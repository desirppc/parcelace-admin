import API_CONFIG from '@/config/api';

export interface WalletTransaction {
  id?: string;
  date: string;
  type: 'credit' | 'debit';
  transaction_id: string;
  debit: number;
  credit: number;
  closing_balance: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  source: string;
}

export interface WalletBalance {
  balance: number;
  currency: string;
  last_updated: string;
}

export interface WalletSummary {
  total_credited: number;
  total_debited: number;
  current_balance: number;
}

class WalletService {
  async getWalletBalance(): Promise<WalletBalance> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WALLET}`;
      
      console.log('🔍 Fetching wallet balance from:', url);
      console.log('🔑 Using token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${token}`,
        }
      });

      console.log('📡 Wallet balance response status:', response.status);
      const result = await response.json();
      console.log('📊 Wallet balance response data:', result);
      
      if (response.ok && result.data) {
        return {
          balance: result.data.balance || 0,
          currency: 'INR',
          last_updated: new Date().toISOString()
        };
      } else {
        return {
          balance: parseInt(sessionStorage.getItem('walletBalance') || '0'),
          currency: 'INR',
          last_updated: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('❌ Error fetching wallet balance:', error);
      return {
        balance: parseInt(sessionStorage.getItem('walletBalance') || '0'),
        currency: 'INR',
        last_updated: new Date().toISOString()
      };
    }
  }

  async createWalletTransaction(
    amount: number, 
    paymentId: string, 
    date: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      const transactionData = {
        amount: amount,
        type: 'credit',
        description: 'Wallet Recharge via Razorpay',
        transaction_id: paymentId,
        date: date,
        status: 'completed',
        source: 'Razorpay'
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WALLET}`, {
        method: 'POST',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(transactionData)
      });

      const result = await response.json();
      
      if (response.ok) {
        const currentBalance = parseInt(sessionStorage.getItem('walletBalance') || '0');
        const newBalance = currentBalance + amount;
        sessionStorage.setItem('walletBalance', newBalance.toString());
        
        window.dispatchEvent(new CustomEvent('walletBalanceUpdated', { 
          detail: { newBalance } 
        }));
        
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.message || 'Failed to create wallet transaction' };
      }
    } catch (error) {
      console.error('Error creating wallet transaction:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  async getWalletTransactions(page: number = 1): Promise<WalletTransaction[]> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WALLET}?page=${page}`;
      
      console.log('🔍 Fetching wallet transactions from:', url);
      console.log('🔑 Using token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${token}`,
        }
      });

      console.log('📡 Wallet transactions response status:', response.status);
      const result = await response.json();
      console.log('📊 Wallet transactions response data:', result);
      
      if (response.ok && result.data && result.data.transactions) {
        // Transform API response to match the new wallet structure
        return result.data.transactions.map((tx: any) => ({
          id: tx.id?.toString(),
          date: tx.payment_date || tx.date || new Date().toISOString().split('T')[0],
          type: tx.type === 'cr' ? 'credit' : 'debit',
          transaction_id: tx.transaction_id || tx.payment_id || '',
          debit: tx.type === 'dr' ? (tx.amount || 0) : 0,
          credit: tx.type === 'cr' ? (tx.amount || 0) : 0,
          closing_balance: tx.closing_balance || 0,
          description: tx.description || tx.title || '',
          status: tx.payment_status === 'authorized' ? 'completed' : 'pending',
          source: tx.source || 'API'
        }));
      } else {
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching wallet transactions:', error);
      return [];
    }
  }

  async getWalletSummary(): Promise<WalletSummary> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WALLET}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${token}`,
        }
      });

      const result = await response.json();
      
      if (response.ok && result.data) {
        return {
          total_credited: result.data.total_credited || 0,
          total_debited: result.data.total_debited || 0,
          current_balance: result.data.balance || 0
        };
      } else {
        return {
          total_credited: 0,
          total_debited: 0,
          current_balance: 0
        };
      }
    } catch (error) {
      console.error('Error fetching wallet summary:', error);
      return {
        total_credited: 0,
        total_debited: 0,
        current_balance: 0
      };
    }
  }

  async updateWalletBalance(newBalance: number): Promise<void> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WALLET}`, {
        method: 'PUT',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ balance: newBalance })
      });

      if (response.ok) {
        sessionStorage.setItem('walletBalance', newBalance.toString());
        window.dispatchEvent(new CustomEvent('walletBalanceUpdated', { 
          detail: { newBalance } 
        }));
      }
    } catch (error) {
      console.error('Error updating wallet balance:', error);
    }
  }
}

export const walletService = new WalletService(); 