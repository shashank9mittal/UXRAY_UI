import { useState } from "react";
import { API_BASE_URL } from "../config/api";

/**
 * Custom hook for analyzing URLs via the backend API with SSE support
 * @returns {Object} Object containing analyze function, loading state, error, success message, progress, and analysis data
 */
export function useAnalyzeURL() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [analysisData, setAnalysisData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressMessages, setProgressMessages] = useState([]);
  const [executionResults, setExecutionResults] = useState([]);
  const [executionSummary, setExecutionSummary] = useState(null);
  const [currentExecution, setCurrentExecution] = useState(null);
  const [screenshots, setScreenshots] = useState(new Map()); // Map to store screenshots by step/timestamp

  const analyzeURL = async (url) => {
    if (!url || !url.trim()) {
      setError("Please provide a valid URL");
      return null;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");
    setAnalysisData(null);
    setProgress(0);
    setProgressMessages([]);
    setExecutionResults([]);
    setExecutionSummary(null);
    setCurrentExecution(null);

    const trimmedUrl = url.trim();

    try {
      // SSE stream for analyze endpoint (now includes automatic execution)
      const response = await fetch(`${API_BASE_URL}/analyze?stream=true`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ url: trimmedUrl }),
      });

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
          let currentEventType = "";
          let currentData = "";

          const processEventData = (eventData, eventType) => {
            const event = eventType || eventData.type || "";
            
            switch (event) {
              case "progress":
                // Handle progress updates with execution phase
                if (eventData.progress !== undefined) {
                  setProgress(eventData.progress);
                }
                if (eventData.message) {
                  setProgressMessages((prev) => [...prev, eventData.message]);
                }
                // Handle execution phase (70-85%)
                if (eventData.stage === "execution" && eventData.metadata) {
                  const { current, total, element, action } = eventData.metadata;
                  if (current !== undefined && total !== undefined) {
                    setCurrentExecution({
                      current,
                      total,
                      element: element?.text || element,
                      action,
                    });
                  }
                }
                break;

              case "screenshot":
                // Handle screenshot events
                if (eventData.screenshot) {
                  const screenshotData = {
                    filename: eventData.screenshot.filename,
                    url: eventData.screenshot.url,
                    base64: eventData.screenshot.base64,
                    step: eventData.step,
                    timestamp: eventData.timestamp,
                    element: eventData.element,
                    action: eventData.action,
                  };
                  
                  // Store screenshot by step and timestamp
                  setScreenshots((prev) => {
                    const newMap = new Map(prev);
                    const key = eventData.step !== undefined 
                      ? `step_${eventData.step}` 
                      : `timestamp_${eventData.timestamp}`;
                    newMap.set(key, screenshotData);
                    return newMap;
                  });
                  
                  // Update execution result if it exists (match by step or timestamp)
                  setExecutionResults((prev) => {
                    const updated = prev.map((result) => {
                      const matchesStep = eventData.step !== undefined && result.step === eventData.step;
                      const matchesTimestamp = eventData.timestamp && result.timestamp === eventData.timestamp;
                      
                      if (matchesStep || matchesTimestamp) {
                        return {
                          ...result,
                          screenshot: screenshotData,
                        };
                      }
                      return result;
                    });
                    
                    // If no matching result found but we have execution data in screenshot event,
                    // create a new execution result entry
                    if (updated.length === prev.length && eventData.execution) {
                      return [
                        ...prev,
                        {
                          step: eventData.step,
                          timestamp: eventData.timestamp,
                          element: eventData.element ? (typeof eventData.element === 'string' 
                            ? { text: eventData.element } 
                            : eventData.element) : null,
                          execution: eventData.execution,
                          screenshot: screenshotData,
                        },
                      ].sort((a, b) => {
                        if (a.step && b.step) return a.step - b.step;
                        if (a.timestamp && b.timestamp) return new Date(a.timestamp) - new Date(b.timestamp);
                        return 0;
                      });
                    }
                    
                    return updated;
                  });
                }
                break;

              case "execution_chunk":
                // Handle execution results chunks
                if (eventData.chunk && Array.isArray(eventData.chunk)) {
                  setExecutionResults((prev) => {
                    const newResults = [...prev];
                    eventData.chunk.forEach((result) => {
                      // Find existing result by timestamp or step
                      const existingIndex = newResults.findIndex(
                        (r) => (r.timestamp === result.timestamp && 
                                r.element?.text === result.element?.text) ||
                               (r.step === result.step && result.step !== undefined)
                      );
                      
                      if (existingIndex >= 0) {
                        // Update existing result, preserving screenshot if it exists
                        newResults[existingIndex] = {
                          ...newResults[existingIndex],
                          ...result,
                          screenshot: newResults[existingIndex].screenshot || result.screenshot,
                        };
                      } else {
                        // Add new result
                        newResults.push(result);
                      }
                    });
                    // Sort by step or timestamp
                    return newResults.sort((a, b) => {
                      if (a.step !== undefined && b.step !== undefined) return a.step - b.step;
                      if (a.timestamp && b.timestamp) return new Date(a.timestamp) - new Date(b.timestamp);
                      return 0;
                    });
                  });
                }
                break;

              case "complete":
                // Final data received
                finalData = eventData.data || eventData;
                setAnalysisData(finalData);
                
                // Update execution results from final data
                if (finalData.executionResults) {
                  setExecutionResults(finalData.executionResults);
                }
                
                // Update execution summary
                if (finalData.executionSummary) {
                  setExecutionSummary(finalData.executionSummary);
                }
                
                setProgress(100);
                const successMessage = finalData.message || eventData.message || "Analysis completed successfully";
                setSuccess(successMessage);
                setCurrentExecution(null);
                setIsLoading(false);
                break;

              case "error":
                setError(eventData.message || eventData.error || "An error occurred during analysis");
                setIsLoading(false);
                return true; // Indicate error occurred

              default:
                // Handle generic data object
                if (eventData.type === "progress") {
                  if (eventData.progress !== undefined) setProgress(eventData.progress);
                  if (eventData.message) {
                    setProgressMessages((prev) => [...prev, eventData.message]);
                  }
                } else if (eventData.type === "screenshot") {
                  // Handle screenshot in default case
                  if (eventData.screenshot) {
                    const screenshotData = {
                      filename: eventData.screenshot.filename,
                      url: eventData.screenshot.url,
                      base64: eventData.screenshot.base64,
                      step: eventData.step,
                      timestamp: eventData.timestamp,
                      element: eventData.element,
                      action: eventData.action,
                    };
                    setScreenshots((prev) => {
                      const newMap = new Map(prev);
                      const key = `${eventData.step}_${eventData.timestamp}`;
                      newMap.set(key, screenshotData);
                      return newMap;
                    });
                  }
                } else if (eventData.type === "complete") {
                  finalData = eventData.data || eventData;
                  setAnalysisData(finalData);
                  if (finalData.executionResults) {
                    setExecutionResults(finalData.executionResults);
                  }
                  if (finalData.executionSummary) {
                    setExecutionSummary(finalData.executionSummary);
                  }
                  setProgress(100);
                  setIsLoading(false);
                } else if (eventData.type === "error") {
                  setError(eventData.message || "An error occurred");
                  setIsLoading(false);
                  return true;
                }
                break;
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
                  if (processEventData(eventData, currentEventType)) {
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
                currentEventType = trimmedLine.slice(7);
              } else if (trimmedLine.startsWith("data: ")) {
                currentData += (currentData ? "\n" : "") + trimmedLine.slice(6);
              } else if (trimmedLine === "") {
                // Empty line indicates end of event, process accumulated data
                if (currentData.trim()) {
                  try {
                    const eventData = JSON.parse(currentData);
                    if (processEventData(eventData, currentEventType)) {
                      return null; // Error occurred
                    }
                    if (eventData.type === "complete" || eventData.data) {
                      finalData = eventData.data || eventData;
                    }
                  } catch (parseError) {
                    console.warn("Failed to parse SSE data:", currentData, parseError);
                  }
                  currentData = "";
                  currentEventType = "";
                }
              }
            }
          }

          // setIsLoading(false) is called in processEventData for "complete" event
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

          setProgress(100);
          const successMessage = data.message || "Analysis request received successfully";
          setSuccess(successMessage);
          setAnalysisData(data);
          
          // Update execution results and summary from JSON response
          if (data.executionResults) {
            setExecutionResults(data.executionResults);
          }
          if (data.executionSummary) {
            setExecutionSummary(data.executionSummary);
          }
          
          setIsLoading(false);
          console.log("Analysis response:", data);
          return data;
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
    setProgress(0);
    setProgressMessages([]);
    setExecutionResults([]);
    setExecutionSummary(null);
    setCurrentExecution(null);
    setScreenshots(new Map());
  };

  return {
    analyzeURL,
    isLoading,
    error,
    success,
    analysisData,
    progress,
    progressMessages,
    executionResults,
    executionSummary,
    currentExecution,
    screenshots,
    clearMessages,
  };
}

