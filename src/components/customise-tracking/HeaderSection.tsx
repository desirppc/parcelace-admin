import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Layout, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { HeaderSection as HeaderSectionType } from '@/services/trackingCustomizationService';

// Interface for menu items from backend
interface MenuItem {
  [key: string]: string; // e.g., "left_menu_1": "Men", "url": "https://www.google.com/men"
}

// Extended interface to include menu_items
interface HeaderSectionWithMenuItems extends HeaderSectionType {
  menu_items?: MenuItem[];
}

// Local state interface for managing labels separately
interface MenuItemState {
  field: string;
  label: string;
  url: string;
}

interface HeaderSectionProps {
  data?: HeaderSectionWithMenuItems[];
  onDataChange?: (data: HeaderSectionWithMenuItems[]) => void;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({ data, onDataChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localData, setLocalData] = useState<HeaderSectionWithMenuItems[]>([
    {
      show_logo: true,
      sticky_header: true,
      sticky_header_text: "Enter sticky header text",
      button_label: "Shop Now",
      button_link: "https://example.com",
      button_color: "#3832f6",
      show_support_email_phone: true,
      left_menu_1: "",
      left_menu_2: "",
      left_menu_3: "",
      right_menu_4: "",
      right_menu_5: "",
      right_menu_6: "",
      privacy_policy_url: "https://www.google.com/privacy",
      menu_items: []
    }
  ]);

  // Local state for menu items
  const [menuItems, setMenuItems] = useState<MenuItemState[]>([]);

  // Initialize with props data or default values
  useEffect(() => {
    if (data && data.length > 0) {
      setLocalData(data);
      
      // Parse menu_items from backend data
      const currentData = data[0];
      if (currentData?.menu_items && Array.isArray(currentData.menu_items)) {
        const parsedMenuItems: MenuItemState[] = [];
        
        currentData.menu_items.forEach((item: MenuItem) => {
          // Extract field name and label from the object
          const fieldName = Object.keys(item).find(key => key.startsWith('left_menu_') || key.startsWith('right_menu_'));
          const url = item.url;
          
          if (fieldName && url) {
            parsedMenuItems.push({
              field: fieldName,
              label: item[fieldName],
              url: url
            });
          }
        });
        
        setMenuItems(parsedMenuItems);
      }
    }
  }, [data]);

  const handleDataChange = (field: keyof HeaderSectionWithMenuItems, value: any) => {
    const updatedData = localData.map((item, index) => 
      index === 0 ? { ...item, [field]: value } : item
    );
    setLocalData(updatedData);
    
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  const handleMenuChange = (index: number, field: 'label' | 'url', value: string) => {
    const updatedMenuItems = [...menuItems];
    updatedMenuItems[index] = { ...updatedMenuItems[index], [field]: value };
    setMenuItems(updatedMenuItems);
    
    // Update the localData with menu_items format
    const menuItemsForBackend = updatedMenuItems.map(item => ({
      [item.field]: item.label,
      url: item.url
    }));
    
    const updatedData = localData.map((item, idx) => 
      idx === 0 ? { ...item, menu_items: menuItemsForBackend } : item
    );
    setLocalData(updatedData);
    
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  const addMenuItem = (field: string) => {
    const newMenuItem: MenuItemState = {
      field: field,
      label: '',
      url: ''
    };
    
    const updatedMenuItems = [...menuItems, newMenuItem];
    setMenuItems(updatedMenuItems);
    
    // Update the localData with menu_items format
    const menuItemsForBackend = updatedMenuItems.map(item => ({
      [item.field]: item.label,
      url: item.url
    }));
    
    const updatedData = localData.map((item, idx) => 
      idx === 0 ? { ...item, menu_items: menuItemsForBackend } : item
    );
    setLocalData(updatedData);
    
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  const removeMenuItem = (index: number) => {
    const updatedMenuItems = menuItems.filter((_, idx) => idx !== index);
    setMenuItems(updatedMenuItems);
    
    // Update the localData with menu_items format
    const menuItemsForBackend = updatedMenuItems.map(item => ({
      [item.field]: item.label,
      url: item.url
    }));
    
    const updatedData = localData.map((item, idx) => 
      idx === 0 ? { ...item, menu_items: menuItemsForBackend } : item
    );
    setLocalData(updatedData);
    
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  const currentData = localData[0];

  // Helper function to get left menu items
  const getLeftMenuItems = (): MenuItemState[] => {
    return menuItems.filter(item => item.field.startsWith('left_menu_'));
  };

  // Helper function to get right menu items
  const getRightMenuItems = (): MenuItemState[] => {
    return menuItems.filter(item => item.field.startsWith('right_menu_'));
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
                {leftMenuItems.length < 3 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const nextField = `left_menu_${leftMenuItems.length + 1}`;
                      addMenuItem(nextField);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Menu Item
                  </Button>
                )}
              </div>
              
              {leftMenuItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border border-gray-200 rounded-md">
                  <Input
                    placeholder="Menu Label"
                    value={item.label}
                    onChange={(e) => handleMenuChange(index, 'label', e.target.value)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Input
                    placeholder="Menu URL"
                    value={item.url}
                    onChange={(e) => handleMenuChange(index, 'url', e.target.value)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeMenuItem(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Menu Items - Right Side */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Right Side Menu ({rightMenuItems.length}/3)</Label>
                {rightMenuItems.length < 3 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const nextField = `right_menu_${rightMenuItems.length + 4}`;
                      addMenuItem(nextField);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Menu Item
                  </Button>
                )}
              </div>
              
              {rightMenuItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border border-gray-200 rounded-md">
                  <Input
                    placeholder="Menu Label"
                    value={item.label}
                    onChange={(e) => handleMenuChange(index, 'label', e.target.value)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Input
                    placeholder="Menu URL"
                    value={item.url}
                    onChange={(e) => handleMenuChange(index, 'url', e.target.value)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeMenuItem(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
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
