import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Upload } from 'lucide-react';

interface Product {
  id: string;
  image: File | null;
  name: string;
  price: string;
  salesPrice: string;
  buttonText: string;
  buttonLink: string;
}

const ProductSection = () => {
  const [showProducts, setShowProducts] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const addProduct = () => {
    if (products.length < 6) {
      setProducts([...products, {
        id: Date.now().toString(),
        image: null,
        name: '',
        price: '',
        salesPrice: '',
        buttonText: '',
        buttonLink: ''
      }]);
    }
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const updateProduct = (id: string, field: keyof Product, value: string | File) => {
    setProducts(products.map(product =>
      product.id === id ? { ...product, [field]: value } : product
    ));
  };

  const handleImageUpload = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updateProduct(id, 'image', file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Switch checked={showProducts} onCheckedChange={setShowProducts} />
        <Label>Add Products</Label>
      </div>

      {showProducts && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Products (Max 6)</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={addProduct}
              disabled={products.length >= 6}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          {products.map((product) => (
            <div key={product.id} className="p-4 border rounded-md space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Product {products.indexOf(product) + 1}</h4>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeProduct(product.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Image</Label>
                  <div className="flex items-center gap-2">
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
                    {product.image && (
                      <span className="text-sm text-muted-foreground">{product.image.name}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input
                    value={product.name}
                    onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                    placeholder="Enter product name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Product Price</Label>
                  <Input
                    value={product.price}
                    onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                    placeholder="$99.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sales Price</Label>
                  <Input
                    value={product.salesPrice}
                    onChange={(e) => updateProduct(product.id, 'salesPrice', e.target.value)}
                    placeholder="$79.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input
                    value={product.buttonText}
                    onChange={(e) => updateProduct(product.id, 'buttonText', e.target.value)}
                    placeholder="Buy Now"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Button Link</Label>
                  <Input
                    value={product.buttonLink}
                    onChange={(e) => updateProduct(product.id, 'buttonLink', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductSection;
