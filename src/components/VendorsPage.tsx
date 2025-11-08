import React, { useState, useEffect } from 'react';
import { Loader2, Users, Mail, Phone, Calendar, Search, Filter, Download, MoreHorizontal, X, Trash2, IndianRupee, UserPlus } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { vendorService, Vendor } from '@/services/vendorService';
import API_CONFIG from '@/config/api';
import { getAuthHeaders } from '@/config/api';
import AssignVendorsToSupportDialog from '@/components/AssignVendorsToSupportDialog';

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
      filtered = filtered.filter(vendor =>
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.phone.includes(searchTerm)
      );
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
    
    // Fetch vendor balance
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}api/vendor-wallet/balance/${vendor.id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        setVendorBalance(data.data?.balance || 0);
      } else {
        setVendorBalance(0);
      }
    } catch (error) {
      console.error('Error fetching vendor balance:', error);
      setVendorBalance(0);
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
                    <TableHead className="font-semibold">Created</TableHead>
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
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(vendor.created_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
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
    </div>
  );
};

export default VendorsPage;
