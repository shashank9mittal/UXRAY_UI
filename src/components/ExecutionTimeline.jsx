import { useState } from "react";

function ExecutionTimeline({ executionResults, currentExecution }) {
  const [filter, setFilter] = useState("all"); // all, successful, failed
  const [expandedStep, setExpandedStep] = useState(null);

  if (!executionResults || executionResults.length === 0) {
    if (currentExecution) {
      return (
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <div className="text-blue-400 text-sm">
            Executing {currentExecution.action} on "{currentExecution.element}" ({currentExecution.current}/{currentExecution.total})...
          </div>
        </div>
      );
    }
    return null;
  }

  const getActionIcon = (action) => {
    switch (action?.toLowerCase()) {
      case "click":
        return "🖱️";
      case "fill":
      case "type":
        return "⌨️";
      case "select":
        return "📋";
      case "scroll":
        return "📜";
      default:
        return "⚡";
    }
  };

  const filteredResults = executionResults.filter((result) => {
    if (filter === "successful") return result.execution?.success;
    if (filter === "failed") return result.execution?.success === false;
    return true;
  });

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Execution Timeline</h3>
        <div className="flex gap-2">
          {["all", "successful", "failed"].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filter === filterOption
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-gray-300 hover:bg-slate-600"
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Current execution progress */}
      {currentExecution && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/50 rounded-lg">
          <div className="flex items-center gap-2 text-blue-400 text-sm">
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
            <span>
              Executing {currentExecution.action} on "{currentExecution.element}" ({currentExecution.current}/{currentExecution.total})
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filteredResults.map((result, index) => {
          const isSuccess = result.execution?.success;
          const isExpanded = expandedStep === index;

          return (
            <div
              key={index}
              className={`border rounded-lg p-4 transition-colors ${
                isSuccess
                  ? "bg-green-500/5 border-green-500/30"
                  : "bg-red-500/5 border-red-500/30"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    <span className="text-2xl">{getActionIcon(result.execution?.action || result.actionSuggestion?.action)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">
                        {result.element?.text || result.element?.tagName || "Element"}
                      </span>
                      <span className={`text-lg ${isSuccess ? "text-green-400" : "text-red-400"}`}>
                        {isSuccess ? "✅" : "❌"}
                      </span>
                      {result.screenshot && (
                        <span className="text-xs" title="Has screenshot">📷</span>
                      )}
                      <span className="text-xs text-gray-400 bg-slate-700 px-2 py-1 rounded">
                        {result.execution?.action || result.actionSuggestion?.action || "N/A"}
                      </span>
                    </div>
                    {result.timestamp && (
                      <div className="text-xs text-gray-500">
                        {new Date(result.timestamp).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setExpandedStep(isExpanded ? null : index)}
                  className="text-gray-400 hover:text-white ml-2 flex-shrink-0"
                >
                  {isExpanded ? "▲" : "▼"}
                </button>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
                  {/* Element Details */}
                  {result.element && (
                    <div>
                      <span className="text-xs font-medium text-gray-400">Element:</span>
                      <div className="text-sm text-gray-300 mt-1 space-y-1">
                        <div>Tag: {result.element.tagName || "N/A"}</div>
                        <div>Text: {result.element.text || "N/A"}</div>
                        <div>Category: {result.element.category || "N/A"}</div>
                      </div>
                    </div>
                  )}

                  {/* Action Suggestion */}
                  {result.actionSuggestion && (
                    <div>
                      <span className="text-xs font-medium text-gray-400">Action Suggestion:</span>
                      <div className="text-sm text-gray-300 mt-1 space-y-1">
                        <div>Action: {result.actionSuggestion.action || "N/A"}</div>
                        {result.actionSuggestion.purpose && (
                          <div>Purpose: {result.actionSuggestion.purpose}</div>
                        )}
                        {result.actionSuggestion.confidence !== undefined && (
                          <div>Confidence: {(result.actionSuggestion.confidence * 100).toFixed(1)}%</div>
                        )}
                        {result.actionSuggestion.suggested_value && (
                          <div>Suggested Value: {result.actionSuggestion.suggested_value}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Execution Result */}
                  {result.execution && (
                    <div>
                      <span className="text-xs font-medium text-gray-400">Execution Result:</span>
                      <div className="text-sm text-gray-300 mt-1">
                        <div className={isSuccess ? "text-green-400" : "text-red-400"}>
                          Status: {isSuccess ? "Success" : "Failed"}
                        </div>
                        <div>Action: {result.execution.action || "N/A"}</div>
                        {result.execution.error && (
                          <div className="text-red-400 mt-1">Error: {result.execution.error}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Screenshot */}
                  {result.screenshot && (
                    <div>
                      <span className="text-xs font-medium text-gray-400 mb-2 block">Screenshot:</span>
                      <div className="mt-2">
                        {result.screenshot.base64 ? (
                          <img
                            src={`data:image/png;base64,${result.screenshot.base64}`}
                            alt={`Screenshot of step ${result.step || index + 1}`}
                            className="max-w-full h-auto rounded-lg border border-slate-700 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => {
                              // Open full size in new tab
                              const newWindow = window.open();
                              newWindow.document.write(`
                                <img src="data:image/png;base64,${result.screenshot.base64}" style="max-width: 100%; height: auto;" />
                              `);
                            }}
                          />
                        ) : result.screenshot.url ? (
                          <img
                            src={result.screenshot.url}
                            alt={`Screenshot of step ${result.step || index + 1}`}
                            className="max-w-full h-auto rounded-lg border border-slate-700 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(result.screenshot.url, '_blank')}
                          />
                        ) : null}
                        {result.screenshot.filename && (
                          <div className="text-xs text-gray-500 mt-1">{result.screenshot.filename}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredResults.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          No {filter === "all" ? "" : filter} execution results found
        </div>
      )}
    </div>
  );
}

export default ExecutionTimeline;

