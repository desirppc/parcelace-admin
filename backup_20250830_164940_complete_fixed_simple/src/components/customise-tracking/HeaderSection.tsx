import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Layout, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { HeaderSection as HeaderSectionType } from '@/services/trackingCustomizationService';

interface HeaderSectionProps {
  data?: HeaderSectionType[];
  onDataChange?: (data: HeaderSectionType[]) => void;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({ data, onDataChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localData, setLocalData] = useState<HeaderSectionType[]>([
    {
      show_logo: true,
      sticky_header: true,
      sticky_header_text: "Enter sticky header text",
      button_label: "Shop Now",
      button_link: "https://example.com",
      button_color: "#3832f6",
      show_support_email_phone: true,
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

  const handleDataChange = (field: keyof HeaderSectionType, value: any) => {
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
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Layout className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Configure logo, menu, sticky header and support contact information</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Header Configuration</span>
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-6 pt-4">
          <div className="grid gap-6">
            {/* Show Logo */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Show Header Logo</Label>
                  <p className="text-xs text-gray-600">Display logo in the header section</p>
                </div>
              </div>
              <Switch 
                checked={currentData?.show_logo || false} 
                onCheckedChange={(checked) => handleDataChange('show_logo', checked)} 
                className="data-[state=checked]:bg-green-600" 
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
                      handleDataChange(item.field as keyof HeaderSectionType, newUrl);
                    }}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Input
                    placeholder="Menu URL"
                    value={item.url}
                    onChange={(e) => handleDataChange(item.field as keyof HeaderSectionType, e.target.value)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDataChange(item.field as keyof HeaderSectionType, '')}
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
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <Input
                        placeholder="Menu URL"
                        onChange={(e) => handleDataChange('left_menu_1', e.target.value)}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <Input
                        placeholder="Menu URL"
                        onChange={(e) => handleDataChange('left_menu_2', e.target.value)}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <Input
                        placeholder="Menu URL"
                        onChange={(e) => handleDataChange('left_menu_3', e.target.value)}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                      handleDataChange(item.field as keyof HeaderSectionType, newUrl);
                    }}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Input
                    placeholder="Menu URL"
                    value={item.url}
                    onChange={(e) => handleDataChange(item.field as keyof HeaderSectionType, e.target.value)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDataChange(item.field as keyof HeaderSectionType, '')}
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
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <Input
                        placeholder="Menu URL"
                        onChange={(e) => handleDataChange('right_menu_4', e.target.value)}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <Input
                        placeholder="Menu URL"
                        onChange={(e) => handleDataChange('right_menu_5', e.target.value)}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <Input
                        placeholder="Menu URL"
                        onChange={(e) => handleDataChange('right_menu_6', e.target.value)}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
              )}
                </div>
              )}
            </div>

            {/* Sticky Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">Sticky Header</Label>
                <p className="text-xs text-gray-600">Keep header visible when scrolling</p>
              </div>
              <Switch 
                checked={currentData?.sticky_header || false} 
                onCheckedChange={(checked) => handleDataChange('sticky_header', checked)} 
                className="data-[state=checked]:bg-green-600" 
              />
            </div>

            {currentData?.sticky_header && (
              <div className="space-y-4 pl-4 border-l-2 border-green-200">
                {/* Sticky Header Text and Button Label in 1 line */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Sticky Header Text</Label>
                    <Input
                      value={currentData?.sticky_header_text || ''}
                      onChange={(e) => handleDataChange('sticky_header_text', e.target.value)}
                      placeholder="Enter sticky header text"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Button Label</Label>
                    <Input
                      value={currentData?.button_label || ''}
                      onChange={(e) => handleDataChange('button_label', e.target.value)}
                      placeholder="e.g., Shop Now"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Support Contact */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Show Support Email & Phone</Label>
                  <p className="text-xs text-gray-600">Display support contact information in the header</p>
                </div>
              </div>
              <Switch 
                checked={currentData?.show_support_email_phone || false} 
                onCheckedChange={(checked) => handleDataChange('show_support_email_phone', checked)} 
                className="data-[state=checked]:bg-green-600" 
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default HeaderSection;
