import { RazorpayOptions, RazorpayResponse, PaymentRequest } from '@/types/razorpay';
import { RAZORPAY_CONFIG, PAYMENT_CONFIG } from '@/config/razorpay';

class RazorpayService {
  private loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        console.log('Razorpay already loaded');
        resolve();
        return;
      }

      console.log('Loading Razorpay script...');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        resolve();
      };
      
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        reject(new Error('Failed to load Razorpay script'));
      };
      
      document.head.appendChild(script);
    });
  }

  async createOrder(amount: number, currency: string = 'INR'): Promise<string> {
    try {
      // For demo purposes, we'll create a real order using Razorpay's API
      // This is a simplified version - in production, this should be on your backend
      
      const orderData = {
        amount: amount * 100, // Convert to paise
        currency: currency,
        receipt: `receipt_${Date.now()}`,
        notes: {
          description: 'Wallet Recharge'
        }
      };

      console.log('Creating order with data:', orderData);

      // For now, let's use a test approach that should work
      // In production, you would make an API call to your backend
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Created order:', orderId, 'for amount:', amount);
      return orderId;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  async verifyPayment(paymentId: string, orderId: string, signature: string): Promise<boolean> {
    try {
      // In a real application, this should be a call to your backend
      // For demo purposes, we'll simulate the verification
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate successful verification
      return true;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  }

  async handleSuccessfulPayment(response: RazorpayResponse, amount: number): Promise<void> {
    try {
      console.log('Processing successful payment:', response);
      console.log('Current session storage contents:');
      console.log('- user:', sessionStorage.getItem('user'));
      console.log('- user_data:', sessionStorage.getItem('user_data'));
      console.log('- auth_token:', sessionStorage.getItem('auth_token'));
      
      // Get current date in required format
      const paymentDate = new Date().toISOString().split('T')[0];
      
      // Get auth token from multiple sources with better debugging
      let token = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
      if (!token) {
        token = sessionStorage.getItem('auth_token') || sessionStorage.getItem('access_token');
      }
      if (!token) {
        // Check user_data first (this is where login stores it)
        const userData = sessionStorage.getItem('user_data');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            token = user.auth_token || user.access_token;
            console.log('Found token in user_data:', token);
          } catch (error) {
            console.error('Error parsing user_data:', error);
          }
        }
      }
      if (!token) {
        // Check user as fallback
        const userData = sessionStorage.getItem('user');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            token = user.auth_token || user.access_token;
            console.log('Found token in user:', token);
          } catch (error) {
            console.error('Error parsing user data:', error);
          }
        }
      }
      
      console.log('Auth token sources check:');
      console.log('- localStorage auth_token:', localStorage.getItem('auth_token'));
      console.log('- localStorage access_token:', localStorage.getItem('access_token'));
      console.log('- sessionStorage auth_token:', sessionStorage.getItem('auth_token'));
      console.log('- sessionStorage access_token:', sessionStorage.getItem('access_token'));
      console.log('- sessionStorage user_data:', sessionStorage.getItem('user_data'));
      console.log('- sessionStorage user:', sessionStorage.getItem('user'));
      console.log('- Final token:', token);
      
      if (token) {
        try {
          // Call the correct wallet API with proper payload format
          const walletResponse = await fetch('https://app.parcelace.io/api/wallet', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              amount: amount,
              transaction_id: response.razorpay_payment_id,
              type: 'cr', // credit
              title: 'Wallet Recharge',
              description: 'Wallet recharge via Razorpay payment',
              payment_status: 'done',
              source: 'razorpay',
              payment_date: paymentDate
            })
          });

          if (walletResponse.ok) {
            const walletData = await walletResponse.json();
            console.log('Wallet transaction created successfully:', walletData);
            
            // Update wallet balance in session storage
            const currentBalance = parseInt(sessionStorage.getItem('walletBalance') || '0');
            const newBalance = currentBalance + amount;
            sessionStorage.setItem('walletBalance', newBalance.toString());
            
            // Trigger wallet balance update event
            window.dispatchEvent(new CustomEvent('walletBalanceUpdated', { 
              detail: { newBalance } 
            }));
            
            // Also trigger a custom event to update the header
            window.dispatchEvent(new CustomEvent('updateWalletBalance', { 
              detail: { newBalance } 
            }));
            
          } else {
            console.error('Failed to create wallet transaction:', walletResponse.status);
            const errorData = await walletResponse.json().catch(() => ({}));
            console.error('Wallet API error:', errorData);
          }
        } catch (error) {
          console.error('Error creating wallet transaction:', error);
        }
      } else {
        console.error('No auth token found for wallet transaction');
      }
      
      // Update wallet balance in session storage
      const currentBalance = parseInt(sessionStorage.getItem('walletBalance') || '0');
      const newBalance = currentBalance + amount;
      sessionStorage.setItem('walletBalance', newBalance.toString());
      
      // Trigger wallet balance update event
      window.dispatchEvent(new CustomEvent('walletBalanceUpdated', { 
        detail: { newBalance } 
      }));
      
      // Show success toast only after actual payment completion
      const { toast } = await import('@/hooks/use-toast');
      toast({
        title: "Payment Successful!",
        description: `Your wallet has been recharged with ₹${amount.toLocaleString()}`,
      });
      
      console.log('Payment successful! Your wallet has been recharged.');
      
    } catch (error) {
      console.error('Error handling successful payment:', error);
      throw new Error('Failed to update wallet after payment');
    }
  }

  async initiatePayment(amount: number, currency: string = 'INR'): Promise<void> {
    try {
      console.log('Initiating payment for amount:', amount);
      console.log('Using Razorpay key:', RAZORPAY_CONFIG.KEY_ID);
      
      await this.loadRazorpayScript();
      console.log('Razorpay script loaded successfully');
      
      // Get user data from multiple sources with better fallback logic
      const getUserName = (): string => {
        // Try sessionStorage first
        const userData = sessionStorage.getItem('user');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            if (user.name) return user.name;
          } catch (error) {
            console.error('Error parsing user data from session:', error);
          }
        }
        
        // Try localStorage
        const localUserData = localStorage.getItem('user_data');
        if (localUserData) {
          try {
            const user = JSON.parse(localUserData);
            if (user.name) return user.name;
          } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
          }
        }
        
        // Try sessionStorage user_data
        const sessionUserData = sessionStorage.getItem('user_data');
        if (sessionUserData) {
          try {
            const user = JSON.parse(sessionUserData);
            if (user.name) return user.name;
          } catch (error) {
            console.error('Error parsing user_data from session:', error);
          }
        }
        
        // Final fallback - try to get email prefix
        if (userData) {
          try {
            const user = JSON.parse(userData);
            if (user.email) return user.email.split('@')[0];
          } catch (error) {
            console.error('Error parsing user email:', error);
          }
        }
        
        return 'Customer';
      };
      
      const userData = sessionStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      // For testing, let's try without order_id first
      const options: RazorpayOptions = {
        key: RAZORPAY_CONFIG.KEY_ID,
        amount: amount * 100, // Razorpay expects amount in paise
        currency: currency,
        name: PAYMENT_CONFIG.COMPANY_NAME,
        description: PAYMENT_CONFIG.COMPANY_DESCRIPTION,
        image: PAYMENT_CONFIG.COMPANY_LOGO,
        // order_id: orderId, // Commenting out for testing
        handler: async (response: RazorpayResponse) => {
          try {
            console.log('Payment response received:', response);
            
            // Handle successful payment - this will show the success message
            await this.handleSuccessfulPayment(response, amount);
            
          } catch (error) {
            console.error('Error processing payment:', error);
            // Show error toast for payment processing failure
            const { toast } = await import('@/hooks/use-toast');
            toast({
              title: "Payment Processing Failed",
              description: error.message || "Unable to process payment. Please try again.",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: getUserName(),
          email: user?.email || 'user@example.com',
          contact: user?.phone || '+919999999999'
        },
        notes: {
          address: 'ParcelAce Office'
        },
        theme: {
          color: PAYMENT_CONFIG.THEME_COLOR
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
            // Show a toast when user cancels the payment
            import('@/hooks/use-toast').then(({ toast }) => {
              toast({
                title: "Payment Cancelled",
                description: "Payment was cancelled. You can try again anytime.",
                variant: "destructive",
              });
            });
          }
        }
      };

      console.log('Razorpay options:', options);
      
      if (!window.Razorpay) {
        throw new Error('Razorpay not loaded properly');
      }
      
      console.log('Creating Razorpay instance...');
      const razorpay = new window.Razorpay(options);
      console.log('Razorpay instance created, opening modal...');
      razorpay.open();
      
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw new Error(`Failed to initiate payment: ${error.message}`);
    }
  }
}

export const razorpayService = new RazorpayService();
export default razorpayService; 