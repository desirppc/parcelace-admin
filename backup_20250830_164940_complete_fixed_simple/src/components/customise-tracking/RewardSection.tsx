import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Gift, Plus, Trash2, Calendar, Percent, IndianRupee, Copy, Share2, ChevronDown, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RewardsPromotions, Reward } from '@/services/trackingCustomizationService';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface RewardSectionProps {
  data?: RewardsPromotions[];
  onDataChange?: (data: RewardsPromotions[]) => void;
}

const RewardSection: React.FC<RewardSectionProps> = ({ data, onDataChange }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [localData, setLocalData] = useState<RewardsPromotions[]>([
    {
      offers: []
    }
  ]);

  // Initialize with props data or default values
  useEffect(() => {
    if (data && data.length > 0) {
      setLocalData(data);
    }
  }, [data]);

  const handleDataChange = (field: keyof RewardsPromotions, value: any) => {
    const updatedData = localData.map((item, index) => 
      index === 0 ? { ...item, [field]: value } : item
    );
    setLocalData(updatedData);
    
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  const addReward = () => {
    const currentOffers = localData[0]?.offers || [];
    if (currentOffers.length < 1) { // Only 1 reward allowed as per user request
      const newReward: Reward = {
        id: Date.now().toString(),
        promo_code: 'PARCEL20',
        expiry_date: '2024-12-31',
        popup_title: '🎉 Congratulations!',
        popup_subtitle: "You've unlocked an exclusive promo code",
        minimum_order_value: 499,
        maximum_discount_value: 200,
        conditions_1: 'Promo code can only be used once per customer',
        conditions_2: 'This promo code cannot be used with other discounts',
        conditions_3: 'Promo code applies to specific product categories',
        conditions_4: 'Additional terms and conditions apply',
        is_active: true
      };
      const updatedOffers = [...currentOffers, newReward];
      handleDataChange('offers', updatedOffers);
    }
  };

  const removeReward = (rewardId: string) => {
    const currentOffers = localData[0]?.offers || [];
    const updatedOffers = currentOffers.filter(reward => reward.id !== rewardId);
    handleDataChange('offers', updatedOffers);
  };

  const updateReward = (rewardId: string, field: keyof Reward, value: any) => {
    const currentOffers = localData[0]?.offers || [];
    const updatedOffers = currentOffers.map(reward =>
      reward.id === rewardId ? { ...reward, [field]: value } : reward
    );
    handleDataChange('offers', updatedOffers);
  };

  const toggleRewardStatus = (rewardId: string) => {
    const currentOffers = localData[0]?.offers || [];
    const updatedOffers = currentOffers.map(reward =>
      reward.id === rewardId ? { ...reward, is_active: !reward.is_active } : reward
    );
    handleDataChange('offers', updatedOffers);
  };

  const generateDiscountCode = (rewardId: string) => {
    const code = 'PARCEL' + Math.random().toString(36).substr(2, 3).toUpperCase();
    updateReward(rewardId, 'promo_code', code);
    
    toast({
      title: "Promo Code Generated",
      description: "A new promo code has been generated successfully",
    });
  };

  const addCondition = (rewardId: string) => {
    const currentOffers = localData[0]?.offers || [];
    const updatedOffers = currentOffers.map(reward =>
      reward.id === rewardId ? { ...reward, conditions_4: 'Additional terms and conditions apply' } : reward
    );
    handleDataChange('offers', updatedOffers);
  };

  const removeCondition = (rewardId: string, conditionKey: keyof Reward) => {
    const currentOffers = localData[0]?.offers || [];
    const updatedOffers = currentOffers.map(reward =>
      reward.id === rewardId ? { ...reward, [conditionKey]: '' } : reward
    );
    handleDataChange('offers', updatedOffers);
  };

  const getConditionsCount = (reward: Reward) => {
    let count = 0;
    if (reward.conditions_1) count++;
    if (reward.conditions_2) count++;
    if (reward.conditions_3) count++;
    if (reward.conditions_4) count++;
    return count;
  };

  const currentData = localData[0];
  const currentReward = currentData?.offers?.[0];

  return (
    <div className="space-y-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Gift className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Create promo codes and special offers to increase customer retention</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Show Offers</span>
            <Switch 
              checked={(currentData?.offers?.length || 0) > 0} 
              onCheckedChange={(checked) => {
                if (checked && !currentData?.offers?.length) {
                  addReward();
                } else if (!checked && currentData?.offers?.length) {
                  handleDataChange('offers', []);
                }
              }} 
              className="data-[state=checked]:bg-green-600" 
            />
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-6 pt-4">
          {(currentData?.offers?.length || 0) > 0 && (
            <div className="space-y-6">
              {/* Single Reward Configuration */}
              {!currentReward ? (
                <div className="text-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={addReward}
                    className="border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 transition-all duration-200"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Promo Code
                  </Button>
                </div>
              ) : (
                <Card className="border-2 border-gray-100 hover:border-green-200 transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Reward Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Gift className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Promo Code Configuration</h4>
                            <p className="text-sm text-gray-500">Configure your exclusive promo code</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={currentReward.is_active ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => toggleRewardStatus(currentReward.id)}
                          >
                            {currentReward.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  <AlertTriangle className="w-5 h-5 text-red-500" />
                                  Delete Promo Code
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete your promo code "{currentReward.discount_code}" and all its configurations.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => removeReward(currentReward.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Promo Code
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                       {/* Section 1: Congratulations Popup */}
                       <div className="space-y-4">
                         <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                           <h4 className="text-sm font-semibold text-gray-900">Section 1 - Congratulations Popup</h4>
                         </div>
                         
                         <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
                           <div className="space-y-1">
                             <Label className="text-sm font-medium text-gray-700">Show Congratulations Popup</Label>
                             <p className="text-xs text-gray-600">Display popup when customers unlock the promo code</p>
                           </div>
                           <Switch 
                             checked={currentReward.show_congratulations_popup} 
                             onCheckedChange={(checked) => updateReward(currentReward.id, 'show_congratulations_popup', checked)} 
                             className="data-[state=checked]:bg-green-600" 
                           />
                         </div>

                         {currentReward.show_congratulations_popup && (
                           <div className="space-y-4 pl-4 border-l-2 border-orange-200">
                             <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                 <Label className="text-sm font-medium text-gray-700">Popup Title</Label>
                                 <Input
                                   value={currentReward.popup_title}
                                   onChange={(e) => updateReward(currentReward.id, 'popup_title', e.target.value)}
                                   placeholder="🎉 Congratulations!"
                                   className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                 />
                               </div>
                               <div className="space-y-2">
                                 <Label className="text-sm font-medium text-gray-700">Popup Subtitle</Label>
                                 <Input
                                   value={currentReward.popup_subtitle}
                                   onChange={(e) => updateReward(currentReward.id, 'popup_subtitle', e.target.value)}
                                   placeholder="You've unlocked an exclusive promo code"
                                   className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                 />
                               </div>
                             </div>
                           </div>
                         )}
                       </div>

                       {/* Section 2: Discount Code */}
                       <div className="space-y-4">
                         <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                           <h4 className="text-sm font-semibold text-gray-900">Section 2 - Discount Code</h4>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                             <Label className="text-sm font-medium text-gray-700">Promo Code</Label>
                             <div className="flex gap-2">
                               <Input
                                 value={currentReward.discount_code}
                                 onChange={(e) => updateReward(currentReward.id, 'discount_code', e.target.value)}
                                 placeholder="PARCEL20"
                                 className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                               />
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => generateDiscountCode(currentReward.id)}
                                 className="whitespace-nowrap"
                               >
                                 Generate
                               </Button>
                             </div>
                           </div>
                           <div className="space-y-2">
                             <Label className="text-sm font-medium text-gray-700">Expiry Date</Label>
                             <Input
                               type="date"
                               value={currentReward.valid_until}
                               onChange={(e) => updateReward(currentReward.id, 'valid_until', e.target.value)}
                               className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                             />
                           </div>
                         </div>
                       </div>

                       {/* Section 3: Terms & Conditions */}
                       <div className="space-y-4">
                         <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                           <h4 className="text-sm font-semibold text-gray-900">Section 3 - Terms & Conditions</h4>
                         </div>
                         
                         <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
                           <div className="space-y-1">
                             <Label className="text-sm font-medium text-gray-700">Show Terms & Conditions</Label>
                             <p className="text-xs text-gray-600">Display terms and conditions in the popup</p>
                           </div>
                           <Switch 
                             checked={currentReward.show_terms_conditions} 
                             onCheckedChange={(checked) => updateReward(currentReward.id, 'show_terms_conditions', checked)} 
                             className="data-[state=checked]:bg-green-600" 
                           />
                         </div>

                         {currentReward.show_terms_conditions && (
                           <div className="space-y-4 pl-4 border-l-2 border-blue-200">
                             {/* Financial Limits */}
                             <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                 <Label className="text-sm font-medium text-gray-700">Minimum Order Value (₹)</Label>
                                 <div className="relative">
                                   <Input
                                     type="number"
                                     value={currentReward.minimum_order_value}
                                     onChange={(e) => updateReward(currentReward.id, 'minimum_order_value', parseFloat(e.target.value) || 0)}
                                     placeholder="499"
                                     min="0"
                                     className="border-gray-300 focus:border-green-500 focus:ring-green-500 pl-8"
                                   />
                                   <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                     <IndianRupee className="w-4 h-4 text-gray-400" />
                                   </div>
                                 </div>
                               </div>
                               <div className="space-y-2">
                                 <Label className="text-sm font-medium text-gray-700">Maximum Discount (₹)</Label>
                                 <div className="relative">
                                   <Input
                                     type="number"
                                     value={currentReward.maximum_discount}
                                     onChange={(e) => updateReward(currentReward.id, 'maximum_discount', parseFloat(e.target.value) || 0)}
                                     placeholder="200"
                                     min="0"
                                     className="border-gray-300 focus:border-green-500 focus:ring-green-500 pl-8"
                                   />
                                   <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                     <IndianRupee className="w-4 h-4 text-gray-400" />
                                   </div>
                                 </div>
                               </div>
                             </div>

                             {/* Conditions List */}
                             <div className="space-y-3">
                               <div className="flex items-center justify-between">
                                 <Label className="text-sm font-medium text-gray-700">Conditions</Label>
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => addCondition(currentReward.id)}
                                   disabled={getConditionsCount(currentReward) >= 4}
                                   className="gap-2"
                                 >
                                   <Plus className="w-4 h-4" />
                                   Add Condition
                                 </Button>
                               </div>
                               
                               {/* Condition 1 */}
                               {currentReward.valid_on_first_order_only && (
                                 <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                                   <Input
                                     value={currentReward.valid_on_first_order_only}
                                     onChange={(e) => updateReward(currentReward.id, 'valid_on_first_order_only', e.target.value)}
                                     placeholder="Condition 1"
                                     className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                   />
                                   <Button
                                     variant="outline"
                                     size="sm"
                                     onClick={() => removeCondition(currentReward.id, 'valid_on_first_order_only')}
                                     className="text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
                                   >
                                     <Trash2 className="w-4 h-4" />
                                   </Button>
                                 </div>
                               )}

                               {/* Condition 2 */}
                               {currentReward.cannot_combine_with_offers && (
                                 <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                                   <Input
                                     value={currentReward.cannot_combine_with_offers}
                                     onChange={(e) => updateReward(currentReward.id, 'cannot_combine_with_offers', e.target.value)}
                                     placeholder="Condition 2"
                                     className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                   />
                                   <Button
                                     variant="outline"
                                     size="sm"
                                     onClick={() => removeCondition(currentReward.id, 'cannot_combine_with_offers')}
                                     className="text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
                                   >
                                     <Trash2 className="w-4 h-4" />
                                   </Button>
                                 </div>
                               )}

                               {/* Condition 3 */}
                               {currentReward.valid_on_selected_products_only && (
                                 <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                                   <Input
                                     value={currentReward.valid_on_selected_products_only}
                                     onChange={(e) => updateReward(currentReward.id, 'valid_on_selected_products_only', e.target.value)}
                                     placeholder="Condition 3"
                                     className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                   />
                                   <Button
                                     variant="outline"
                                     size="sm"
                                     onClick={() => removeCondition(currentReward.id, 'valid_on_selected_products_only')}
                                     className="text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
                                   >
                                     <Trash2 className="w-4 h-4" />
                                   </Button>
                                 </div>
                               )}

                               {/* Condition 4 */}
                               {currentReward.additional_condition && (
                                 <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                                   <Input
                                     value={currentReward.additional_condition}
                                     onChange={(e) => updateReward(currentReward.id, 'additional_condition', e.target.value)}
                                     placeholder="Condition 4"
                                     className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                   />
                                   <Button
                                     variant="outline"
                                     size="sm"
                                     onClick={() => removeCondition(currentReward.id, 'additional_condition')}
                                     className="text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
                                   >
                                     <Trash2 className="w-4 h-4" />
                                   </Button>
                                 </div>
                               )}
                             </div>
                           </div>
                         )}
                       </div>

                       {/* Button Configuration Section */}
                       <div className="space-y-4">
                         <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                           <h4 className="text-sm font-semibold text-gray-900">Button Configuration</h4>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                             <Label className="text-sm font-medium text-gray-700">Copy Button Text</Label>
                             <Input
                               value={currentReward.button_copy_text}
                               onChange={(e) => updateReward(currentReward.id, 'button_copy_text', e.target.value)}
                               placeholder="Copy Promo Code"
                               className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                             />
                           </div>
                           <div className="space-y-2">
                             <Label className="text-sm font-medium text-gray-700">Share Button Text</Label>
                             <Input
                               value={currentReward.button_share_text}
                               onChange={(e) => updateReward(currentReward.id, 'button_share_text', e.target.value)}
                               placeholder="Share with Friends"
                               className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                             />
                           </div>
                         </div>
                       </div>

                      {/* Popup Preview */}
                      {currentReward.show_congratulations_popup && (
                        <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border-2 border-dashed border-orange-300">
                          <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                              <Gift className="w-8 h-8 text-orange-600" />
                            </div>
                            <div>
                              <h5 className="text-lg font-bold text-orange-900">{currentReward.popup_title || '🎉 Congratulations!'}</h5>
                              <p className="text-sm text-orange-700">{currentReward.popup_subtitle || "You've unlocked an exclusive promo code"}</p>
                            </div>
                            
                            {/* Promo Code Display */}
                            <div className="p-4 bg-white rounded-lg border-2 border-dashed border-blue-300">
                              <p className="text-sm text-gray-600 mb-2">Your Promo Code</p>
                              <p className="text-2xl font-bold text-blue-600">{currentReward.discount_code || 'PARCEL20'}</p>
                              <p className="text-xs text-gray-500">Valid until {currentReward.valid_until ? new Date(currentReward.valid_until).toLocaleDateString() : 'December 31, 2024'}</p>
                            </div>

                            {/* Terms & Conditions */}
                            <div className="text-left">
                              <p className="text-sm font-medium text-gray-700 mb-2">Quick Terms & Conditions:</p>
                              <ul className="text-xs text-gray-600 space-y-1">
                                <li>• Minimum order value: ₹{currentReward.minimum_order_value || 499}</li>
                                <li>• Maximum discount: ₹{currentReward.maximum_discount || 200}</li>
                                <li>• {currentReward.valid_on_first_order_only || 'Valid on first order only'}</li>
                                <li>• {currentReward.cannot_combine_with_offers || 'Cannot be combined with other offers'}</li>
                                <li>• {currentReward.valid_on_selected_products_only || 'Valid on selected products only'}</li>
                                <li>• {currentReward.additional_condition || 'Additional terms and conditions apply'}</li>
                              </ul>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 justify-center">
                              <Button className="bg-blue-600 hover:bg-blue-700">
                                <Copy className="w-4 h-4 mr-2" />
                                {currentReward.button_copy_text || 'Copy Promo Code'}
                              </Button>
                              <Button variant="outline" className="border-gray-300">
                                <Share2 className="w-4 h-4 mr-2" />
                                {currentReward.button_share_text || 'Share with Friends'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Information Section */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <Gift className="w-3 h-3 text-green-600" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-green-900">Promo Code Benefits</h4>
                    <ul className="text-xs text-green-800 space-y-1">
                      <li>• Increase customer retention and loyalty</li>
                      <li>• Encourage repeat purchases with exclusive offers</li>
                      <li>• Boost conversion rates on tracking page</li>
                      <li>• Create urgency with time-limited promotions</li>
                      <li>• Professional congratulations popup for better UX</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default RewardSection;
