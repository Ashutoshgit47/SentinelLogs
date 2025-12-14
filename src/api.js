// src/api.js
import { API_BASE_URL } from './config';

async function fetchAPI(endpoint, params = {}) {
  // Validate that API_BASE_URL is configured
  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL is not configured. Please set VITE_API_URL environment variable.');
  }

  // Construct the full URL
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  let url;

  try {
    url = new URL(fullUrl);
  } catch (e) {
    throw new Error(`Invalid API URL: ${fullUrl}. Check your VITE_API_URL configuration.`);
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.error || 'API Error',
        code: data.code,
        status: response.status,
        fallback: data.fallback,
        fallbackNotice: data.fallbackNotice
      };
    }

    return data;
  } catch (error) {
    console.error(`API Fetch Error [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  getSkyEvents: (year, location) =>
    fetchAPI('/sky-events', { year, location }),

  getDiscoveries: (month, day) =>
    fetchAPI('/discoveries', { month, day }),

  getHistory: (month, day) =>
    fetchAPI('/history', { month, day }),

  getAPOD: () =>
    fetchAPI('/apod'),

  getGeocode: (query) =>
    fetchAPI('/geocode', { q: query }),

  checkHealth: () =>
    fetchAPI('/health')
};
