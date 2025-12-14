import { useState } from "react";
import { useAnalyzeURL } from "../hooks/useAnalyzeURL";
import AnalysisResults from "./AnalysisResults";

function URLInput() {
  const [url, setUrl] = useState("");
  const { analyzeURL, isLoading, error, success, analysisData, clearMessages } = useAnalyzeURL();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    await analyzeURL(url);
    // Optionally clear the URL after successful submission
    // if (success) setUrl("");
  };

  const handleInputChange = (e) => {
    setUrl(e.target.value);
    clearMessages();
  };

  return (
    <div className="w-full my-8 block">
      <div className="flex justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-2xl px-4">
          <div className="relative">
            <input
              type="url"
              value={url}
              onChange={handleInputChange}
              placeholder="Enter URL here..."
              disabled={isLoading}
              className="w-full px-4 py-3 pr-24 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                "Submit"
              )}
            </button>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
              {error}
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/50 text-green-400 text-sm">
              {success}
            </div>
          )}
        </form>
      </div>

      {/* Analysis Results */}
      {analysisData && <AnalysisResults analysisData={analysisData} />}
    </div>
  );
}

export default URLInput;
