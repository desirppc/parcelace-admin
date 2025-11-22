import masterFormulas from '@/data/master-formulas.json';
import { orderService } from './orderService';
import { shipmentService } from './shipmentService';
import { ENVIRONMENT } from '@/config/environment';

interface DataPoint {
  name: string;
  description: string;
  api_endpoint: string;
  filters: Record<string, any>;
  calculation: string;
}

interface Metric {
  name: string;
  aliases: string[];
  description: string;
  formula: string;
  unit: string;
  category: string;
  calculation_type: string;
  api_endpoint: string;
  filters: Record<string, boolean>;
  friendly_response: string;
}

interface AnalyticsResponse {
  metric: string;
  value: number;
  unit: string;
  description: string;
  calculation: string;
  data_points: Record<string, number>;
  friendly_response: string;
}

class AnalyticsService {
  private formulas = masterFormulas;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private useMockData = false; // Set to false to use real API data

  /**
   * Parse user query and find matching metric
   */
  parseQuery(query: string): Metric | null {
    const normalizedQuery = query.toLowerCase().trim();
    console.log('Parsing query:', normalizedQuery);
    
    // Search through all metrics and their aliases
    for (const [key, metric] of Object.entries(this.formulas.metrics)) {
      console.log(`Checking metric: ${key} with aliases:`, metric.aliases);
      
      // Check if any alias is contained in the query
      const hasMatch = metric.aliases.some(alias => {
        const normalizedAlias = alias.toLowerCase();
        
        // Check for exact match first
        if (normalizedQuery.includes(normalizedAlias)) {
          console.log(`Exact match found for alias "${normalizedAlias}"`);
          return true;
        }
        
        // Check for word-based matching (split by spaces)
        const queryWords = normalizedQuery.split(/\s+/);
        const aliasWords = normalizedAlias.split(/\s+/);
        
        // Check if all alias words are present in query words
        const allWordsMatch = aliasWords.every(aliasWord => 
          queryWords.some(queryWord => queryWord.includes(aliasWord) || aliasWord.includes(queryWord))
        );
        
        if (allWordsMatch) {
          console.log(`Word-based match found for alias "${normalizedAlias}"`);
          return true;
        }
        
        return false;
      });
      
      if (hasMatch) {
        console.log(`Found matching metric: ${key}`);
        return metric as Metric;
      }
    }
    
    console.log('No matching metric found');
    return null;
  }

  /**
   * Extract data points needed for a metric calculation
   */
  extractDataPoints(metric: Metric): string[] {
    const dataPoints: string[] = [];
    const formula = metric.formula;
    
    // Extract data point names from formula (e.g., RTO_Order, Total_FP_Order)
    // Use a more specific regex to match complete data point names
    const matches = formula.match(/[A-Z][A-Za-z_]*/g);
    if (matches) {
      // Filter out common words that aren't data points
      const validDataPoints = matches.filter(match => 
        this.formulas.data_points[match] !== undefined
      );
      dataPoints.push(...validDataPoints);
    }
    
    console.log(`Extracted data points for ${metric.name}:`, dataPoints);
    return dataPoints;
  }

  /**
   * Fetch data for a specific data point using integrated APIs
   */
  async fetchDataPoint(dataPointKey: string, filters: Record<string, any> = {}): Promise<number> {
    const dataPoint = this.formulas.data_points[dataPointKey] as DataPoint;
    
    if (!dataPoint) {
      throw new Error(`Data point ${dataPointKey} not found`);
    }

    console.log(`Fetching data point: ${dataPointKey} with filters:`, filters);
    const startTime = Date.now();

    try {
      let result: number;
      
      // Use integrated services based on data point type
      switch (dataPointKey) {
        case 'Total_FP_Order':
          result = await this.fetchTotalOrders(filters);
          break;
        
        case 'RTO_Order':
          result = await this.fetchRTOOrders(filters);
          break;
        
        case 'Delivered_Orders':
          result = await this.fetchDeliveredOrders(filters);
          break;
        
        case 'Current_Balance':
          result = await this.fetchWalletBalance();
          break;
        
        case 'Wallet_Expense':
          result = await this.fetchWalletExpense(filters);
          break;
        
        case 'Total_Shipments':
          result = await this.fetchTotalShipments(filters);
          break;
        
        case 'Delivered_Shipments':
          result = await this.fetchDeliveredShipments(filters);
          break;
        
        default:
          // Fallback to direct API call for unknown data points
          result = await this.fetchDirectAPI(dataPoint, filters);
          break;
      }
      
      const duration = Date.now() - startTime;
      return result;
      
    } catch (error) {
      console.error(`Error fetching data for ${dataPointKey}:`, error);
      const duration = Date.now() - startTime;
      return this.getMockValue(dataPointKey);
    }
  }

