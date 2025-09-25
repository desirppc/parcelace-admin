import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import pincodeData from '@/data/pincode-city-state.json';

export interface WarehouseFormValues {
  warehouse_name: string;
  first_name: string;
  last_name: string;
  address: string;
  mobile_number: string;
  whatsapp_number?: string;
  alternative_mobile_number?: string;
  pincode: string;
  city: string;
  state: string;
}

interface WarehouseFormProps {
  initialValues?: WarehouseFormValues;
  onSubmit: (values: WarehouseFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
  loading?: boolean;
}

const defaultValues: WarehouseFormValues = {
  warehouse_name: '',
  first_name: '',
  last_name: '',
  address: '',
  mobile_number: '',
  whatsapp_number: '',
  alternative_mobile_number: '',
  pincode: '',
  city: '',
  state: '',
};

const WarehouseForm: React.FC<WarehouseFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  loading = false,
}) => {
  const [values, setValues] = useState<WarehouseFormValues>(initialValues || defaultValues);

  useEffect(() => {
    setValues(initialValues || defaultValues);
  }, [initialValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle mobile number validation - only allow numbers
    if (name === 'mobile_number') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setValues((prev) => ({ 
        ...prev, 
        [name]: numericValue,
        whatsapp_number: numericValue, // Auto-fill WhatsApp number
        alternative_mobile_number: numericValue // Auto-fill alternate number
      }));
    } else if (name === 'pincode') {
      // Handle pincode validation - only allow numbers
      const numericValue = value.replace(/[^0-9]/g, '');
      // Auto-populate city and state if pincode is 6 digits
      if (numericValue.length === 6) {
        // Use local mapping file to find city and state
        const entry = pincodeData[numericValue]; // <-- mapping file usage
        if (entry) {
          setValues((prev) => ({ ...prev, [name]: numericValue, city: entry.city, state: entry.state }));
        } else {
          setValues((prev) => ({ ...prev, [name]: numericValue, city: '', state: '' }));
        }
      } else {
        setValues((prev) => ({ ...prev, [name]: numericValue, city: '', state: '' }));
      }
    } else {
    setValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure WhatsApp and alternate numbers are same as mobile number
    const formData = {
      ...values,
      whatsapp_number: values.mobile_number,
      alternative_mobile_number: values.mobile_number
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Warehouse Name & First Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="warehouse_name">Warehouse Name *</Label>
          <Input
            id="warehouse_name"
            name="warehouse_name"
            value={values.warehouse_name}
            onChange={handleChange}
            placeholder="Enter warehouse name"
            required
          />
        </div>
        <div>
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            name="first_name"
            value={values.first_name}
            onChange={handleChange}
            placeholder="Enter first name"
            required
          />
        </div>
      </div>
      {/* Last Name & Mobile Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            name="last_name"
            value={values.last_name}
            onChange={handleChange}
            placeholder="Enter last name"
            required
          />
        </div>
        <div>
          <Label htmlFor="mobile_number">Mobile Number *</Label>
          <Input
            id="mobile_number"
            name="mobile_number"
            type="tel"
            value={values.mobile_number}
            onChange={handleChange}
            placeholder="Enter mobile number"
            maxLength={10}
            pattern="[0-9]{10}"
            required
          />
        </div>
      </div>
      {/* Address */}
      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          name="address"
          value={values.address}
          onChange={handleChange}
          placeholder="Enter complete address"
          rows={2}
          className="resize-none"
        />
      </div>
      {/* Pincode, City, State */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="pincode">Pincode</Label>
          <Input
            id="pincode"
            name="pincode"
            type="text"
            value={values.pincode}
            onChange={handleChange}
            placeholder="Pincode"
            maxLength={6}
            pattern="[0-9]{6}"
          />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            value={values.city}
            onChange={handleChange}
            placeholder="City"
          />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            name="state"
            value={values.state}
            onChange={handleChange}
            placeholder="State"
          />
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:from-pink-600 hover:via-purple-600 hover:to-blue-700 text-white border-0 shadow-md"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default WarehouseForm; 