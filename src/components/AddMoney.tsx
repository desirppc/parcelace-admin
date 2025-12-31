import React, { useState, useEffect } from 'react';
import { Loader2, Users, Mail, Phone, Calendar, Search, Filter, Download, MoreHorizontal, X, Trash2, IndianRupee, UserPlus, UserCircle, Eye, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { vendorService, Vendor, VendorPOCData, VendorPOC, VendorPOCListResponse } from '@/services/vendorService';
import API_CONFIG from '@/config/api';
import { getAuthHeaders } from '@/config/api';
import AssignVendorsToSupportDialog from '@/components/AssignVendorsToSupportDialog';
import { MultiSelectFilter } from '@/components/MultiSelectFilter';

const VendorsPage = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteVendorLoading, setDeleteVendorLoading] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [vendorForWallet, setVendorForWallet] = useState<Vendor | null>(null);
  const [walletFormData, setWalletFormData] = useState({
    amount: '',
    transactionId: '',
    type: '',
    title: '',
    description: '',
    source: '',
    paymentDate: new Date()
  });
  const [vendorBalance, setVendorBalance] = useState<number>(0);
  const [showPOCModal, setShowPOCModal] = useState(false);
  const [pocLoading, setPocLoading] = useState(false);
  const [vendorForPOC, setVendorForPOC] = useState<Vendor | null>(null);
  const [pocFormData, setPocFormData] = useState({
    name: '',
    number: '',
    role: '',
    email: '',
    whatsapp_number: ''
  });
  const [showViewPOCModal, setShowViewPOCModal] = useState(false);
  const [viewPOCLoading, setViewPOCLoading] = useState(false);
  const [vendorForViewPOC, setVendorForViewPOC] = useState<Vendor | null>(null);
  const [vendorPOCs, setVendorPOCs] = useState<VendorPOC[]>([]);
  const [showVendorSelectionModal, setShowVendorSelectionModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [manageLoading, setManageLoading] = useState(false);
  const [fetchingManageData, setFetchingManageData] = useState(false);
  const [vendorForManage, setVendorForManage] = useState<Vendor | null>(null);
  const [existingManageUserId, setExistingManageUserId] = useState<number | null>(null);
  const [manageFormData, setManageFormData] = useState({
    skip_rate_validation: false,
    skip_status: [] as string[],
    auto_cancel_days: ''
  });
  const { toast } = useToast();

  // Fetch vendors
  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await vendorService.getVendors();
      
      if (response.status) {
        setVendors(response.data.vendor_users);
        toast({
          title: "Success",
          description: response.message,
        });
      } else {
        // Show mock data for testing UI
        setVendors([
          {
            id: 1,
            name: "Test Vendor",
            email: "vendor@example.com",
            phone: "1234567890",
            created_at: new Date().toISOString()
          }
        ]);
        setError(null);
        toast({
          title: "Warning",
          description: "Showing mock data - API error: " + response.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMessage = 'Failed to fetch vendors';
      // Show mock data for testing UI
      setVendors([
        {
          id: 1,
          name: "Test Vendor",
          email: "vendor@example.com",
          phone: "1234567890",
          created_at: new Date().toISOString()
        }
      ]);
      setError(null);
      toast({
        title: "Warning",
        description: "Showing mock data - Network error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter vendors based on search term and status
  useEffect(() => {
    let filtered = vendors;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(vendor => {
        const name = (vendor.name || '').toLowerCase();
        const email = (vendor.email || '').toLowerCase();
        const phone = (vendor.phone || '').toString();
        
        return name.includes(searchLower) ||
               email.includes(searchLower) ||
               phone.includes(searchTerm);
      });
    }

    setFilteredVendors(filtered);
  }, [vendors, searchTerm, statusFilter]);

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleDeleteVendor = (vendor: Vendor) => {
    setVendorToDelete(vendor);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!vendorToDelete) return;

    setDeleteVendorLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VENDORS}/${vendorToDelete.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok && data.status) {
        toast({
          title: "Success",
          description: data.message || "Vendor deleted successfully",
        });
        setShowDeleteModal(false);
        setVendorToDelete(null);
        fetchVendors(); // Refresh the vendors list
      } else {
        // Extract error message from API response
        let errorMessage = data.message || "Failed to delete vendor";
        
        // Check if there's a detailed error message in the error object
        if (data.error && typeof data.error === 'object') {
          if (data.error.message) {
            errorMessage = data.error.message;
          } else if (typeof data.error === 'string') {
            errorMessage = data.error;
          }
        }
        
        // Handle specific error cases
        if (errorMessage.includes("Vendor not found")) {
          errorMessage = "This vendor has already been deleted or does not exist.";
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setDeleteVendorLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setVendorToDelete(null);
  };

  // Wallet transaction handlers
  const handleWalletTransaction = async (vendor: Vendor) => {
    setVendorForWallet(vendor);
    setWalletFormData({
      amount: '',
      transactionId: '',
      type: '',
      title: '',
      description: '',
      source: '',
      paymentDate: new Date()
    });
    
    // Fetch vendor balance using new API endpoint
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}api/wallet/support-user`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          vendor_id: vendor.id
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.status) {
        // Success case - extract balance from response
        setVendorBalance(data.data?.balance || 0);
      } else {
        // Handle error cases
        setVendorBalance(0);
        
        // Extract error message
        let errorMessage = data.message || 'Failed to fetch vendor balance';
        
        // Check for authorization error
        if (data.error) {
          if (typeof data.error === 'object' && data.error.message) {
            errorMessage = data.error.message;
          } else if (typeof data.error === 'string') {
            errorMessage = data.error;
          }
        }
        
        // Show error toast
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching vendor balance:', error);
      setVendorBalance(0);
      toast({
        title: "Error",
        description: "Network error occurred while fetching vendor balance",
        variant: "destructive",
      });
    }
    
    setShowWalletModal(true);
  };

  const handleCloseWalletModal = () => {
    setShowWalletModal(false);
    setVendorForWallet(null);
    setWalletFormData({
      amount: '',
      transactionId: '',
      type: '',
      title: '',
      description: '',
      source: '',
      paymentDate: new Date()
    });
  };

  const handleWalletInputChange = (field: string, value: string | Date) => {
    setWalletFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveWalletTransaction = async () => {
    try {
      if (!walletFormData.amount || !walletFormData.type || !walletFormData.title || !walletFormData.source) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      setWalletLoading(true);

      // Use provided transaction ID or generate one with YYYY-MM-DD-HH-MM-SS format
      const transactionId = walletFormData.transactionId || 
        format(walletFormData.paymentDate, 'yyyy-MM-dd-HH-mm-ss');

      const response = await fetch(`${API_CONFIG.BASE_URL}api/vendor-wallet/transaction`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          vendor_id: vendorForWallet?.id,
          amount: parseFloat(walletFormData.amount),
          transaction_id: transactionId,
          type: walletFormData.type,
          title: walletFormData.title,
          description: walletFormData.description,
          source: walletFormData.source,
          payment_date: walletFormData.paymentDate.toISOString()
        })
      });

      const data = await response.json();

      if (response.ok && data.status) {
        toast({
          title: "Success",
          description: data.message || "Wallet transaction processed successfully",
        });
        handleCloseWalletModal();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to process wallet transaction",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing wallet transaction:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setWalletLoading(false);
    }
  };

  // Get title options based on transaction type
  const getTitleOptions = (type: string) => {
    if (type === 'Credit') {
      return [
        { value: 'Pre Credit Amount', label: 'Pre Credit Amount' },
        { value: 'Razorpay Payment', label: 'Razorpay Payment' },
        { value: 'Failure', label: 'Failure' }
      ];
    } else if (type === 'Debit') {
      return [
        { value: 'Weight Mismatch', label: 'Weight Mismatch' },
        { value: 'RTO Charges', label: 'RTO Charges' },
        { value: 'CN Issued', label: 'CN Issued' }
      ];
    }
    return [];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  // POC handlers
  const handleAddPOC = (vendor: Vendor) => {
    setVendorForPOC(vendor);
    setPocFormData({
      name: '',
      number: '',
      role: '',
      email: '',
      whatsapp_number: ''
    });
    setShowPOCModal(true);
  };

  const handleClosePOCModal = () => {
    setShowPOCModal(false);
    setVendorForPOC(null);
    setPocFormData({
      name: '',
      number: '',
      role: '',
      email: '',
      whatsapp_number: ''
    });
  };

  const handlePOCInputChange = (field: string, value: string) => {
    setPocFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSavePOC = async () => {
    if (!vendorForPOC) return;

    // Validation
    if (!pocFormData.name || !pocFormData.number || !pocFormData.role || !pocFormData.email || !pocFormData.whatsapp_number) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(pocFormData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setPocLoading(true);

    try {
      const pocData: VendorPOCData = {
        vendor_id: vendorForPOC.id,
        name: pocFormData.name,
        number: pocFormData.number,
        role: pocFormData.role,
        email: pocFormData.email,
        whatsapp_number: pocFormData.whatsapp_number
      };

      const response = await vendorService.createVendorPOC(pocData);

      if (response.status) {
        toast({
          title: "Success",
          description: response.message || "Vendor POC added successfully",
        });
        handleClosePOCModal();
        // Refresh POC list if view modal is open
        if (showViewPOCModal && vendorForViewPOC) {
          await fetchVendorPOCs(vendorForViewPOC);
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to add vendor POC",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating vendor POC:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setPocLoading(false);
    }
  };

  // View POC handlers
  const handleViewPOC = async (vendor: Vendor) => {
    setVendorForViewPOC(vendor);
    setShowViewPOCModal(true);
    await fetchVendorPOCs(vendor);
  };

  const handleCloseViewPOCModal = () => {
    setShowViewPOCModal(false);
    setVendorForViewPOC(null);
    setVendorPOCs([]);
  };

  const fetchVendorPOCs = async (vendor: Vendor) => {
    setViewPOCLoading(true);
    try {
      // Pass vendor_id to filter POCs for this specific vendor
      const response = await vendorService.getVendorPOCs(vendor.id);
      
      if (response.status) {
        setVendorPOCs(response.data.vendor_pocs_data || []);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch vendor POCs",
          variant: "destructive",
        });
        setVendorPOCs([]);
      }
    } catch (error) {
      console.error('Error fetching vendor POCs:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
      setVendorPOCs([]);
    } finally {
      setViewPOCLoading(false);
    }
  };

  const handleAddPOCFromView = (vendor: Vendor) => {
    handleCloseViewPOCModal();
    handleAddPOC(vendor);
  };

  // Manage user handlers
  const fetchManageUserData = async (userId: number) => {
    setFetchingManageData(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}api/manage-user`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok && data.status && data.data?.manage_user) {
        // Find the manage_user record for this specific user_id
        const userManageData = data.data.manage_user.find(
          (item: any) => item.user_id === userId && item.deleted_at === null
        );

        if (userManageData) {
          // Pre-populate form with existing data
          setExistingManageUserId(userManageData.id);
          setManageFormData({
            skip_rate_validation: userManageData.skip_rate_validation === 1,
            skip_status: userManageData.skip_status || [],
            auto_cancel_days: userManageData.auto_cancel_days?.toString() || ''
          });
        } else {
          // No existing data, reset to defaults
          setExistingManageUserId(null);
          setManageFormData({
            skip_rate_validation: false,
            skip_status: [],
            auto_cancel_days: ''
          });
        }
      } else {
        // If API fails, reset to defaults
        setExistingManageUserId(null);
        setManageFormData({
          skip_rate_validation: false,
          skip_status: [],
          auto_cancel_days: ''
        });
      }
    } catch (error) {
      console.error('Error fetching manage user data:', error);
      // On error, reset to defaults
      setExistingManageUserId(null);
      setManageFormData({
        skip_rate_validation: false,
        skip_status: [],
        auto_cancel_days: ''
      });
    } finally {
      setFetchingManageData(false);
    }
  };

  const handleManage = async (vendor: Vendor) => {
    setVendorForManage(vendor);
    setShowManageModal(true);
    // Fetch existing manage user data for this vendor
    await fetchManageUserData(vendor.id);
  };

  const handleCloseManageModal = () => {
    setShowManageModal(false);
    setVendorForManage(null);
    setExistingManageUserId(null);
    setManageFormData({
      skip_rate_validation: false,
      skip_status: [],
      auto_cancel_days: ''
    });
  };

  const handleManageInputChange = (field: string, value: boolean | string | string[]) => {
    setManageFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveManage = async () => {
    if (!vendorForManage) return;

    // Validate auto_cancel_days is a number
    if (manageFormData.auto_cancel_days && isNaN(Number(manageFormData.auto_cancel_days))) {
      toast({
        title: "Validation Error",
        description: "Auto cancel days must be a number",
        variant: "destructive",
      });
      return;
    }

    setManageLoading(true);

    try {
      const requestBody: any = {
        user_id: vendorForManage.id,
        skip_rate_validation: manageFormData.skip_rate_validation,
        skip_status: manageFormData.skip_status,
        auto_cancel_days: manageFormData.auto_cancel_days ? Number(manageFormData.auto_cancel_days) : undefined
      };

      // If updating existing record, include the ID in the request body
      if (existingManageUserId) {
        requestBody.id = existingManageUserId;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}api/manage-user`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok && data.status) {
        toast({
          title: "Success",
          description: data.message || (existingManageUserId ? "Manage user updated successfully" : "Manage user created successfully"),
        });
        handleCloseManageModal();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to manage user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error managing user:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setManageLoading(false);
    }
  };

  // Status options for multi-select (excluding 'all' as it's not a real status)
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'booked', label: 'Booked' },
    { value: 'pickup_failed', label: 'Pickup Failed' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'ndr', label: 'NDR' },
    { value: 'rto_in_transit', label: 'RTO In Transit' },
    { value: 'rto_delivered', label: 'RTO Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'rvp_cancelled', label: 'RVP Cancelled' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendors Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage and monitor vendor users
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-full sm:w-[30%]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button 
            onClick={() => {
              if (filteredVendors.length === 0) {
                toast({
                  title: "No Vendors",
                  description: "Please ensure there are vendors available before adding a POC",
                  variant: "destructive",
                });
                return;
              }
              setShowVendorSelectionModal(true);
            }}
            className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white"
          >
            <UserCircle className="h-4 w-4 mr-2" />
            Add POC
          </Button>
          <AssignVendorsToSupportDialog
            onAssignmentComplete={fetchVendors}
            trigger={
              <Button 
                className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Support User
              </Button>
            }
          />
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {filteredVendors.length} of {vendors.length} vendors
          </span>
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear search
            </Button>
          )}
        </div>
      </div>

      {/* Vendors Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading vendors...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchVendors} variant="outline">
                Try Again
              </Button>
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                {searchTerm ? 'No vendors found matching your search' : 'No vendors found'}
              </p>
              {searchTerm && (
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm('')}
                  className="mt-2"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Phone</TableHead>
                    <TableHead className="font-semibold">Support Users</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">
                        {vendor.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{vendor.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{vendor.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {vendor.support_user_count && vendor.support_user_count > 0 && vendor.support_users && vendor.support_users.length > 0 ? (
                          <div className="space-y-2">
                            {vendor.support_users.map((supportUser) => (
                              <div key={supportUser.id} className="flex items-center gap-2">
                                <Users className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                <div className="flex flex-col">
                                  {supportUser.name && (
                                    <span className="text-sm font-medium">{supportUser.name}</span>
                                  )}
                                  <span className={`text-xs ${supportUser.name ? 'text-muted-foreground' : 'text-sm'}`}>
                                    {supportUser.email}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No support users</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleManage(vendor)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                            title="Manage"
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Manage
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewPOC(vendor)}
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200"
                            title="View POC"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View POC
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleWalletTransaction(vendor)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                            title="Wallet Transaction"
                          >
                            <IndianRupee className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteVendor(vendor)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Vendor Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Vendor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{vendorToDelete?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={handleCancelDelete}
              disabled={deleteVendorLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDelete}
              disabled={deleteVendorLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteVendorLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Vendor
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Wallet Transaction Modal */}
      <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-green-600" />
              Wallet Transaction - {vendorForWallet?.name}
            </DialogTitle>
            <DialogDescription>
              Add or deduct amount from vendor wallet. All fields marked with * are required.
            </DialogDescription>
            {/* Current Balance Display */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Current Balance:</span>
                <span className="text-lg font-bold text-green-900">₹{vendorBalance.toFixed(2)}</span>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="0.00"
                  value={walletFormData.amount}
                  onChange={(e) => handleWalletInputChange('amount', e.target.value)}
                  disabled={walletLoading}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Type and Title in one line */}
            <div className="grid grid-cols-2 gap-4">
              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={walletFormData.type}
                  onValueChange={(value) => {
                    handleWalletInputChange('type', value);
                    handleWalletInputChange('title', ''); // Reset title when type changes
                  }}
                  disabled={walletLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Credit">Credit</SelectItem>
                    <SelectItem value="Debit">Debit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title - Dynamic based on Type */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Select
                  value={walletFormData.title}
                  onValueChange={(value) => handleWalletInputChange('title', value)}
                  disabled={walletLoading || !walletFormData.type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent>
                    {getTitleOptions(walletFormData.type).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                placeholder="Enter transaction description"
                value={walletFormData.description}
                onChange={(e) => handleWalletInputChange('description', e.target.value)}
                disabled={walletLoading}
              />
            </div>

            {/* Source */}
            <div className="space-y-2">
              <Label htmlFor="source">Source *</Label>
              <Select
                value={walletFormData.source}
                onValueChange={(value) => handleWalletInputChange('source', value)}
                disabled={walletLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Razorpay">Razorpay</SelectItem>
                  <SelectItem value="Wallet">Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Date */}
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={walletLoading}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {walletFormData.paymentDate ? format(walletFormData.paymentDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={walletFormData.paymentDate}
                    onSelect={(date) => date && handleWalletInputChange('paymentDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Transaction ID - Moved to bottom */}
            <div className="space-y-2">
              <Label htmlFor="transactionId">Transaction ID</Label>
              <Input
                id="transactionId"
                name="transactionId"
                placeholder="Leave empty for auto-generation (YYYY-MM-DD-HH-MM-SS)"
                value={walletFormData.transactionId}
                onChange={(e) => handleWalletInputChange('transactionId', e.target.value)}
                disabled={walletLoading}
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated with format YYYY-MM-DD-HH-MM-SS if left empty
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCloseWalletModal}
              disabled={walletLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveWalletTransaction}
              disabled={walletLoading || !walletFormData.amount || !walletFormData.type || !walletFormData.title || !walletFormData.source}
              className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white"
            >
              {walletLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <IndianRupee className="h-4 w-4 mr-2" />
                  Save Transaction
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add POC Modal */}
      <Dialog open={showPOCModal} onOpenChange={setShowPOCModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-blue-600" />
              Add Point of Contact - {vendorForPOC?.name}
            </DialogTitle>
            <DialogDescription>
              Add a new point of contact for this vendor. All fields are required.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="poc-name">Name *</Label>
              <Input
                id="poc-name"
                name="name"
                placeholder="Enter POC name"
                value={pocFormData.name}
                onChange={(e) => handlePOCInputChange('name', e.target.value)}
                disabled={pocLoading}
              />
            </div>

            {/* Number */}
            <div className="space-y-2">
              <Label htmlFor="poc-number">Number *</Label>
              <Input
                id="poc-number"
                name="number"
                type="tel"
                placeholder="Enter phone number"
                value={pocFormData.number}
                onChange={(e) => handlePOCInputChange('number', e.target.value)}
                disabled={pocLoading}
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="poc-role">Role *</Label>
              <Select
                value={pocFormData.role}
                onValueChange={(value) => handlePOCInputChange('role', value)}
                disabled={pocLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Dept Head">Dept Head</SelectItem>
                  <SelectItem value="Operations Manager">Operations Manager</SelectItem>
                  <SelectItem value="Logistics Manager">Logistics Manager</SelectItem>
                  <SelectItem value="Account Manager">Account Manager</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="poc-email">Email *</Label>
              <Input
                id="poc-email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={pocFormData.email}
                onChange={(e) => handlePOCInputChange('email', e.target.value)}
                disabled={pocLoading}
              />
            </div>

            {/* WhatsApp Number */}
            <div className="space-y-2">
              <Label htmlFor="poc-whatsapp">WhatsApp Number *</Label>
              <Input
                id="poc-whatsapp"
                name="whatsapp_number"
                type="tel"
                placeholder="Enter WhatsApp number"
                value={pocFormData.whatsapp_number}
                onChange={(e) => handlePOCInputChange('whatsapp_number', e.target.value)}
                disabled={pocLoading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleClosePOCModal}
              disabled={pocLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePOC}
              disabled={pocLoading || !pocFormData.name || !pocFormData.number || !pocFormData.role || !pocFormData.email || !pocFormData.whatsapp_number}
              className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white"
            >
              {pocLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserCircle className="h-4 w-4 mr-2" />
                  Add POC
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View POC Modal */}
      <Dialog open={showViewPOCModal} onOpenChange={setShowViewPOCModal}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Eye className="h-5 w-5 text-purple-600" />
                  POC Details - {vendorForViewPOC?.name}
                </DialogTitle>
                <DialogDescription className="mt-2">
                  Manage points of contact for this vendor
                </DialogDescription>
              </div>
              <Button
                onClick={() => vendorForViewPOC && handleAddPOCFromView(vendorForViewPOC)}
                className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white"
              >
                <UserCircle className="h-4 w-4 mr-2" />
                Add POC
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col py-4">
            {/* POC List */}
            {viewPOCLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                <span className="ml-3 text-muted-foreground">Loading POCs...</span>
              </div>
            ) : vendorPOCs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-purple-100 p-4 mb-4">
                  <UserCircle className="h-12 w-12 text-purple-600" />
                </div>
                <p className="text-lg font-medium mb-2">No POCs found</p>
                <p className="text-sm text-muted-foreground mb-4">Get started by adding a point of contact for this vendor</p>
                <Button
                  onClick={() => vendorForViewPOC && handleAddPOCFromView(vendorForViewPOC)}
                  className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white"
                >
                  <UserCircle className="h-4 w-4 mr-2" />
                  Add First POC
                </Button>
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background z-10">
                          <TableRow className="border-b">
                            <TableHead className="font-semibold text-sm h-12">Name</TableHead>
                            <TableHead className="font-semibold text-sm h-12">Role</TableHead>
                            <TableHead className="font-semibold text-sm h-12">Email</TableHead>
                            <TableHead className="font-semibold text-sm h-12">Phone Number</TableHead>
                            <TableHead className="font-semibold text-sm h-12">WhatsApp Number</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {vendorPOCs.map((poc, index) => (
                            <TableRow 
                              key={poc.id}
                              className={index % 2 === 0 ? "bg-muted/30" : ""}
                            >
                              <TableCell className="font-medium py-4">
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                                    {poc.name.charAt(0).toUpperCase()}
                                  </div>
                                  <span>{poc.name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <Badge 
                                  variant="outline" 
                                  className="font-medium border-purple-200 text-purple-700 bg-purple-50"
                                >
                                  {poc.role}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <a 
                                    href={`mailto:${poc.email}`}
                                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                                  >
                                    {poc.email}
                                  </a>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <a 
                                    href={`tel:${poc.number}`}
                                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                                  >
                                    {poc.number}
                                  </a>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-green-600 flex-shrink-0" />
                                  <a 
                                    href={`https://wa.me/${poc.whatsapp_number.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-green-600 hover:text-green-700 hover:underline"
                                  >
                                    {poc.whatsapp_number}
                                  </a>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
                {vendorPOCs.length > 0 && (
                  <div className="mt-4 text-sm text-muted-foreground text-center">
                    Showing {vendorPOCs.length} POC{vendorPOCs.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleCloseViewPOCModal}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vendor Selection Modal for Add POC */}
      <Dialog open={showVendorSelectionModal} onOpenChange={setShowVendorSelectionModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-blue-600" />
              Select Vendor to Add POC
            </DialogTitle>
            <DialogDescription>
              Choose a vendor to add a new point of contact.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {filteredVendors.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No vendors available</p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto">
                <div className="space-y-2">
                  {filteredVendors.map((vendor) => (
                    <div
                      key={vendor.id}
                      onClick={() => {
                        setShowVendorSelectionModal(false);
                        handleAddPOC(vendor);
                      }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                          {vendor.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{vendor.name}</p>
                          <p className="text-sm text-muted-foreground">{vendor.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowVendorSelectionModal(false);
                          handleAddPOC(vendor);
                        }}
                      >
                        <UserCircle className="h-4 w-4 mr-2" />
                        Add POC
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowVendorSelectionModal(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage User Modal */}
      <Dialog open={showManageModal} onOpenChange={setShowManageModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Manage User - {vendorForManage?.name}
            </DialogTitle>
            <DialogDescription>
              {existingManageUserId 
                ? "Update user management settings for this vendor." 
                : "Configure user management settings for this vendor."}
            </DialogDescription>
          </DialogHeader>
          
          {fetchingManageData ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-muted-foreground">Loading current settings...</span>
            </div>
          ) : (
          <div className="space-y-4 py-4">
            {/* Skip Rate Validation */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="skip-rate-validation"
                checked={manageFormData.skip_rate_validation}
                onCheckedChange={(checked) => handleManageInputChange('skip_rate_validation', checked === true)}
                disabled={manageLoading}
              />
              <Label 
                htmlFor="skip-rate-validation"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Skip Rate validation
              </Label>
            </div>

            {/* Skip Status */}
            <div className="space-y-2">
              <Label htmlFor="skip-status">Skip Status</Label>
              <MultiSelectFilter
                options={statusOptions}
                selectedValues={manageFormData.skip_status}
                onValueChange={(values) => handleManageInputChange('skip_status', values)}
                placeholder="Select statuses..."
                className="w-full"
              />
              {manageFormData.skip_status.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {manageFormData.skip_status.map((statusValue) => {
                    const statusOption = statusOptions.find(opt => opt.value === statusValue);
                    return (
                      <Badge
                        key={statusValue}
                        variant="secondary"
                        className="flex items-center gap-1 px-2 py-1"
                      >
                        {statusOption?.label || statusValue}
                        <button
                          type="button"
                          onClick={() => {
                            const newValues = manageFormData.skip_status.filter(v => v !== statusValue);
                            handleManageInputChange('skip_status', newValues);
                          }}
                          className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                          disabled={manageLoading}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Select one or more statuses to skip
              </p>
            </div>

            {/* Auto Cancel Days */}
            <div className="space-y-2">
              <Label htmlFor="auto-cancel-days">Auto cancel Day</Label>
              <Input
                id="auto-cancel-days"
                name="auto_cancel_days"
                type="number"
                placeholder="Enter number of days"
                value={manageFormData.auto_cancel_days}
                onChange={(e) => handleManageInputChange('auto_cancel_days', e.target.value)}
                disabled={manageLoading}
                min="0"
              />
              <p className="text-xs text-muted-foreground">
                Enter the number of days for auto cancellation
              </p>
            </div>
          </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCloseManageModal}
              disabled={manageLoading || fetchingManageData}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveManage}
              disabled={manageLoading || fetchingManageData}
              className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white"
            >
              {manageLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {existingManageUserId ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  {existingManageUserId ? 'Update' : 'Save'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorsPage;
