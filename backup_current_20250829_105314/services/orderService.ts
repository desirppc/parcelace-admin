import API_CONFIG from '@/config/api';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: {
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  billing_address: {
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items: OrderItem[];
  total_amount: number;
  shipping_fee: number;
  tax_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_method: 'cod' | 'prepaid';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  courier_partner?: string;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
  delivery_date?: string;
  rto_status?: 'pending' | 'returned' | 'delivered';
}

export interface OrderItem {
  id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
}

export interface OrderFilters {
  status?: string;
  payment_method?: string;
  date_from?: string;
  date_to?: string;
  courier_partner?: string;
  rto_status?: string;
}

class OrderService {
  async getOrders(filters: OrderFilters = {}): Promise<any> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      console.log('Building query params with filters:', filters);
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          // Dates are already in the correct format from analytics service
          if (key === 'date_from' || key === 'date_to') {
            console.log(`Using date ${key}: ${value}`);
            queryParams.append(key, value);
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
      console.log('Final query params:', queryParams.toString());

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS}?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${token}`,
        }
      });

      const result = await response.json();
      
      if (response.ok) {
        // Return the full response structure to handle pagination
        return result.data || result;
      } else {
        console.error('Error fetching orders:', result.message);
        return { orders_data: [], pagination: { total: 0 } };
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { orders_data: [], pagination: { total: 0 } };
    }
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}`, {
        method: 'GET',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${token}`,
        }
      });

      const result = await response.json();
      
      if (response.ok) {
        return result.data;
      } else {
        console.error('Error fetching order:', result.message);
        return null;
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }

  async getOrderStats(filters: OrderFilters = {}): Promise<{
    total_orders: number;
    delivered_orders: number;
    rto_orders: number;
    pending_orders: number;
    total_amount: number;
  }> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      console.log('Auth token available:', !!token);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      console.log('Building stats query params with filters:', filters);
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          // Dates are already in the correct format from analytics service
          if (key === 'date_from' || key === 'date_to') {
            console.log(`Using stats date ${key}: ${value}`);
            queryParams.append(key, value);
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
      console.log('Final stats query params:', queryParams.toString());

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS}/stats?${queryParams.toString()}`;
      console.log('Making API call to:', url);
      console.log('With filters:', filters);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${token}`,
        }
      });

      console.log('API response status:', response.status);
      const result = await response.json();
      console.log('API response data:', result);
      
      if (response.ok) {
        console.log('API call successful, returning data:', result.data);
        return result.data;
      } else {
        console.error('Error fetching order stats:', result.message);
        console.error('Response status:', response.status);
        console.error('Response data:', result);
        return {
          total_orders: 0,
          delivered_orders: 0,
          rto_orders: 0,
          pending_orders: 0,
          total_amount: 0,
        };
      }
    } catch (error) {
      console.error('Error fetching order stats:', error);
      return {
        total_orders: 0,
        delivered_orders: 0,
        rto_orders: 0,
        pending_orders: 0,
        total_amount: 0,
      };
    }
  }

  async getOrdersByDateRange(startDate: string, endDate: string, filters: OrderFilters = {}): Promise<Order[]> {
    const dateFilters = {
      ...filters,
      date_from: startDate,
      date_to: endDate,
    };
    return this.getOrders(dateFilters);
  }

  async getOrdersByStatus(status: string, filters: OrderFilters = {}): Promise<Order[]> {
    const statusFilters = {
      ...filters,
      status,
    };
    return this.getOrders(statusFilters);
  }

  async exportOrders(exportFilters: {
    date_range?: string;
    order_id?: string;
    order_type?: string[];
  }): Promise<string> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      const url = `${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/order/export`;
      console.log('Export API URL:', url);
      console.log('Export filters:', exportFilters);
      console.log('Auth token available:', !!token);
      
      // Ensure we have valid filters
      const requestBody = {
        date_range: exportFilters.date_range || "",
        order_id: exportFilters.order_id || "",
        order_type: exportFilters.order_type || []
      };
      
      console.log('Request body being sent:', requestBody);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Export API response status:', response.status);
      console.log('Export API response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Export API error response:', errorData);
        throw new Error(errorData.message || `Failed to export orders (${response.status})`);
      }

      // Parse the response to get the download URL
      const result = await response.json();
      console.log('Export API response:', result);
      
      if (result.status && result.data?.download_url) {
        console.log('Export successful, download URL:', result.data.download_url);
        return result.data.download_url;
      } else {
        throw new Error('Invalid response format: missing download URL');
      }
    } catch (error) {
      console.error('Error exporting orders:', error);
      throw error;
    }
  }

  async cancelOrder(orderId: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const url = `${API_CONFIG.BASE_URL}api/order/${orderId}`;
      console.log('Cancel order API URL:', url);
      console.log('API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);
      console.log('Environment VITE_API_URL:', import.meta.env.VITE_API_URL);
      console.log('Cancelling order ID:', orderId);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Cancel order API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Cancel order API error response:', errorData);
        throw new Error(errorData.message || `Failed to cancel order (${response.status})`);
      }

      const result = await response.json();
      console.log('Cancel order API response:', result);
      
      return {
        success: true,
        message: result.message || 'Order cancelled successfully',
        data: result.data
      };
    } catch (error) {
      console.error('Error cancelling order:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to cancel order'
      };
    }
  }
}

export const orderService = new OrderService(); 