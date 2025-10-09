import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Phone, 
  User, 
  Warehouse,
  Building,
  MessageCircle,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import OnboardingLayout from './OnboardingLayout';
import WarehouseForm, { WarehouseFormValues } from './WarehouseForm';

interface WarehouseData {
  id: number;
  user_id: number;
  warehouse_name: string;
  warehouse_code: string;
  first_name: string;
  last_name: string;
  address: string;
  mobile_number: string;
  whatsapp_number?: string;
  alternative_mobile_number?: string;
  pincode: string;
  city: string;
  state: string;
  is_default: number;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

// API URL - using the same base URL as other components
const API_URL = `${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/warehouse`;
console.log('Warehouse API URL:', API_URL);

// Helper function to format date
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

// ErrorBoundary component to catch rendering errors
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    // You can log error here
    console.error('WarehouseScreen ErrorBoundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-8 text-center text-red-600">Something went wrong while loading the warehouse page. Please try again later.</div>;
    }
    return this.props.children;
  }
}

const WarehouseScreen = () => {
  console.log('WarehouseScreen component rendered');
  const { toast } = useToast();
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  
  // Ensure warehouses is always an array
  useEffect(() => {
    if (!Array.isArray(warehouses)) {
      console.warn('Warehouses is not an array, resetting to empty array');
      setWarehouses([]);
    }
  }, [warehouses]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseData | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  // No need for formData state, handled by WarehouseForm

  // Fetch warehouses from API
  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login to access warehouse data",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Warehouse API response:', data);
      
      // Ensure we always set an array
      let warehousesData = [];
      if (data && data.status && data.data && Array.isArray(data.data.warehouses_data)) {
        warehousesData = data.data.warehouses_data;
      } else if (data && Array.isArray(data)) {
        warehousesData = data;
      } else if (data && Array.isArray(data.data)) {
        warehousesData = data.data;
      } else if (data && data.data && Array.isArray(data.data.warehouses)) {
        warehousesData = data.data.warehouses;
      } else if (data && data.warehouses && Array.isArray(data.warehouses)) {
        warehousesData = data.warehouses;
      }
      
      // Sort by created_at descending
      warehousesData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      console.log('Processed warehouses data:', warehousesData);
      setWarehouses(warehousesData);
      
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast({
        title: "Error",
        description: "Failed to fetch warehouses. Please check your connection and try again.",
        variant: "destructive"
      });
      // Set empty array on error to prevent filter issues
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
    
    // Test API connectivity
    const testAPI = async () => {
      try {
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        console.log('Testing API connectivity...');
        console.log('API URL:', API_URL);
        console.log('Auth token:', token ? 'Present' : 'Missing');
        
        const response = await fetch(API_URL, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors'
        });
        
        console.log('API test response status:', response.status);
        console.log('API test response headers:', response.headers);
      } catch (error) {
        console.error('API connectivity test failed:', error);
      }
    };
    
    testAPI();
  }, []);

  // Fix filteredWarehouses logic:
  const filteredWarehouses = Array.isArray(warehouses)
    ? (searchTerm.trim() === ''
        ? warehouses
        : warehouses.filter(warehouse =>
            warehouse.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            warehouse.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            warehouse.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            warehouse.city.toLowerCase().includes(searchTerm.toLowerCase())
          )
      )
    : [];

  // No need for handleMobileNumberChange, handled by WarehouseForm

  const handleAddWarehouse = async (values: WarehouseFormValues) => {
    setAddLoading(true);
    let timeoutId: NodeJS.Timeout | null = null;
    let requestTimeoutId: NodeJS.Timeout | null = null;
    try {
      // Set a max wait time of 10 seconds
      timeoutId = setTimeout(() => setAddLoading(false), 10000);
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login to access warehouse data",
          variant: "destructive"
        });
        return;
      }

      const requestBody = {
        warehouse_name: values.warehouse_name,
        first_name: values.first_name,
        last_name: values.last_name,
        address: values.address,
        mobile_number: values.mobile_number,
        whatsapp_number: values.whatsapp_number || '',
        alternative_mobile_number: values.alternative_mobile_number || '',
        pincode: values.pincode,
        city: values.city,
        state: values.state,
        country: 'India'
      };

      console.log('Creating warehouse with payload:', requestBody);

      // Create an AbortController for timeout
      const controller = new AbortController();
      requestTimeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
        mode: 'cors',
        signal: controller.signal
      });

      clearTimeout(requestTimeoutId);

      const result = await response.json();
      console.log('Warehouse creation response:', result);

      // Check if the API response indicates success
      if (result.status === true) {
        await fetchWarehouses();
        setAddDialogOpen(false);
        toast({
          title: "Warehouse Added ✅",
          description: `${values.warehouse_name} has been added successfully`
        });
      } else {
        // Handle API errors
        const errorMessage = result.message || result.error || 'Failed to create warehouse';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error adding warehouse:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast({
        title: "Error",
        description: error.message || "Failed to add warehouse. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAddLoading(false);
      if (timeoutId) clearTimeout(timeoutId);
      if (requestTimeoutId) clearTimeout(requestTimeoutId);
    }
  };

  const handleEditWarehouse = async (values: WarehouseFormValues) => {
    if (!editingWarehouse) return;
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login to access warehouse data",
          variant: "destructive"
        });
        return;
      }

      const requestBody = {
        warehouse_name: values.warehouse_name,
        first_name: values.first_name,
        last_name: values.last_name,
        address: values.address,
        mobile_number: values.mobile_number,
        whatsapp_number: values.whatsapp_number || '',
        alternative_mobile_number: values.alternative_mobile_number || '',
        pincode: values.pincode,
        city: values.city,
        state: values.state,
        country: 'India'
      };

      console.log('Updating warehouse with payload:', requestBody);

      const response = await fetch(`${API_URL}/${editingWarehouse.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      console.log('Warehouse update response:', result);

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      await fetchWarehouses();
      setEditDialogOpen(false);
      setEditingWarehouse(null);
      toast({
        title: "Warehouse Updated ✅",
        description: `${values.warehouse_name} has been updated successfully`
      });
    } catch (error) {
      console.error('Error updating warehouse:', error);
      toast({
        title: "Error",
        description: "Failed to update warehouse. Please try again.",
        variant: "destructive"
      });
    }
  };

  // No need for resetFormData, handled by WarehouseForm

  const openEditDialog = (warehouse: WarehouseData) => {
    setEditingWarehouse(warehouse);
    setEditDialogOpen(true);
  };

  const handleDeleteWarehouse = async (warehouse: WarehouseData) => {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login to access warehouse data",
          variant: "destructive"
        });
        return;
      }

      console.log('Deleting warehouse:', warehouse.id);
      console.log('Delete URL:', `${API_URL}/${warehouse.id}`);

      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_URL}/${warehouse.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('Delete response status:', response.status);
      console.log('Delete response headers:', response.headers);

      // Try to parse response as JSON, but handle cases where it might not be JSON
      let result = null;
      try {
        const responseText = await response.text();
        console.log('Delete response text:', responseText);
        
        if (responseText) {
          result = JSON.parse(responseText);
          console.log('Warehouse deletion response:', result);
        }
      } catch (parseError) {
        console.log('Response is not JSON, treating as success if status is 200-299');
      }

      if (!response.ok) {
        const errorMessage = result?.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      await fetchWarehouses();
      toast({
        title: "Warehouse Deleted",
        description: `${warehouse.warehouse_name} has been deleted`
      });
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      let errorMessage = "Failed to delete warehouse. Please try again.";
      
      if (error.name === 'AbortError') {
        errorMessage = "Request timed out. Please check your connection and try again.";
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const WarehouseContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading warehouses...</span>
        </div>
      );
    }
    if (!loading && warehouses.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Warehouse className="h-12 w-12 text-blue-400 mb-4" />
          <div className="text-lg font-semibold mb-2">No warehouses found</div>
          <div className="text-gray-500 mb-4">Add your first warehouse to get started.</div>
          <Button onClick={() => setAddDialogOpen(true)} className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:from-pink-600 hover:via-purple-600 hover:to-blue-700">
            <Plus className="h-4 w-4 mr-2" /> Add Warehouse
          </Button>
        </div>
      );
    }
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Search and Stats */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search warehouses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {filteredWarehouses.length} Warehouses
              </Badge>
            </div>
            <Button 
              onClick={() => setAddDialogOpen(true)} 
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:from-pink-600 hover:via-purple-600 hover:to-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Warehouse
            </Button>
          </div>
          {/* Warehouses Grid */}
          {filteredWarehouses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWarehouses.map((warehouse) => (
                <Card key={warehouse.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Warehouse className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{warehouse.warehouse_name}</CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Created {formatDate(warehouse.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditDialog(warehouse)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Warehouse</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{warehouse.warehouse_name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteWarehouse(warehouse)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{warehouse.first_name} {warehouse.last_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{warehouse.mobile_number}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-700 dark:text-gray-300">{warehouse.address}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                          {warehouse.city}, {warehouse.state} - {warehouse.pincode}
                        </p>
                      </div>
                    </div>
                                    {warehouse.whatsapp_number && warehouse.whatsapp_number !== warehouse.mobile_number && (
                      <div className="flex items-center gap-2 text-sm">
                        <MessageCircle className="h-4 w-4 text-green-500" />
                        <span>WhatsApp: {warehouse.whatsapp_number}</span>
                      </div>
                    )}
                    {warehouse.alternative_mobile_number && warehouse.alternative_mobile_number !== warehouse.mobile_number && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-blue-500" />
                        <span>Alternate: {warehouse.alternative_mobile_number}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredWarehouses.length === 0 && (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No warehouses found' : 'No warehouses yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search criteria' 
                  : 'Create your first warehouse to get started'
                }
              </p>
            </div>
          )}

          {/* Edit Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Edit Warehouse
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  Update warehouse information
                </DialogDescription>
              </DialogHeader>
              <WarehouseForm
                initialValues={editingWarehouse ? {
                  warehouse_name: editingWarehouse.warehouse_name,
                  first_name: editingWarehouse.first_name,
                  last_name: editingWarehouse.last_name,
                  address: editingWarehouse.address,
                  mobile_number: editingWarehouse.mobile_number,
                  whatsapp_number: editingWarehouse.whatsapp_number || '',
                  alternative_mobile_number: editingWarehouse.alternative_mobile_number || '',
                  pincode: editingWarehouse.pincode,
                  city: editingWarehouse.city,
                  state: editingWarehouse.state,
                } : undefined}
                onSubmit={handleEditWarehouse}
                onCancel={() => {
                  setEditDialogOpen(false);
                  setEditingWarehouse(null);
                }}
                submitLabel="Update Warehouse"
              />
            </DialogContent>
          </Dialog>

          {/* Add Dialog */}
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Add New Warehouse
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  Create a new warehouse/pickup location for your shipments
                </DialogDescription>
              </DialogHeader>
              <WarehouseForm
                initialValues={undefined}
                onSubmit={handleAddWarehouse}
                onCancel={() => setAddDialogOpen(false)}
                submitLabel="Add Warehouse"
                loading={addLoading}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <WarehouseContent />
    </ErrorBoundary>
  );
};

export default WarehouseScreen; 