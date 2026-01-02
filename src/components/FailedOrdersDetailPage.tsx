import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Loader2, 
  ArrowLeft, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle,
  X,
  Search,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/config/api';
import API_CONFIG from '@/config/api';
import { usePageMeta } from '@/hooks/usePageMeta';
import { format } from 'date-fns';
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import SmartCache, { CacheStrategies } from '@/utils/smartCache';

interface ExcelSource {
  id: number;
  user_id: number;
  store_id: number | null;
  name: string;
  excel_name: string;
  uuid: string | null;
  created_at: string;
  updated_at: string;
}

interface FailedOrder {
  id: number;
  user_id: number;
  excel_source_id: number;
  order_no: string;
  order_data: any;
  row: string;
  error_message: string[];
  created_at: string;
  updated_at: string;
}

interface FailedOrdersResponse {
  excel_source: ExcelSource;
  failed_orders: FailedOrder[];
}

const FailedOrdersDetailPage = () => {
  const { importId } = useParams<{ importId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Set page meta tags
  usePageMeta({
    title: 'Failed Orders Details - ParcelAce',
    description: 'View detailed information about failed orders from Excel import.',
    keywords: 'failed orders, import errors, order validation, excel import'
  });

  const [data, setData] = useState<FailedOrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<FailedOrder | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const itemsPerPage = 50;

  // Fetch failed orders data with caching
  const fetchFailedOrders = async () => {
    if (!importId) {
      setError('Import ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const endpoint = `${API_CONFIG.ENDPOINTS.IMPORT_EXCEL_FAILED_ORDERS}/${importId}`;
      const cacheKey = `failed_orders:${importId}`;
      
      const cachedStrategy = {
        ...CacheStrategies.static,
        ttlMs: 10 * 60 * 1000, // 10 minutes
        backgroundRefreshIntervalMs: 5 * 60 * 1000,
      };

      const responseData = await SmartCache.getData<FailedOrdersResponse>(
        cacheKey,
        async () => {
          const response = await apiRequest(endpoint, 'GET');
          if (response.success && response.data) {
            // The API returns data directly, not wrapped
            return response.data as FailedOrdersResponse;
          }
          throw new Error(response.message || 'Failed to fetch failed orders');
        },
        cachedStrategy
      );

      if (responseData) {
        setData(responseData);
      } else {
        setError('No data received from API');
        toast({
          title: "Error",
          description: 'No data received from API',
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Network error occurred while fetching failed orders';
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

  useEffect(() => {
    fetchFailedOrders();
  }, [importId]);

  // Filter and paginate orders
  const filteredOrders = data?.failed_orders?.filter(order => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      order.order_no?.toLowerCase().includes(searchLower) ||
      order.order_data?.first_name?.toLowerCase().includes(searchLower) ||
      order.order_data?.phone?.toString().includes(searchTerm) ||
      order.error_message?.some(msg => msg.toLowerCase().includes(searchLower))
    );
  }) || [];

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm');
    } catch {
      return dateString;
    }
  };

  const handleViewOrder = (order: FailedOrder) => {
    setSelectedOrder(order);
    setShowOrderDialog(true);
  };

  const handleExport = () => {
    if (!data?.failed_orders) return;
    
    // Create CSV content
    const headers = ['Order No', 'Row', 'Error Message', 'First Name', 'Phone', 'City', 'State', 'Pincode'];
    const rows = data.failed_orders.map(order => [
      order.order_no || '',
      order.row || '',
      order.error_message?.join('; ') || '',
      order.order_data?.first_name || '',
      order.order_data?.phone || '',
      order.order_data?.city || '',
      order.order_data?.state || '',
      order.order_data?.pincode || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `failed_orders_${importId}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Failed orders exported successfully.",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/dashboard/failed-order-import')}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Failed Orders</h1>
              <p className="text-muted-foreground mt-1">
                Import ID: {importId} | {data?.excel_source?.excel_name || 'Loading...'}
              </p>
            </div>
          </div>
        </div>
        {data && data.failed_orders.length > 0 && (
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        )}
      </div>

      {/* Excel Source Info */}
      {data?.excel_source && (
        <Card>
          <CardHeader>
            <CardTitle>Import Source Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Excel Name</p>
                <p className="font-medium">{data.excel_source.excel_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-medium">{data.excel_source.user_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created At</p>
                <p className="font-medium">{formatDate(data.excel_source.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Failed Orders</p>
                <p className="font-medium text-red-600">{data.failed_orders?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Failed Orders ({filteredOrders.length})</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order no, name, phone, or error..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-muted-foreground">Loading failed orders...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <p className="text-destructive font-medium">{error}</p>
                <Button onClick={fetchFailedOrders} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground font-medium">
                  {searchTerm ? 'No orders found matching your search' : 'No failed orders found'}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table className="table-fixed w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold w-20">Row</TableHead>
                      <TableHead className="font-semibold w-32">Order No</TableHead>
                      <TableHead className="font-semibold w-40">Customer Name</TableHead>
                      <TableHead className="font-semibold w-32">Phone</TableHead>
                      <TableHead className="font-semibold w-48">Location</TableHead>
                      <TableHead className="font-semibold w-80">Error Message</TableHead>
                      <TableHead className="font-semibold text-right w-40">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium w-20">{order.row}</TableCell>
                        <TableCell className="w-32">
                          <span className="font-medium">{order.order_no || '-'}</span>
                        </TableCell>
                        <TableCell className="w-40">
                          {order.order_data?.first_name || '-'}
                          {order.order_data?.last_name && ` ${order.order_data.last_name}`}
                        </TableCell>
                        <TableCell className="w-32">{order.order_data?.phone || '-'}</TableCell>
                        <TableCell className="w-48">
                          <div className="text-sm">
                            <div>{order.order_data?.city || '-'}</div>
                            <div className="text-muted-foreground">
                              {order.order_data?.state || ''} {order.order_data?.pincode || ''}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="w-80">
                          <div className="max-w-full">
                            {order.error_message?.slice(0, 2).map((msg, idx) => (
                              <Badge key={idx} variant="destructive" className="mr-1 mb-1 text-xs">
                                {msg}
                              </Badge>
                            ))}
                            {order.error_message && order.error_message.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{order.error_message.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right w-40">
                          <Button
                            onClick={() => handleViewOrder(order)}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <AlertCircle className="h-4 w-4" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNum)}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.order_no}</DialogTitle>
            <DialogDescription>
              Row {selectedOrder?.row} - Complete order information and error details
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Error Messages */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Error Messages
                </h3>
                <div className="space-y-2">
                  {selectedOrder.error_message?.map((msg, idx) => (
                    <Badge key={idx} variant="destructive" className="block text-left p-2">
                      {msg}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Order Data */}
              <div>
                <h3 className="font-semibold mb-3">Order Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order Type</p>
                    <p className="font-medium">{selectedOrder.order_data?.order_type || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Parcel Type</p>
                    <p className="font-medium">{selectedOrder.order_data?.parcel_type || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">First Name</p>
                    <p className="font-medium">{selectedOrder.order_data?.first_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Name</p>
                    <p className="font-medium">{selectedOrder.order_data?.last_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedOrder.order_data?.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Alternate Phone</p>
                    <p className="font-medium">{selectedOrder.order_data?.alternate_phone || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Address 1</p>
                    <p className="font-medium">{selectedOrder.order_data?.address_1 || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Address 2</p>
                    <p className="font-medium">{selectedOrder.order_data?.address_2 || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">City</p>
                    <p className="font-medium">{selectedOrder.order_data?.city || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">State</p>
                    <p className="font-medium">{selectedOrder.order_data?.state || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pincode</p>
                    <p className="font-medium">{selectedOrder.order_data?.pincode || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Weight (gm)</p>
                    <p className="font-medium">{selectedOrder.order_data?.weightgm || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dimensions (L x H x B cm)</p>
                    <p className="font-medium">
                      {selectedOrder.order_data?.lengthcm || '-'} x {selectedOrder.order_data?.heightcm || '-'} x {selectedOrder.order_data?.breadthcm || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <h3 className="font-semibold mb-3">Products</h3>
                <div className="space-y-2">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
                    const product = selectedOrder.order_data?.[`product${num}`];
                    if (!product) return null;
                    return (
                      <div key={num} className="border rounded p-3">
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">SKU {num}</p>
                            <p className="font-medium">{selectedOrder.order_data?.[`sku${num}`] || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Product</p>
                            <p className="font-medium">{product}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Quantity</p>
                            <p className="font-medium">{selectedOrder.order_data?.[`quantity${num}`] || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Price</p>
                            <p className="font-medium">
                              ₹{selectedOrder.order_data?.[`per_product_price${num}`] || 0} 
                              {selectedOrder.order_data?.[`total_price${num}`] && 
                                ` (Total: ₹${selectedOrder.order_data[`total_price${num}`]})`}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Charges */}
              <div>
                <h3 className="font-semibold mb-3">Charges</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Shipping Charges</p>
                    <p className="font-medium">₹{selectedOrder.order_data?.shipping_charges || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">COD Charges</p>
                    <p className="font-medium">₹{selectedOrder.order_data?.cod_charges || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Discount</p>
                    <p className="font-medium">₹{selectedOrder.order_data?.discount || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FailedOrdersDetailPage;

