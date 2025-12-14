import PropTypes from "prop-types";

/**
 * Reusable component for displaying performance metrics
 * @param {Object} performance - Performance data object
 * @param {string} className - Additional CSS classes
 */
function PerformanceMetrics({ performance, className = "" }) {
  if (!performance) {
    return null;
  }

  const {
    domContentLoaded = 0,
    loadComplete = 0,
    firstPaint = 0,
    firstContentfulPaint = 0,
  } = performance;

  const formatTime = (ms) => {
    if (ms === 0 || ms === null || ms === undefined) return "N/A";
    // Handle very small values (less than 1ms)
    if (ms < 1) {
      return `${ms.toFixed(2)} ms`;
    }
    // For larger values, show 2 decimal places
    return `${ms.toFixed(2)} ms`;
  };

  const getPerformanceStatus = (value, thresholds) => {
    if (value === 0) return "info";
    if (value <= thresholds.good) return "good";
    if (value <= thresholds.warning) return "warning";
    return "error";
  };

  const metrics = [
    {
      label: "DOM Content Loaded",
      value: domContentLoaded,
      format: formatTime(domContentLoaded),
      status: getPerformanceStatus(domContentLoaded, { good: 1000, warning: 2000 }),
      description: "Time until DOM is ready",
    },
    {
      label: "Load Complete",
      value: loadComplete,
      format: formatTime(loadComplete),
      status: getPerformanceStatus(loadComplete, { good: 2000, warning: 4000 }),
      description: "Time until page fully loaded",
    },
    {
      label: "First Paint",
      value: firstPaint,
      format: formatTime(firstPaint),
      status: getPerformanceStatus(firstPaint, { good: 1000, warning: 2500 }),
      description: "Time to first visual render",
    },
    {
      label: "First Contentful Paint",
      value: firstContentfulPaint,
      format: formatTime(firstContentfulPaint),
      status: getPerformanceStatus(firstContentfulPaint, { good: 1800, warning: 3000 }),
      description: "Time to first content render",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "good":
        return "text-green-400";
      case "warning":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      default:
        return "text-blue-400";
    }
  };

  return (
    <div className={`bg-slate-800 rounded-lg border border-slate-700 p-6 ${className}`}>
      <h3 className="text-xl font-semibold mb-4 text-white">Performance Metrics</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-slate-900 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">{metric.label}</span>
                <span className={`text-xl font-bold ${getStatusColor(metric.status)}`}>
                  {metric.format}
                </span>
              </div>
              <p className="text-xs text-gray-500">{metric.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

PerformanceMetrics.propTypes = {
  performance: PropTypes.shape({
    domContentLoaded: PropTypes.number,
    loadComplete: PropTypes.number,
    firstPaint: PropTypes.number,
    firstContentfulPaint: PropTypes.number,
  }),
  className: PropTypes.string,
};

export default PerformanceMetrics;

