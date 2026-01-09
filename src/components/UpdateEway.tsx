import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FileText, Loader2 } from 'lucide-react';
import { ewayService, UpdateEwayRequest } from '@/services/ewayService';

const UpdateEway = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateEwayRequest>({
    awb: '',
    dcn: '',
    ewbn: ''
  });

  const handleInputChange = (field: keyof UpdateEwayRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.awb.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter an AWB number',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.dcn.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter an Invoice Number (DCN)',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.ewbn.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter an Eway Number (EWBN)',
        variant: 'destructive'
      });
      return;
    }

    // Validate eway number is 12 digits
    if (formData.ewbn.length !== 12 || !/^\d+$/.test(formData.ewbn)) {
      toast({
        title: 'Validation Error',
        description: 'Eway Number must be exactly 12 digits',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await ewayService.updateEwayBill(formData);

      if (response.success) {
        // Show success message from API
        toast({
          title: 'Success',
          description: response.message || 'Eway bill updated successfully',
        });

        // Reset form
        setFormData({
          awb: '',
          dcn: '',
          ewbn: ''
        });
      } else {
        // Show error message from API
        toast({
          title: 'Error',
          description: response.message || response.error || 'Failed to update eway bill',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error updating eway bill:', error);
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
            <FileText className="w-6 h-6 text-purple-600" />
            <CardTitle className="text-2xl">Update Eway Bill</CardTitle>
          </div>
          <CardDescription>
            Update eway bill information for a shipment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* AWB Input */}
            <div className="space-y-2">
              <Label htmlFor="awb">AWB Number *</Label>
              <Input
                id="awb"
                type="text"
                placeholder="Enter AWB number"
                value={formData.awb}
                onChange={(e) => handleInputChange('awb', e.target.value.toUpperCase())}
                className="h-12"
                disabled={loading}
              />
            </div>

            {/* DCN (Invoice Number) Input */}
            <div className="space-y-2">
              <Label htmlFor="dcn">Invoice Number (DCN) *</Label>
              <Input
                id="dcn"
                type="text"
                placeholder="Enter Invoice Number (DCN)"
                value={formData.dcn}
                onChange={(e) => handleInputChange('dcn', e.target.value)}
                className="h-12"
                disabled={loading}
              />
            </div>

            {/* EWBN (Eway Number) Input */}
            <div className="space-y-2">
              <Label htmlFor="ewbn">Eway Number (EWBN) *</Label>
              <Input
                id="ewbn"
                type="text"
                placeholder="Enter 12-digit Eway Number"
                value={formData.ewbn}
                onChange={(e) => {
                  // Only allow digits and limit to 12 characters
                  const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                  handleInputChange('ewbn', value);
                }}
                className="h-12"
                maxLength={12}
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                Eway Number must be exactly 12 digits
              </p>
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
                    Updating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Update Eway Bill
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

export default UpdateEway;

