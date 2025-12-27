/**
 * API Configuration
 * Central configuration for API endpoints and WebSocket connections
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:3000";

// API Endpoints
export const API_ENDPOINTS = {
  SESSION_START: `${API_BASE_URL}/session/start`,
  ANALYZE: `${API_BASE_URL}/analyze`,
};

// WebSocket URLs
export const WS_ENDPOINTS = {
  AGENT: (userId) => `${WS_BASE_URL}/?userId=${userId}`,
};

export default {
  API_BASE_URL,
  WS_BASE_URL,
  API_ENDPOINTS,
  WS_ENDPOINTS,
};

