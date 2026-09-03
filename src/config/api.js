// Centralized API Configuration for Cloudflare / Production / Local
// If VITE_API_URL is set in Cloudflare Pages/Workers, it will be used.
// Otherwise, it falls back to http://localhost:5000/api in local dev.

export const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Strips any trailing slashes or '/api' suffix to get the root backend origin
export const BACKEND_URL = RAW_API_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '');

// Guaranteed /api prefixed base URL
export const API_BASE_URL = `${BACKEND_URL}/api`;

/**
 * Returns full URL for any given API endpoint or public asset
 * @param {string} endpoint - e.g. '/jobs/all' or 'jobs/all' or '/sitemap.xml'
 */
export const apiUrl = (endpoint) => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    if (cleanEndpoint.startsWith('/api/')) {
        return `${BACKEND_URL}${cleanEndpoint}`;
    }
    // Public paths like /robots.txt or /sitemap.xml
    if (cleanEndpoint.startsWith('/robots.txt') || cleanEndpoint.startsWith('/sitemap.xml')) {
        return `${BACKEND_URL}${cleanEndpoint}`;
    }
    return `${API_BASE_URL}${cleanEndpoint}`;
};

export default API_BASE_URL;
