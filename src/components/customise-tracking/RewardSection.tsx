import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const RewardSection = () => {
  const [showRewards, setShowRewards] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [termsConditions, setTermsConditions] = useState('');
  const [expiryDate, setExpiryDate] = useState<Date>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reward Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Switch checked={showRewards} onCheckedChange={setShowRewards} />
          <Label>Reward Section</Label>
        </div>

        {showRewards && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Enter Promo Code</Label>
              <Input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="SAVE20"
              />
            </div>

            <div className="space-y-2">
              <Label>Enter T&C</Label>
              <Textarea
                value={termsConditions}
                onChange={(e) => setTermsConditions(e.target.value)}
                placeholder="Enter terms and conditions"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Enter Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expiryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDate ? format(expiryDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={expiryDate}
                    onSelect={setExpiryDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RewardSection;
