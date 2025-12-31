import API_CONFIG from '@/config/api';
import { apiRequest } from '@/config/api';

export interface GmailConnection {
  id: number;
  company_id?: number;
  company_name?: string;
  email: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  scope: string;
  status: 'connected' | 'disconnected' | 'expired';
  created_at: string;
  updated_at: string;
}

export interface GmailConnectionsResponse {
  status: boolean;
  message: string;
  data: {
    connections: GmailConnection[];
  };
  error: null;
}

export interface ConnectGmailResponse {
  status: boolean;
  message: string;
  data: {
    auth_url: string;
    connection_id?: number;
  };
  error: null;
}

class GmailOAuthService {
  /**
   * Get Google OAuth authorization URL
   * @param companyId - Optional company ID for multi-company support
   * @returns Promise<ConnectGmailResponse>
   */
  async getAuthUrl(companyId?: number): Promise<ConnectGmailResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (companyId) {
        queryParams.append('company_id', companyId.toString());
      }

      const endpoint = queryParams.toString()
        ? `${API_CONFIG.ENDPOINTS.GMAIL_OAUTH_INIT}?${queryParams.toString()}`
        : API_CONFIG.ENDPOINTS.GMAIL_OAUTH_INIT;

      const response = await apiRequest(endpoint, 'GET');

      if (response.success && response.data) {
        return {
          status: true,
          message: response.message || 'Authorization URL generated successfully',
          data: {
            auth_url: response.data.auth_url || response.data.url,
            connection_id: response.data.connection_id
          },
          error: null
        };
      }

      return {
        status: false,
        message: response.message || 'Failed to generate authorization URL',
        data: {
          auth_url: '',
          connection_id: undefined
        },
        error: response.error
      };
    } catch (error) {
      console.error('Error getting Gmail auth URL:', error);
      return {
        status: false,
        message: 'Network error occurred',
        data: {
          auth_url: '',
          connection_id: undefined
        },
        error: 'Failed to connect to Gmail OAuth service'
      };
    }
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   * @param code - Authorization code from Google
   * @param state - Optional state parameter
   * @returns Promise<{status: boolean, message: string, data?: GmailConnection}>
   */
  async handleCallback(code: string, state?: string): Promise<{
    status: boolean;
    message: string;
    data?: GmailConnection;
    error?: any;
  }> {
    try {
      const response = await apiRequest(API_CONFIG.ENDPOINTS.GMAIL_OAUTH_CALLBACK, 'POST', {
        code,
        state
      });

      if (response.success && response.data) {
        return {
          status: true,
          message: response.message || 'Gmail connected successfully',
          data: response.data.connection || response.data
        };
      }

      return {
        status: false,
        message: response.message || 'Failed to connect Gmail',
        error: response.error
      };
    } catch (error) {
      console.error('Error handling Gmail OAuth callback:', error);
      return {
        status: false,
        message: 'Network error occurred',
        error: 'Failed to process OAuth callback'
      };
    }
  }

  /**
   * Get all Gmail connections for the user/company
   * @param companyId - Optional company ID to filter connections
   * @returns Promise<GmailConnectionsResponse>
   */
  async getConnections(companyId?: number): Promise<GmailConnectionsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (companyId) {
        queryParams.append('company_id', companyId.toString());
      }

      const endpoint = queryParams.toString()
        ? `${API_CONFIG.ENDPOINTS.GMAIL_CONNECTIONS}?${queryParams.toString()}`
        : API_CONFIG.ENDPOINTS.GMAIL_CONNECTIONS;

      const response = await apiRequest(endpoint, 'GET');

      if (response.success && response.data) {
        return {
          status: true,
          message: response.message || 'Connections fetched successfully',
          data: {
            connections: Array.isArray(response.data) ? response.data : response.data.connections || []
          },
          error: null
        };
      }

      return {
        status: false,
        message: response.message || 'Failed to fetch connections',
        data: {
          connections: []
        },
        error: response.error
      };
    } catch (error) {
      console.error('Error fetching Gmail connections:', error);
      return {
        status: false,
        message: 'Network error occurred',
        data: {
          connections: []
        },
        error: 'Failed to connect to Gmail service'
      };
    }
  }

  /**
   * Disconnect a Gmail connection
   * @param connectionId - Connection ID to disconnect
   * @returns Promise<{status: boolean, message: string}>
   */
  async disconnectConnection(connectionId: number): Promise<{
    status: boolean;
    message: string;
    error?: any;
  }> {
    try {
      const response = await apiRequest(
        `${API_CONFIG.ENDPOINTS.GMAIL_CONNECTIONS}/${connectionId}`,
        'DELETE'
      );

      if (response.success) {
        return {
          status: true,
          message: response.message || 'Gmail disconnected successfully'
        };
      }

      return {
        status: false,
        message: response.message || 'Failed to disconnect Gmail',
        error: response.error
      };
    } catch (error) {
      console.error('Error disconnecting Gmail:', error);
      return {
        status: false,
        message: 'Network error occurred',
        error: 'Failed to disconnect Gmail'
      };
    }
  }

  /**
   * Refresh access token for a connection
   * @param connectionId - Connection ID to refresh
   * @returns Promise<{status: boolean, message: string, data?: GmailConnection}>
   */
  async refreshToken(connectionId: number): Promise<{
    status: boolean;
    message: string;
    data?: GmailConnection;
    error?: any;
  }> {
    try {
      const response = await apiRequest(
        `${API_CONFIG.ENDPOINTS.GMAIL_CONNECTIONS}/${connectionId}/refresh`,
        'POST'
      );

      if (response.success && response.data) {
        return {
          status: true,
          message: response.message || 'Token refreshed successfully',
          data: response.data.connection || response.data
        };
      }

      return {
        status: false,
        message: response.message || 'Failed to refresh token',
        error: response.error
      };
    } catch (error) {
      console.error('Error refreshing Gmail token:', error);
      return {
        status: false,
        message: 'Network error occurred',
        error: 'Failed to refresh token'
      };
    }
  }
}

export const gmailOAuthService = new GmailOAuthService();

