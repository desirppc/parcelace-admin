import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

const BannerSection = () => {
  const [showBanners, setShowBanners] = useState(false);
  const [banner1, setBanner1] = useState<File | null>(null);
  const [banner2, setBanner2] = useState<File | null>(null);
  const [banner3, setBanner3] = useState<File | null>(null);

  const handleBannerUpload = (bannerNumber: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      switch (bannerNumber) {
        case 1:
          setBanner1(file);
          break;
        case 2:
          setBanner2(file);
          break;
        case 3:
          setBanner3(file);
          break;
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Banner Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Switch checked={showBanners} onCheckedChange={setShowBanners} />
          <Label>Banner Section</Label>
        </div>

        {showBanners && (
          <div className="space-y-4">
            {[1, 2, 3].map((bannerNumber) => {
              const banner = bannerNumber === 1 ? banner1 : bannerNumber === 2 ? banner2 : banner3;
              return (
                <div key={bannerNumber} className="space-y-2">
                  <Label>Upload Banner {bannerNumber}</Label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <label htmlFor={`banner-${bannerNumber}`} className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Banner {bannerNumber}
                      </label>
                    </Button>
                    <input
                      id={`banner-${bannerNumber}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleBannerUpload(bannerNumber, e)}
                      className="hidden"
                    />
                    {banner && (
                      <span className="text-sm text-muted-foreground">{banner.name}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BannerSection;
