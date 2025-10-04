import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { toast } from "@/hooks/use-toast";
import { Upload, Save, Facebook, Twitter, Linkedin, Instagram, Youtube, Phone, Mail, Loader2, AlertTriangle, CheckCircle, Package } from "lucide-react";
import API_CONFIG from '@/config/api';

const BrandDetails = () => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brandData, setBrandData] = useState({
    support_contact_number: '',
    support_email: '',
    facebook_link: '',
    twitter_link: '',
    linkedin_link: '',
    instagram_link: '',
    youtube_link: '',
    brand_logo: ''
  });

  // Fetch brand details from API
  const fetchBrandDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const authToken = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
      
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_USER_META}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          { "widget_type": "brand_details", "meta_key": "brand_details" }
        ])
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();

      if (result?.status && Array.isArray(result?.data) && result.data.length > 0) {
        const bd =
          result?.data?.[0]?.brand_details?.brand_details?.[0] ??
          result?.data?.[0]?.brand_details?.[0] ??
          result?.data?.[0]?.brand_details ??
          null;

        if (bd && typeof bd === 'object') {
          setBrandData(prev => ({
            ...prev,
            support_contact_number: bd.support_contact_number ?? '',
            support_email: bd.support_email ?? '',
            facebook_link: bd.facebook_link ?? '',
            twitter_link: bd.twitter_link ?? '',
            linkedin_link: bd.linkedin_link ?? '',
            instagram_link: bd.instagram_link ?? '',
            youtube_link: bd.youtube_link ?? '',
            brand_logo: bd.brand_logo ?? ''
          }));

          if (bd.brand_logo) {
            setLogoPreview(`${API_CONFIG.BASE_URL}${bd.brand_logo}`);
          }
        } else {
          console.warn('Brand details not found in response:', result);
        }
      } else {
        console.warn('Unexpected brand details API response shape:', result);
      }
    } catch (err) {
      console.error('Error fetching brand details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch brand details');
      toast({
        title: "Error",
        description: "Failed to fetch brand details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      setError('crash: ' + event.error?.message || 'Unknown error');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setError('crash: ' + (event.reason?.message || 'Promise rejected'));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Fetch brand details on component mount
  useEffect(() => {
    fetchBrandDetails();
  }, []);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid File",
            description: "Please select an image file (PNG, JPG, GIF)",
            variant: "destructive"
          });
          return;
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          toast({
            title: "File Too Large",
            description: "Please select an image smaller than 10MB",
            variant: "destructive"
          });
          return;
        }

        setLogoFile(file);
        
        // Create preview with error handling
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            if (e.target?.result) {
              setLogoPreview(e.target.result as string);
            }
          } catch (error) {
            console.error('Error setting logo preview:', error);
            toast({
              title: "Preview Error",
              description: "Could not generate image preview. The file will still be uploaded.",
              variant: "destructive"
            });
          }
        };
        
        reader.onerror = (error) => {
          console.error('FileReader error:', error);
          toast({
            title: "File Read Error",
            description: "Could not read the selected file. Please try another image.",
            variant: "destructive"
          });
          setLogoFile(null);
        };
        
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error handling logo upload:', error);
      toast({
        title: "Upload Error",
        description: "An error occurred while processing the image. Please try again.",
        variant: "destructive"
      });
      setLogoFile(null);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setBrandData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Upload image to server
  const uploadImage = async (file: File): Promise<string> => {
    try {
      setIsUploading(true);
      
      // Check if API endpoints are configured
      if (!API_CONFIG.BASE_URL || !API_CONFIG.ENDPOINTS.IMAGE_UPLOAD) {
        throw new Error('API configuration is missing');
      }
      
      const authToken = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
      
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      // Additional file validation
      if (!file || !(file instanceof File)) {
        throw new Error('Invalid file object');
      }

      const formData = new FormData();
      formData.append('image', file);

      console.log('Uploading image:', file.name, 'Size:', file.size);
      console.log('API URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE_UPLOAD}`);

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE_UPLOAD}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          // Don't set Content-Type for FormData, let browser set it
        },
        body: formData
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload response error:', errorText);
        throw new Error(`Image upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Upload response:', result);
      
      if (result.status && result.data && result.data.image_path) {
        return result.data.image_path; // Return the image path for storage
      } else {
        console.error('Invalid upload response:', result);
        throw new Error('Image upload response invalid or missing image_path');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  // Update brand details
  const updateBrandDetails = async (imagePath?: string) => {
    try {
      // Check if API endpoints are configured
      if (!API_CONFIG.BASE_URL || !API_CONFIG.ENDPOINTS.UPDATE_USER_META) {
        throw new Error('API configuration is missing');
      }
      
      const authToken = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
      
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      // Prepare the data to send
      const updateData = [
        {
          "widget_type": "brand_details",
          "meta_key": "brand_details",
          "meta_value": [
            {
              "support_contact_number": brandData.support_contact_number,
              "support_email": brandData.support_email,
              "facebook_link": brandData.facebook_link,
              "twitter_link": brandData.twitter_link,
              "linkedin_link": brandData.linkedin_link,
              "brand_logo": imagePath || brandData.brand_logo || ""
            }
          ]
        }
      ];

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_USER_META}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error(`Update failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status) {
        // Update local state with new image path if uploaded
        if (imagePath) {
          setBrandData(prev => ({
            ...prev,
            brand_logo: imagePath
          }));
          setLogoPreview(`${API_CONFIG.BASE_URL}${imagePath}`);
        }
        
        toast({
          title: "Success",
          description: "Brand details updated successfully!",
        });
        
        // Refresh data to show updated information
        await fetchBrandDetails();
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (err) {
      console.error('Error updating brand details:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update brand details",
        variant: "destructive"
      });
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    if (!brandData.support_contact_number.trim()) {
      toast({
        title: "Validation Error",
        description: "Support contact number is required",
        variant: "destructive"
      });
      return false;
    }
    
    if (!brandData.support_email.trim()) {
      toast({
        title: "Validation Error",
        description: "Support email is required",
        variant: "destructive"
      });
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(brandData.support_email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    // Validate form first
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      let imagePath: string | undefined;
      
      // If there's a new logo file, upload it first
      if (logoFile) {
        imagePath = await uploadImage(logoFile);
        setLogoFile(null); // Clear the file after upload
      }
      
      // Then update the brand details
      await updateBrandDetails(imagePath);
      
    } catch (err) {
      console.error('Error saving brand details:', err);
      toast({
        title: "Error",
        description: "Failed to save brand details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const socialMediaLinks = [
    { key: 'facebook_link', label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { key: 'twitter_link', label: 'Twitter', icon: Twitter, color: 'text-sky-500' },
    { key: 'linkedin_link', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
    { key: 'instagram_link', label: 'Instagram', icon: Instagram, color: 'text-pink-600' },
    { key: 'youtube_link', label: 'YouTube', icon: Youtube, color: 'text-red-600' }
  ];

  // Error boundary for the component
  if (error && error.includes('crash')) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Something went wrong</h1>
          <p className="text-red-600 mb-4">The page encountered an error. Please refresh to try again.</p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Brand Details
            </h1>
            <p className="text-slate-600 text-lg">
              Manage your brand information and social media presence
            </p>
          </div>
          

        </div>

        {/* Error Display */}
        {error && (
          <Card className="shadow-lg border-0 bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <p className="font-medium">Error: {error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card className="shadow-lg border-0 bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <p className="text-blue-700 font-medium">Loading brand details...</p>
              </div>
            </CardContent>
          </Card>
        )}



        {/* Logo Upload Section */}
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Upload className="h-5 w-5" />
              Brand Logo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <Label htmlFor="logo-upload" className="text-sm font-medium text-slate-700 mb-2 block">
                  Upload your brand logo
                </Label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  isUploading 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-slate-300 hover:border-blue-400'
                }`}>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      try {
                        handleLogoUpload(e);
                      } catch (error) {
                        console.error('Error in file input change:', error);
                        toast({
                          title: "File Error",
                          description: "An error occurred while selecting the file. Please try again.",
                          variant: "destructive"
                        });
                      }
                    }}
                    disabled={isUploading || isLoading}
                    className="hidden"
                  />
                  <label htmlFor="logo-upload" className={`cursor-pointer ${isUploading ? 'pointer-events-none' : ''}`}>
                    {isUploading ? (
                      <div className="space-y-3">
                        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
                        <p className="text-blue-700 font-medium">Uploading logo...</p>
                        <p className="text-blue-600 text-sm">Please wait</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600 font-medium">Click to upload or drag and drop</p>
                        <p className="text-slate-400 text-sm mt-1">PNG, JPG, GIF up to 10MB</p>
                      </>
                    )}
                  </label>
                </div>
                
                {/* File info */}
                {logoFile && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-700 font-medium">
                          {logoFile.name}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setLogoFile(null)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      {(logoFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>
              
              {/* Logo Preview */}
              {(logoPreview || brandData.brand_logo) && (
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 border rounded-lg overflow-hidden bg-white shadow-md relative">
                    <img
                      src={logoPreview || `${API_CONFIG.BASE_URL}${brandData.brand_logo}`}
                      alt="Brand logo"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Fallback if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    {logoFile ? 'New logo (will be uploaded)' : 'Current logo'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Phone className="h-5 w-5" />
              Support Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="support_contact_number" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Phone className="h-4 w-4" />
                  Support Contact Number
                </Label>
                <Input
                  id="support_contact_number"
                  type="tel"
                  value={brandData.support_contact_number}
                  onChange={(e) => handleInputChange('support_contact_number', e.target.value)}
                  disabled={isLoading}
                  className="bg-white/80 border-slate-200 focus:border-blue-400 focus:ring-blue-400 disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support_email" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Mail className="h-4 w-4" />
                  Support Email
                </Label>
                <Input
                  id="support_email"
                  type="email"
                  value={brandData.support_email}
                  onChange={(e) => handleInputChange('support_email', e.target.value)}
                  disabled={isLoading}
                  className="bg-white/80 border-slate-200 focus:border-blue-400 focus:ring-blue-400 disabled:opacity-50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Links */}
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
            <CardTitle className="text-slate-800">Social Media Links</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {socialMediaLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <div key={social.key} className="space-y-2">
                    <Label htmlFor={social.key} className={`flex items-center gap-2 text-sm font-medium text-slate-700`}>
                      <IconComponent className={`h-4 w-4 ${social.color}`} />
                      {social.label}
                    </Label>
                    <Input
                      id={social.key}
                      type="url"
                      value={brandData[social.key as keyof typeof brandData]}
                      onChange={(e) => handleInputChange(social.key, e.target.value)}
                      placeholder={`Enter your ${social.label} profile URL`}
                      disabled={isLoading}
                      className="bg-white/80 border-slate-200 focus:border-blue-400 focus:ring-blue-400 disabled:opacity-50"
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleSave}
            disabled={isLoading || isUploading}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {isLoading ? 'Saving...' : 'Save Brand Details'}
          </Button>
          
          <Button
            onClick={() => {
              setLogoFile(null);
              setLogoPreview('');
              fetchBrandDetails(); // Reset to original data
              toast({
                title: "Reset",
                description: "Changes have been reset to original values",
              });
            }}
            disabled={isLoading || isUploading}
            variant="outline"
            size="lg"
            className="px-8 py-3 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 disabled:opacity-50"
          >
            Reset Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BrandDetails;
