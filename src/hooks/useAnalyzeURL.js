import { useState } from "react";

const API_BASE_URL = "http://localhost:3000";

/**
 * Custom hook for analyzing URLs via the backend API with SSE support
 * @returns {Object} Object containing analyze function, loading state, error, success message, progress, and analysis data
 */
export function useAnalyzeURL() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [analysisData, setAnalysisData] = useState(null);
  const [actionableElementsData, setActionableElementsData] = useState(null);
  const [progress, setProgress] = useState("");
  const [progressMessages, setProgressMessages] = useState([]);

  const analyzeURL = async (url) => {
    if (!url || !url.trim()) {
      setError("Please provide a valid URL");
      return null;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");
    setAnalysisData(null);
    setActionableElementsData(null);
    setProgress("");
    setProgressMessages([]);

    const trimmedUrl = url.trim();
    const encodedUrl = encodeURIComponent(trimmedUrl);

    try {
      // Make both API calls - SSE for analyze, regular GET for actionable elements
      const [analyzeStream, actionableElementsResponse] = await Promise.allSettled([
        // SSE stream for analyze endpoint
        fetch(`${API_BASE_URL}/analyze`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({ url: trimmedUrl }),
        }),
        // Regular GET for actionable elements
        fetch(`${API_BASE_URL}/analyze/actionable-elements?url=${encodedUrl}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }),
      ]);

      // Handle actionable elements API response (non-blocking)
      if (actionableElementsResponse.status === "fulfilled") {
        const response = actionableElementsResponse.value;
        const data = await response.json();

        if (response.ok) {
          setActionableElementsData(data);
          console.log("Actionable elements response:", data);
        } else {
          console.warn("Actionable elements API returned error:", data);
        }
      } else {
        console.warn("Error in actionable elements API:", actionableElementsResponse.reason);
      }

      // Handle SSE stream for analyze endpoint
      if (analyzeStream.status === "fulfilled") {
        const response = analyzeStream.value;

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || errorData.error || "Failed to analyze URL";
          setError(errorMessage);
          setIsLoading(false);
          return null;
        }

        // Check if response is SSE stream
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("text/event-stream")) {
          // Handle SSE stream
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          let finalData = null;
          let currentEvent = "";
          let currentData = "";

          const processEventData = (eventData, eventType) => {
            // Handle different event types
            if (eventData.type === "progress" || eventType === "progress") {
              const message = eventData.message || eventData.data || "";
              setProgress(message);
              if (message) {
                setProgressMessages((prev) => [...prev, message]);
              }
            } else if (eventData.type === "complete" || eventType === "complete" || eventData.data) {
              // Final data received
              finalData = eventData.data || eventData;
              setAnalysisData(finalData);
              const successMessage = finalData.message || eventData.message || "Analysis completed successfully";
              setSuccess(successMessage);
            } else if (eventData.type === "error" || eventType === "error") {
              setError(eventData.message || eventData.error || "An error occurred during analysis");
              setIsLoading(false);
              return true; // Indicate error occurred
            }
            return false;
          };

          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // Process any remaining data in buffer
              if (currentData.trim()) {
                try {
                  const eventData = JSON.parse(currentData);
                  if (processEventData(eventData, currentEvent)) {
                    return null; // Error occurred
                  }
                  if (eventData.type === "complete" || eventData.data) {
                    finalData = eventData.data || eventData;
                  }
                } catch (e) {
                  console.warn("Failed to parse final SSE data:", e);
                }
              }
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || ""; // Keep incomplete line in buffer

            for (const line of lines) {
              const trimmedLine = line.trim();
              
              if (trimmedLine.startsWith("event: ")) {
                currentEvent = trimmedLine.slice(7);
              } else if (trimmedLine.startsWith("data: ")) {
                currentData += (currentData ? "\n" : "") + trimmedLine.slice(6);
              } else if (trimmedLine === "") {
                // Empty line indicates end of event, process accumulated data
                if (currentData.trim()) {
                  try {
                    const eventData = JSON.parse(currentData);
                    if (processEventData(eventData, currentEvent)) {
                      return null; // Error occurred
                    }
                    if (eventData.type === "complete" || eventData.data) {
                      finalData = eventData.data || eventData;
                    }
                  } catch (parseError) {
                    console.warn("Failed to parse SSE data:", currentData, parseError);
                  }
                  currentData = "";
                  currentEvent = "";
                }
              }
            }
          }

          setIsLoading(false);
          return finalData;
        } else {
          // Fallback to regular JSON response if SSE is not available
          const data = await response.json();
          
          if (!response.ok) {
            const errorMessage = data.message || data.error || "Failed to analyze URL";
            setError(errorMessage);
            setIsLoading(false);
            return null;
          }

          const successMessage = data.message || "Analysis request received successfully";
          setSuccess(successMessage);
          setAnalysisData(data);
          setIsLoading(false);
          console.log("Analysis response:", data);
          return data;
        }
      } else {
        // Handle error from analyze API call
        console.error("Error in analyze API:", analyzeStream.reason);
        setError("Failed to analyze URL. Please try again.");
        setIsLoading(false);
        return null;
      }
    } catch (error) {
      console.error("Error processing URL:", error);
      const errorMessage = error.message || "Failed to connect to server. Please try again.";
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
    setAnalysisData(null);
    setActionableElementsData(null);
    setProgress("");
    setProgressMessages([]);
  };

  return {
    analyzeURL,
    isLoading,
    error,
    success,
    analysisData,
    actionableElementsData,
    progress,
    progressMessages,
    clearMessages,
  };
}

