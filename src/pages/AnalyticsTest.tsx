import React, { useState, useMemo, useEffect } from 'react';
import { analyticsService } from '@/services/analyticsService';
import API_CONFIG, { apiRequest } from '@/config/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Search, Sparkles, TrendingUp, Loader2, CheckCircle2, XCircle, Info, Calendar, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsMatrix {
  id: number;
  matrix_name: string;
  detail: string;
  category_name: string;
  formula: string;
}

interface Metric {
  name: string;
  aliases: string[];
  description: string;
  category: string;
  id?: number;
  formula?: string;
}

const AnalyticsTest = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('thismonth');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(() => {
    // Default to start of current month
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [dateTo, setDateTo] = useState<Date | undefined>(() => {
    // Default to end of current month
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 1, 0);
  });
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);


  // Handle quick date range selection
  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    
    if (value === 'custom') {
      // Keep current dates when switching to custom
      return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let startDate: Date;
    let endDate: Date;
    
    switch (value) {
      case 'today':
        startDate = new Date(today);
        endDate = new Date(today);
        break;
      case 'last7days':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6); // Include today, so 6 days back
        endDate = new Date(today);
        break;
      case 'last30days':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 29); // Include today, so 29 days back
        endDate = new Date(today);
        break;
      case 'thismonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'lastmonth':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'last90days':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 89); // Include today, so 89 days back
        endDate = new Date(today);
        break;
      default:
        startDate = new Date(today);
        endDate = new Date(today);
    }
    
    setDateFrom(startDate);
    setDateTo(endDate);
  };

  // Fetch analytics matrices from API
  const fetchMetrics = React.useCallback(async () => {
    setMetricsLoading(true);
    setMetricsError(null);
    
    try {
      const result = await apiRequest(
        'api/analytics/metrics/list',
        API_CONFIG.METHODS.GET
      );

      if (result.success && result.data) {
        const matrices: AnalyticsMatrix[] = Array.isArray(result.data) ? result.data : [];
        
        // Transform API response to match component format
        const transformedMetrics: Metric[] = matrices.map((matrix) => ({
          name: matrix.matrix_name,
          aliases: [matrix.matrix_name.toLowerCase()], // Generate aliases from name
          description: matrix.detail || matrix.matrix_name,
          category: matrix.category_name || 'Other',
          id: matrix.id,
          formula: matrix.formula,
        }));
        
        setMetrics(transformedMetrics);
      } else {
        setMetricsError(result.message || 'Failed to fetch metrics');
        toast({
          title: 'Error',
          description: result.message || 'Failed to fetch analytics metrics',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error fetching analytics matrices:', error);
      setMetricsError(error.message || 'Failed to fetch metrics');
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch analytics metrics',
        variant: 'destructive',
      });
    } finally {
      setMetricsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Get metrics grouped by category
  const metricsByCategory = useMemo(() => {
    const grouped: Record<string, Metric[]> = {};
    
    metrics.forEach((metric) => {
      const category = metric.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(metric);
    });
    
    return grouped;
  }, [metrics]);

  // Get all categories
  const categories = useMemo(() => {
    return Object.keys(metricsByCategory).sort();
  }, [metricsByCategory]);

  // Get metrics for selected category
  const displayedMetrics = useMemo(() => {
    if (selectedCategory === 'all') {
      return Object.values(metricsByCategory).flat();
    }
    return metricsByCategory[selectedCategory] || [];
  }, [metricsByCategory, selectedCategory]);

  const sampleQueries = [
    { text: 'What is my return rate?', icon: TrendingUp },
    { text: 'Show me total orders', icon: BarChart3 },
    { text: 'What is my delivery rate?', icon: CheckCircle2 },
    { text: 'Check my wallet balance', icon: Sparkles },
    { text: 'How many RTO orders do I have?', icon: XCircle },
    { text: 'What is my average order value?', icon: TrendingUp }
  ];

  // Format date as YYYY-MM-DD
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle metric click - fetch analytics data
  const handleMetricClick = async (metric: Metric) => {
    if (!metric.id) {
      toast({
        title: 'Error',
        description: 'Metric ID not available',
        variant: 'destructive',
      });
      return;
    }

    if (!dateFrom || !dateTo) {
      toast({
        title: 'Error',
        description: 'Please select a date range',
        variant: 'destructive',
      });
      return;
    }

    setQuery(metric.name);
    setLoading(true);
    setResult(null);

    try {
      const startDate = formatDate(dateFrom);
      const endDate = formatDate(dateTo);
      
      // Build endpoint with id and query parameters
      const endpoint = `${API_CONFIG.ENDPOINTS.ANALYTICS_METRICS_EXECUTE}/${metric.id}?start_date=${startDate}&end_date=${endDate}`;
      
      const result = await apiRequest(
        endpoint,
        API_CONFIG.METHODS.GET
      );

      if (result.success && result.data) {
        // Transform API response to match formatResult expectations
        const apiData = result.data;
        const rows = apiData.rows || [];
        
        // Extract the first value from rows (rows is an array of objects with metric values)
        let value = 0;
        let valueKey = '';
        if (rows.length > 0) {
          const firstRow = rows[0];
          // Get the first key-value pair from the row object
          const keys = Object.keys(firstRow);
          if (keys.length > 0) {
            valueKey = keys[0];
            value = firstRow[valueKey] || 0;
          }
        }

        setResult({
          metric: apiData.matrix_name || metric.name,
          value: value,
          unit: '',
          description: apiData.detail || metric.description,
          calculation: `ID: ${apiData.id || metric.id} | Formula: ${metric.formula || 'N/A'}`,
          data_points: rows.length > 0 ? rows[0] : {},
          id: apiData.id || metric.id,
          formula: metric.formula || apiData.formula,
        });
      } else {
        setResult({ 
          error: result.message || 'Failed to fetch analytics data' 
        });
        toast({
          title: 'Error',
          description: result.message || 'Failed to fetch analytics data',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Analytics execute error:', error);
      setResult({ error: error.message || 'Failed to fetch analytics data' });
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = async (queryText: string, useMetricsDateRange: boolean = false) => {
    setQuery(queryText);
    setLoading(true);
    setResult(null);

    try {
      // Build date filters from selected date range
      const filters: Record<string, any> = {};
      
      if (useMetricsDateRange && dateFrom && dateTo) {
        filters.date_from = formatDate(dateFrom);
        filters.date_to = formatDate(dateTo);
      }
      
      const analyticsResult = await analyticsService.processQuery(queryText, filters);
      setResult(analyticsResult);
    } catch (error) {
      console.error('Analytics error:', error);
      setResult({ error: 'Failed to process query' });
    } finally {
      setLoading(false);
    }
  };

  const formatResult = (result: any) => {
    if (result?.error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">Error</h3>
          </div>
          <p className="text-red-700">{String(result.error)}</p>
        </div>
      );
    }

    if (!result) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
          <Info className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600">No result found</p>
        </div>
      );
    }

    const { metric, value, unit, description, calculation, data_points, formula } = result;
    
    return (
      <div className="space-y-6">
        {/* Main Metric Display */}
        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border border-green-200 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-800">
                {metric}
              </h3>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-green-100">
            <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {Number(value).toFixed(2)} <span className="text-2xl text-gray-600">{unit}</span>
            </p>
          </div>
        </div>
        
        {/* Details Section */}
        <div className="space-y-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Description
            </h4>
            <p className="text-gray-700 leading-relaxed">{description}</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Formula
            </h4>
            <p className="text-gray-700 font-mono text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
              {result.formula || calculation}
            </p>
          </div>
          
          {Object.keys(data_points).length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Data Points
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(data_points).map(([key, value]) => (
                  <div key={key} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                    <div className="text-xs font-medium text-blue-600 mb-1">{key}</div>
                    <div className="text-sm font-semibold text-gray-800">{String(value)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6">
      <div className="relative max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-lg">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Get insights into your shipping operations with AI-powered analytics
          </p>
        </div>

        {/* Query Input Card */}
        <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-gray-200">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Search className="w-6 h-6 text-blue-600" />
              Ask Your Question
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Enter your analytics query
              </label>
              <div className="flex gap-3">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && query.trim() && !loading) {
                      handleQuery(query);
                    }
                  }}
                  placeholder="e.g., What is my return rate?"
                  className="flex-1 h-12 text-base border-2 focus:border-blue-400 rounded-xl"
                />
                <Button 
                  onClick={() => handleQuery(query)}
                  disabled={!query.trim() || loading}
                  className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Query
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Quick Sample Queries
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sampleQueries.map((sampleQuery, index) => {
                  const Icon = sampleQuery.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => handleQuery(sampleQuery.text)}
                      disabled={loading}
                      className="justify-start text-left h-auto p-4 bg-white/60 hover:bg-blue-50 border-2 hover:border-blue-300 rounded-xl transition-all duration-200 group"
                    >
                      <Icon className="w-5 h-5 mr-3 text-blue-600 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">{sampleQuery.text}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Metrics Card */}
        <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                  Available Metrics
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Click on any metric to learn more about what analytics are available
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={dateFilter} onValueChange={handleDateFilterChange}>
                  <SelectTrigger className="w-[180px] border-2 hover:border-blue-400">
                    <Calendar className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Select Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="last7days">Last 7 Days</SelectItem>
                    <SelectItem value="last30days">Last 30 Days</SelectItem>
                    <SelectItem value="thismonth">This Month</SelectItem>
                    <SelectItem value="lastmonth">Last Month</SelectItem>
                    <SelectItem value="last90days">Last 90 Days</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                
                {dateFilter === 'custom' ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">From:</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="border-2 hover:border-blue-400 w-[140px] justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {dateFrom ? format(dateFrom, 'MMM dd, yyyy') : 'From Date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            initialFocus
                            mode="single"
                            selected={dateFrom}
                            onSelect={setDateFrom}
                            defaultMonth={dateFrom}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">To:</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="border-2 hover:border-blue-400 w-[140px] justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {dateTo ? format(dateTo, 'MMM dd, yyyy') : 'To Date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            initialFocus
                            mode="single"
                            selected={dateTo}
                            onSelect={setDateTo}
                            defaultMonth={dateTo || dateFrom}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                ) : (
                  dateFrom && dateTo && (
                    <span className="text-sm text-gray-600">
                      {format(dateFrom, 'MMM dd')} - {format(dateTo, 'MMM dd, yyyy')}
                    </span>
                  )
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Loading State */}
            {metricsLoading && (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 mx-auto text-blue-600 mb-4 animate-spin" />
                <p className="text-gray-600 font-medium">Loading available metrics...</p>
              </div>
            )}

            {/* Error State */}
            {!metricsLoading && metricsError && (
              <div className="text-center py-12">
                <XCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                <p className="text-red-600 font-medium mb-2">Failed to load metrics</p>
                <p className="text-gray-600 text-sm mb-4">{metricsError}</p>
                <Button
                  onClick={fetchMetrics}
                  variant="outline"
                  className="mt-2"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            )}

            {/* Metrics Display */}
            {!metricsLoading && !metricsError && (
              <>
                {/* Category Tabs */}
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full mb-6">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 h-auto p-1 bg-gray-100 rounded-xl overflow-x-auto">
                    <TabsTrigger 
                      value="all" 
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg py-2 text-xs whitespace-nowrap"
                    >
                      All ({Object.values(metricsByCategory).flat().length})
                    </TabsTrigger>
                    {categories.map((category) => (
                      <TabsTrigger 
                        key={category}
                        value={category}
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg py-2 text-xs whitespace-nowrap"
                      >
                        {category.split(' ')[0]} ({metricsByCategory[category]?.length || 0})
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedMetrics.map((metric, index) => (
                    <div 
                      key={`${selectedCategory}-${metric.id || index}`} 
                      className="p-5 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all duration-200 group cursor-pointer"
                      onClick={() => handleMetricClick(metric)}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {metric.name}
                          </h3>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {metric.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {metric.aliases.slice(0, 3).map((alias, aliasIndex) => (
                          <span
                            key={aliasIndex}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md border border-blue-200"
                          >
                            {alias}
                          </span>
                        ))}
                        {metric.aliases.length > 3 && (
                          <span className="text-xs text-gray-500 px-2 py-1">
                            +{metric.aliases.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {displayedMetrics.length === 0 && (
                  <div className="text-center py-12">
                    <Info className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 font-medium">No metrics found in this category</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Result Card */}
        {result && (
          <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                Query Result
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {formatResult(result)}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AnalyticsTest; 