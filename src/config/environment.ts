/**
 * Environment Configuration for ParcelAce
 * Handles different environments (development, staging, production)
 */

export const ENVIRONMENT = {
  // Current environment
  NODE_ENV: import.meta.env.MODE || 'development',
  
  // API URLs for different environments
  API_URLS: {
    local: 'http://localhost:8084/',
    development: 'https://app.parcelace.io/',
    staging: 'https://app.parcelace.io/',
    production: 'https://parcelace.in/',
  },
  
  // Get current API URL based on environment
  getCurrentApiUrl(): string {
    // Priority: 1. .env file, 2. localhost detection, 3. environment-specific, 4. fallback
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    
    // Check if we're running on localhost
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return this.API_URLS.local;
    }
    
    const env = this.NODE_ENV;
    return this.API_URLS[env] || this.API_URLS.production;
  },
  
  // Check if we're in local development mode
  isLocal(): boolean {
    if (typeof window !== 'undefined') {
      return window.location.hostname === 'localhost';
    }
    return false;
  },
  
  // Check if we're in development mode
  isDevelopment(): boolean {
    return this.NODE_ENV === 'development';
  },
  
  // Check if we're in production mode
  isProduction(): boolean {
    return this.NODE_ENV === 'production';
  },
  
  // Check if we're in staging mode
  isStaging(): boolean {
    return this.NODE_ENV === 'staging';
  },
  
  // Get environment info for debugging
  getInfo() {
    return {
      NODE_ENV: this.NODE_ENV,
      MODE: import.meta.env.MODE,
      VITE_API_URL: import.meta.env.VITE_API_URL,
      currentApiUrl: this.getCurrentApiUrl(),
      isLocal: this.isLocal(),
      isDev: this.isDevelopment(),
      isProd: this.isProduction(),
      isStaging: this.isStaging(),
    };
  }
};

// Log environment info in development
if (ENVIRONMENT.isDevelopment() || ENVIRONMENT.isLocal()) {
  console.log('🌍 Environment Configuration:', ENVIRONMENT.getInfo());
}
