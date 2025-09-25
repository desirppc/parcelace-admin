import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Image as ImageIcon, Package, Plus, Trash2, Edit3, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProductShowcase, Product } from '@/services/trackingCustomizationService';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ProductSectionProps {
  data?: ProductShowcase[];
  onDataChange?: (data: ProductShowcase[]) => void;
}

const ProductSection: React.FC<ProductSectionProps> = ({ data, onDataChange }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [localData, setLocalData] = useState<ProductShowcase[]>([
    {
      show_products: false,
      products: []
    }
  ]);

  // Initialize with props data or default values
  useEffect(() => {
    if (data && data.length > 0) {
      setLocalData(data);
    }
  }, [data]);

  const handleDataChange = (field: keyof ProductShowcase, value: any) => {
    const updatedData = localData.map((item, index) => 
      index === 0 ? { ...item, [field]: value } : item
    );
    setLocalData(updatedData);
    
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  const addProduct = () => {
    const currentProducts = localData[0]?.products || [];
    if (currentProducts.length < 10) {
      const newProduct: Product = {
        id: Date.now().toString(),
        product_name: '',
        description: '',
        price: 0,
        image_url: '',
        button_text: 'Buy Now',
        button_link: '',
        is_active: true
      };
      const updatedProducts = [...currentProducts, newProduct];
      handleDataChange('products', updatedProducts);
    }
  };

  const removeProduct = (productId: string) => {
    const currentProducts = localData[0]?.products || [];
    const updatedProducts = currentProducts.filter(product => product.id !== productId);
    handleDataChange('products', updatedProducts);
  };

  const updateProduct = (productId: string, field: keyof Product, value: any) => {
    const currentProducts = localData[0]?.products || [];
    const updatedProducts = currentProducts.map(product =>
      product.id === productId ? { ...product, [field]: value } : product
    );
    handleDataChange('products', updatedProducts);
  };

  const toggleProductStatus = (productId: string) => {
    const currentProducts = localData[0]?.products || [];
    const updatedProducts = currentProducts.map(product =>
      product.id === productId ? { ...product, is_active: !product.is_active } : product
    );
    handleDataChange('products', updatedProducts);
  };

  const handleImageUpload = (productId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real implementation, you would upload the file to the server
      // For now, we'll just update the local state
      const fileName = `uploads/products/${file.name}`;
      updateProduct(productId, 'image_url', fileName);
      
      toast({
        title: "Product Image Updated",
        description: "Product image has been updated successfully",
      });
    }
  };

  const currentData = localData[0];

  return (
    <div className="space-y-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Show your products on tracking link to drive additional sales</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Show Products</span>
            <Switch 
              checked={currentData?.show_products || false} 
              onCheckedChange={(checked) => handleDataChange('show_products', checked)} 
              className="data-[state=checked]:bg-orange-600" 
            />
            <ChevronDown className={`w-5 h-5 text-orange-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-6 pt-4">

      {currentData?.show_products && (
        <div className="space-y-6">
          {/* Products List */}
          <div className="space-y-4">
            {currentData.products.map((product, index) => (
              <Card key={product.id} className="border-2 border-gray-100 hover:border-orange-200 transition-all duration-200">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Product Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-orange-600">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Product {index + 1}</h4>
                          <p className="text-sm text-gray-500">Configure your product details</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={product.is_active ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => toggleProductStatus(product.id)}
                        >
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeProduct(product.id)}
                          className="text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Product Details Form */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Product Name</Label>
                        <Input
                          value={product.product_name}
                          onChange={(e) => updateProduct(product.id, 'product_name', e.target.value)}
                          placeholder="Enter product name"
                          className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Price</Label>
                        <Input
                          type="number"
                          value={product.price}
                          onChange={(e) => updateProduct(product.id, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Description</Label>
                      <Input
                        value={product.description}
                        onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                        placeholder="Enter product description"
                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Button Text</Label>
                        <Input
                          value={product.button_text}
                          onChange={(e) => updateProduct(product.id, 'button_text', e.target.value)}
                          placeholder="Buy Now"
                          className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Button Link</Label>
                        <Input
                          value={product.button_link}
                          onChange={(e) => updateProduct(product.id, 'button_link', e.target.value)}
                          placeholder="https://example.com/product"
                          className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    {/* Product Image Upload */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Product Image</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                        {product.image_url ? (
                          <div className="space-y-2">
                            <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto">
                              <ImageIcon className="w-8 h-8 text-orange-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-900">Image uploaded</p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateProduct(product.id, 'image_url', '')}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-600">Upload Image</p>
                            <p className="text-xs text-gray-500">500x500px PNG/JPG file</p>
                            <Button variant="outline" size="sm" asChild>
                              <label htmlFor={`product-image-${product.id}`} className="cursor-pointer">
                                <Upload className="w-4 h-4 mr-2" />
                                Choose Image
                              </label>
                            </Button>
                            <input
                              id={`product-image-${product.id}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(product.id, e)}
                              className="hidden"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add Product Button */}
          <div className="text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={addProduct}
              disabled={(currentData?.products?.length || 0) >= 10}
              className="border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50 transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Product {(currentData?.products?.length || 0) > 0 && `(${currentData.products.length}/10)`}
            </Button>
            {(currentData?.products?.length || 0) >= 10 && (
              <p className="text-sm text-gray-500 mt-2">Maximum 10 products allowed</p>
            )}
          </div>

          {/* Information Section */}
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                <Package className="w-3 h-3 text-orange-600" />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-orange-900">Product Showcase Benefits</h4>
                <ul className="text-xs text-orange-800 space-y-1">
                  <li>• Drive additional sales from tracking page visitors</li>
                  <li>• Showcase your best products to engaged customers</li>
                  <li>• Increase conversion rates with strategic product placement</li>
                  <li>• Cross-sell and upsell opportunities</li>
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

export default ProductSection;
