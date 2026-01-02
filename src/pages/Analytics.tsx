import React, { useState } from 'react';
import API_CONFIG, { apiRequest } from '@/config/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Send, 
  Code,
  Package,
  Truck,
  RotateCcw,
  RefreshCw,
  DollarSign,
  TrendingDown,
  Wallet,
  FileText,
  AlertTriangle,
  TrendingUp,
  Users,
  MapPin,
  Target,
  Box
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsQueryRequest {
  formula: string;
  category_name: string;
  matrix_name: string;
  detail: string;
  table_nm: string;
  query: string;
}

interface AnalyticsQueryResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
  };
  error: string | null;
}

// Category configuration with icons
const categories = [
  { value: 'Order & Shipment', icon: Package, label: 'Order & Shipment' },
  { value: 'Delivery Performance', icon: Truck, label: 'Delivery Performance' },
  { value: 'RTO Analytics', icon: RotateCcw, label: 'RTO Analytics' },
  { value: 'Return & Reverse', icon: RefreshCw, label: 'Return & Reverse' },
  { value: 'Revenue & GMV', icon: DollarSign, label: 'Revenue & GMV' },
  { value: 'Cost & Profitability', icon: TrendingDown, label: 'Cost & Profitability' },
  { value: 'COD & Wallet', icon: Wallet, label: 'COD & Wallet' },
  { value: 'Courier Performance', icon: Truck, label: 'Courier Performance' },
  { value: 'Pickup & Manifest Metrics', icon: FileText, label: 'Pickup & Manifest Metrics' },
  { value: 'SLA, Risk & Alert', icon: AlertTriangle, label: 'SLA, Risk & Alert' },
  { value: 'Funnel Analytics', icon: TrendingUp, label: 'Funnel Analytics' },
  { value: 'Customer Analytics', icon: Users, label: 'Customer Analytics' },
  { value: 'Geo Growth', icon: MapPin, label: 'Geo Growth' },
  { value: 'Campaign / UTM', icon: Target, label: 'Campaign / UTM' },
  { value: 'Product / SKU', icon: Box, label: 'Product / SKU' },
  { value: 'Advanced Analytics', icon: BarChart3, label: 'Advanced Analytics' },
];

