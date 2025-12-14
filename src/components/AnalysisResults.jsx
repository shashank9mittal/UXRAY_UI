import PropTypes from "prop-types";
import ScreenshotDisplay from "./ScreenshotDisplay";
import AccessibilityMetrics from "./AccessibilityMetrics";
import PerformanceMetrics from "./PerformanceMetrics";
import PageInfo from "./PageInfo";

/**
 * Container component that orchestrates the display of analysis results
 * @param {Object} analysisData - The complete analysis data from the API
 * @param {string} className - Additional CSS classes
 */
function AnalysisResults({ analysisData, className = "" }) {
  if (!analysisData) {
    return null;
  }

  const {
    screenshot,
    accessibility,
    performance,
    pageInfo,
    url,
  } = analysisData;

  // Debug: Log screenshot type to help identify issues
  if (screenshot) {
    console.log("Screenshot type:", typeof screenshot, "Is string:", typeof screenshot === "string");
    if (typeof screenshot !== "string") {
      console.log("Screenshot is not a string:", screenshot);
    }
  }

  return (
    <div className={`w-full mt-8 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Page Info Section */}
        <PageInfo pageInfo={pageInfo} url={url} />

        {/* Screenshot Section */}
        {screenshot && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-white">Screenshot</h2>
            <ScreenshotDisplay screenshot={screenshot} alt={`Screenshot of ${url || "page"}`} />
          </div>
        )}

        {/* Metrics Sections - Full Width */}
        <div className="space-y-6">
          {/* Accessibility Metrics */}
          {accessibility && (
            <AccessibilityMetrics accessibility={accessibility} />
          )}

          {/* Performance Metrics */}
          {performance && (
            <PerformanceMetrics performance={performance} />
          )}
        </div>
      </div>
    </div>
  );
}

AnalysisResults.propTypes = {
  analysisData: PropTypes.shape({
    screenshot: PropTypes.string,
    accessibility: PropTypes.object,
    performance: PropTypes.object,
    pageInfo: PropTypes.object,
    url: PropTypes.string,
    message: PropTypes.string,
    status: PropTypes.string,
  }),
  className: PropTypes.string,
};

export default AnalysisResults;

