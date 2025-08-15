import API_CONFIG from '@/config/api';

export interface Shipment {
  id: string;
  tracking_number: string;
  courier_partner: string;
  booking_date: string;
  order_number: string;
  product_name: string;
  quantity: number;
  dimensions: string;
  weight: string;
  status: 'Pending' | 'Booked' | 'Pickup Failed' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'NDR' | 'RTO In Transit' | 'RTO Delivered' | 'Cancelled';
  delivery_date?: string;
  order_amount: number;
  payment_type: 'Prepaid' | 'COD';
  pickup_warehouse: string;
  delivery_address: string;
  customer_name: string;
  customer_number: string;
  awb?: string;
}

export interface ShipmentFilters {
  status?: string;
  courier_partner?: string;
  date_range?: {
    start: string;
    end: string;
  };
  search?: string;
}

class ShipmentService {
  async getShipments(page: number = 1, filters: ShipmentFilters = {}): Promise<{
    shipments: Shipment[];
    total: number;
    current_page: number;
    total_pages: number;
  }> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      // Check if we have a valid token
      if (!token) {
        console.warn('⚠️ No authentication token found');
        return {
          shipments: [],
          total: 0,
          current_page: page,
          total_pages: 0
        };
      }
      
      // Prepare request body for POST request
      const requestBody = {
        page: page,
        ...filters
      };
      
