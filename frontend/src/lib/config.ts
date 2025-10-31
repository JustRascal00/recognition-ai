/**
 * Get the backend API URL
 * Uses NEXT_PUBLIC_BACKEND_URL environment variable if set, otherwise defaults to localhost
 */
export const getBackendUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Client-side: use environment variable or default to localhost
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  }
  // Server-side: use environment variable or default to localhost
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
};

/**
 * Get WebSocket URL for backend
 */
export const getBackendWsUrl = (): string => {
  const backendUrl = getBackendUrl();
  // Convert http:// to ws:// and https:// to wss://
  if (backendUrl.startsWith('https://')) {
    return backendUrl.replace(/^https/, 'wss');
  }
  return backendUrl.replace(/^http/, 'ws');
};

