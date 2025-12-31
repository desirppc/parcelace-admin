import React, { useState, useEffect } from 'react';
import { 
  Loader2, 
  Search, 
  Download, 
  RefreshCw,
  Calendar,
  FileText,
  ArrowUp,
  DollarSign,
  Clock,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { apiRequest } from '@/config/api';
import { DateRange } from 'react-day-picker';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

interface CODRemittanceDetailItem {
  id: number;
  shipment_id: number;
  awb: string;
  due_date: string;
  invoice_value: number;
  utr_no: string | null;
  cod_remittance_id: number;
  remittance: {
    id: number;
    reference_id: string;
  };
  shipment: {
    id: number;
    customer_name: string;
  };
}

interface CODRemittanceDetailsApiResponse {
  summary: {
    this_month: number;
    last_month: number;
    total_due: number;
    upcoming_cod: number | null;
    due_date: string | null;
  };
  cod_remittance_details: CODRemittanceDetailItem[];
  pagination: {
    current_page: number;
    last_page: number;
    total_page: number;
    per_page: number;
    total: number;
  };
}

const CODRemittanceDetailsPage = () => {
  const [details, setDetails] = useState<CODRemittanceDetailItem[]>([]);
  const [filteredDetails, setFilteredDetails] = useState<CODRemittanceDetailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [exportLoading, setExportLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Summary stats
  const [summaryStats, setSummaryStats] = useState({
    thisMonth: 0,
    lastMonth: 0,
    totalDue: 0,
    upcomingCOD: 0,
    dueDate: '',
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSizeOptions = [10, 50, 100, 250, 300];

  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('user_id');

  // Fetch COD remittance details
  const fetchCODRemittanceDetails = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      if (!id) {
        setError('COD remittance ID is required');
        return;
      }

      const response = await apiRequest(`api/cod-remittance/${id}`, 'GET');

      if (response.success && response.data) {
        const data = response.data as CODRemittanceDetailsApiResponse;
        
        const detailsList = data.cod_remittance_details || [];
        setDetails(detailsList);
        setFilteredDetails(detailsList);

        // Calculate Total Due: Sum of invoice_value where utr_no is null
        const totalDue = detailsList
          .filter(item => item.utr_no === null || item.utr_no === '')
          .reduce((sum, item) => sum + (item.invoice_value || 0), 0);

        // Set summary stats
        if (data.summary) {
          setSummaryStats({
            thisMonth: data.summary.this_month || 0,
            lastMonth: data.summary.last_month || 0,
            totalDue: totalDue, // Use calculated value instead of API value
            upcomingCOD: data.summary.upcoming_cod || 0,
            dueDate: data.summary.due_date || '',
          });
        } else {
          // If no summary in API, still calculate totalDue
          setSummaryStats({
            thisMonth: 0,
            lastMonth: 0,
            totalDue: totalDue,
            upcomingCOD: 0,
            dueDate: '',
          });
        }

        // Set pagination
        if (data.pagination) {
          setTotalPages(data.pagination.last_page || 1);
          setTotalItems(data.pagination.total || detailsList.length);
          setCurrentPage(data.pagination.current_page || 1);
        } else {
          setTotalPages(Math.ceil(detailsList.length / pageSize));
          setTotalItems(detailsList.length);
        }

        toast({
          title: 'Success',
          description: 'COD remittance details loaded successfully',
        });
      } else {
        setError(response.message || 'Failed to fetch COD remittance details');
        toast({
          title: 'Error',
          description: response.message || 'Failed to fetch COD remittance details',
          variant: 'destructive',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCODRemittanceDetails();
    }
  }, [id]);

  // Filter details based on search and date
  useEffect(() => {
    if (!details || details.length === 0) {
      setFilteredDetails([]);
      setTotalPages(1);
      setTotalItems(0);
      return;
    }

    let filtered = [...details];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        (item.awb || '').toLowerCase().includes(searchLower) ||
        (item.remittance?.reference_id || '').toLowerCase().includes(searchLower) ||
        (item.shipment?.customer_name || '').toLowerCase().includes(searchLower) ||
        (item.utr_no || '').toLowerCase().includes(searchLower)
      );
    }

    // Apply date filter
    if (dateRange?.from) {
      filtered = filtered.filter(item => {
        if (!item.due_date) return false;
        try {
          const dueDate = new Date(item.due_date);
          if (isNaN(dueDate.getTime())) return false;
          const fromDate = dateRange.from!;
          const toDate = dateRange.to || dateRange.from!;
          return dueDate >= fromDate && dueDate <= toDate;
        } catch {
          return false;
        }
      });
    }

    setFilteredDetails(filtered);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / pageSize)));
    setTotalItems(filtered.length);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, dateRange, details, pageSize]);

  // Get paginated details
  const getPaginatedDetails = () => {
    if (!filteredDetails || filteredDetails.length === 0) {
      return [];
    }
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredDetails.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize));
    setCurrentPage(1);
  };

  // Export functions
  const handleExportCSV = () => {
    setExportLoading(true);
    try {
      const headers = ['AWB Number', 'Reference ID', 'Customer Name', 'Due Date', 'Invoice Value', 'UTR Number'];
      const rows = filteredDetails.map(item => [
        item.awb || '',
        item.remittance?.reference_id || '',
        item.shipment?.customer_name || '',
        item.due_date ? format(new Date(item.due_date), 'dd MMM yyyy') : '',
        `₹${(item.invoice_value || 0).toFixed(2)}`,
        item.utr_no || '-',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `cod-remittance-details-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Success',
        description: 'CSV exported successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to export CSV',
        variant: 'destructive',
      });
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportExcel = () => {
    handleExportCSV();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getReferenceId = () => {
    if (details.length > 0 && details[0].remittance?.reference_id) {
      return details[0].remittance.reference_id;
    }
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (userId) {
                navigate(`/dashboard/finance/cod-remittance?user_id=${userId}`);
              } else {
                navigate('/dashboard/finance/cod-remittance-summary');
              }
            }}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">COD Remittance Details</h1>
            <p className="text-muted-foreground">
              Reference ID: {getReferenceId()}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Due</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryStats.totalDue)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span>Total Amount</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryStats.thisMonth)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span>Current Month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Month</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryStats.lastMonth)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span>Previous Month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total AWB</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{details.length}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              <span>AWB Count</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>COD Remittance Details</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={exportLoading || filteredDetails.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                disabled={exportLoading || filteredDetails.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => fetchCODRemittanceDetails(true)}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by AWB, Reference ID, Customer Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-[200px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  Date Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    Show {size} entries
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>AWB Number</TableHead>
                  <TableHead>Reference ID</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Due Date
                    </div>
                  </TableHead>
                  <TableHead>Invoice Value</TableHead>
                  <TableHead>UTR Number</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getPaginatedDetails().length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {error ? `Error: ${error}` : 'No COD remittance details found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  getPaginatedDetails().map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.awb || '-'}</TableCell>
                      <TableCell>{item.remittance?.reference_id || '-'}</TableCell>
                      <TableCell>{item.shipment?.customer_name || '-'}</TableCell>
                      <TableCell>
                        {item.due_date
                          ? format(new Date(item.due_date), 'dd MMM yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(item.invoice_value || 0)}
                      </TableCell>
                      <TableCell>{item.utr_no || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredDetails.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(currentPage * pageSize, filteredDetails.length)} of {totalItems} entries
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
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
                        onClick={() => handlePageChange(pageNum)}
                        isActive={currentPage === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CODRemittanceDetailsPage;

