// Google OAuth 2.0 Client-side implementation
// This file handles Google OAuth directly without backend API calls

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  refresh_token?: string;
}

export interface GmailConnection {
  id: string;
  email: string;
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  scope: string;
  company_id?: number;
  company_name?: string;
  status: 'connected' | 'expired';
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email';
const STORAGE_KEY = 'gmail_connections';

class GoogleOAuth {
  private isInitialized = false;
  private tokenClient: any = null;

  /**
   * Initialize Google OAuth client
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    if (!GOOGLE_CLIENT_ID) {
      console.error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in environment variables.');
      return false;
    }

    return new Promise((resolve) => {
      // Load Google API script
      if (window.gapi) {
        this.setupOAuthClient(resolve);
      } else {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          this.setupOAuthClient(resolve);
        };
        script.onerror = () => {
          console.error('Failed to load Google OAuth script');
          resolve(false);
        };
        document.head.appendChild(script);
      }
    });
  }

  private setupOAuthClient(resolve: (value: boolean) => void) {
    try {
      // Just verify the library is loaded, don't create token client here
      if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
        throw new Error('Google Identity Services library not loaded');
      }
      
      console.log('✅ Google Identity Services library loaded');
      this.isInitialized = true;
      resolve(true);
    } catch (error) {
      console.error('❌ Error initializing Google OAuth:', error);
      resolve(false);
    }
  }

  /**
   * Request authorization and get access token
   */
  async requestAccess(companyId?: number, companyName?: string): Promise<GmailConnection | null> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize Google OAuth');
      }
    }

    return new Promise((resolve, reject) => {
      console.log('🔐 Initializing Google OAuth Token Client...');
      console.log('Client ID:', GOOGLE_CLIENT_ID);
      console.log('Scopes:', GOOGLE_SCOPES);

      // Check if we can get a refresh token by using access_type: 'offline'
      // Note: Google Identity Services may not always provide refresh tokens
      // We'll handle re-authentication when tokens expire
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SCOPES,
        // Try to get refresh token by forcing consent
        callback: async (response: GoogleTokenResponse | any) => {
          console.log('📥 OAuth Callback Received:', response);
          
          // Check for errors
          if (response.error) {
            console.error('❌ OAuth Error:', response.error);
            reject(new Error(response.error));
            return;
          }

          // Log full response for debugging
          console.log('✅ Token Response:', {
            has_access_token: !!response.access_token,
            has_refresh_token: !!response.refresh_token,
            expires_in: response.expires_in,
            scope: response.scope,
            token_type: response.token_type,
            full_response: response
          });

          try {
            // Validate access token exists
            if (!response.access_token) {
              console.error('❌ No access_token in response:', response);
              reject(new Error('No access token received from Google. Response: ' + JSON.stringify(response)));
              return;
            }

            console.log('✅ Access token received:', response.access_token.substring(0, 20) + '...');

            // Small delay to ensure token is fully processed
            await new Promise(resolve => setTimeout(resolve, 100));

            // Get user email from Google
            let email = '';
            try {
              email = await this.getUserEmail(response.access_token);
            } catch (emailError: any) {
              console.warn('Could not fetch email immediately, will retry:', emailError);
              // Retry once after a short delay
              await new Promise(resolve => setTimeout(resolve, 500));
              try {
                email = await this.getUserEmail(response.access_token);
              } catch (retryError) {
                // If we still can't get email, we'll use a placeholder
                // The user can still use the connection, email will be fetched later
                console.error('Failed to fetch email after retry:', retryError);
                email = 'email@pending.com'; // Placeholder, will be updated on next use
              }
            }
            
            // Create connection object
            const connection: GmailConnection = {
              id: `gmail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              email: email,
              access_token: response.access_token,
              refresh_token: response.refresh_token || undefined,
              expires_at: Date.now() + ((response.expires_in || 3600) * 1000),
              scope: response.scope || GOOGLE_SCOPES,
              company_id: companyId,
              company_name: companyName,
              status: 'connected'
            };

            console.log('💾 Saving connection:', {
              id: connection.id,
              email: connection.email,
              has_access_token: !!connection.access_token,
              has_refresh_token: !!connection.refresh_token,
              expires_at: new Date(connection.expires_at).toISOString(),
              expires_in_hours: Math.round((connection.expires_at - Date.now()) / (1000 * 60 * 60))
            });

            if (!connection.refresh_token) {
              console.warn('⚠️ No refresh token received. Token will expire in ~1 hour. User will need to re-authenticate.');
            }

            // Save connection
            this.saveConnection(connection);
            console.log('✅ Connection saved successfully');
            resolve(connection);
          } catch (error: any) {
            console.error('Error in OAuth callback:', error);
            reject(error);
          }
        },
      });

      // Request access token
      console.log('🚀 Requesting access token...');
      try {
        // Use prompt: 'consent' to force re-authorization and get refresh token
        this.tokenClient.requestAccessToken({ 
          prompt: 'consent',
          hint: '' // Optional: can add email hint here
        });
        console.log('✅ Access token request initiated - waiting for user authorization...');
        
        // Set a timeout to detect if callback never fires
        setTimeout(() => {
          console.warn('⏰ 30 seconds passed - callback may not have fired. Check if user completed authorization.');
        }, 30000);
      } catch (error) {
        console.error('❌ Error requesting access token:', error);
        reject(error);
      }
    });
  }

  /**
   * Get user email from Google API
   */
  private async getUserEmail(accessToken: string): Promise<string> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch user info:', response.status, errorData);
        throw new Error(`Failed to fetch user info: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.email) {
        throw new Error('Email not found in user info response');
      }
      return data.email;
    } catch (error: any) {
      console.error('Error fetching user email:', error);
      // If we can't get email, we can still proceed but log a warning
      if (error.message?.includes('401') || error.message?.includes('UNAUTHENTICATED')) {
        throw new Error('Authentication failed. Please try connecting again.');
      }
      throw error;
    }
  }

  /**
   * Get all saved connections
   */
  getConnections(): GmailConnection[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const connections: GmailConnection[] = JSON.parse(stored);
      
      // Check and update expired tokens
      return connections.map(conn => {
        if (conn.expires_at && Date.now() > conn.expires_at) {
          return { ...conn, status: 'expired' as const };
        }
        return conn;
      });
    } catch (error) {
      console.error('Error loading connections:', error);
      return [];
    }
  }

  /**
   * Save connection to localStorage
   */
  private saveConnection(connection: GmailConnection): void {
    const connections = this.getConnections();
    const existingIndex = connections.findIndex(c => c.email === connection.email && c.company_id === connection.company_id);
    
    if (existingIndex >= 0) {
      connections[existingIndex] = connection;
    } else {
      connections.push(connection);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
  }

  /**
   * Remove connection
   */
  removeConnection(connectionId: string): void {
    const connections = this.getConnections();
    const filtered = connections.filter(c => c.id !== connectionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }

  /**
   * Revoke access token and remove connection
   */
  async revokeAccess(connection: GmailConnection): Promise<void> {
    try {
      if (connection.access_token) {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${connection.access_token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
      }
    } catch (error) {
      console.error('Error revoking token:', error);
    } finally {
      this.removeConnection(connection.id);
    }
  }

  /**
   * Refresh access token by re-authenticating
   * Note: Client-side OAuth requires re-authentication for expired tokens
   * as we cannot use refresh tokens without a client secret
   */
  async refreshAccessToken(connection: GmailConnection): Promise<GmailConnection | null> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize Google OAuth');
      }
    }

    return new Promise((resolve, reject) => {
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SCOPES,
        callback: async (response: GoogleTokenResponse) => {
          if (response.error) {
            reject(new Error(response.error));
            return;
          }

          try {
            // Get user email to verify it's the same account
            const email = await this.getUserEmail(response.access_token);
            
            if (email !== connection.email) {
              reject(new Error('Email mismatch. Please reconnect with the correct account.'));
              return;
            }

            const updated: GmailConnection = {
              ...connection,
              access_token: response.access_token,
              refresh_token: response.refresh_token || connection.refresh_token,
              expires_at: Date.now() + (response.expires_in * 1000),
              status: 'connected'
            };

            this.saveConnection(updated);
            resolve(updated);
          } catch (error) {
            reject(error);
          }
        },
      });

      // Request new access token (will prompt user if needed)
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }
}

export const googleOAuth = new GoogleOAuth();

