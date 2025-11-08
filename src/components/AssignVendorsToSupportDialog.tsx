import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { vendorService, Vendor } from '@/services/vendorService';
import { supportUserService, SupportUser } from '@/services/supportUserService';
import API_CONFIG from '@/config/api';
import { getAuthHeaders } from '@/config/api';

interface AssignVendorsToSupportDialogProps {
  onAssignmentComplete: () => void;
  trigger?: React.ReactNode;
}

const AssignVendorsToSupportDialog: React.FC<AssignVendorsToSupportDialogProps> = ({ 
  onAssignmentComplete,
  trigger 
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [supportUsers, setSupportUsers] = useState<SupportUser[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [selectedSupportUserId, setSelectedSupportUserId] = useState<string>('');
  const [selectedVendorIds, setSelectedVendorIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Load support users and vendors when dialog opens
  useEffect(() => {
    if (open) {
      loadSupportUsers();
      loadVendors();
    }
  }, [open]);

  // Filter vendors based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredVendors(vendors);
    } else {
      const search = searchTerm.toLowerCase();
      setFilteredVendors(
        vendors.filter(
          vendor =>
            vendor.name.toLowerCase().includes(search) ||
            vendor.email.toLowerCase().includes(search)
        )
      );
    }
  }, [vendors, searchTerm]);

  const loadSupportUsers = async () => {
    try {
      const response = await supportUserService.getSupportUsers();
      if (response.status) {
        setSupportUsers(response.data.support_users);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load support users",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading support users:', error);
      toast({
        title: "Error",
        description: "Failed to load support users",
        variant: "destructive",
      });
    }
  };

  const loadVendors = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleVendorToggle = (vendorId: number) => {
    setSelectedVendorIds(prev => {
      if (prev.includes(vendorId)) {
        return prev.filter(id => id !== vendorId);
      } else {
        return [...prev, vendorId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedVendorIds.length === filteredVendors.length) {
      // Deselect all
      setSelectedVendorIds([]);
    } else {
      // Select all filtered vendors
      setSelectedVendorIds(filteredVendors.map(v => v.id));
    }
  };

  const handleAssign = async () => {
    if (!selectedSupportUserId) {
      toast({
        title: "Error",
        description: "Please select a support user",
        variant: "destructive",
      });
      return;
    }

    if (selectedVendorIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one vendor to assign",
        variant: "destructive",
      });
      return;
    }

    setAssigning(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ASSIGN_VENDORS}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          support_id: parseInt(selectedSupportUserId),
          vendor_ids: selectedVendorIds
        })
      });

      const data = await response.json();

      if (response.ok && data.status) {
        toast({
          title: "Success",
          description: data.message || data.data?.message || "Vendors assigned successfully",
        });
        setOpen(false);
        setSelectedSupportUserId('');
        setSelectedVendorIds([]);
        setSearchTerm('');
        onAssignmentComplete();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to assign vendors",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error assigning vendors:', error);
      toast({
        title: "Error",
        description: "Failed to assign vendors",
        variant: "destructive",
      });
    } finally {
      setAssigning(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSelectedSupportUserId('');
      setSelectedVendorIds([]);
      setSearchTerm('');
    }
  };

  const allFilteredSelected = filteredVendors.length > 0 && 
    filteredVendors.every(v => selectedVendorIds.includes(v.id));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Vendors to Support User</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 flex-1 overflow-hidden">
          {/* Support User Selection */}
          <div className="space-y-2">
            <Label htmlFor="support-user">Support User *</Label>
            <Select 
              value={selectedSupportUserId} 
              onValueChange={setSelectedSupportUserId}
            >
              <SelectTrigger className="focus:ring-0 focus:ring-offset-0 border-input">
                <SelectValue placeholder="Select a support user" />
              </SelectTrigger>
              <SelectContent>
                {supportUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    <span className="text-sm">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-gray-500"> - {user.email}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={!selectedSupportUserId}
            />
          </div>

          {/* Select All Checkbox */}
          {filteredVendors.length > 0 && selectedSupportUserId && (
            <div className="flex items-center space-x-2 p-2 border-b">
              <Checkbox
                id="select-all"
                checked={allFilteredSelected}
                onCheckedChange={handleSelectAll}
                disabled={!selectedSupportUserId}
              />
              <label
                htmlFor="select-all"
                className="text-sm font-medium cursor-pointer"
              >
                Select All ({filteredVendors.length} vendors)
              </label>
            </div>
          )}

          {/* Vendors List */}
          <div className="flex-1 overflow-y-auto border rounded-md">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Loading vendors...</span>
              </div>
            ) : !selectedSupportUserId ? (
              <div className="text-center p-8 text-muted-foreground">
                Please select a support user first
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                {searchTerm ? 'No vendors found matching your search' : 'No vendors available'}
              </div>
            ) : (
              <div className="divide-y">
                {filteredVendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleVendorToggle(vendor.id)}
                  >
                    <Checkbox
                      id={`vendor-${vendor.id}`}
                      checked={selectedVendorIds.includes(vendor.id)}
                      onCheckedChange={() => handleVendorToggle(vendor.id)}
                    />
                    <label
                      htmlFor={`vendor-${vendor.id}`}
                      className="flex-1 cursor-pointer text-sm"
                    >
                      <span className="font-medium">{vendor.name}</span>
                      <span className="text-muted-foreground"> - {vendor.email}</span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selection Summary */}
          {selectedVendorIds.length > 0 && (() => {
            const visibleSelectedCount = filteredVendors.filter(v => selectedVendorIds.includes(v.id)).length;
            const totalSelectedCount = selectedVendorIds.length;
            
            // Only show summary if there are visible vendors OR no search is active
            if (searchTerm && filteredVendors.length === 0) {
              // Search active but no results - show total but indicate they're not visible
              return (
                <div className="text-sm text-muted-foreground">
                  {totalSelectedCount} vendor{totalSelectedCount !== 1 ? 's' : ''} selected (not visible in current search)
                </div>
              );
            } else if (searchTerm && visibleSelectedCount !== totalSelectedCount) {
              // Search active with some results - show both counts
              return (
                <div className="text-sm text-muted-foreground">
                  {visibleSelectedCount} visible selected, {totalSelectedCount} total vendor{totalSelectedCount !== 1 ? 's' : ''} selected
                </div>
              );
            } else {
              // No search or all selected are visible - show simple count
              return (
                <div className="text-sm text-muted-foreground">
                  {totalSelectedCount} vendor{totalSelectedCount !== 1 ? 's' : ''} selected
                </div>
              );
            }
          })()}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={assigning}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={assigning || !selectedSupportUserId || selectedVendorIds.length === 0}
              className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white"
            >
              {assigning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign Support User
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignVendorsToSupportDialog;

