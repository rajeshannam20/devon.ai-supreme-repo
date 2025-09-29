
import axios from 'axios';

// Set base URL for API endpoints
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Configure axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handling helper
export const handleServiceError = (error: unknown, message: string): never => {
  if (axios.isAxiosError(error)) {
    console.error(`${message}:`, error.response?.data || error.message);
  } else {
    console.error(`${message}:`, error);
  }
  throw error;
};