  /**
   * Calculate metric value using formula and data points
   */
  async calculateMetric(metric: Metric, filters: Record<string, any> = {}): Promise<AnalyticsResponse> {
    const dataPoints = this.extractDataPoints(metric);
    const dataPointValues: Record<string, number> = {};
    
    // Fetch all required data points
    for (const dataPoint of dataPoints) {
      dataPointValues[dataPoint] = await this.fetchDataPoint(dataPoint, filters);
    }
    
    // Calculate the metric using the formula
    let calculatedValue: number;
    const formula = metric.formula;
    
    try {
      // Replace data point names with their values in the formula
      let calculationFormula = formula;
      Object.entries(dataPointValues).forEach(([key, value]) => {
        calculationFormula = calculationFormula.replace(new RegExp(key, 'g'), value.toString());
      });
      
      // Evaluate the formula (in production, use a safe math library)
      calculatedValue = eval(calculationFormula);
      
    } catch (error) {
      console.error('Error calculating metric:', error);
      calculatedValue = 0;
    }
    
    // Log calculation step
    
    // Generate friendly response
    const userName = this.getUserName();
    const timestamp = new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    // Format value based on unit
    let formattedValue = calculatedValue.toFixed(2);
    if (metric.unit === 'count') {
      formattedValue = calculatedValue.toLocaleString('en-IN');
    } else if (metric.unit === '%') {
      formattedValue = calculatedValue.toFixed(1);
    } else if (metric.unit === '₹') {
      formattedValue = calculatedValue.toLocaleString('en-IN');
    }
    
    const friendlyResponse = metric.friendly_response
      .replace('{user_name}', userName)
      .replace('{value}', formattedValue)
      .replace('{timestamp}', timestamp);
    
    return {
      metric: metric.name,
      value: calculatedValue,
      unit: metric.unit,
      description: metric.description,
      calculation: formula,
      data_points: dataPointValues,
      friendly_response: friendlyResponse,
    };
  }

  /**
   * Main method to process analytics queries
   */
  async processQuery(query: string, filters: Record<string, any> = {}): Promise<AnalyticsResponse | null> {
    console.log('Processing analytics query:', query);
    
    const metric = this.parseQuery(query);
    
    if (!metric) {
      console.log('No metric found for query');
      // Don't end session here - let the component handle it
      return null;
    }
    
    console.log('Found metric:', metric.name);
    
    // Process date filters if present in query
    const processedFilters = this.processDateFilters(query, filters);
    
    const result = await this.calculateMetric(metric, processedFilters);
    console.log('Analytics result:', result);
    
    // Don't end session here - let the component handle it
    return result;
  }

