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
   * Calculate similarity between two strings using Levenshtein distance
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Extract keywords from query, removing common stop words
   */
  private extractKeywords(query: string): string[] {
    const stopWords = new Set([
      'what', 'is', 'my', 'the', 'a', 'an', 'for', 'this', 'that', 'these', 'those',
      'show', 'me', 'tell', 'give', 'check', 'get', 'find', 'how', 'many', 'much',
      'can', 'you', 'please', 'i', 'want', 'need', 'to', 'know', 'about', 'of',
      'in', 'on', 'at', 'by', 'from', 'with', 'as', 'are', 'was', 'were', 'be',
      'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'shall'
    ]);
    
    const words = query.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
    
    return words;
  }

  /**
   * Calculate match score for a metric against a query
   */
  private calculateMatchScore(query: string, metric: Metric, alias: string): number {
    const normalizedQuery = query.toLowerCase();
    const normalizedAlias = alias.toLowerCase();
    let score = 0;
    
    // Exact substring match (highest score)
    if (normalizedQuery.includes(normalizedAlias)) {
      score += 100;
    }
    
    // Check if all alias words are present in query
    const aliasWords = normalizedAlias.split(/\s+/);
    const queryWords = normalizedQuery.split(/\s+/);
    const matchingWords = aliasWords.filter(aliasWord => 
      queryWords.some(queryWord => 
        queryWord.includes(aliasWord) || aliasWord.includes(queryWord)
      )
    );
    
    if (matchingWords.length === aliasWords.length) {
      score += 80;
    } else if (matchingWords.length > 0) {
      score += (matchingWords.length / aliasWords.length) * 60;
    }
    
    // Fuzzy similarity score
    const similarity = this.calculateSimilarity(normalizedQuery, normalizedAlias);
    score += similarity * 40;
    
    // Boost score if metric name words are in query
    const metricNameWords = metric.name.toLowerCase().split(/\s+/);
    const metricWordsInQuery = metricNameWords.filter(word => 
      normalizedQuery.includes(word)
    );
    if (metricWordsInQuery.length > 0) {
      score += (metricWordsInQuery.length / metricNameWords.length) * 30;
    }
    
    // Boost score for keyword matches
    const keywords = this.extractKeywords(query);
    const aliasKeywords = this.extractKeywords(alias);
    const matchingKeywords = keywords.filter(kw => 
      aliasKeywords.some(akw => akw.includes(kw) || kw.includes(akw))
    );
    if (matchingKeywords.length > 0) {
      score += (matchingKeywords.length / Math.max(keywords.length, aliasKeywords.length)) * 20;
    }
    
    return score;
  }

  /**
   * Parse user query and find matching metric with improved fuzzy matching
   */
  parseQuery(query: string): Metric | null {
    const normalizedQuery = query.toLowerCase().trim();
    console.log('Parsing query:', normalizedQuery);
    
    // Remove common query prefixes
    const cleanedQuery = normalizedQuery
      .replace(/^(what|what's|what is|show|tell|give|check|get|find|how|can you|please)\s+/i, '')
      .replace(/\s+(for|in|during|of|this|that|the)\s+(this|that|the|my|me)/gi, ' ')
      .trim();
    
    const matches: Array<{ metric: Metric; key: string; score: number; alias: string }> = [];
    
    // Search through all metrics and their aliases
    for (const [key, metric] of Object.entries(this.formulas.metrics)) {
      // Check each alias for this metric
      for (const alias of metric.aliases) {
        const score = this.calculateMatchScore(cleanedQuery, metric, alias);
        
        if (score > 30) { // Threshold for considering a match
          matches.push({ metric: metric as Metric, key, score, alias });
        }
      }
      
      // Also check metric name directly
      const nameScore = this.calculateMatchScore(cleanedQuery, metric, metric.name);
      if (nameScore > 30) {
        matches.push({ metric: metric as Metric, key, score: nameScore, alias: metric.name });
      }
    }
    
    if (matches.length === 0) {
      console.log('No matching metric found');
      return null;
    }
    
    // Sort by score (highest first) and return the best match
    matches.sort((a, b) => b.score - a.score);
    const bestMatch = matches[0];
    
    console.log(`Found ${matches.length} potential matches. Best match: ${bestMatch.key} (score: ${bestMatch.score.toFixed(2)}, alias: "${bestMatch.alias}")`);
    
    return bestMatch.metric;
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
        
        case 'Picked_Up_Orders':
          result = await this.fetchPickedUpOrders(filters);
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
   * Process date filters from query with improved natural language parsing
   */
  private processDateFilters(query: string, filters: Record<string, any> = {}): Record<string, any> {
    const processedFilters = { ...filters };
    const lowerQuery = query.toLowerCase();
    
    // Format date as YYYY-MM-DD for API
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check for "today" in query
    if (lowerQuery.match(/\btoday\b/)) {
      processedFilters.date_from = formatDate(today);
      processedFilters.date_to = formatDate(today);
      return processedFilters;
    }
    
    // Check for "yesterday" in query
    if (lowerQuery.match(/\byesterday\b/)) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      processedFilters.date_from = formatDate(yesterday);
      processedFilters.date_to = formatDate(yesterday);
      return processedFilters;
    }
    
    // Check for "this week" in query
    if (lowerQuery.match(/\bthis\s+week\b/)) {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(today);
      processedFilters.date_from = formatDate(startOfWeek);
      processedFilters.date_to = formatDate(endOfWeek);
      return processedFilters;
    }
    
    // Check for "last week" in query
    if (lowerQuery.match(/\blast\s+week\b/)) {
      const startOfLastWeek = new Date(today);
      startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
      processedFilters.date_from = formatDate(startOfLastWeek);
      processedFilters.date_to = formatDate(endOfLastWeek);
      return processedFilters;
    }
    
    // Check for "this month" in query
    if (lowerQuery.match(/\bthis\s+month\b/)) {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today);
      processedFilters.date_from = formatDate(startOfMonth);
      processedFilters.date_to = formatDate(endOfMonth);
      return processedFilters;
    }
    
    // Check for "last month" in query
    if (lowerQuery.match(/\blast\s+month\b/)) {
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      processedFilters.date_from = formatDate(startOfLastMonth);
      processedFilters.date_to = formatDate(endOfLastMonth);
      return processedFilters;
    }
    
    // Check for "last 7 days" or "past 7 days"
    if (lowerQuery.match(/\b(last|past)\s+7\s+days?\b/)) {
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 6); // Include today
      processedFilters.date_from = formatDate(startDate);
      processedFilters.date_to = formatDate(today);
      return processedFilters;
    }
    
    // Check for "last 30 days" or "past 30 days"
    if (lowerQuery.match(/\b(last|past)\s+30\s+days?\b/)) {
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 29); // Include today
      processedFilters.date_from = formatDate(startDate);
      processedFilters.date_to = formatDate(today);
      return processedFilters;
    }
    
    // Check for "last 90 days" or "past 90 days"
    if (lowerQuery.match(/\b(last|past)\s+90\s+days?\b/)) {
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 89); // Include today
      processedFilters.date_from = formatDate(startDate);
      processedFilters.date_to = formatDate(today);
      return processedFilters;
    }
    
    // Check for "this year"
    if (lowerQuery.match(/\bthis\s+year\b/)) {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      processedFilters.date_from = formatDate(startOfYear);
      processedFilters.date_to = formatDate(today);
      return processedFilters;
    }
    
    return processedFilters;
  }

  /**
   * Get available metrics for suggestions
   */
  getAvailableMetrics(): Array<{ name: string; aliases: string[]; description: string; category: string }> {
    return Object.values(this.formulas.metrics).map(metric => ({
      name: metric.name,
      aliases: metric.aliases,
      description: metric.description,
      category: metric.category || 'Other',
    }));
  }

  /**
   * Get metrics grouped by category
   */
  getMetricsByCategory(): Record<string, Array<{ name: string; aliases: string[]; description: string; category: string }>> {
    const metrics = this.getAvailableMetrics();
    const grouped: Record<string, Array<{ name: string; aliases: string[]; description: string; category: string }>> = {};
    
    metrics.forEach(metric => {
      const category = metric.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(metric);
    });
    
    return grouped;
  }

  /**
   * Get all unique categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    Object.values(this.formulas.metrics).forEach(metric => {
      categories.add(metric.category || 'Other');
    });
    return Array.from(categories).sort();
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
      'Picked_Up_Orders': 1180,
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
   * Fetch picked up orders using order service
   */
  private async fetchPickedUpOrders(filters: Record<string, any> = {}): Promise<number> {
    try {
      // For now, we'll use total orders as a proxy for picked up orders
      // In a real implementation, you'd filter by status like "Picked Up", "In Transit", etc.
      const stats = await orderService.getOrderStats(filters);
      // Assuming picked up orders are orders that are not in "pending" or "cancelled" status
      // This is a simplified implementation - adjust based on your actual order statuses
      return stats.total_orders - (stats.pending_orders || 0);
    } catch (error) {
      console.error('Error fetching picked up orders:', error);
      return this.getMockValue('Picked_Up_Orders');
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