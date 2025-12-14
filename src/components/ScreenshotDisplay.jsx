import PropTypes from "prop-types";

/**
 * Reusable component for displaying base64 encoded screenshots
 * @param {string} screenshot - Base64 encoded image data (data:image/png;base64,...)
 * @param {string} alt - Alt text for the image
 * @param {string} className - Additional CSS classes
 */
function ScreenshotDisplay({ screenshot, alt = "Page screenshot", className = "" }) {
  if (!screenshot) {
    return (
      <div className={`flex items-center justify-center p-8 bg-slate-800 rounded-lg border border-slate-700 ${className}`}>
        <p className="text-gray-400 text-sm">No screenshot available</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden border border-slate-700 bg-slate-800 ${className}`}>
      <img
        src={screenshot}
        alt={alt}
        className="w-full h-auto object-contain"
        loading="lazy"
      />
    </div>
  );
}

ScreenshotDisplay.propTypes = {
  screenshot: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
};

export default ScreenshotDisplay;

