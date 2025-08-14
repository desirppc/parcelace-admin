
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CategoryMapping } from '@/types/support';

interface CategorySelectorProps {
  category: string;
  subcategory: string;
  onCategoryChange: (category: string) => void;
  onSubCategoryChange: (subcategory: string) => void;
  disabled?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  category,
  subcategory,
  onCategoryChange,
  onSubCategoryChange,
  disabled = false
}) => {

  const categories: CategoryMapping = {
    "Pickup & Delivery Related": [
      "Delay in Pickup",
      "Delay in Delivery", 
      "Delay in RTO"
    ],
    "Shipment NDR and RTO": [
      "Fake NDR Remarks",
      "DTO Not Received",
      "Fake POD"
    ],
    "Finance": [
      "Delay in COD Remittance",
      "Close account - transfer wallet balance to bank",
      "Unable to Recharge"
    ],
    "Billing Remittance": [
      "COD Settlement Issues",
      "Invoice Discrepancies", 
      "Payment Gateway Problems"
    ],
    "Technical Support": [
      "API Integration Issues",
      "Platform Access Problems",
      "Feature Requests"
    ],
    "Claims": [
      "Damage Claims",
      "Lost Package Claims",
      "Insurance Claims"
    ],
    "Billing & Taxation": [
      "GST Issues",
      "Invoice Corrections",
      "Tax Compliance"
    ]
  };

  const handleCategoryChange = (newCategory: string) => {
    onCategoryChange(newCategory);
    onSubCategoryChange(''); // Reset sub-category when category changes
  };

  return (
    <div className="space-y-6">
      {/* Category and Sub-Category Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Selection */}
        <div className="relative">
          <Label htmlFor="category" className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 block">
            Category *
          </Label>
          <Select value={category} onValueChange={handleCategoryChange} disabled={disabled}>
            <SelectTrigger className="border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 shadow-sm hover:shadow-md focus:shadow-lg focus:shadow-purple-100 dark:focus:shadow-purple-900/20 rounded-lg h-12">
              <SelectValue placeholder="Select a category" className="text-gray-600 dark:text-gray-300" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-800 shadow-xl rounded-lg">
              {Object.keys(categories).map((cat) => (
                <SelectItem key={cat} value={cat} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 focus:bg-gradient-to-r focus:from-purple-100 focus:to-blue-100 dark:focus:from-purple-800/40 dark:focus:to-blue-800/40 transition-all duration-200 cursor-pointer">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sub-Category Selection */}
        <div className="relative">
          <Label htmlFor="sub-category" className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 block">
            Sub-Category *
          </Label>
          <Select value={subcategory} onValueChange={onSubCategoryChange} disabled={disabled || !category}>
            <SelectTrigger className="border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 shadow-sm hover:shadow-md focus:shadow-lg focus:shadow-purple-100 dark:focus:shadow-purple-900/20 rounded-lg h-12 disabled:opacity-60 disabled:cursor-not-allowed">
              <SelectValue placeholder={category ? "Select a sub-category" : "Select category first"} className="text-gray-600 dark:text-gray-300" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-800 shadow-xl rounded-lg">
              {categories[category]?.map((subCat) => (
                <SelectItem key={subCat} value={subCat} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 focus:bg-gradient-to-r focus:from-purple-100 focus:to-blue-100 dark:focus:from-purple-800/40 dark:focus:to-blue-800/40 transition-all duration-200 cursor-pointer">
                  {subCat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default CategorySelector;
