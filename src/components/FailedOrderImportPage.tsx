import React, { useState, useEffect } from 'react';
import { Loader2, FileSpreadsheet, RefreshCw, Filter, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, getApiUrl } from '@/config/api';
import API_CONFIG from '@/config/api';
import { usePageMeta, PageMetaConfigs } from '@/hooks/usePageMeta';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import SmartCache, { CacheStrategies } from '@/utils/smartCache';

interface ExcelImportData {
  id: number;
  user_id: number;
  store_id: number | null;
  name: string;
  excel_name: string;
  uuid: string | null;
  created_at: string;
  updated_at: string;
  total_excel_import: number;
  failed_excel_import: number;
  booked_shipment: number;
  failed_shipment: number;
  success_excel_import: number;
  vendor_name?: string; // Will be added to API response in the future
  user_email?: string;
}

interface ApiDataResponse {
  excel_data: ExcelImportData[];
}

interface Vendor {
  id: number;
  user_id?: number;
  vendor_id?: number;
  name: string;
  vendor_name?: string;
  email: string;
  vendor_email: string;
  phone: string;
}

const FailedOrderImportPage = () => {
  // Set page meta tags
  usePageMeta({
    title: 'Failed Order Import - ParcelAce',
    description: 'View and manage failed order imports from Excel files. Track import status, success rates, and shipment bookings.',
    keywords: 'order import, excel import, failed imports, import management, order processing'
  });

  const [excelData, setExcelData] = useState<ExcelImportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedVendorEmail, setSelectedVendorEmail] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch vendors
  const fetchVendors = async () => {
    try {
      setVendorsLoading(true);
      const response = await apiRequest(API_CONFIG.ENDPOINTS.VENDORS, 'GET');
      
      if (response.success && response.data) {
        const mappedVendors = (response.data.vendor_users || []).map((vendor: any) => {
          // Try to get user_id from various possible fields
          const userId = vendor.user_id || vendor.id || vendor.vendor_id;
          const vendorEmail = vendor.vendor_email || vendor.email || '';
          
          return {
            id: vendor.vendor_id || vendor.id,
            user_id: userId,
            vendor_id: vendor.vendor_id || vendor.id,
            name: vendor.vendor_name || vendor.name || '',
            vendor_name: vendor.vendor_name || vendor.name || '',
            email: vendor.vendor_email || vendor.email || '',
            vendor_email: vendorEmail,
            phone: vendor.vendor_phone || vendor.phone || ''
          };
        });
        setVendors(mappedVendors);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load vendors",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast({
        title: "Error",
        description: "Failed to load vendors",
        variant: "destructive",
      });
    } finally {
      setVendorsLoading(false);
    }
  };

  // Fetch import excel listing data with caching
  const fetchImportData = async (userId?: number | null) => {
    try {
      setLoading(true);
      setError(null);

      // Build endpoint with optional user_id query parameter
      let endpoint = API_CONFIG.ENDPOINTS.IMPORT_EXCEL_LISTING;
      if (userId) {
        endpoint = `${endpoint}?user_id=${userId}`;
      }

      // Create cache key based on endpoint and user_id
      const cacheKey = `import_excel_listing:${userId || 'all'}`;
      
      // Use smart cache with static strategy (10 minutes cache)
      const cachedStrategy = {
        ...CacheStrategies.static,
        ttlMs: 10 * 60 * 1000, // 10 minutes
        backgroundRefreshIntervalMs: 5 * 60 * 1000, // 5 minutes
      };

      const data = await SmartCache.getData<ApiDataResponse>(
        cacheKey,
        async () => {
          const response = await apiRequest(endpoint, 'GET');
          if (response.success && response.data) {
            return response.data as ApiDataResponse;
          }
          throw new Error(response.message || 'Failed to fetch import data');
        },
        cachedStrategy
      );

      if (data?.excel_data && Array.isArray(data.excel_data)) {
        setExcelData(data.excel_data);
        toast({
          title: "Success",
          description: "Excel import data fetched successfully.",
        });
      } else {
        setError('Invalid data format received from API');
        toast({
          title: "Error",
          description: 'Invalid data format received from API',
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Network error occurred while fetching import data';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Open filter dialog and load vendors
  const handleOpenFilter = () => {
    setShowFilterDialog(true);
    if (vendors.length === 0) {
      fetchVendors();
    }
  };

  // Apply filter
  const handleApplyFilter = () => {
    if (selectedUserId) {
      fetchImportData(selectedUserId);
      setShowFilterDialog(false);
    } else {
      toast({
        title: "Error",
        description: "Please select a vendor",
        variant: "destructive",
      });
    }
  };

  // Clear filter
  const handleClearFilter = () => {
    setSelectedUserId(null);
    setSelectedVendorEmail('');
    fetchImportData(null);
    setShowFilterDialog(false);
  };

  // Handle vendor selection
  const handleVendorSelect = (vendorEmail: string) => {
    setSelectedVendorEmail(vendorEmail);
    const vendor = vendors.find(v => (v.vendor_email || v.email) === vendorEmail);
    if (vendor) {
      setSelectedUserId(vendor.user_id || vendor.id);
    }
  };

  useEffect(() => {
    fetchImportData(null);
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Failed Order Import</h1>
            <p className="text-muted-foreground mt-1">
              View and manage Excel import records and their status
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleOpenFilter}
            variant="outline"
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
            {selectedUserId && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                1
              </span>
            )}
          </Button>
          <Button
            onClick={() => fetchImportData(selectedUserId)}
            disabled={loading}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-muted-foreground">Loading import data...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <p className="text-destructive font-medium">{error}</p>
                <Button onClick={fetchImportData} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            </div>
          ) : excelData.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground font-medium">No import records found</p>
                <p className="text-sm text-muted-foreground">
                  Excel import records will appear here once available.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Excel Name</TableHead>
                    <TableHead className="font-semibold">Vendor Name</TableHead>
                    <TableHead className="font-semibold">Total Import</TableHead>
                    <TableHead className="font-semibold">Success Import</TableHead>
                    <TableHead className="font-semibold">Failed Import</TableHead>
                    <TableHead className="font-semibold">Booked Shipment</TableHead>
                    <TableHead className="font-semibold">Failed Shipment</TableHead>
                    <TableHead className="font-semibold">Created At</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {excelData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{record.excel_name || record.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm">
                            {record.vendor_name || ''}
                          </span>
                          {record.user_email && (
                            <span className="text-xs text-muted-foreground">
                              {record.user_email}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{record.total_excel_import || 0}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-green-600 font-medium">
                          {record.success_excel_import || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-red-600 font-medium">
                          {record.failed_excel_import || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-blue-600 font-medium">
                          {record.booked_shipment || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-orange-600 font-medium">
                          {record.failed_shipment || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(record.created_at)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => navigate(`/dashboard/failed-order-import/${record.id}`)}
                          variant="default"
                          size="sm"
                          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <Eye className="h-4 w-4" />
                          View Failed Orders
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Filter by Vendor</DialogTitle>
            <DialogDescription>
              Select a vendor to filter import records by user ID
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Vendor Email</label>
              {vendorsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                <Select value={selectedVendorEmail} onValueChange={handleVendorSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a vendor email" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem 
                        key={vendor.id} 
                        value={vendor.vendor_email || vendor.email}
                      >
                        {vendor.vendor_email || vendor.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {selectedUserId && (
              <div className="text-sm text-muted-foreground">
                Selected User ID: <span className="font-medium">{selectedUserId}</span>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            {selectedUserId && (
              <Button
                onClick={handleClearFilter}
                variant="outline"
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear Filter
              </Button>
            )}
            <Button
              onClick={handleApplyFilter}
              disabled={!selectedUserId || vendorsLoading}
              className="gap-2"
            >
              Apply Filter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FailedOrderImportPage;

