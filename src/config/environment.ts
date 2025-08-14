/**
 * Environment Configuration for ParcelAce
 * Handles different environments (development, staging, production)
 */

export const ENVIRONMENT = {
  // Current environment
  NODE_ENV: import.meta.env.MODE || 'development',
  
  // API URLs for different environments
  API_URLS: {
    development: 'https://staging.parcelace.io/', // or your staging URL
    staging: 'https://staging.parcelace.io/',
    production: 'https://app.parcelace.io/',
  },
  
  // Get current API URL based on environment
  getCurrentApiUrl(): string {
    // Priority: 1. .env file, 2. environment-specific, 3. fallback
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    
    const env = this.NODE_ENV;
    return this.API_URLS[env] || this.API_URLS.production;
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
      isDev: this.isDevelopment(),
      isProd: this.isProduction(),
      isStaging: this.isStaging(),
    };
  }
};

// Log environment info in development
if (ENVIRONMENT.isDevelopment()) {
  console.log('🌍 Environment Configuration:', ENVIRONMENT.getInfo());
}