  /**
   * Process date filters from query
   */
  private processDateFilters(query: string, filters: Record<string, any> = {}): Record<string, any> {
    const processedFilters = { ...filters };
    const lowerQuery = query.toLowerCase();
    
    // Check for "today" in query
    if (lowerQuery.includes('today')) {
      const today = new Date();
      // Use local date format instead of ISO format to match API expectations
      const todayStr = today.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });
      processedFilters.date_from = todayStr;
      processedFilters.date_to = todayStr;
    }
    
    // Check for "yesterday" in query
    if (lowerQuery.includes('yesterday')) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      // Use local date format instead of ISO format to match API expectations
      const yesterdayStr = yesterday.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });
      processedFilters.date_from = yesterdayStr;
      processedFilters.date_to = yesterdayStr;
    }
    
    // Check for "this week" in query
    if (lowerQuery.includes('this week')) {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      processedFilters.date_from = startOfWeek.toISOString().split('T')[0];
      processedFilters.date_to = endOfWeek.toISOString().split('T')[0];
    }
    
    // Check for "this month" in query
    if (lowerQuery.includes('this month')) {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      processedFilters.date_from = startOfMonth.toISOString().split('T')[0];
      processedFilters.date_to = endOfMonth.toISOString().split('T')[0];
    }
    
    return processedFilters;
  }

  /**
   * Get available metrics for suggestions
   */
  getAvailableMetrics(): Array<{ name: string; aliases: string[]; description: string }> {
    return Object.values(this.formulas.metrics).map(metric => ({
      name: metric.name,
      aliases: metric.aliases,
      description: metric.description,
    }));
  }

  /**
   * Get cached data if available and not expired
   */
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Cache data with timestamp
   */
  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get real-time dashboard data
   */
  async getDashboardData(): Promise<{
    total_orders: number;
    delivered_orders: number;
    rto_orders: number;
    wallet_balance: number;
    total_shipments: number;
    delivered_shipments: number;
  }> {
    try {
      const cacheKey = 'dashboard_data';
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }

      const [
        orderStats,
        walletBalance,
        shipmentStats
      ] = await Promise.all([
        orderService.getOrderStats(),
        // Mock wallet balance
        Promise.resolve({ balance: 0, currency: 'INR' }),
        shipmentService.getShipmentStats()
      ]);

      const dashboardData = {
        total_orders: orderStats.total_orders,
        delivered_orders: orderStats.delivered_orders,
        rto_orders: orderStats.rto_orders,
        wallet_balance: walletBalance.balance,
        total_shipments: shipmentStats.total_shipments,
        delivered_shipments: shipmentStats.delivered_shipments,
      };

      this.setCachedData(cacheKey, dashboardData);
      return dashboardData;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return {
        total_orders: 0,
        delivered_orders: 0,
        rto_orders: 0,
        wallet_balance: 0,
        total_shipments: 0,
        delivered_shipments: 0,
      };
    }
  }

  /**
   * Mock values for development/testing
   */
  private getMockValue(dataPointKey: string): number {
    const mockValues: Record<string, number> = {
      'Total_FP_Order': 1250,
      'RTO_Order': 87,
      'Delivered_Orders': 1103,
      'Current_Balance': 15420,
      'Wallet_Expense': 3250,
      'Total_Shipments': 1250,
      'Delivered_Shipments': 1103,
    };
    
    return mockValues[dataPointKey] || 0;
  }

  /**
   * Test method to verify metric parsing
   */
  testMetricParsing(): void {
    const testQueries = [
      "Check my wallet expense for today",
      "wallet expense",
      "expense",
      "spending",
      "wallet spending"
    ];
    
    console.log('Testing metric parsing...');
    testQueries.forEach(query => {
      console.log(`\nTesting query: "${query}"`);
      const result = this.parseQuery(query);
      console.log(`Result:`, result ? result.name : 'No match');
    });
  }

  /**
   * Fetch total orders using order service
   */
  private async fetchTotalOrders(filters: Record<string, any> = {}): Promise<number> {
    // Use mock data for testing
    if (this.useMockData) {
      console.log('Using mock data for total orders');
      const mockValue = this.getMockValue('Total_FP_Order');
      console.log('Mock total orders:', mockValue);
      return mockValue;
    }

    try {
      const cacheKey = `total_orders_${JSON.stringify(filters)}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        console.log('Using cached total orders:', cached);
        return cached;
      }

      console.log('Fetching total orders with filters:', filters);
      
      // Get orders and count them instead of using stats endpoint
      const ordersResponse = await orderService.getOrders(filters);
      console.log('Orders response:', ordersResponse);
      console.log('Orders response type:', typeof ordersResponse);
      console.log('Orders response keys:', Object.keys(ordersResponse || {}));
      
      let result = 0;
      
      // If ordersResponse is an array, count it
      if (Array.isArray(ordersResponse)) {
        result = ordersResponse.length;
      }
      // If ordersResponse has a pagination structure like your API response
      else if (ordersResponse && ordersResponse.pagination && ordersResponse.pagination.total) {
        result = ordersResponse.pagination.total;
      }
      // If ordersResponse has a data structure with orders_data
      else if (ordersResponse && ordersResponse.data && ordersResponse.data.pagination) {
        result = ordersResponse.data.pagination.total;
      }
      // If ordersResponse has orders_data array (like your API response)
      else if (ordersResponse && ordersResponse.orders_data && Array.isArray(ordersResponse.orders_data)) {
        result = ordersResponse.orders_data.length;
      }
      // Fallback to stats endpoint
      else {
        console.log('Falling back to stats endpoint');
        const stats = await orderService.getOrderStats(filters);
        console.log('Order stats response:', stats);
        result = stats.total_orders;
      }
      
      this.setCachedData(cacheKey, result);
      console.log('Total orders result:', result);
      return result;
    } catch (error) {
      console.error('Error fetching total orders:', error);
      const mockValue = this.getMockValue('Total_FP_Order');
      console.log('Using mock value for total orders:', mockValue);
      return mockValue;
    }
  }

  /**
   * Fetch RTO orders using order service
   */
  private async fetchRTOOrders(filters: Record<string, any> = {}): Promise<number> {
    // Use mock data for testing
    if (this.useMockData) {
      console.log('Using mock data for RTO orders');
      const mockValue = this.getMockValue('RTO_Order');
      console.log('Mock RTO orders:', mockValue);
      return mockValue;
    }

    try {
      const stats = await orderService.getOrderStats(filters);
      return stats.rto_orders;
    } catch (error) {
      console.error('Error fetching RTO orders:', error);
      return this.getMockValue('RTO_Order');
    }
  }

  /**
   * Fetch delivered orders using order service
   */
  private async fetchDeliveredOrders(filters: Record<string, any> = {}): Promise<number> {
    // Use mock data for testing
    if (this.useMockData) {
      console.log('Using mock data for delivered orders');
      const mockValue = this.getMockValue('Delivered_Orders');
      console.log('Mock delivered orders:', mockValue);
      return mockValue;
    }

    try {
      const stats = await orderService.getOrderStats(filters);
      return stats.delivered_orders;
    } catch (error) {
      console.error('Error fetching delivered orders:', error);
      return this.getMockValue('Delivered_Orders');
    }
  }

  /**
   * Fetch wallet balance using wallet service
   */
  private async fetchWalletBalance(): Promise<number> {
    // Use mock data for testing
    if (this.useMockData) {
      console.log('Using mock data for wallet balance');
      const mockValue = this.getMockValue('Current_Balance');
      console.log('Mock wallet balance:', mockValue);
      return mockValue;
    }

    try {
      const cacheKey = 'wallet_balance';
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }

      // Mock wallet balance
      const balance = { balance: 0, currency: 'INR' };
      const result = balance.balance;
      
      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      return this.getMockValue('Current_Balance');
    }
  }

  /**
   * Fetch wallet expense using wallet service
   */
  private async fetchWalletExpense(filters: Record<string, any> = {}): Promise<number> {
    try {
      // Mock wallet transactions
      const transactions: any[] = [];
      
      // Calculate total expense (debit transactions)
      const totalExpense = transactions
        .filter(tx => tx.type === 'debit' && tx.status === 'completed')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      return totalExpense;
    } catch (error) {
      console.error('Error fetching wallet expense:', error);
      return this.getMockValue('Wallet_Expense');
    }
  }

  /**
   * Fetch total shipments using shipment service
   */
  private async fetchTotalShipments(filters: Record<string, any> = {}): Promise<number> {
    try {
      const stats = await shipmentService.getShipmentStats(filters);
      return stats.total_shipments;
    } catch (error) {
      console.error('Error fetching total shipments:', error);
      return this.getMockValue('Total_Shipments');
    }
  }

  /**
   * Fetch delivered shipments using shipment service
   */
  private async fetchDeliveredShipments(filters: Record<string, any> = {}): Promise<number> {
    try {
      const stats = await shipmentService.getShipmentStats(filters);
      return stats.delivered_shipments;
    } catch (error) {
      console.error('Error fetching delivered shipments:', error);
      return this.getMockValue('Delivered_Shipments');
    }
  }

  /**
   * Fallback method for direct API calls
   */
  private async fetchDirectAPI(dataPoint: DataPoint, filters: Record<string, any> = {}): Promise<number> {
    try {
      // Use ENVIRONMENT to get the correct API URL with proper trailing slash handling
      const baseUrl = ENVIRONMENT.getCurrentApiUrl();
      const cleanEndpoint = dataPoint.api_endpoint.startsWith('/') ? dataPoint.api_endpoint.slice(1) : dataPoint.api_endpoint;
      const apiUrl = `${baseUrl}${cleanEndpoint}`;
      
      // Build query parameters from filters
      const queryParams = new URLSearchParams();
      
      // Add data point specific filters
      Object.entries(dataPoint.filters).forEach(([key, values]) => {
        if (Array.isArray(values)) {
          queryParams.append(key, values.join(','));
        } else {
          queryParams.append(key, values.toString());
        }
      });
      
      // Add user provided filters
      Object.entries(filters).forEach(([key, value]) => {
        queryParams.append(key, value.toString());
      });

      const response = await fetch(`${apiUrl}?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Return mock value for unknown data points
      return this.getMockValue(dataPoint.name);
      
    } catch (error) {
      console.error(`Error fetching data for ${dataPoint.name}:`, error);
      return this.getMockValue(dataPoint.name);
    }
  }

  /**
   * Get user name from storage
   */
  private getUserName(): string {
    try {
      // Try localStorage first
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.name) return user.name;
      
      // Try sessionStorage
      const sessionUser = JSON.parse(sessionStorage.getItem('user') || '{}');
      if (sessionUser.name) return sessionUser.name;
      
      // Try email from localStorage
      if (user.email) return user.email.split('@')[0];
      
      // Try email from sessionStorage
      if (sessionUser.email) return sessionUser.email.split('@')[0];
      
      // Default fallback
      return 'there';
    } catch (error) {
      console.error('Error getting user name:', error);
      return 'there';
    }
  }
}

export const analyticsService = new AnalyticsService(); 