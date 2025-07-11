
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CategoryMapping, KeywordMapping } from '@/types/support';

interface CategorySelectorProps {
  category: string;
  subCategory: string;
  onCategoryChange: (category: string) => void;
  onSubCategoryChange: (subCategory: string) => void;
  disabled?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  category,
  subCategory,
  onCategoryChange,
  onSubCategoryChange,
  disabled = false
}) => {
  const [searchText, setSearchText] = useState('');
  const [isAutoDetected, setIsAutoDetected] = useState(false);

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

  const keywordMappings: KeywordMapping = {
    "pickup not happening": { category: "Pickup & Delivery Related", subCategory: "Delay in Pickup" },
    "pickup delay": { category: "Pickup & Delivery Related", subCategory: "Delay in Pickup" },
    "delay pickup": { category: "Pickup & Delivery Related", subCategory: "Delay in Pickup" },
    "delivery delay": { category: "Pickup & Delivery Related", subCategory: "Delay in Delivery" },
    "delay delivery": { category: "Pickup & Delivery Related", subCategory: "Delay in Delivery" },
    "delivery pending": { category: "Pickup & Delivery Related", subCategory: "Delay in Delivery" },
    "rto delay": { category: "Pickup & Delivery Related", subCategory: "Delay in RTO" },
    "fake ndr": { category: "Shipment NDR and RTO", subCategory: "Fake NDR Remarks" },
    "false ndr": { category: "Shipment NDR and RTO", subCategory: "Fake NDR Remarks" },
    "cod not received": { category: "Finance", subCategory: "Delay in COD Remittance" },
    "cod delay": { category: "Finance", subCategory: "Delay in COD Remittance" },
    "payment delay": { category: "Finance", subCategory: "Delay in COD Remittance" },
    "recharge issue": { category: "Finance", subCategory: "Unable to Recharge" },
    "unable to recharge": { category: "Finance", subCategory: "Unable to Recharge" },
    "wallet issue": { category: "Finance", subCategory: "Close account - transfer wallet balance to bank" },
    "close account": { category: "Finance", subCategory: "Close account - transfer wallet balance to bank" },
    "damaged package": { category: "Claims", subCategory: "Damage Claims" },
    "package damaged": { category: "Claims", subCategory: "Damage Claims" },
    "lost package": { category: "Claims", subCategory: "Lost Package Claims" },
    "package lost": { category: "Claims", subCategory: "Lost Package Claims" },
    "api issue": { category: "Technical Support", subCategory: "API Integration Issues" },
    "api problem": { category: "Technical Support", subCategory: "API Integration Issues" },
    "login issue": { category: "Technical Support", subCategory: "Platform Access Problems" },
    "access problem": { category: "Technical Support", subCategory: "Platform Access Problems" },
    "invoice wrong": { category: "Billing Remittance", subCategory: "Invoice Discrepancies" },
    "billing issue": { category: "Billing Remittance", subCategory: "Invoice Discrepancies" },
    "gst problem": { category: "Billing & Taxation", subCategory: "GST Issues" },
    "tax issue": { category: "Billing & Taxation", subCategory: "GST Issues" }
  };

  useEffect(() => {
    if (searchText.trim().length > 3) {
      const lowerSearchText = searchText.toLowerCase();
      
      // Find matching keywords
      const matchedKeyword = Object.keys(keywordMappings).find(keyword => 
        lowerSearchText.includes(keyword.toLowerCase())
      );

      if (matchedKeyword) {
        const mapping = keywordMappings[matchedKeyword];
        onCategoryChange(mapping.category);
        onSubCategoryChange(mapping.subCategory);
        setIsAutoDetected(true);
      }
    }
  }, [searchText, onCategoryChange, onSubCategoryChange]);

  const handleCategoryChange = (newCategory: string) => {
    onCategoryChange(newCategory);
    onSubCategoryChange(''); // Reset sub-category when category changes
    setIsAutoDetected(false);
  };

  return (
    <div className="space-y-4">
      {/* Smart Search Input */}
      <div>
        <Label htmlFor="issue-description" className="text-sm font-medium text-foreground">
          Describe your issue (optional - for smart detection)
        </Label>
        <Input
          id="issue-description"
          placeholder="e.g., pickup not happening, delivery delay, cod not received..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="mt-1 border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
          disabled={disabled}
        />
        {isAutoDetected && (
          <div className="mt-2">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              Auto-detected category
            </Badge>
          </div>
        )}
      </div>

      {/* Category Selection */}
      <div>
        <Label htmlFor="category" className="text-sm font-medium text-foreground">
          Category *
        </Label>
        <Select value={category} onValueChange={handleCategoryChange} disabled={disabled}>
          <SelectTrigger className="mt-1 border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(categories).map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sub-Category Selection */}
      {category && (
        <div>
          <Label htmlFor="sub-category" className="text-sm font-medium text-foreground">
            Sub-Category *
          </Label>
          <Select value={subCategory} onValueChange={onSubCategoryChange} disabled={disabled}>
            <SelectTrigger className="mt-1 border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600">
              <SelectValue placeholder="Select a sub-category" />
            </SelectTrigger>
            <SelectContent>
              {categories[category]?.map((subCat) => (
                <SelectItem key={subCat} value={subCat}>
                  {subCat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
