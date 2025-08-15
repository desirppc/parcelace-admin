import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, Globe, FileImage } from 'lucide-react';

const BrowserInfoSection = () => {
  const [showFavicon, setShowFavicon] = useState(false);
  const [webTitle, setWebTitle] = useState('');
  const [favicon, setFavicon] = useState<File | null>(null);

  const handleFaviconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFavicon(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {/* Web Title */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <Label htmlFor="web-title" className="text-sm font-medium">Page Title</Label>
          </div>
          <Input
            id="web-title"
            value={webTitle}
            onChange={(e) => setWebTitle(e.target.value)}
            placeholder="Enter your tracking page title"
            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
          <p className="text-xs text-muted-foreground">
            This will appear in browser tabs and search results
          </p>
        </div>

        {/* Favicon Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-3">
              <FileImage className="w-5 h-5 text-primary" />
              <div className="space-y-1">
                <Label className="text-sm font-medium">Custom Favicon</Label>
                <p className="text-xs text-muted-foreground">
                  Upload a favicon (recommended: 120x120px)
                </p>
              </div>
            </div>
            <Switch 
              checked={showFavicon} 
              onCheckedChange={setShowFavicon}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {showFavicon && (
            <div className="space-y-3 pl-4 border-l-2 border-primary/20">
              <Label className="text-sm font-medium">Upload Favicon</Label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" asChild className="gap-2">
                  <label htmlFor="favicon-upload" className="cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Choose File
                  </label>
                </Button>
                <input
                  id="favicon-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFaviconUpload}
                  className="hidden"
                />
                {favicon && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                    <FileImage className="w-3 h-3 text-primary" />
                    <span className="text-xs font-medium text-primary">{favicon.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowserInfoSection;