const Analytics = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AnalyticsQueryRequest>({
    formula: 'Ops',
    category_name: 'Order & Shipment',
    matrix_name: 'Total Forward Orders (FP)',
    detail: 'Forward orders (exclude reverse)',
    table_nm: 'shipment',
    query: "SELECT COUNT(id) AS total_orders_booked FROM ace_store_orders WHERE status = 'booked';"
  });
  const [response, setResponse] = useState<AnalyticsQueryResponse | null>(null);

  // Get selected category icon
  const selectedCategory = categories.find(cat => cat.value === formData.category_name);

  const handleInputChange = (field: keyof AnalyticsQueryRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const result = await apiRequest(
        'api/analytics/metrics/add',
        API_CONFIG.METHODS.POST,
        formData
      );

      if (result.success && result.data) {
        setResponse({
          status: result.data.status ?? true,
          message: result.data.message || result.message || 'Analytics query saved successfully',
          data: result.data.data || { id: result.data.id || 0 },
          error: result.data.error || null
        });
        
        toast({
          title: 'Success',
          description: result.data.message || 'Analytics query saved successfully',
          variant: 'default',
        });
      } else {
        setResponse({
          status: false,
          message: result.message || 'Failed to save analytics query',
          data: { id: 0 },
          error: result.error || 'Unknown error'
        });
        
        toast({
          title: 'Error',
          description: result.message || 'Failed to save analytics query',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Analytics query error:', error);
      setResponse({
        status: false,
        message: 'An error occurred while processing the query',
        data: { id: 0 },
        error: error.message || 'Network error'
      });
      
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while processing the query',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Analytics Query
          </h1>
          <p className="text-gray-600">
            Submit analytics queries to save and process data
          </p>
        </div>

        {/* Form Card */}
        <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-gray-200">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Analytics Query Form
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name (Matrix Name) */}
                <div className="space-y-2">
                  <Label htmlFor="matrix_name" className="text-sm font-medium text-gray-700">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="matrix_name"
                    type="text"
                    value={formData.matrix_name}
                    onChange={(e) => handleInputChange('matrix_name', e.target.value)}
                    required
                    className="h-11 border-2 focus:border-blue-400 rounded-xl"
                    placeholder="e.g., Total Forward Orders (FP)"
                  />
                </div>

                {/* Category Name */}
                <div className="space-y-2">
                  <Label htmlFor="category_name" className="text-sm font-medium text-gray-700">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.category_name}
                    onValueChange={(value) => handleInputChange('category_name', value)}
                    required
                  >
                    <SelectTrigger className="h-11 border-2 focus:border-blue-400 rounded-xl">
                      <SelectValue placeholder="Select a category">
                        {selectedCategory && (
                          <div className="flex items-center gap-2">
                            <selectedCategory.icon className="w-4 h-4 text-gray-600" />
                            <span>{selectedCategory.label}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-gray-600" />
                              <span>{category.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Detail */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="detail" className="text-sm font-medium text-gray-700">
                    Details <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="detail"
                    type="text"
                    value={formData.detail}
                    onChange={(e) => handleInputChange('detail', e.target.value)}
                    required
                    className="h-11 border-2 focus:border-blue-400 rounded-xl"
                    placeholder="e.g., Forward orders (exclude reverse)"
                  />
                </div>

                {/* Table Name - Dropdown */}
                <div className="space-y-2">
                  <Label htmlFor="table_nm" className="text-sm font-medium text-gray-700">
                    Table Name <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.table_nm}
                    onValueChange={(value) => handleInputChange('table_nm', value)}
                    required
                  >
                    <SelectTrigger className="h-11 border-2 focus:border-blue-400 rounded-xl">
                      <SelectValue placeholder="Select table name" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shipment">Shipment</SelectItem>
                      <SelectItem value="order">Order</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Formula (formerly Pillar) */}
                <div className="space-y-2">
                  <Label htmlFor="formula" className="text-sm font-medium text-gray-700">
                    Formula <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="formula"
                    type="text"
                    value={formData.formula}
                    onChange={(e) => handleInputChange('formula', e.target.value)}
                    required
                    className="h-11 border-2 focus:border-blue-400 rounded-xl"
                    placeholder="e.g., Ops"
                  />
                </div>

                {/* SQL Query Editor */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="query" className="text-sm font-medium text-gray-700">
                    SQL Query <span className="text-red-500">*</span>
                  </Label>
                  <div className="border-2 border-gray-300 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all shadow-sm">
                    {/* SQL Editor Header */}
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2.5 flex items-center gap-2.5 border-b border-slate-700">
                      <Code className="w-4 h-4 text-slate-300" />
                      <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">SQL Query Editor</span>
                      <div className="ml-auto flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-sm"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-sm"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-sm"></div>
                        </div>
                      </div>
                    </div>
                    {/* SQL Editor Body */}
                    <div className="bg-slate-950 relative">
                      <Textarea
                        id="query"
                        value={formData.query}
                        onChange={(e) => handleInputChange('query', e.target.value)}
                        required
                        rows={12}
                        className="bg-transparent border-0 focus:ring-0 focus-visible:ring-0 text-slate-100 font-mono text-sm leading-relaxed resize-none p-5 placeholder:text-slate-500 min-h-[300px]"
                        placeholder="-- Enter your SQL query here...&#10;SELECT * FROM table_name WHERE condition;"
                        style={{
                          fontFamily: "'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
                          tabSize: 2
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Query
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Response Card */}
        {response && (
          <Card className={`bg-white/80 backdrop-blur-xl border-white/30 shadow-2xl rounded-3xl overflow-hidden ${
            response.status ? 'border-green-200' : 'border-red-200'
          }`}>
            <CardHeader className={`border-b ${
              response.status 
                ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-200' 
                : 'bg-gradient-to-r from-red-500/10 to-rose-500/10 border-red-200'
            }`}>
              <CardTitle className="flex items-center gap-3 text-2xl">
                {response.status ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                Query Response
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                    response.status 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {response.status ? 'Success' : 'Failed'}
                  </span>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Message:</span>
                  <p className={`p-4 rounded-xl ${
                    response.status 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {response.message}
                  </p>
                </div>

                {/* Data */}
                {response.data && response.data.id > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-700">Query ID:</span>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-blue-800 font-mono font-semibold">
                        {response.data.id}
                      </p>
                    </div>
                  </div>
                )}

                {/* Error */}
                {response.error && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-700">Error:</span>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-800 font-mono text-sm">
                        {response.error}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Analytics;

