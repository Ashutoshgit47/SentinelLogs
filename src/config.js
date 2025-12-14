// src/config.js

// API Base URL configuration
// REQUIRED: Set VITE_API_URL in your .env file
// - Local development: VITE_API_URL=http://localhost:3000/api
// - Production: VITE_API_URL=https://your-backend-url.com/api

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const ENDPOINTS = {
  SKY_EVENTS: 'sky-events',
  DISCOVERIES: 'discoveries',
  HISTORY: 'history',
  APOD: 'apod',
  GEOCODE: 'geocode',
  HEALTH: 'health'
};
