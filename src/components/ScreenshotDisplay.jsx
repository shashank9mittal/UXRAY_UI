import PropTypes from "prop-types";

/**
 * Reusable component for displaying base64 encoded screenshots
 * @param {string} screenshot - Base64 encoded image data (data:image/png;base64,...)
 * @param {string} alt - Alt text for the image
 * @param {string} className - Additional CSS classes
 */
function ScreenshotDisplay({ screenshot, alt = "Page screenshot", className = "" }) {
  // Normalize screenshot to string - handle cases where it might be an object
  const getScreenshotSrc = () => {
    if (!screenshot) return null;
    
    // If it's already a string, check if it needs data URL prefix
    if (typeof screenshot === "string") {
      // If it's already a data URL, return as is
      if (screenshot.startsWith("data:")) {
        return screenshot;
      }
      // If it's a base64 string without prefix, add the prefix
      if (screenshot.length > 100) { // Base64 strings are typically long
        return `data:image/png;base64,${screenshot}`;
      }
      // If it's a URL, return as is
      if (screenshot.startsWith("http://") || screenshot.startsWith("https://") || screenshot.startsWith("/")) {
        return screenshot;
      }
      // Otherwise assume it's base64 and add prefix
      return `data:image/png;base64,${screenshot}`;
    }
    
    // If it's an object, try to extract the string value
    if (typeof screenshot === "object") {
      // Check common object properties that might contain the base64 string
      if (screenshot.data) {
        const data = screenshot.data;
        return data.startsWith("data:") ? data : `data:image/png;base64,${data}`;
      }
      if (screenshot.url) return screenshot.url;
      if (screenshot.src) return screenshot.src;
      if (screenshot.base64) {
        const base64 = screenshot.base64;
        return base64.startsWith("data:") ? base64 : `data:image/png;base64,${base64}`;
      }
      if (screenshot.dataUrl) return screenshot.dataUrl;
      
      // If object has a toString method that might help
      console.warn("Screenshot is an object, expected string. Object:", screenshot);
      return null;
    }
    
    return null;
  };

  const screenshotSrc = getScreenshotSrc();

  if (!screenshotSrc) {
    return (
      <div className={`flex items-center justify-center p-8 bg-slate-800 rounded-lg border border-slate-700 ${className}`}>
        <p className="text-gray-400 text-sm">No screenshot available</p>
      </div>
    );
  }

  // Validate that it's a proper data URL or image URL
  const isValidImageSrc = screenshotSrc.startsWith("data:image") || 
                          screenshotSrc.startsWith("http://") || 
                          screenshotSrc.startsWith("https://") ||
                          screenshotSrc.startsWith("/");

  if (!isValidImageSrc) {
    console.warn("Invalid screenshot format:", screenshotSrc.substring(0, 50));
    return (
      <div className={`flex items-center justify-center p-8 bg-slate-800 rounded-lg border border-slate-700 ${className}`}>
        <p className="text-red-400 text-sm">Invalid screenshot format</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden border border-slate-700 bg-slate-800 ${className}`}>
      <img
        src={screenshotSrc}
        alt={alt}
        className="w-full h-auto object-contain"
        loading="lazy"
        onError={(e) => {
          console.error("Error loading screenshot image");
          e.target.style.display = "none";
        }}
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

