import React, { useState, useEffect } from 'react';
import { 
  Loader2, 
  Search, 
  Download, 
  RefreshCw,
  Calendar,
  Eye,
  FileText,
  ArrowUp,
  DollarSign,
  Clock,
  CheckCircle,
  Hash,
  Edit
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
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { apiRequest, getApiUrl, getAuthHeaders } from '@/config/api';
import { DateRange } from 'react-day-picker';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface CODRemittance {
  id: number;
  reference_id: string;
  total_awb: number;
  due_date: string;
  amount: number;
  utr_number: string | null;
  status: string;
  email_id?: string;
  created_at?: string;
  updated_at?: string;
}

// API response structure
interface CODRemittanceApiItem {
  id: number;
  user_id: number;
  reference_id: string;
  total_awb: number;
  due_date: string;
  total_amount: number;
  utr_no: string | null;
  check_payment: boolean;
  utr_date: string | null;
}

interface CODRemittanceApiResponse {
  summary: {
    this_month: number;
    last_month: number;
    total_due: number;
    upcoming_cod: number;
    due_date: string;
  };
  cod_remittances: CODRemittanceApiItem[];
  pagination: {
    current_page: number;
    last_page: number;
    total_page: number;
    per_page: number;
    total: number;
  };
}

interface CODRemittanceResponse {
  data: CODRemittance[];
  total?: number;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total_cod_remittances?: number;
  pending_payments?: number;
  paid_amount?: number;
  total_awb_count?: number;
}


const CODRemittancePage = () => {
  const [remittances, setRemittances] = useState<CODRemittance[]>([]);
  const [filteredRemittances, setFilteredRemittances] = useState<CODRemittance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [exportLoading, setExportLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRemittances, setSelectedRemittances] = useState<Set<number>>(new Set());
  
  // Update UTR Dialog states
  const [updateUTRDialogOpen, setUpdateUTRDialogOpen] = useState(false);
  const [selectedRemittanceForUpdate, setSelectedRemittanceForUpdate] = useState<CODRemittance | null>(null);
  const [selectedRemittancesForUpdate, setSelectedRemittancesForUpdate] = useState<CODRemittance[]>([]);
  const [utrNo, setUtrNo] = useState('');
  const [utrDate, setUtrDate] = useState<Date | undefined>(undefined);
  const [updatingUTR, setUpdatingUTR] = useState(false);

  // Helper function to check if remittance has blank UTR
  const hasBlankUTR = (remittance: CODRemittance): boolean => {
    return !remittance.utr_number || remittance.utr_number.trim() === '';
  };

  // Summary stats
  const [summaryStats, setSummaryStats] = useState({
    totalCODRemittances: 0,
    pendingPayments: 0,
    paidAmount: 0,
    totalAWBCount: 0,
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSizeOptions = [10, 50, 100, 250, 300];


  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get('user_id');

  // Fetch COD remittances
  const fetchCODRemittances = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Build endpoint with user_id query parameter if provided
      let endpoint = 'api/cod-remittance';
      if (userId) {
        endpoint = `${endpoint}?user_id=${userId}`;
      }
      
      const response = await apiRequest(endpoint, 'GET');

      if (response.success && response.data) {
        const data = response.data as CODRemittanceApiResponse | CODRemittance[] | CODRemittanceResponse;
        
        // Handle different response structures
        let remittancesList: CODRemittance[] = [];
        let summaryData = null;
        let paginationData = null;

        // Check if it's the new API response structure with summary, cod_remittances, and pagination
        if (data && typeof data === 'object' && !Array.isArray(data) && 'cod_remittances' in data) {
          const apiData = data as CODRemittanceApiResponse;
          
          // Map API response to component format
          remittancesList = (apiData.cod_remittances || []).map((item: CODRemittanceApiItem) => ({
            id: item.id,
            reference_id: item.reference_id,
            total_awb: item.total_awb,
            due_date: item.due_date,
            amount: item.total_amount, // Map total_amount to amount
            utr_number: item.utr_no, // Map utr_no to utr_number
            status: item.check_payment ? 'Paid' : 'Pending', // Map check_payment boolean to status string
            email_id: undefined,
            created_at: undefined,
            updated_at: undefined,
          }));
          
          summaryData = apiData.summary;
          paginationData = apiData.pagination;
        } 
        // Handle legacy array response
        else if (Array.isArray(data)) {
          remittancesList = data;
        } 
        // Handle legacy object response with data array
        else if (data && typeof data === 'object' && 'data' in data) {
          const legacyData = data as CODRemittanceResponse;
          if (Array.isArray(legacyData.data)) {
            remittancesList = legacyData.data;
          }
        }

        setRemittances(remittancesList);
        setFilteredRemittances(remittancesList);

        // Extract summary stats
        if (summaryData) {
          // Use summary data from API
          const pendingAmount = remittancesList
            .filter(r => r.status === 'Pending')
            .reduce((sum, r) => sum + (r.amount || 0), 0);
          const paidAmount = remittancesList
            .filter(r => r.status === 'Paid')
            .reduce((sum, r) => sum + (r.amount || 0), 0);
          
          setSummaryStats({
            totalCODRemittances: summaryData.total_due || 0,
            pendingPayments: pendingAmount,
            paidAmount: paidAmount,
            totalAWBCount: remittancesList.reduce((sum, r) => sum + (r.total_awb || 0), 0),
          });
        } else if (data && typeof data === 'object' && !Array.isArray(data) && 'total_cod_remittances' in data) {
          // Legacy summary format
          const legacyData = data as CODRemittanceResponse;
          setSummaryStats({
            totalCODRemittances: legacyData.total_cod_remittances || remittancesList.reduce((sum, r) => sum + (r.amount || 0), 0),
            pendingPayments: legacyData.pending_payments || remittancesList.filter(r => (r.status || '').toLowerCase() === 'pending').reduce((sum, r) => sum + (r.amount || 0), 0),
            paidAmount: legacyData.paid_amount || remittancesList.filter(r => (r.status || '').toLowerCase() === 'paid').reduce((sum, r) => sum + (r.amount || 0), 0),
            totalAWBCount: legacyData.total_awb_count || remittancesList.reduce((sum, r) => sum + (r.total_awb || 0), 0),
          });
        } else {
          // Calculate from data if not provided
          setSummaryStats({
            totalCODRemittances: remittancesList.reduce((sum, r) => sum + (r.amount || 0), 0),
            pendingPayments: remittancesList.filter(r => (r.status || '').toLowerCase() === 'pending').reduce((sum, r) => sum + (r.amount || 0), 0),
            paidAmount: remittancesList.filter(r => (r.status || '').toLowerCase() === 'paid').reduce((sum, r) => sum + (r.amount || 0), 0),
            totalAWBCount: remittancesList.reduce((sum, r) => sum + (r.total_awb || 0), 0),
          });
        }

        // Set pagination
        if (paginationData) {
          setTotalPages(paginationData.last_page || 1);
          setTotalItems(paginationData.total || remittancesList.length);
          setCurrentPage(paginationData.current_page || 1);
        } else if (data && typeof data === 'object' && !Array.isArray(data) && 'last_page' in data) {
          const legacyData = data as CODRemittanceResponse;
          setTotalPages(legacyData.last_page || 1);
          setTotalItems(legacyData.total || remittancesList.length);
        } else {
          setTotalPages(Math.ceil(remittancesList.length / pageSize));
          setTotalItems(remittancesList.length);
        }

        toast({
          title: 'Success',
          description: 'COD remittances loaded successfully',
        });
      } else {
        setError(response.message || 'Failed to fetch COD remittances');
        toast({
          title: 'Error',
          description: response.message || 'Failed to fetch COD remittances',
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

  const handleViewDetails = (remittanceId: number) => {
    const url = userId 
      ? `/dashboard/finance/cod-remittance/${remittanceId}?user_id=${userId}`
      : `/dashboard/finance/cod-remittance/${remittanceId}`;
    navigate(url);
  };

  // Handle checkbox selection - only allow selection of remittances with blank UTR
  const handleSelectRemittance = (remittanceId: number, checked: boolean) => {
    const remittance = getPaginatedRemittances().find(r => r.id === remittanceId);
    if (!remittance) return;
    
    // Only allow selection if UTR is blank
    if (checked && !hasBlankUTR(remittance)) {
      toast({
        title: 'Selection Not Allowed',
        description: 'Only remittances with blank UTR numbers can be selected',
        variant: 'destructive',
      });
      return;
    }
    
    const newSelected = new Set(selectedRemittances);
    if (checked) {
      newSelected.add(remittanceId);
    } else {
      newSelected.delete(remittanceId);
    }
    setSelectedRemittances(newSelected);
  };

  // Handle select all - only select remittances with blank UTR
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const blankUTRRemittances = getPaginatedRemittances().filter(r => hasBlankUTR(r));
      const allIds = new Set(blankUTRRemittances.map(r => r.id));
      setSelectedRemittances(allIds);
    } else {
      setSelectedRemittances(new Set());
    }
  };

  // Open Update UTR dialog for a specific remittance or bulk update
  const handleOpenUpdateUTRDialog = (remittance?: CODRemittance) => {
    if (remittance) {
      // Single remittance update
      setSelectedRemittanceForUpdate(remittance);
      setSelectedRemittancesForUpdate([remittance]);
      setUtrNo(remittance.utr_number || '');
    } else {
      // Bulk update - get all selected remittances
      const selected = getPaginatedRemittances().filter(r => selectedRemittances.has(r.id));
      setSelectedRemittanceForUpdate(null);
      setSelectedRemittancesForUpdate(selected);
      setUtrNo('');
    }
    setUtrDate(new Date());
    setUpdateUTRDialogOpen(true);
  };

  // Close Update UTR dialog
  const handleCloseUpdateUTRDialog = () => {
    setUpdateUTRDialogOpen(false);
    setSelectedRemittanceForUpdate(null);
    setSelectedRemittancesForUpdate([]);
    setUtrNo('');
    setUtrDate(undefined);
    setSelectedRemittances(new Set());
  };

  // Handle Update UTR API call
  const handleUpdateUTR = async () => {
    const remittancesToUpdate = selectedRemittancesForUpdate.length > 0 
      ? selectedRemittancesForUpdate 
      : (selectedRemittanceForUpdate ? [selectedRemittanceForUpdate] : []);
    
    if (remittancesToUpdate.length === 0) return;
    
    // UTR number is required for all cases
    if (!utrNo.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter UTR Number',
        variant: 'destructive',
      });
      return;
    }

    if (!utrDate) {
      toast({
        title: 'Validation Error',
        description: 'Please select UTR Date',
        variant: 'destructive',
      });
      return;
    }

    setUpdatingUTR(true);

    try {
      // Get reference_ids as array
      const referenceIds = remittancesToUpdate.map(r => r.reference_id);
      
      // Use new endpoint without reference_id in path
      const endpoint = 'api/cod-remittances/utr-update';
      
      // Make direct fetch call to get full response including status field
      const url = getApiUrl(endpoint);
      const headers = getAuthHeaders();
      
      const fetchResponse = await fetch(url, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference_ids: referenceIds,
          utr_no: utrNo.trim(),
          utr_date: format(utrDate, 'yyyy-MM-dd'),
        }),
      });

      const result = await fetchResponse.json();

      // Check the actual API status field (not just HTTP status)
      const apiStatus = result.status;
      const isApiSuccess = apiStatus === true || apiStatus === 'true';
      
      // Get the actual API message
      const apiMessage = result.error?.message || result.message;

      if (isApiSuccess) {
        // Success case - show only API message
        toast({
          title: 'Success',
          description: apiMessage || 'UTR updated successfully',
        });
        
        await fetchCODRemittances(true);
        handleCloseUpdateUTRDialog();
      } else {
        // Error case - show only API message, no dummy messages
        toast({
          title: 'Error',
          description: apiMessage || 'An error occurred',
          variant: 'destructive',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating UTR';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setUpdatingUTR(false);
    }
  };

  useEffect(() => {
    fetchCODRemittances();
  }, [userId]);

  // Filter remittances based on search, status, and date
  useEffect(() => {
    if (!remittances || remittances.length === 0) {
      setFilteredRemittances([]);
      setTotalPages(1);
      setTotalItems(0);
      return;
    }

    let filtered = [...remittances];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(remittance =>
        (remittance.reference_id || '').toLowerCase().includes(searchLower) ||
        (remittance.utr_number || '').toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(remittance => (remittance.status || '') === statusFilter);
    }

    // Apply date filter
    if (dateRange?.from) {
      filtered = filtered.filter(remittance => {
        if (!remittance.due_date) return false;
        try {
          const dueDate = new Date(remittance.due_date);
          if (isNaN(dueDate.getTime())) return false;
          const fromDate = dateRange.from!;
          const toDate = dateRange.to || dateRange.from!;
          return dueDate >= fromDate && dueDate <= toDate;
        } catch {
          return false;
        }
      });
    }

    setFilteredRemittances(filtered);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / pageSize)));
    setTotalItems(filtered.length);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, dateRange, remittances, pageSize]);

  // Get paginated remittances
  const getPaginatedRemittances = () => {
    if (!filteredRemittances || filteredRemittances.length === 0) {
      return [];
    }
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredRemittances.slice(startIndex, endIndex);
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
      const headers = ['Reference ID', 'Total AWB', 'Due Date', 'Amount', 'UTR Number', 'Status'];
      const rows = filteredRemittances.map(r => [
        r.reference_id || '',
        r.total_awb?.toString() || '0',
        r.due_date ? format(new Date(r.due_date), 'dd MMM yyyy') : '',
        `₹${(r.amount || 0).toFixed(2)}`,
        r.utr_number || '-',
        r.status || '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `cod-remittance-${format(new Date(), 'yyyy-MM-dd')}.csv`);
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
    // For Excel export, we'll use CSV format (can be enhanced with a library like xlsx)
    handleExportCSV();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'paid') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
    } else if (statusLower === 'pending') {
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Pending</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
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
          {userId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/finance/cod-remittance-summary')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Summary
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">COD Remittance</h1>
            <p className="text-muted-foreground">
              {userId ? `AWB Wise Remittance Details for User ID: ${userId}` : 'Manage and track your COD remittances'}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total COD Remittances</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryStats.totalCODRemittances)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              <span>{remittances.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryStats.pendingPayments)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span className="text-orange-600">Pending</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryStats.paidAmount)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              <span>Paid</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total AWB Count</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalAWBCount}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              <span>AWB</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>COD Remittance</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={exportLoading || filteredRemittances.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                disabled={exportLoading || filteredRemittances.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => fetchCODRemittances(true)}
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
                  placeholder="Search by Reference ID, UTR..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
              </SelectContent>
            </Select>
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

          {/* Bulk Actions - Show when items are selected */}
          {selectedRemittances.size > 0 && (
            <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-950 rounded-md flex items-center justify-between">
              <span className="text-sm text-purple-700 dark:text-purple-300">
                {selectedRemittances.size} remittance{selectedRemittances.size > 1 ? 's' : ''} selected
              </span>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  // For bulk update, open dialog with all selected remittances
                  handleOpenUpdateUTRDialog();
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Update UTR
              </Button>
            </div>
          )}

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={getPaginatedRemittances().length > 0 && 
                               getPaginatedRemittances()
                                 .filter(r => hasBlankUTR(r))
                                 .every(r => selectedRemittances.has(r.id))}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Reference ID</TableHead>
                  <TableHead>Total AWB</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Due Date
                    </div>
                  </TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>UTR Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getPaginatedRemittances().length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {error ? `Error: ${error}` : 'No COD remittances found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  getPaginatedRemittances().map((remittance) => {
                    const canSelect = hasBlankUTR(remittance);
                    return (
                    <TableRow key={remittance.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRemittances.has(remittance.id)}
                          onCheckedChange={(checked) => handleSelectRemittance(remittance.id, checked as boolean)}
                          disabled={!canSelect}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{remittance.reference_id || '-'}</TableCell>
                      <TableCell>{remittance.total_awb || 0}</TableCell>
                      <TableCell>
                        {remittance.due_date
                          ? format(new Date(remittance.due_date), 'dd MMM yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(remittance.amount || 0)}
                      </TableCell>
                      <TableCell>{remittance.utr_number || '-'}</TableCell>
                      <TableCell>{getStatusBadge(remittance.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewDetails(remittance.id)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleOpenUpdateUTRDialog(remittance)}
                            title="Update UTR"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredRemittances.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(currentPage * pageSize, filteredRemittances.length)} of {totalItems} entries
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

      {/* Update UTR Dialog */}
      <Dialog open={updateUTRDialogOpen} onOpenChange={setUpdateUTRDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update UTR</DialogTitle>
            <DialogDescription>
              {selectedRemittancesForUpdate.length > 1 ? (
                <>
                  Update UTR for {selectedRemittancesForUpdate.length} remittances:
                  <div className="mt-2 text-xs font-mono">
                    {selectedRemittancesForUpdate.map((r, idx) => (
                      <div key={r.id}>{idx + 1}. {r.reference_id}</div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    The same UTR number will be applied to all selected remittances
                  </div>
                </>
              ) : (
                `Update UTR details for remittance: ${selectedRemittanceForUpdate?.reference_id || selectedRemittancesForUpdate[0]?.reference_id}`
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="utr-no" className="text-sm font-medium">
                UTR Number <span className="text-red-500">*</span>
              </label>
              <Input
                id="utr-no"
                placeholder="Enter UTR Number"
                value={utrNo}
                onChange={(e) => setUtrNo(e.target.value)}
                disabled={updatingUTR}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="utr-date" className="text-sm font-medium">
                UTR Date <span className="text-red-500">*</span>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={updatingUTR}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {utrDate ? format(utrDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={utrDate}
                    onSelect={setUtrDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseUpdateUTRDialog}
              disabled={updatingUTR}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateUTR}
              disabled={updatingUTR}
            >
              {updatingUTR ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Submit'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CODRemittancePage;
