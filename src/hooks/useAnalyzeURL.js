import { useState } from "react";
import { API_BASE_URL } from "../config/api";

/**
 * Custom hook for getting screenshot from URL
 * @returns {Object} Object containing getScreenshot function, loading state, error, and screenshot
 */
export function useAnalyzeURL() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [interactiveDNA, setInteractiveDNA] = useState([]);
  const [analysisData, setAnalysisData] = useState(null);

  const getScreenshot = async (url) => {
    if (!url || !url.trim()) {
      setError("Please provide a valid URL");
      return null;
    }

    // Reset state
    setIsLoading(true);
    setError("");
    setScreenshot(null);
    setInteractiveDNA([]);
    setAnalysisData(null);

    const trimmedUrl = url.trim();

    try {
      // Simple GET request with URL as query parameter
      const response = await fetch(`${API_BASE_URL}/analyze?url=${encodeURIComponent(trimmedUrl)}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || "Failed to get screenshot";
        setError(errorMessage);
        setIsLoading(false);
        return null;
      }

      const data = await response.json();

      // Handle screenshot - could be base64 string or object with base64 property
      let screenshotData = null;
      if (data.screenshot) {
        if (typeof data.screenshot === "string") {
          // Already a string (base64 or data URL)
          screenshotData = data.screenshot.startsWith("data:")
            ? data.screenshot
            : `data:image/png;base64,${data.screenshot}`;
        } else if (data.screenshot.base64) {
          // Object with base64 property
          screenshotData = `data:image/png;base64,${data.screenshot.base64}`;
        }
      } else if (data.base64) {
        // Screenshot might be at root level
        screenshotData = `data:image/png;base64,${data.base64}`;
      }

      if (screenshotData) {
        setScreenshot(screenshotData);
      } else {
        setError("No screenshot received from server");
      }

      // Store interactive DNA data
      if (data.interactiveDNA && Array.isArray(data.interactiveDNA)) {
        setInteractiveDNA(data.interactiveDNA);
      }

      // Store full analysis data
      setAnalysisData(data);

      setIsLoading(false);
      return data;
    } catch (error) {
      console.error("Error getting screenshot:", error);
      setError(error.message || "Failed to connect to server");
      setIsLoading(false);
      return null;
    }
  };

  const clearMessages = () => {
    setError("");
    setScreenshot(null);
    setInteractiveDNA([]);
    setAnalysisData(null);
  };

  return {
    getScreenshot,
    isLoading,
    error,
    screenshot,
    interactiveDNA,
    analysisData,
    clearMessages,
  };
}
