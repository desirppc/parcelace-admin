import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Upload } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  link: string;
}

const HeaderSection = () => {
  const [showHeader, setShowHeader] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [stickyHeader, setStickyHeader] = useState(false);
  const [stickyHeaderText, setStickyHeaderText] = useState('');
  const [stickyHeaderButtonLabel, setStickyHeaderButtonLabel] = useState('');
  const [stickyHeaderButtonLink, setStickyHeaderButtonLink] = useState('');
  const [stickyHeaderColor, setStickyHeaderColor] = useState('#000000');
  const [supportDisplay, setSupportDisplay] = useState('not');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [logo, setLogo] = useState<File | null>(null);

  const addMenuItem = () => {
    if (menuItems.length < 6) {
      setMenuItems([...menuItems, { id: Date.now().toString(), name: '', link: '' }]);
    }
  };

  const removeMenuItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const updateMenuItem = (id: string, field: 'name' | 'link', value: string) => {
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogo(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Header Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-3">
          <Switch checked={showHeader} onCheckedChange={setShowHeader} />
          <Label>Header Section</Label>
        </div>

        {showHeader && (
          <div className="space-y-6">
            {/* Show Logo */}
            <div className="flex items-center justify-between">
              <Label>Show Logo</Label>
              <Switch checked={showLogo} onCheckedChange={setShowLogo} />
            </div>

            {showLogo && (
              <div className="space-y-2">
                <Label htmlFor="logo-upload">Upload Logo</Label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Logo
                    </label>
                  </Button>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  {logo && <span className="text-sm text-muted-foreground">{logo.name}</span>}
                </div>
              </div>
            )}

            {/* Add Menu */}
            <div className="flex items-center justify-between">
              <Label>Add Menu</Label>
              <Switch checked={showMenu} onCheckedChange={setShowMenu} />
            </div>

            {showMenu && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Menu Items (Max 6)</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addMenuItem}
                    disabled={menuItems.length >= 6}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Menu
                  </Button>
                </div>
                
                {menuItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 p-3 border rounded-md">
                    <Input
                      placeholder="Menu Name"
                      value={item.name}
                      onChange={(e) => updateMenuItem(item.id, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Menu Link"
                      value={item.link}
                      onChange={(e) => updateMenuItem(item.id, 'link', e.target.value)}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeMenuItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Sticky Header */}
            <div className="flex items-center justify-between">
              <Label>Sticky Header</Label>
              <Switch checked={stickyHeader} onCheckedChange={setStickyHeader} />
            </div>

            {stickyHeader && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Sticky Header Text</Label>
                  <Input
                    value={stickyHeaderText}
                    onChange={(e) => setStickyHeaderText(e.target.value)}
                    placeholder="Enter sticky header text"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button Label</Label>
                  <Input
                    value={stickyHeaderButtonLabel}
                    onChange={(e) => setStickyHeaderButtonLabel(e.target.value)}
                    placeholder="Enter button label"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button Link</Label>
                  <Input
                    value={stickyHeaderButtonLink}
                    onChange={(e) => setStickyHeaderButtonLink(e.target.value)}
                    placeholder="Enter button link"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Header Color</Label>
                  <Input
                    type="color"
                    value={stickyHeaderColor}
                    onChange={(e) => setStickyHeaderColor(e.target.value)}
                    className="w-20 h-10"
                  />
                </div>
              </div>
            )}

            {/* Support Contact */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Show Support Email & Phone</Label>
                <Select value={supportDisplay} onValueChange={setSupportDisplay}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header">Header</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                    <SelectItem value="not">Not Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {supportDisplay !== 'not' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Support Email</Label>
                    <Input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      placeholder="support@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Support Phone</Label>
                    <Input
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HeaderSection;
