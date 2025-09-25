import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Star, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { NPSSection as NPSSectionType } from '@/services/trackingCustomizationService';

interface NPSSectionProps {
  data?: NPSSectionType[];
  onDataChange?: (data: NPSSectionType[]) => void;
}

const NPSSection: React.FC<NPSSectionProps> = ({ data, onDataChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localData, setLocalData] = useState<NPSSectionType[]>([
    {
      show_nps_section: true,
      show_delivery_feedback_section: true
    }
  ]);

  // Initialize with props data or default values
  useEffect(() => {
    if (data && data.length > 0) {
      setLocalData(data);
    }
  }, [data]);

  const handleDataChange = (field: keyof NPSSectionType, value: boolean) => {
    const updatedData = localData.map((item, index) => 
      index === 0 ? { ...item, [field]: value } : item
    );
    setLocalData(updatedData);
    
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  const currentData = localData[0];

  return (
    <div className="space-y-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Configure NPS surveys and delivery feedback collection</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">NPS Configuration</span>
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-6 pt-4">
          <div className="grid gap-6">
            {/* NPS Section Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Show NPS Section</Label>
                  <p className="text-xs text-gray-600">Display Net Promoter Score survey to customers</p>
                </div>
              </div>
              <Switch 
                checked={currentData?.show_nps_section || false} 
                onCheckedChange={(checked) => handleDataChange('show_nps_section', checked)} 
                className="data-[state=checked]:bg-orange-600" 
              />
            </div>

            {/* Delivery Feedback Section Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Show Delivery Feedback Section</Label>
                  <p className="text-xs text-gray-600">Collect delivery experience ratings from customers</p>
                </div>
              </div>
              <Switch 
                checked={currentData?.show_delivery_feedback_section || false} 
                onCheckedChange={(checked) => handleDataChange('show_delivery_feedback_section', checked)} 
                className="data-[state=checked]:bg-orange-600" 
              />
            </div>

            {/* Information Section */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <Star className="w-3 h-3 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-blue-900">NPS & Feedback Benefits</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Collect customer satisfaction scores</li>
                    <li>• Identify areas for service improvement</li>
                    <li>• Build customer loyalty through feedback</li>
                    <li>• Track delivery performance metrics</li>
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

export default NPSSection;
