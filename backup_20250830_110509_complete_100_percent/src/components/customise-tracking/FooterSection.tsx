import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FooterSection as FooterSectionType } from '@/services/trackingCustomizationService';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface FooterSectionProps {
  data?: FooterSectionType[];
  onDataChange?: (data: FooterSectionType[]) => void;
}

const FooterSection: React.FC<FooterSectionProps> = ({ data, onDataChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localData, setLocalData] = useState<FooterSectionType[]>([
    {
      show_support_email_phone: true,
      show_social_icons: true,
      sticky_footer: true,
      sticky_footer_text: "Enter sticky footer text",
      button_label: "Shop Now",
      button_link: "https://example.com",
      button_color: "#3832f6",
      left_menu_1: "https://www.google.com/men",
      left_menu_2: "https://www.google.com/women",
      left_menu_3: "https://www.google.com/about",
      right_menu_4: "https://www.google.com/contact",
      right_menu_5: "https://www.google.com/help",
      right_menu_6: "https://www.google.com/support",
      privacy_policy_url: "https://www.google.com/privacy"
    }
  ]);

  // Initialize with props data or default values
  useEffect(() => {
    if (data && data.length > 0) {
      setLocalData(data);
    }
  }, [data]);

  const handleDataChange = (field: keyof FooterSectionType, value: any) => {
    const updatedData = localData.map((item, index) => 
      index === 0 ? { ...item, [field]: value } : item
    );
    setLocalData(updatedData);
    
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  const currentData = localData[0];

  // Helper function to get menu label from URL
  const getMenuLabel = (url: string): string => {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      if (path === '/') return 'Home';
      return path.charAt(1).toUpperCase() + path.slice(2) || 'Menu';
    } catch {
      return url || 'Menu';
    }
  };

  // Helper function to get left menu items
  const getLeftMenuItems = () => {
    const items = [];
    if (currentData?.left_menu_1) items.push({ field: 'left_menu_1', url: currentData.left_menu_1, label: getMenuLabel(currentData.left_menu_1) });
    if (currentData?.left_menu_2) items.push({ field: 'left_menu_2', url: currentData.left_menu_2, label: getMenuLabel(currentData.left_menu_2) });
    if (currentData?.left_menu_3) items.push({ field: 'left_menu_3', url: currentData.left_menu_3, label: getMenuLabel(currentData.left_menu_3) });
    return items;
  };

  // Helper function to get right menu items
  const getRightMenuItems = () => {
    const items = [];
    if (currentData?.right_menu_4) items.push({ field: 'right_menu_4', url: currentData.right_menu_4, label: getMenuLabel(currentData.right_menu_4) });
    if (currentData?.right_menu_5) items.push({ field: 'right_menu_5', url: currentData.right_menu_5, label: getMenuLabel(currentData.right_menu_5) });
    if (currentData?.right_menu_6) items.push({ field: 'right_menu_6', url: currentData.right_menu_6, label: getMenuLabel(currentData.right_menu_6) });
    return items;
  };

  const leftMenuItems = getLeftMenuItems();
  const rightMenuItems = getRightMenuItems();

  return (
    <div className="space-y-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Configure footer content, legal links and support information</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Footer Configuration</span>
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-6 pt-4">
          <div className="grid gap-6">
            {/* Support Contact */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Show Support Email & Phone</Label>
                  <p className="text-xs text-gray-600">Display support contact information in the footer</p>
                </div>
              </div>
              <Switch 
                checked={currentData?.show_support_email_phone || false} 
                onCheckedChange={(checked) => handleDataChange('show_support_email_phone', checked)} 
                className="data-[state=checked]:bg-purple-600" 
              />
            </div>

            {/* Privacy Policy */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Privacy Policy URL</Label>
                <Input
                  value={currentData?.privacy_policy_url || ''}
                  onChange={(e) => handleDataChange('privacy_policy_url', e.target.value)}
                  placeholder="https://example.com/privacy-policy"
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-600">Enter the URL where your privacy policy is hosted</p>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Show Social Icons</Label>
                  <p className="text-xs text-gray-600">Display social media links in the footer</p>
                </div>
              </div>
              <Switch 
                checked={currentData?.show_social_icons || false} 
                onCheckedChange={(checked) => handleDataChange('show_social_icons', checked)} 
                className="data-[state=checked]:bg-purple-600" 
              />
            </div>

            {/* Menu Items - Left Side */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Left Side Menu ({leftMenuItems.length}/3)</Label>
              </div>
              
              {leftMenuItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border border-gray-200 rounded-md">
                  <Input
                    placeholder="Menu Label"
                    value={item.label}
                    onChange={(e) => {
                      // Update the label by modifying the URL to include the new label
                      const newUrl = e.target.value ? `https://example.com/${e.target.value.toLowerCase()}` : '';
                      handleDataChange(item.field as keyof FooterSectionType, newUrl);
                    }}
                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                  <Input
                    placeholder="Menu URL"
                    value={item.url}
                    onChange={(e) => handleDataChange(item.field as keyof FooterSectionType, e.target.value)}
                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDataChange(item.field as keyof FooterSectionType, '')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {/* Add new left menu items */}
              {leftMenuItems.length < 3 && (
                <div className="space-y-2">
                  {!currentData?.left_menu_1 && (
                    <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-md">
                      <Input
                        placeholder="Menu Label"
                        onChange={(e) => {
                          const newUrl = e.target.value ? `https://example.com/${e.target.value.toLowerCase()}` : '';
                          handleDataChange('left_menu_1', newUrl);
                        }}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                      <Input
                        placeholder="Menu URL"
                        onChange={(e) => handleDataChange('left_menu_1', e.target.value)}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  )}
                  {!currentData?.left_menu_2 && currentData?.left_menu_1 && (
                    <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-md">
                      <Input
                        placeholder="Menu Label"
                        onChange={(e) => {
                          const newUrl = e.target.value ? `https://example.com/${e.target.value.toLowerCase()}` : '';
                          handleDataChange('left_menu_2', newUrl);
                        }}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                      <Input
                        placeholder="Menu URL"
                        onChange={(e) => handleDataChange('left_menu_2', e.target.value)}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  )}
                  {!currentData?.left_menu_3 && currentData?.left_menu_2 && (
                    <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-md">
                      <Input
                        placeholder="Menu Label"
                        onChange={(e) => {
                          const newUrl = e.target.value ? `https://example.com/${e.target.value.toLowerCase()}` : '';
                          handleDataChange('left_menu_3', newUrl);
                        }}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                      <Input
                        placeholder="Menu URL"
                        onChange={(e) => handleDataChange('left_menu_3', e.target.value)}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Menu Items - Right Side */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Right Side Menu ({rightMenuItems.length}/3)</Label>
              </div>
              
              {rightMenuItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border border-gray-200 rounded-md">
                  <Input
                    placeholder="Menu Label"
                    value={item.label}
                    onChange={(e) => {
                      // Update the label by modifying the URL to include the new label
                      const newUrl = e.target.value ? `https://example.com/${e.target.value.toLowerCase()}` : '';
                      handleDataChange(item.field as keyof FooterSectionType, newUrl);
                    }}
                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                  <Input
                    placeholder="Menu URL"
                    value={item.url}
                    onChange={(e) => handleDataChange(item.field as keyof FooterSectionType, e.target.value)}
                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDataChange(item.field as keyof FooterSectionType, '')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {/* Add new right menu items */}
              {rightMenuItems.length < 3 && (
                <div className="space-y-2">
                  {!currentData?.right_menu_4 && (
                    <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-md">
                      <Input
                        placeholder="Menu Label"
                        onChange={(e) => {
                          const newUrl = e.target.value ? `https://example.com/${e.target.value.toLowerCase()}` : '';
                          handleDataChange('right_menu_4', newUrl);
                        }}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                      <Input
                        placeholder="Menu URL"
                        onChange={(e) => handleDataChange('right_menu_4', e.target.value)}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  )}
                  {!currentData?.right_menu_5 && currentData?.right_menu_4 && (
                    <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-md">
                      <Input
                        placeholder="Menu Label"
                        onChange={(e) => {
                          const newUrl = e.target.value ? `https://example.com/${e.target.value.toLowerCase()}` : '';
                          handleDataChange('right_menu_5', newUrl);
                        }}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                      <Input
                        placeholder="Menu URL"
                        onChange={(e) => handleDataChange('right_menu_5', e.target.value)}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  )}
                  {!currentData?.right_menu_6 && currentData?.right_menu_5 && (
                    <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-md">
                      <Input
                        placeholder="Menu Label"
                        onChange={(e) => {
                          const newUrl = e.target.value ? `https://example.com/${e.target.value.toLowerCase()}` : '';
                          handleDataChange('right_menu_6', newUrl);
                        }}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                      <Input
                        placeholder="Menu URL"
                        onChange={(e) => handleDataChange('right_menu_6', e.target.value)}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sticky Footer */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">Sticky Footer</Label>
                <p className="text-xs text-gray-600">Keep footer visible when scrolling</p>
              </div>
              <Switch 
                checked={currentData?.sticky_footer || false} 
                onCheckedChange={(checked) => handleDataChange('sticky_footer', checked)} 
                className="data-[state=checked]:bg-purple-600" 
              />
            </div>

            {currentData?.sticky_footer && (
              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                {/* Sticky Footer Text and Button Label in 1 line */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Sticky Footer Text</Label>
                    <Input
                      value={currentData?.sticky_footer_text || ''}
                      onChange={(e) => handleDataChange('sticky_footer_text', e.target.value)}
                      placeholder="Enter sticky footer text"
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Button Label</Label>
                    <Input
                      value={currentData?.button_label || ''}
                      onChange={(e) => handleDataChange('button_label', e.target.value)}
                      placeholder="e.g., Shop Now"
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                {/* Button Link and Color in 1 line */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Button Link</Label>
                    <Input
                      value={currentData?.button_link || ''}
                      onChange={(e) => handleDataChange('button_link', e.target.value)}
                      placeholder="https://example.com"
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="color"
                        value={currentData?.button_color || '#3832f6'}
                        onChange={(e) => handleDataChange('button_color', e.target.value)}
                        className="w-20 h-10 border-gray-300"
                      />
                      <Input
                        value={currentData?.button_color || '#3832f6'}
                        onChange={(e) => handleDataChange('button_color', e.target.value)}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Information Section */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                  <FileText className="w-3 h-3 text-purple-600" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-purple-900">Footer Benefits</h4>
                  <ul className="text-xs text-purple-800 space-y-1">
                    <li>• Professional appearance and branding</li>
                    <li>• Legal compliance with privacy policy</li>
                    <li>• Enhanced customer support access</li>
                    <li>• Social media engagement opportunities</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default FooterSection;
