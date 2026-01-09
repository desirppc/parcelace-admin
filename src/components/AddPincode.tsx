import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Loader2 } from 'lucide-react';
import { pincodeService, AddPincodeRequest } from '@/services/pincodeService';

const AddPincode = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AddPincodeRequest>({
    pincode: '',
    state: '',
    city: ''
  });

  const handleInputChange = (field: keyof AddPincodeRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.pincode.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a pincode',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.state.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a state',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.city.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a city',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await pincodeService.addPincode(formData);

      if (response.success) {
        // Show success message from API
        toast({
          title: 'Success',
          description: response.message || 'Pincode added successfully',
        });

        // Reset form
        setFormData({
          pincode: '',
          state: '',
          city: ''
        });
      } else {
        // Show error message from API
        toast({
          title: 'Error',
          description: response.message || response.error || 'Failed to add pincode',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error adding pincode:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-purple-600" />
            <CardTitle className="text-2xl">Add Pincode</CardTitle>
          </div>
          <CardDescription>
            Add a new delivery pincode to the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pincode Input */}
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                type="text"
                placeholder="Enter pincode (e.g., 581186)"
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                className="h-12"
                maxLength={6}
                disabled={loading}
              />
            </div>

            {/* City Input */}
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                type="text"
                placeholder="Enter city (e.g., UTTARA KANNADA)"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value.toUpperCase())}
                className="h-12"
                disabled={loading}
              />
            </div>

            {/* State Input */}
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                type="text"
                placeholder="Enter state (e.g., KARNATAKA)"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value.toUpperCase())}
                className="h-12"
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:from-pink-600 hover:via-purple-600 hover:to-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mr-2" />
                    Add Pincode
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddPincode;

