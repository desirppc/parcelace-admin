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
      
      // Handle authentication errors - now handled globally in apiRequest
      // The global handler will automatically logout and redirect to login
      
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

      // Handle authentication errors - now handled globally in apiRequest
      // The global handler will automatically logout and redirect to login

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

  async downloadShippingLabels(awbNumbers: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BULK_SHIPMENT_LABELS}`, {
        method: 'POST',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ awb: awbNumbers })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || `Failed to download labels (${response.status})` };
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `shipping-labels-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error downloading shipping labels:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  async downloadInvoice(awbNumbers: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }
      
      if (!awbNumbers || awbNumbers.length === 0) {
        return { success: false, error: 'No AWB numbers provided' };
      }
      
      console.log('Downloading invoice for AWBs:', awbNumbers);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BULK_SHIPMENT_INVOICE}`, {
        method: 'POST',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ awb: awbNumbers })
      });

      console.log('Download invoice response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Download invoice error:', errorData);
        return { success: false, error: errorData.message || `Failed to download invoice (${response.status})` };
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${awbNumbers.length > 1 ? 'bulk' : awbNumbers[0]}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Invoice downloaded successfully');
      return { success: true };
    } catch (error) {
      console.error('Error downloading invoice:', error);
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

  async cancelShipment(awb: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SHIPMENT_CANCEL}`;
      console.log('Cancel shipment API URL:', url);
      console.log('Cancelling AWB:', awb);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ awb })
      });

      console.log('Cancel shipment API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Cancel shipment API error response:', errorData);
        throw new Error(errorData.message || `Failed to cancel shipment (${response.status})`);
      }

      const result = await response.json();
      console.log('Cancel shipment API response:', result);
      
      return {
        success: true,
        message: result.message || 'Shipment cancelled successfully',
        data: result.data
      };
    } catch (error) {
      console.error('Error cancelling shipment:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to cancel shipment'
      };
    }
  }

  async cancelBulkShipments(awbs: string[]): Promise<{ success: boolean; message: string; data?: any; failedAwbs?: string[] }> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      if (!awbs || awbs.length === 0) {
        throw new Error('No AWB numbers provided for cancellation');
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SHIPMENT_CANCEL}`;
      console.log('Bulk cancel shipments API URL:', url);
      console.log('Cancelling AWBs:', awbs);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ awb: awbs })
      });

      console.log('Bulk cancel shipments API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Bulk cancel shipments API error response:', errorData);
        throw new Error(errorData.message || `Failed to cancel shipments (${response.status})`);
      }

      const result = await response.json();
      console.log('Bulk cancel shipments API response:', result);
      
      return {
        success: true,
        message: result.message || 'Shipments cancelled successfully',
        data: result.data,
        failedAwbs: result.failed_awbs || []
      };
    } catch (error) {
      console.error('Error cancelling bulk shipments:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to cancel shipments'
      };
    }
  }

  // Bulk Booking Functions
  async createBulkBookingRequest(warehouseId: string, rtoId: string, orderIds: string[]): Promise<{ success: boolean; message: string; data?: { uuId: string }; error?: string }> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      if (!warehouseId || !rtoId || !orderIds || orderIds.length === 0) {
        throw new Error('Warehouse ID, RTO ID, and order IDs are required');
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BULK_BOOKING_REQUEST}`;
      console.log('Create bulk booking request API URL:', url);
      console.log('Bulk booking request payload:', { warehouse_id: warehouseId, rto_id: rtoId, order_ids: orderIds });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          warehouse_id: warehouseId,
          rto_id: rtoId,
          order_ids: orderIds
        })
      });

      console.log('Create bulk booking request API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Create bulk booking request API error response:', errorData);
        throw new Error(errorData.message || `Failed to create bulk booking request (${response.status})`);
      }

      const bookingResult = await response.json();
      console.log('📋 Raw booking response:', bookingResult);
      
      // Try multiple possible UUID field names
      const uuid = bookingResult.uuId || 
                   bookingResult.uuid || 
                   bookingResult.UUID || 
                   bookingResult.Uuid ||
                   bookingResult.data?.uuId || 
                   bookingResult.data?.uuid || 
                   bookingResult.data?.UUID ||
                   bookingResult.data?.Uuid ||
                   bookingResult.booking_uuid ||
                   bookingResult.booking_uuid ||
                   bookingResult.id;
      
      console.log('🔍 Extracted UUID:', uuid);
      console.log('🔍 Available fields in response:', Object.keys(bookingResult));
      if (bookingResult.data) {
        console.log('🔍 Available fields in data:', Object.keys(bookingResult.data));
      }
      
      if (!uuid) {
        console.error('❌ No UUID found in response. Full response:', bookingResult);
        throw new Error('No UUID received from bulk booking request. Please check the API response structure.');
      }

      return {
        success: true,
        message: bookingResult.message || 'Bulk booking request created successfully',
        data: { uuId: uuid }
      };
    } catch (error) {
      console.error('Error creating bulk booking request:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create bulk booking request',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getBulkBookingRates(uuId: string): Promise<{ success: boolean; message: string; data?: any; error?: string }> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      if (!uuId) {
        throw new Error('UUID is required to fetch bulk booking rates');
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_BULK_BOOKING_RATES}`;
      console.log('Get bulk booking rates API URL:', url);
      console.log('Fetching rates for UUID:', uuId);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ uuId })
      });

      console.log('Get bulk booking rates API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Get bulk booking rates API error response:', errorData);
        throw new Error(errorData.message || `Failed to fetch bulk booking rates (${response.status})`);
      }

      const result = await response.json();
      console.log('Get bulk booking rates API response:', result);
      
      return {
        success: true,
        message: result.message || 'Bulk booking rates fetched successfully',
        data: result.data || result
      };
    } catch (error) {
      console.error('Error fetching bulk booking rates:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch bulk booking rates',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Combined function to create bulk booking request and fetch rates in one call
  async createBulkBookingAndGetRates(warehouseId: string, rtoId: string, orderIds: string[]): Promise<{ 
    success: boolean; 
    message: string; 
    data?: { 
      uuId: string; 
      rates: any; 
    }; 
    error?: string 
  }> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      if (!warehouseId || !rtoId || !orderIds || orderIds.length === 0) {
        throw new Error('Warehouse ID, RTO ID, and order IDs are required');
      }

      // Step 1: Create bulk booking request
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BULK_BOOKING_REQUEST}`;
      const requestBody = {
        warehouse_id: warehouseId,
        rto_id: rtoId,
        order_ids: orderIds
      };
      
      console.log('🚀 Creating bulk booking and fetching rates in one call...');
      console.log('Payload:', requestBody);
      console.log('🔗 API URL:', url);
      console.log('🔑 Token present:', !!token);
      console.log('📤 Sending request to:', url);
      console.log('📤 Request body:', requestBody);
      console.log('📤 Request headers:', {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.substring(0, 20)}...`
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('📥 Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create bulk booking request (${response.status})`);
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      console.log('📥 Content-Type:', contentType);
      
      let bookingResult;
      try {
        bookingResult = await response.json();
        console.log('📋 Raw booking response:', bookingResult);
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        const textResponse = await response.text();
        console.error('❌ Raw text response:', textResponse);
        throw new Error('Invalid JSON response from server');
      }
      
      // Try multiple possible UUID field names
      const uuid = bookingResult.uuId || 
                   bookingResult.uuid || 
                   bookingResult.UUID || 
                   bookingResult.Uuid ||
                   bookingResult.data?.uuId || 
                   bookingResult.data?.uuid || 
                   bookingResult.data?.UUID ||
                   bookingResult.data?.Uuid ||
                   bookingResult.booking_uuid ||
                   bookingResult.booking_uuid ||
                   bookingResult.id;
      
      console.log('🔍 Extracted UUID:', uuid);
      console.log('🔍 Available fields in response:', Object.keys(bookingResult));
      if (bookingResult.data) {
        console.log('🔍 Available fields in data:', Object.keys(bookingResult.data));
      }
      
      if (!uuid) {
        console.error('❌ No UUID found in response. Full response:', bookingResult);
        throw new Error('No UUID received from bulk booking request. Please check the API response structure.');
      }

      console.log('✅ Bulk booking request created with UUID:', uuid);

      // Step 2: Immediately fetch rates using the UUID
      const ratesUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_BULK_BOOKING_RATES}`;
      const ratesResponse = await fetch(ratesUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ uuId: uuid })
      });

      if (!ratesResponse.ok) {
        const errorData = await ratesResponse.json();
        throw new Error(errorData.message || `Failed to fetch rates (${ratesResponse.status})`);
      }

      const ratesResult = await ratesResponse.json();
      console.log('✅ Rates fetched successfully');

      return {
        success: true,
        message: 'Bulk booking created and rates fetched successfully',
        data: {
          uuId: uuid,
          rates: ratesResult.data || ratesResult
        }
      };

    } catch (error) {
      console.error('❌ Error in combined bulk booking and rates fetch:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create bulk booking and fetch rates',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const shipmentService = new ShipmentService(); 

// New helper type and function for bulk booking (create shipments)
export type BulkBookingPayload = {
  warehouse_id: string;
  rto_id: string;
  order_ids: Record<string, {
    rates: {
      order_id: number;
      courier_partner_id: number;
      shippingRateData: any;
    }
  }>;
  auto_pickup?: number;
  user_id?: number;
};

export async function createBulkShipments(payload: BulkBookingPayload): Promise<{ success: boolean; message: string; data?: any; error?: string }>{
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  if (!token) return { success: false, message: 'Authentication token not found', error: 'No token' };

  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BULK_BOOKING_CREATE}`;
  console.log('Bulk booking create API URL:', url);
  console.log('Bulk booking create payload:', payload);

  const attempts = [0, 1000, 2000, 4000]; // ms, first is immediate
  for (let i = 0; i < attempts.length; i++) {
    if (attempts[i] > 0) {
      await new Promise(r => setTimeout(r, attempts[i]));
      console.log(`Retrying bulk shipments (attempt ${i + 1}/${attempts.length})...`);
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      console.log('Bulk booking create response status:', response.status);
      const result = await response.json();
      console.log('Bulk booking create response body:', result);

      // Success
      if (response.ok) {
        return {
          success: true,
          message: result.message || 'Shipment processing has been queued successfully',
          data: result.data
        };
      }

      const msg = (result && (result.message || result.error)) || `Failed to create bulk shipments (${response.status})`;
      const isLockTimeout = typeof msg === 'string' && (msg.includes('Lock wait timeout exceeded') || msg.includes('SQLSTATE[HY000]') || msg.includes('1205'));

      if (isLockTimeout && i < attempts.length - 1) {
        console.warn('Detected DB lock wait timeout. Will retry...', { attempt: i + 1, msg });
        continue; // retry
      }

      // Non-retryable error
      return { success: false, message: msg, error: msg };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Network error';
      const isLockTimeout = typeof errMsg === 'string' && (errMsg.includes('Lock wait timeout exceeded') || errMsg.includes('SQLSTATE[HY000]') || errMsg.includes('1205'));
      if (isLockTimeout && i < attempts.length - 1) {
        console.warn('Detected DB lock wait timeout on exception. Retrying...', { attempt: i + 1, err: errMsg });
        continue;
      }
      console.error('Bulk shipments request failed:', err);
      return { success: false, message: errMsg, error: errMsg };
    }
  }

  return { success: false, message: 'Failed after retries due to DB lock', error: 'Lock wait timeout exceeded' };
}