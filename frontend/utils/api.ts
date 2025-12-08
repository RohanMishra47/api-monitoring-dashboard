// utils/api.ts
// This file defines the base URL for the API used in the frontend application.
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://api-monitoring-dashboard.onrender.com"
    : "http://localhost:5000");
