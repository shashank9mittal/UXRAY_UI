import { useState, useRef, useEffect, useMemo } from "react";
import PropTypes from "prop-types";

/**
 * Interactive DNA Visualizer Component
 * Displays bounding boxes overlaid on a screenshot with interactive features
 */
function InteractiveDNAVisualizer({ screenshot, elements = [] }) {
  const [hoveredElement, setHoveredElement] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleTypes, setVisibleTypes] = useState(new Set());
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 });

  // Color mapping for different element types
  const typeColors = {
    button: { fill: "rgba(59, 130, 246, 0.3)", stroke: "#3b82f6", hover: "#60a5fa" }, // Blue
    link: { fill: "rgba(34, 197, 94, 0.3)", stroke: "#22c55e", hover: "#4ade80" }, // Green
    a: { fill: "rgba(34, 197, 94, 0.3)", stroke: "#22c55e", hover: "#4ade80" }, // Green
    input: { fill: "rgba(249, 115, 22, 0.3)", stroke: "#f97316", hover: "#fb923c" }, // Orange
    select: { fill: "rgba(249, 115, 22, 0.3)", stroke: "#f97316", hover: "#fb923c" }, // Orange
    textarea: { fill: "rgba(249, 115, 22, 0.3)", stroke: "#f97316", hover: "#fb923c" }, // Orange
    form: { fill: "rgba(168, 85, 247, 0.3)", stroke: "#a855f7", hover: "#c084fc" }, // Purple
    default: { fill: "rgba(148, 163, 184, 0.3)", stroke: "#94a3b8", hover: "#cbd5e1" }, // Gray
  };

  // Get all unique types from elements
  const availableTypes = useMemo(() => {
    const types = new Set();
    elements.forEach((el) => {
      const type = el.type || el.tagName || "default";
      types.add(type.toLowerCase());
    });
    return Array.from(types);
  }, [elements]);

  // Initialize visible types to show all
  useEffect(() => {
    if (availableTypes.length > 0 && visibleTypes.size === 0) {
      setVisibleTypes(new Set(availableTypes));
    }
  }, [availableTypes, visibleTypes.size]);

  // Calculate scale when image loads or container resizes
  useEffect(() => {
    const calculateScale = () => {
      if (imageRef.current && containerRef.current) {
        const img = imageRef.current;
        const container = containerRef.current;
        const imgNaturalWidth = img.naturalWidth || img.width;
        const imgNaturalHeight = img.naturalHeight || img.height;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const scaleX = containerWidth / imgNaturalWidth;
        const scaleY = containerHeight / imgNaturalHeight;
        const minScale = Math.min(scaleX, scaleY);

        setScale({ x: minScale, y: minScale });
        setImageDimensions({ width: imgNaturalWidth, height: imgNaturalHeight });
        setDisplayDimensions({ width: img.offsetWidth, height: img.offsetHeight });
      }
    };

    if (imageRef.current?.complete) {
      calculateScale();
    } else {
      imageRef.current?.addEventListener("load", calculateScale);
    }

    window.addEventListener("resize", calculateScale);
    return () => {
      window.removeEventListener("resize", calculateScale);
      imageRef.current?.removeEventListener("load", calculateScale);
    };
  }, [screenshot]);

  // Filter elements based on search and type visibility
  const filteredElements = useMemo(() => {
    return elements.filter((el) => {
      const type = (el.type || el.tagName || "default").toLowerCase();
      const label = (el.label || el.text || "").toLowerCase();
      const matchesSearch = !searchQuery || label.includes(searchQuery.toLowerCase());
      const matchesType = visibleTypes.has(type);
      return matchesSearch && matchesType;
    });
  }, [elements, searchQuery, visibleTypes]);

  // Get color for element type
  const getElementColor = (element) => {
    const type = (element.type || element.tagName || "default").toLowerCase();
    return typeColors[type] || typeColors.default;
  };

  // Handle element hover
  const handleElementHover = (element, event) => {
    if (element && containerRef.current) {
      setHoveredElement(element);
      setShowTooltip(true);
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPosition({ 
        x: event.clientX - rect.left, 
        y: event.clientY - rect.top 
      });
    } else {
      setHoveredElement(null);
      setShowTooltip(false);
    }
  };

  // Handle element click
  const handleElementClick = (element) => {
    setSelectedElement(element);
    // Scroll to element in list
    const elementId = `element-${element.id || elements.indexOf(element)}`;
    document.getElementById(elementId)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Toggle type visibility
  const toggleType = (type) => {
    setVisibleTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  // Toggle all types
  const toggleAllTypes = () => {
    if (visibleTypes.size === availableTypes.length) {
      setVisibleTypes(new Set());
    } else {
      setVisibleTypes(new Set(availableTypes));
    }
  };

  if (!screenshot || elements.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-4 text-white">Interactive DNA Visualization</h2>
        
        <div className="flex gap-4">
          {/* Main Visualization Area */}
          <div className="flex-1">
            <div
              ref={containerRef}
              className="relative bg-slate-800 rounded-lg border border-slate-700 overflow-auto max-h-[80vh]"
              style={{ minHeight: "400px" }}
            >
              {/* Screenshot Image */}
              <img
                ref={imageRef}
                src={screenshot}
                alt="Website screenshot"
                className="w-full h-auto block"
                style={{ maxWidth: "100%" }}
              />

              {/* SVG Overlay for Bounding Boxes */}
              {displayDimensions.width > 0 && imageDimensions.width > 0 && (
                <svg
                  className="absolute top-0 left-0 pointer-events-none"
                  style={{
                    width: `${displayDimensions.width}px`,
                    height: `${displayDimensions.height}px`,
                  }}
                >
                  {filteredElements.map((element, index) => {
                    if (!element.coordinates) return null;

                    const { x, y, width, height } = element.coordinates;
                    const scaledX = (x / imageDimensions.width) * displayDimensions.width;
                    const scaledY = (y / imageDimensions.height) * displayDimensions.height;
                    const scaledWidth = (width / imageDimensions.width) * displayDimensions.width;
                    const scaledHeight = (height / imageDimensions.height) * displayDimensions.height;

                    const colors = getElementColor(element);
                    const isHovered = hoveredElement === element;
                    const isSelected = selectedElement === element;

                    return (
                      <g key={element.id || index} pointerEvents="all">
                        <rect
                          x={scaledX}
                          y={scaledY}
                          width={scaledWidth}
                          height={scaledHeight}
                          fill={colors.fill}
                          stroke={isHovered || isSelected ? colors.hover : colors.stroke}
                          strokeWidth={isHovered || isSelected ? 3 : 2}
                          className="cursor-pointer transition-all"
                          onMouseEnter={(e) => handleElementHover(element, e)}
                          onMouseLeave={() => handleElementHover(null, null)}
                          onClick={() => handleElementClick(element)}
                        />
                      </g>
                    );
                  })}
                </svg>
              )}

              {/* Tooltip */}
              {showTooltip && hoveredElement && (
                <div
                  className="absolute z-50 bg-slate-900 border border-slate-600 rounded-lg shadow-xl p-3 text-sm pointer-events-none"
                  style={{
                    left: `${tooltipPosition.x + 10}px`,
                    top: `${tooltipPosition.y + 10}px`,
                    maxWidth: "300px",
                  }}
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-white">
                      {hoveredElement.label || hoveredElement.text || "Unlabeled"}
                    </div>
                    <div className="text-gray-300">
                      <span className="text-gray-400">Type:</span> {hoveredElement.type || hoveredElement.tagName || "Unknown"}
                    </div>
                    {hoveredElement.coordinates && (
                      <div className="text-gray-300 text-xs">
                        <div>
                          <span className="text-gray-400">Position:</span> ({hoveredElement.coordinates.x}, {hoveredElement.coordinates.y})
                        </div>
                        <div>
                          <span className="text-gray-400">Size:</span> {hoveredElement.coordinates.width} × {hoveredElement.coordinates.height}px
                        </div>
                      </div>
                    )}
                    {hoveredElement.attributes?.href && (
                      <div className="text-blue-400 text-xs truncate max-w-xs" title={hoveredElement.attributes.href}>
                        <span className="text-gray-400">URL:</span> {hoveredElement.attributes.href}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - DNA List */}
          <div className="w-80 bg-slate-800 rounded-lg border border-slate-700 p-4 flex flex-col max-h-[80vh]">
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search elements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Type Filters */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Filter by Type</span>
                <button
                  onClick={toggleAllTypes}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  {visibleTypes.size === availableTypes.length ? "Hide All" : "Show All"}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTypes.map((type) => {
                  const isVisible = visibleTypes.has(type);
                  const colors = typeColors[type] || typeColors.default;
                  return (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        isVisible
                          ? "bg-slate-700 text-white border"
                          : "bg-slate-900 text-gray-500 border border-slate-700"
                      }`}
                      style={isVisible ? { borderColor: colors.stroke } : {}}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Elements List */}
            <div className="flex-1 overflow-y-auto">
              <div className="text-sm font-medium text-gray-300 mb-2">
                Elements ({filteredElements.length})
              </div>
              <div className="space-y-2">
                {filteredElements.length === 0 ? (
                  <div className="text-gray-500 text-sm text-center py-4">
                    No elements found
                  </div>
                ) : (
                  filteredElements.map((element, index) => {
                    const elementId = `element-${element.id || index}`;
                    const colors = getElementColor(element);
                    const isSelected = selectedElement === element;

                    return (
                      <div
                        key={element.id || index}
                        id={elementId}
                        onClick={() => handleElementClick(element)}
                        className={`p-3 rounded-md border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-slate-700 border-blue-500"
                            : "bg-slate-900 border-slate-700 hover:bg-slate-800"
                        }`}
                        style={isSelected ? { borderColor: colors.stroke } : {}}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white text-sm truncate">
                              {element.label || element.text || "Unlabeled"}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {element.type || element.tagName || "Unknown"}
                            </div>
                            {element.coordinates && (
                              <div className="text-xs text-gray-500 mt-1">
                                {element.coordinates.width} × {element.coordinates.height}px
                              </div>
                            )}
                          </div>
                          <div
                            className="w-3 h-3 rounded flex-shrink-0"
                            style={{ backgroundColor: colors.stroke }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

InteractiveDNAVisualizer.propTypes = {
  screenshot: PropTypes.string.isRequired,
  elements: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      label: PropTypes.string,
      text: PropTypes.string,
      type: PropTypes.string,
      tagName: PropTypes.string,
      coordinates: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
      }),
      attributes: PropTypes.object,
      visible: PropTypes.bool,
    })
  ),
};

export default InteractiveDNAVisualizer;

