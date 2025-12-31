import React, { useState, useEffect } from 'react';
import { 
  Loader2, 
  Search, 
  RefreshCw,
  Calendar,
  Eye,
  DollarSign,
  Clock,
  CheckCircle,
  ArrowUp,
  Users,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { apiRequest } from '@/config/api';
import { DateRange } from 'react-day-picker';
import { useNavigate } from 'react-router-dom';
import { vendorService, Vendor } from '@/services/vendorService';

interface CODRemittanceSummary {
  user_id: number;
  user_email: string;
  total_due: number;
  total_paid: number;
  upcoming_cod: number;
  due_date: string;
}

interface CODRemittanceFilterResponse {
  status: boolean;
  message: string;
  data: CODRemittanceSummary[];
  error: null | string;
}

const CODRemittanceSummaryPage = () => {
  const [summaries, setSummaries] = useState<CODRemittanceSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  // Vendor selection states
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [vendorSearchTerm, setVendorSearchTerm] = useState('');
  const [vendorDropdownOpen, setVendorDropdownOpen] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  // Load vendors
  useEffect(() => {
    loadVendors();
  }, []);

  // Filter vendors based on search term
  useEffect(() => {
    if (vendorSearchTerm.trim() === '') {
      setFilteredVendors(vendors);
    } else {
      const search = vendorSearchTerm.toLowerCase();
      setFilteredVendors(
        vendors.filter(
          vendor =>
            vendor.name.toLowerCase().includes(search) ||
            vendor.email.toLowerCase().includes(search)
        )
      );
    }
  }, [vendors, vendorSearchTerm]);

  const loadVendors = async () => {
    setLoadingVendors(true);
    try {
      const response = await vendorService.getVendors();
      if (response.status) {
        setVendors(response.data.vendor_users);
        setFilteredVendors(response.data.vendor_users);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load vendors",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
      toast({
        title: "Error",
        description: "Failed to load vendors",
        variant: "destructive",
      });
    } finally {
      setLoadingVendors(false);
    }
  };

  // Fetch COD remittance summaries
  const fetchCODRemittanceSummaries = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Build request body
      const requestBody: any = {};
      
      if (selectedUserId) {
        requestBody.user_id = selectedUserId;
      }
      
      if (dateRange?.from) {
        requestBody.date_from = format(dateRange.from, 'yyyy-MM-dd');
      }
      
      if (dateRange?.to) {
        requestBody.date_to = format(dateRange.to, 'yyyy-MM-dd');
      }

      const response = await apiRequest('api/cod-remittances/filter', 'POST', requestBody);

      console.log('COD Remittance Filter Response:', response);

      if (response.success && response.data) {
        // Handle both cases: response.data could be the array directly or an object with data property
        let summariesList: CODRemittanceSummary[] = [];
        
        if (Array.isArray(response.data)) {
          // If response.data is directly an array
          summariesList = response.data;
        } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          // If response.data is an object with a data property
          const dataObj = response.data as CODRemittanceFilterResponse;
          if (Array.isArray(dataObj.data)) {
            summariesList = dataObj.data;
          }
        }
        
        console.log('Processed summaries list:', summariesList);
        
        setSummaries(summariesList);
        setError(null); // Clear any previous errors
        if (summariesList.length > 0) {
          toast({
            title: 'Success',
            description: response.message || 'COD remittance summaries loaded successfully',
          });
        }
      } else {
        setError(response.message || 'Failed to fetch COD remittance summaries');
        toast({
          title: 'Error',
          description: response.message || 'Failed to fetch COD remittance summaries',
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

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchCODRemittanceSummaries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId, dateRange]);

  const handleViewDetails = (userId: number) => {
    navigate(`/dashboard/finance/cod-remittance?user_id=${userId}`);
  };

  const handleClearFilters = () => {
    setSelectedUserId(null);
    setDateRange(undefined);
    setVendorSearchTerm('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getSelectedVendor = () => {
    if (!selectedUserId) return null;
    return vendors.find(v => v.id === selectedUserId);
  };

  if (loading && summaries.length === 0) {
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
        <h1 className="text-3xl font-bold text-foreground mb-2">COD Remittance Summary</h1>
        <p className="text-muted-foreground">View COD remittance summaries by vendor</p>
      </div>

      {/* Filters Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Date Range Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-[250px] justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'dd MMM yyyy')} - {format(dateRange.to, 'dd MMM yyyy')}
                      </>
                    ) : (
                      format(dateRange.from, 'dd MMM yyyy')
                    )
                  ) : (
                    <span>Select date range</span>
                  )}
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

            {/* User ID / Vendor Filter */}
            <Popover open={vendorDropdownOpen} onOpenChange={setVendorDropdownOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={vendorDropdownOpen}
                  className="w-full sm:w-[300px] justify-between"
                >
                  {selectedUserId ? (
                    <span className="truncate">
                      {getSelectedVendor()?.name || getSelectedVendor()?.email || `User ID: ${selectedUserId}`}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Select vendor (User ID)</span>
                  )}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search vendors..."
                    value={vendorSearchTerm}
                    onValueChange={setVendorSearchTerm}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {loadingVendors ? 'Loading vendors...' : 'No vendors found.'}
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredVendors.map((vendor) => (
                        <CommandItem
                          key={vendor.id}
                          value={`${vendor.name} ${vendor.email} ${vendor.id}`}
                          onSelect={() => {
                            setSelectedUserId(vendor.id);
                            setVendorDropdownOpen(false);
                            setVendorSearchTerm('');
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{vendor.name}</span>
                            <span className="text-sm text-muted-foreground">{vendor.email} (ID: {vendor.id})</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Clear Filters Button */}
            {(selectedUserId || dateRange?.from) && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full sm:w-auto"
              >
                Clear Filters
              </Button>
            )}

            {/* Refresh Button */}
            <Button
              variant="default"
              onClick={() => fetchCODRemittanceSummaries(true)}
              disabled={refreshing}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>COD Remittance Summary</CardTitle>
            <div className="text-sm text-muted-foreground">
              {summaries.length} vendor{summaries.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && !loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-destructive">{error}</p>
            </div>
          ) : summaries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No COD remittance summaries found</p>
              <p className="text-sm mt-2">Try adjusting your filters or refresh the data</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Total Due</TableHead>
                    <TableHead>Total Paid</TableHead>
                    <TableHead>Upcoming COD</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaries.map((summary) => (
                    <TableRow key={summary.user_id}>
                      <TableCell className="font-medium">{summary.user_id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{summary.user_email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-orange-600">
                        {formatCurrency(summary.total_due)}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(summary.total_paid)}
                      </TableCell>
                      <TableCell className="font-semibold text-blue-600">
                        {formatCurrency(summary.upcoming_cod)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{summary.due_date || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(summary.user_id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
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
    </div>
  );
};

export default CODRemittanceSummaryPage;

