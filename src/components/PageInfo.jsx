import PropTypes from "prop-types";

/**
 * Reusable component for displaying page information
 * @param {Object} pageInfo - Page information object
 * @param {string} url - The analyzed URL
 * @param {string} className - Additional CSS classes
 */
function PageInfo({ pageInfo, url, className = "" }) {
  if (!pageInfo && !url) {
    return null;
  }

  const { title = "N/A", viewport = null } = pageInfo || {};

  return (
    <div className={`bg-slate-800 rounded-lg border border-slate-700 p-6 ${className}`}>
      <h3 className="text-xl font-semibold mb-4 text-white">Page Information</h3>
      <div className="space-y-3">
        {url && (
          <div>
            <span className="text-sm text-gray-400 block mb-1">URL</span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 break-all text-sm"
            >
              {url}
            </a>
          </div>
        )}
        {title && (
          <div>
            <span className="text-sm text-gray-400 block mb-1">Title</span>
            <p className="text-white text-sm">{title}</p>
          </div>
        )}
        {viewport && (
          <div>
            <span className="text-sm text-gray-400 block mb-1">Viewport</span>
            <p className="text-white text-sm">
              {viewport.width} × {viewport.height} px
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

PageInfo.propTypes = {
  pageInfo: PropTypes.shape({
    title: PropTypes.string,
    viewport: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number,
    }),
  }),
  url: PropTypes.string,
  className: PropTypes.string,
};

export default PageInfo;

