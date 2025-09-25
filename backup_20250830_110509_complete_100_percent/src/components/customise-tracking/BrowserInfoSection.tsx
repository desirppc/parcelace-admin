import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, ChevronDown, Upload, Image as ImageIcon } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BrowserSettings } from '@/services/trackingCustomizationService';

interface BrowserInfoSectionProps {
  data?: BrowserSettings[];
  onDataChange?: (data: BrowserSettings[]) => void;
}

const BrowserInfoSection: React.FC<BrowserInfoSectionProps> = ({ data, onDataChange }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [localData, setLocalData] = useState<BrowserSettings[]>([
    {
      page_title: "Track Your Package - ParcelAce",
      favicon_url: "uploads/favicon/parcelace.png"
    }
  ]);

  // Initialize with props data or default values
  useEffect(() => {
    if (data && data.length > 0) {
      setLocalData(data);
    }
  }, [data]);

  const handleDataChange = (field: keyof BrowserSettings, value: string) => {
    const updatedData = localData.map((item, index) => 
      index === 0 ? { ...item, [field]: value } : item
    );
    setLocalData(updatedData);
    
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  const handleFaviconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real implementation, you would upload the file to the server
      // For now, we'll just update the local state
      const fileName = `uploads/favicon/${file.name}`;
      handleDataChange('favicon_url', fileName);
      
      toast({
        title: "Favicon Updated",
        description: "Favicon has been updated successfully",
      });
    }
  };

  const currentData = localData[0] || localData[0];

  return (
    <div className="space-y-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Customize page title and favicon for professional branding</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Browser Settings</span>
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-6 pt-4">
          <div className="grid gap-6">
            {/* Web Title */}
            <div className="space-y-3">
              <Label htmlFor="web-title" className="text-sm font-medium text-gray-700">Page Title</Label>
              <Input
                id="web-title"
                value={currentData?.page_title || ''}
                onChange={(e) => handleDataChange('page_title', e.target.value)}
                placeholder="Enter your tracking page title"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">
                This title will appear in the browser tab when customers visit your tracking page
              </p>
            </div>

            {/* Favicon Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Favicon</Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  {currentData?.favicon_url ? (
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 text-gray-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Current</p>
                    </div>
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Upload a favicon (16x16, 32x32, or 48x48 pixels)
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <label htmlFor="favicon-upload" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </label>
                    </Button>
                    <input
                      id="favicon-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFaviconUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Supported formats: ICO, PNG, GIF. Recommended size: 32x32 pixels
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default BrowserInfoSection;
