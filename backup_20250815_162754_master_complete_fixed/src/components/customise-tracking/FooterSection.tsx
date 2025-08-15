import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const FooterSection = () => {
  const [showFooter, setShowFooter] = useState(false);
  const [showSocialMedia, setShowSocialMedia] = useState(false);
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [stickyFooter, setStickyFooter] = useState(false);
  const [stickyFooterText, setStickyFooterText] = useState('');
  const [stickyFooterButtonLabel, setStickyFooterButtonLabel] = useState('');
  const [stickyFooterButtonLink, setStickyFooterButtonLink] = useState('');
  const [stickyFooterColor, setStickyFooterColor] = useState('#000000');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Footer Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Switch checked={showFooter} onCheckedChange={setShowFooter} />
          <Label>Footer Section</Label>
        </div>

        {showFooter && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Show Social Media Icons</Label>
              <Switch checked={showSocialMedia} onCheckedChange={setShowSocialMedia} />
            </div>

            <div className="space-y-2">
              <Label>Privacy Policy</Label>
              <Input
                value={privacyPolicy}
                onChange={(e) => setPrivacyPolicy(e.target.value)}
                placeholder="Enter privacy policy URL or text"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Sticky Footer</Label>
              <Switch checked={stickyFooter} onCheckedChange={setStickyFooter} />
            </div>

            {stickyFooter && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Sticky Footer Text</Label>
                  <Input
                    value={stickyFooterText}
                    onChange={(e) => setStickyFooterText(e.target.value)}
                    placeholder="Enter sticky footer text"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sticky Footer Button Label</Label>
                  <Input
                    value={stickyFooterButtonLabel}
                    onChange={(e) => setStickyFooterButtonLabel(e.target.value)}
                    placeholder="Enter button label"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sticky Footer Button Link</Label>
                  <Input
                    value={stickyFooterButtonLink}
                    onChange={(e) => setStickyFooterButtonLink(e.target.value)}
                    placeholder="Enter button link"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sticky Footer Color</Label>
                  <Input
                    type="color"
                    value={stickyFooterColor}
                    onChange={(e) => setStickyFooterColor(e.target.value)}
                    className="w-20 h-10"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FooterSection;
