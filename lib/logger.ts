// Simple logger utility to control console output in development
const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  info: (message: string, ...args: any[]) => {
    if (isDev) console.log(`[INFO] ${message}`, ...args);
  },
  
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  
  warn: (message: string, ...args: any[]) => {
    if (isDev) console.warn(`[WARN] ${message}`, ...args);
  },
  
  // Use this for API calls to reduce noise
  api: (message: string, ...args: any[]) => {
    // Only log API calls in production or when explicitly needed
    if (process.env.LOG_API_CALLS === 'true') {
      console.log(`[API] ${message}`, ...args);
    }
  }
};