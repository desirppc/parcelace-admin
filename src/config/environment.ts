/**
 * Environment Configuration for ParcelAce
 * Handles different environments (development, staging, production)
 */

export const ENVIRONMENT = {
  // Current environment
  NODE_ENV: import.meta.env.MODE || 'development',
  
  // API URLs for different environments
  API_URLS: {
    local: 'https://app.parcelace.io/', // Use staging API for local development
    development: 'https://app.parcelace.io/',
    staging: 'https://app.parcelace.io/',
    production: 'https://parcelace.in/',
  },
  
  // Get current API URL based on environment
  getCurrentApiUrl(): string {
    // Priority: 1. .env file, 2. localhost detection, 3. environment-specific, 4. fallback
    if (import.meta.env.VITE_API_URL) {
      let apiUrl = import.meta.env.VITE_API_URL.trim();
      // Ensure URL ends with a trailing slash
      if (!apiUrl.endsWith('/')) {
        apiUrl += '/';
      }
      return apiUrl;
    }
    
    // Check if we're running on localhost
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return this.API_URLS.local;
    }
    
    // Check if we're running on Netlify or Vercel domains
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      // Netlify production domain
      if (hostname === 'parcelace.netlify.app') {
        return this.API_URLS.production;
      }
      
      // Netlify staging domain or branch deploys
      if (hostname.includes('staging') || hostname.includes('--parcelace.netlify.app')) {
        return this.API_URLS.staging;
      }
      
      // Vercel domains
      if (hostname.includes('vercel.app')) {
        // Production deployment (main branch) - use production API
        // Preview/branch deployments - use staging API
        // You can customize this based on your Vercel project setup
        if (hostname.includes('parcelace-admin') && !hostname.includes('git-')) {
          return this.API_URLS.production;
        }
        // Preview deployments and branch deploys use staging
        return this.API_URLS.staging;
      }
    }
    
    const env = this.NODE_ENV;
    const apiUrl = this.API_URLS[env] || this.API_URLS.production;
    // Ensure URL ends with a trailing slash
    return apiUrl.endsWith('/') ? apiUrl : apiUrl + '/';
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

// Log environment info in development and staging
if (ENVIRONMENT.isDevelopment() || ENVIRONMENT.isLocal() || ENVIRONMENT.isStaging()) {
  console.log('🌍 Environment Configuration:', ENVIRONMENT.getInfo());
  console.log('🚀 Staging Environment Active - Using app.parcelace.io');
}
