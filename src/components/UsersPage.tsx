import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Users, Mail, Phone, Calendar, Search, Filter, Download, MoreHorizontal, X, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supportUserService, SupportUser } from '@/services/supportUserService';
import API_CONFIG from '@/config/api';
import { getAuthHeaders } from '@/config/api';

const UsersPage = () => {
  const [users, setUsers] = useState<SupportUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<SupportUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);
  const [userToDelete, setUserToDelete] = useState<SupportUser | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    parent_vendor_email: ''
  });
  const { toast } = useToast();

  // Password validation function
  const validatePassword = (password: string): boolean => {
    // Minimum 8 characters, 1 small, 1 capital, 1 special character, 1 number
    const minLength = password.length >= 8;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return minLength && hasLower && hasUpper && hasNumber && hasSpecial;
  };

  // Check if passwords match
  const passwordsMatch = formData.password === formData.password_confirmation;
  const showPasswordError = formData.password_confirmation.length > 0 && !passwordsMatch;

  // Check if all required fields are filled and passwords match
  const isFormValid = formData.name.trim() !== '' && 
                     formData.email.trim() !== '' && 
                     formData.phone.trim() !== '' && 
                     formData.password.trim() !== '' && 
                     formData.password_confirmation.trim() !== '' && 
                     passwordsMatch && 
                     validatePassword(formData.password);


  // Fetch support users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await supportUserService.getSupportUsers();
      
      if (response.status) {
        setUsers(response.data.support_users);
        toast({
          title: "Success",
          description: response.message,
        });
      } else {
        // Show mock data for testing UI
        setUsers([
          {
            id: 1,
            name: "Test User",
            email: "test@example.com",
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
      const errorMessage = 'Failed to fetch users';
      // Show mock data for testing UI
      setUsers([
        {
          id: 1,
          name: "Test User",
          email: "test@example.com",
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

  // Filter users based on search term and status
  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setShowAddUserModal(true);
  };

  const handleCloseModal = () => {
    setShowAddUserModal(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: '',
      parent_vendor_email: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateUser = async () => {
    try {
      // Validation
      if (!formData.name || !formData.email || !formData.phone || !formData.password) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      if (!validatePassword(formData.password)) {
        toast({
          title: "Password Error",
          description: "Password must be minimum 8 characters with 1 lowercase, 1 uppercase, 1 number, and 1 special character",
          variant: "destructive",
        });
        return;
      }

      if (formData.password !== formData.password_confirmation) {
        toast({
          title: "Password Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return;
      }

      setAddUserLoading(true);

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPPORT_USERS}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          parent_vendor_email: formData.parent_vendor_email
        })
      });

      const data = await response.json();

      if (response.ok && data.status) {
        toast({
          title: "Success",
          description: data.message || "Support user created successfully",
        });
        handleCloseModal();
        fetchUsers(); // Refresh the users list
      } else {
        // Extract error message from API response
        let errorMessage = data.message || "Failed to create user";
        
        // Check if there's a detailed error message in the error object
        if (data.error && typeof data.error === 'object') {
          if (data.error.message) {
            errorMessage = data.error.message;
          } else if (typeof data.error === 'string') {
            errorMessage = data.error;
          }
        }
        
        // Handle specific error cases
        if (errorMessage.includes("email has already been taken")) {
          errorMessage = "This email address is already registered. Please use a different email.";
        } else if (errorMessage.includes("Invalid request")) {
          errorMessage = "Please check all fields and try again.";
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleDeleteUser = (user: SupportUser) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setDeleteUserLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPPORT_USERS}/${userToDelete.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok && data.status) {
        toast({
          title: "Success",
          description: data.message || "User deleted successfully",
        });
        setShowDeleteModal(false);
        setUserToDelete(null);
        fetchUsers(); // Refresh the users list
      } else {
        // Extract error message from API response
        let errorMessage = data.message || "Failed to delete user";
        
        // Check if there's a detailed error message in the error object
        if (data.error && typeof data.error === 'object') {
          if (data.error.message) {
            errorMessage = data.error.message;
          } else if (typeof data.error === 'string') {
            errorMessage = data.error;
          }
        }
        
        // Handle specific error cases
        if (errorMessage.includes("Support user not found")) {
          errorMessage = "This user has already been deleted or does not exist.";
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setDeleteUserLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
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
          <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage and monitor support users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleAddUser} 
            className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col gap-4">
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

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {filteredUsers.length} of {users.length} users
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

      {/* Users Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchUsers} variant="outline">
                Try Again
              </Button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                {searchTerm ? 'No users found matching your search' : 'No users found'}
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
                    <TableHead className="font-semibold">Phone Number</TableHead>
                    <TableHead className="font-semibold">Created At</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{user.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(user.created_at)}</span>
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
                            onClick={() => handleDeleteUser(user)}
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

      {/* Add User Modal */}
      <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new support user account. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={addUserLoading}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={addUserLoading}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={addUserLoading}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={addUserLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={addUserLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters, 1 lowercase, 1 uppercase, 1 number, 1 special character
              </p>
            </div>

            {/* Password Confirmation */}
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="password_confirmation"
                  name="password_confirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  disabled={addUserLoading}
                  className={`pr-10 ${showPasswordError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={addUserLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {showPasswordError && (
                <p className="text-xs text-red-500">
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Parent Vendor Email */}
            <div className="space-y-2">
              <Label htmlFor="parent_vendor_email">Parent Vendor Email</Label>
              <Input
                id="parent_vendor_email"
                name="parent_vendor_email"
                type="email"
                placeholder="parent@vendor.com (optional)"
                value={formData.parent_vendor_email}
                onChange={handleInputChange}
                disabled={addUserLoading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCloseModal}
              disabled={addUserLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={addUserLoading || !isFormValid}
              className={`${
                isFormValid 
                  ? "bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white" 
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {addUserLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{userToDelete?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={handleCancelDelete}
              disabled={deleteUserLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDelete}
              disabled={deleteUserLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteUserLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