      console.log('🔍 Fetching shipments with POST request:', requestBody);
      console.log('🔑 Using token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SHIPMENTS}`, {
        method: 'POST',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 Shipments response status:', response.status);
      const result = await response.json();
      console.log('📊 Shipments response data:', result);
      
      // Handle authentication errors
      if (response.status === 401) {
        console.warn('⚠️ Authentication failed');
        // Clear invalid tokens
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        
        return {
          shipments: [],
          total: 0,
          current_page: page,
          total_pages: 0
        };
      }
      
      if (response.ok && result.data && result.data.shipment_data) {
        // Transform API response to match component expectations
        const shipments = result.data.shipment_data.map((shipment: any) => ({
          id: shipment.id?.toString() || '',
          tracking_number: shipment.awb || shipment.store_order?.order_no || '',
          courier_partner: shipment.courier_partner?.name || 'Unknown',
          booking_date: shipment.order_date || shipment.store_order?.sync_date || new Date().toISOString(),
          order_number: shipment.store_order?.order_no || shipment.store_order?.order_id || '',
          product_name: this.getProductNames(shipment.store_order?.store_order_items),
          quantity: this.getTotalQuantity(shipment.store_order?.store_order_items),
          dimensions: `${shipment.shipment_length || 0}x${shipment.shipment_width || 0}x${shipment.shipment_height || 0}`,
          weight: `${shipment.weight || 0} KG`,
          status: this.mapStatus(shipment.shipment_status),
          delivery_date: shipment.shipment_status === 'Delivered' ? shipment.order_date : undefined,
          order_amount: shipment.total_amount || shipment.store_order?.total || 0,
          payment_type: shipment.payment_mode === 'prepaid' ? 'Prepaid' : 'COD',
          pickup_warehouse: shipment.warehouse?.warehouse_name || 'Unknown Warehouse',
          delivery_address: shipment.customer_address || 'Unknown Address',
          customer_name: shipment.customer_name || '',
          customer_number: shipment.customer_number || '',
          awb: shipment.awb || null
        }));

        return {
          shipments,
          total: result.data.pagination?.total || shipments.length,
          current_page: result.data.pagination?.current_page || page,
          total_pages: result.data.pagination?.last_page || Math.ceil(shipments.length / 10)
        };
      } else {
        console.warn('⚠️ API returned error or no data');
        return {
          shipments: [],
          total: 0,
          current_page: page,
          total_pages: 0
        };
      }
    } catch (error) {
      console.error('❌ Error fetching shipments:', error);
      return {
        shipments: [],
        total: 0,
        current_page: page,
        total_pages: 0
      };
    }
  }

  private getProductNames(items: any[]): string {
    if (!items || items.length === 0) return 'Unknown Product';
    return items.map(item => item.name).join(', ');
  }

  private getTotalQuantity(items: any[]): number {
    if (!items || items.length === 0) return 1;
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
  }

  private mapStatus(apiStatus: string): 'Pending' | 'Booked' | 'Pickup Failed' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'NDR' | 'RTO In Transit' | 'RTO Delivered' | 'Cancelled' {
    const statusMap: { [key: string]: 'Pending' | 'Booked' | 'Pickup Failed' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'NDR' | 'RTO In Transit' | 'RTO Delivered' | 'Cancelled' } = {
      'pending': 'Pending',
      'booked': 'Booked',
      'pickup_failed': 'Pickup Failed',
      'in_transit': 'In Transit',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'ndr': 'NDR',
      'rto_in_transit': 'RTO In Transit',
      'rto_delivered': 'RTO Delivered',
      'cancelled': 'Cancelled',
      '-': 'Pending'
    };
    
    return statusMap[apiStatus?.toLowerCase()] || 'Pending';
  }

  async getShipmentById(shipmentId: string): Promise<Shipment | null> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        console.warn('⚠️ No authentication token found');
        return null;
      }
      
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SHIPMENTS}/${shipmentId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.status === 401) {
        console.warn('⚠️ Authentication failed');
        return null;
      }

      const result = await response.json();
      
      if (response.ok && result.data) {
        const shipment = result.data;
        return {
          id: shipment.id?.toString(),
          tracking_number: shipment.awb || shipment.store_order?.order_no || '',
          courier_partner: shipment.courier_partner?.name || 'Unknown',
          booking_date: shipment.order_date || shipment.store_order?.sync_date || new Date().toISOString(),
          order_number: shipment.store_order?.order_no || shipment.store_order?.order_id || '',
          product_name: this.getProductNames(shipment.store_order?.store_order_items),
          quantity: this.getTotalQuantity(shipment.store_order?.store_order_items),
          dimensions: `${shipment.shipment_length || 0}x${shipment.shipment_width || 0}x${shipment.shipment_height || 0}`,
          weight: `${shipment.weight || 0} KG`,
          status: this.mapStatus(shipment.shipment_status),
          delivery_date: shipment.shipment_status === 'Delivered' ? shipment.order_date : undefined,
          order_amount: shipment.total_amount || shipment.store_order?.total || 0,
          payment_type: shipment.payment_mode === 'prepaid' ? 'Prepaid' : 'COD',
          pickup_warehouse: shipment.warehouse?.warehouse_name || 'Unknown Warehouse',
          delivery_address: shipment.customer_address || 'Unknown Address',
          customer_name: shipment.customer_name || '',
          customer_number: shipment.customer_number || '',
          awb: shipment.awb || null
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching shipment by ID:', error);
      return null;
    }
  }

  async createShipment(shipmentData: Partial<Shipment>): Promise<{ success: boolean; data?: Shipment; error?: string }> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SHIPMENTS}`, {
        method: 'POST',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(shipmentData)
      });

      const result = await response.json();
      
      if (response.ok && result.data) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.message || 'Failed to create shipment' };
      }
    } catch (error) {
      console.error('Error creating shipment:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  async updateShipment(shipmentId: string, shipmentData: Partial<Shipment>): Promise<{ success: boolean; data?: Shipment; error?: string }> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SHIPMENTS}/${shipmentId}`, {
        method: 'PUT',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(shipmentData)
      });

      const result = await response.json();
      
      if (response.ok && result.data) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.message || 'Failed to update shipment' };
      }
    } catch (error) {
      console.error('Error updating shipment:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  async deleteShipment(shipmentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SHIPMENTS}/${shipmentId}`, {
        method: 'DELETE',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${token}`,
        }
      });

      const result = await response.json();
      
      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: result.message || 'Failed to delete shipment' };
      }
    } catch (error) {
      console.error('Error deleting shipment:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  async generateShippingLabel(shipmentId: string): Promise<{ success: boolean; label_url?: string; error?: string }> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SHIPMENT_LABEL}`, {
        method: 'POST',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ shipment_id: shipmentId })
      });

      const result = await response.json();
      
      if (response.ok && result.data) {
        return { success: true, label_url: result.data.label_url };
      } else {
        return { success: false, error: result.message || 'Failed to generate shipping label' };
      }
    } catch (error) {
      console.error('Error generating shipping label:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  async exportShipments(exportFilters: {
    date_range?: string;
    order_type?: string[];
    selected_status?: string[];
  }): Promise<string> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      const url = `${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/shipments/export`;
      console.log('Shipment Export API URL:', url);
      console.log('Shipment Export filters:', exportFilters);
      console.log('Auth token available:', !!token);
      
      // Ensure we have valid filters
      const requestBody = {
        date_range: exportFilters.date_range || "",
        order_type: exportFilters.order_type || [],
        selected_status: exportFilters.selected_status || []
      };
      
      console.log('Shipment Export request body being sent:', requestBody);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Shipment Export API response status:', response.status);
      console.log('Shipment Export API response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Shipment Export API error response:', errorData);
        throw new Error(errorData.message || `Failed to export shipments (${response.status})`);
      }

      // Parse the response to get the download URL
      const result = await response.json();
      console.log('Shipment Export API response:', result);
      
      if (result.status && result.data?.download_url) {
        console.log('Shipment Export successful, download URL:', result.data.download_url);
        return result.data.download_url;
      } else {
        throw new Error('Invalid response format: missing download URL');
      }
    } catch (error) {
      console.error('Error exporting shipments:', error);
      throw error;
    }
  }
}

export const shipmentService = new ShipmentService(); 