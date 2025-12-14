import { useState } from "react";

const API_BASE_URL = "http://localhost:3000";

/**
 * Custom hook for analyzing URLs via the backend API
 * @returns {Object} Object containing analyze function, loading state, error, and success message
 */
export function useAnalyzeURL() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [analysisData, setAnalysisData] = useState(null);

  const analyzeURL = async (url) => {
    if (!url || !url.trim()) {
      setError("Please provide a valid URL");
      return null;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");
    setAnalysisData(null);

    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error response from backend
        const errorMessage = data.message || data.error || "Failed to analyze URL";
        setError(errorMessage);
        return null;
      }

      // Success response
      const successMessage = data.message || "Analysis request received successfully";
      setSuccess(successMessage);
      setAnalysisData(data);
      console.log("Analysis response:", data);
      
      return data;
    } catch (error) {
      console.error("Error processing URL:", error);
      const errorMessage = error.message || "Failed to connect to server. Please try again.";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
    setAnalysisData(null);
  };

  return {
    analyzeURL,
    isLoading,
    error,
    success,
    analysisData,
    clearMessages,
  };
}

