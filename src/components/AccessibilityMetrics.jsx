import PropTypes from "prop-types";

/**
 * Reusable component for displaying accessibility metrics
 * @param {Object} accessibility - Accessibility data object
 * @param {string} className - Additional CSS classes
 */
function AccessibilityMetrics({ accessibility, className = "" }) {
  if (!accessibility) {
    return null;
  }

  const {
    totalImages = 0,
    imagesWithoutAlt = 0,
    totalLinks = 0,
    linksWithoutText = 0,
    totalHeadings = 0,
  } = accessibility;

  const imagesWithAlt = totalImages - imagesWithoutAlt;
  const linksWithText = totalLinks - linksWithoutText;

  const metrics = [
    {
      label: "Total Images",
      value: totalImages,
      subValue: `${imagesWithAlt} with alt text`,
      status: imagesWithoutAlt === 0 ? "good" : "warning",
    },
    {
      label: "Images Without Alt",
      value: imagesWithoutAlt,
      status: imagesWithoutAlt === 0 ? "good" : "error",
    },
    {
      label: "Total Links",
      value: totalLinks,
      subValue: `${linksWithText} with text`,
      status: linksWithoutText === 0 ? "good" : "warning",
    },
    {
      label: "Links Without Text",
      value: linksWithoutText,
      status: linksWithoutText === 0 ? "good" : "error",
    },
    {
      label: "Total Headings",
      value: totalHeadings,
      status: "info",
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
      <h3 className="text-xl font-semibold mb-4 text-white">Accessibility Metrics</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-slate-900 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">{metric.label}</span>
                <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                  {metric.value}
                </span>
              </div>
              {metric.subValue && (
                <p className="text-xs text-gray-500">{metric.subValue}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

AccessibilityMetrics.propTypes = {
  accessibility: PropTypes.shape({
    totalImages: PropTypes.number,
    imagesWithoutAlt: PropTypes.number,
    totalLinks: PropTypes.number,
    linksWithoutText: PropTypes.number,
    totalHeadings: PropTypes.number,
  }),
  className: PropTypes.string,
};

export default AccessibilityMetrics;

