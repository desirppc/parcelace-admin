import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Star, MessageSquare } from 'lucide-react';

const NPSSection = () => {
  const [showNPS, setShowNPS] = useState(false);
  const [showDeliveryFeedback, setShowDeliveryFeedback] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-primary" />
            <div className="space-y-1">
              <Label className="text-sm font-medium">NPS Survey</Label>
              <p className="text-xs text-muted-foreground">
                Collect Net Promoter Score from customers
              </p>
            </div>
          </div>
          <Switch 
            checked={showNPS} 
            onCheckedChange={setShowNPS}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-primary" />
            <div className="space-y-1">
              <Label className="text-sm font-medium">Delivery Feedback</Label>
              <p className="text-xs text-muted-foreground">
                Get specific feedback about delivery experience
              </p>
            </div>
          </div>
          <Switch 
            checked={showDeliveryFeedback} 
            onCheckedChange={setShowDeliveryFeedback}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </div>
    </div>
  );
};

export default NPSSection;
