
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ENVIRONMENT } from '@/config/environment';
import { getStoredToken, isTokenActuallyValid, resetSessionTimerForAPI, getSessionInfo } from '@/utils/authUtils';
import CategorySelector from './CategorySelector';

interface CreateTicketProps {
  hideHeader?: boolean;
  onSuccess?: () => void;
}

const CreateTicket: React.FC<CreateTicketProps> = ({ hideHeader = false, onSuccess }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    remark: '',
    AWBValues: [] as string[]
  });

  const [awbInput, setAwbInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  // Monitor session status - reduced frequency to prevent aggressive checking
  useEffect(() => {
    const updateSessionInfo = () => {
      const info = getSessionInfo();
      setSessionInfo(info);
    };

    // Update immediately
    updateSessionInfo();

    // Update every 5 minutes instead of 30 seconds to reduce aggressive checking
    const interval = setInterval(updateSessionInfo, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Session status indicator component
  const SessionStatusIndicator = () => {
    if (!sessionInfo) return null;

    const { sessionAgeMinutes, shouldShowWarning, isExpiringSoon, isExpired } = sessionInfo;

    if (isExpired) {
      return (
        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md mb-4">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-600 font-medium">Session Expired - Please login again</span>
        </div>
      );
    }

    if (isExpiringSoon) {
      return (
        <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-md mb-4">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <span className="text-sm text-orange-600 font-medium">Session expiring soon - {540 - sessionAgeMinutes} minutes remaining</span>
        </div>
      );
    }

    if (shouldShowWarning) {
      return (
        <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
          <Clock className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-600 font-medium">Session active - {540 - sessionAgeMinutes} minutes remaining</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md mb-4">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <span className="text-sm text-green-600 font-medium">Session active - {540 - sessionAgeMinutes} minutes remaining</span>
      </div>
    );
  };

  const handleAwbInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addAwbNumber();
    }
  };

  const addAwbNumber = () => {
    const trimmedAwb = awbInput.trim();
    if (trimmedAwb && !formData.AWBValues.includes(trimmedAwb)) {
      setFormData(prev => ({
        ...prev,
        AWBValues: [...prev.AWBValues, trimmedAwb]
      }));
      setAwbInput('');
    }
  };

  const removeAwbNumber = (awbToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      AWBValues: prev.AWBValues.filter(awb => awb !== awbToRemove)
    }));
  };

  const handleSuccess = () => {
    // Reset form
    setFormData({
      category: '',
      subcategory: '',
      remark: '',
      AWBValues: []
    });
    setAwbInput('');

    // Show success toast
    toast({
      title: "Success!",
      description: "Support ticket created successfully!",
      variant: "default",
    });

    // If onSuccess callback is provided (popup mode), call it to close popup
    if (onSuccess) {
      onSuccess();
    } else {
      // If no callback (standalone page mode), reload the page
      setTimeout(() => {
        window.location.reload();
      }, 1500); // Small delay to show success message
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.category || !formData.subcategory) {
      toast({
        title: "Validation Error",
        description: "Please select a category and sub-category",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Get auth token and validate it
    const authToken = getStoredToken();
    if (!authToken) {
      toast({
        title: "Authentication Error",
        description: "Please login again to continue",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Enhanced token validation
    const isTokenValid = await isTokenActuallyValid(authToken);
    if (!isTokenValid) {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please login again to continue.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Reset session timer on successful validation
    resetSessionTimerForAPI();

    try {
      const apiUrl = ENVIRONMENT.getCurrentApiUrl();
      console.log('🌍 API URL:', apiUrl);
      console.log('📤 Request payload:', {
        category: formData.category,
        subcategory: formData.subcategory,
        remark: formData.remark,
        AWBValues: formData.AWBValues
      });
      
      const response = await fetch(`${apiUrl}api/support-ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          category: formData.category,
          subcategory: formData.subcategory,
          remark: formData.remark,
          AWBValues: formData.AWBValues
        })
      });

      console.log('📥 Response status:', response.status);
      
      // Check if the HTTP request was successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📥 Response data:', result);

      // Check if the API call was successful based on the response data
      if (result.status === true) {
        handleSuccess();
      } else {
        // API returned success: false or error
        toast({
          title: "Error",
          description: result.message || result.error || 'Failed to create ticket',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      
      // Handle different types of errors
      let errorMessage = "Failed to create ticket. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('HTTP error! status: 401')) {
          errorMessage = "Authentication failed. Please login again.";
        } else if (error.message.includes('HTTP error! status: 403')) {
          errorMessage = "Access denied. You don't have permission to create tickets.";
        } else if (error.message.includes('HTTP error! status: 422')) {
          errorMessage = "Invalid data provided. Please check your input.";
        } else if (error.message.includes('HTTP error! status: 500')) {
          errorMessage = "Server error. Please try again later.";
        } else if (error.message.includes('fetch')) {
          errorMessage = "Network error. Please check your connection.";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Create Support Ticket
          </h1>
          <p className="text-muted-foreground">Get help with your shipment or account issues</p>
        </div>
      )}

      {/* Session Status Indicator */}
      <SessionStatusIndicator />

      <Card>
        <CardHeader>
          <CardTitle>New Support Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <CategorySelector
              category={formData.category}
              subcategory={formData.subcategory}
              onCategoryChange={(category) => setFormData(prev => ({ ...prev, category }))}
              onSubCategoryChange={(subcategory) => setFormData(prev => ({ ...prev, subcategory }))}
              disabled={isSubmitting}
            />

            <div>
              <Label className="text-sm font-medium text-foreground">
                AWB Numbers (optional)
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Enter AWB numbers separated by commas or press Enter to add
              </p>
              <Input
                placeholder="Enter AWB numbers (comma separated or press Enter)"
                value={awbInput}
                onChange={(e) => setAwbInput(e.target.value)}
                onKeyDown={handleAwbInputKeyDown}
                onBlur={addAwbNumber}
                className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                disabled={isSubmitting}
              />
              
              {formData.AWBValues.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.AWBValues.map((awb, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {awb}
                      <button
                        type="button"
                        onClick={() => removeAwbNumber(awb)}
                        className="text-red-500 hover:text-red-700"
                        disabled={isSubmitting}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="remark" className="text-sm font-medium text-foreground">
                Description
              </Label>
              <Textarea
                id="remark"
                placeholder="Please describe your issue..."
                value={formData.remark}
                onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
                className="mt-1 min-h-[120px] border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                disabled={isSubmitting}
              />
            </div>

            <Separator />

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:from-pink-600 hover:via-purple-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSubmitting ? 'Creating Ticket...' : 'Create Ticket'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTicket;
