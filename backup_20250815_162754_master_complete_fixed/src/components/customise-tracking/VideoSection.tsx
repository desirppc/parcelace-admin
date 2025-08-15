import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const VideoSection = () => {
  const [showVideo, setShowVideo] = useState(false);
  const [h1Text, setH1Text] = useState('');
  const [h2Text, setH2Text] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle>YouTube Video Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Switch checked={showVideo} onCheckedChange={setShowVideo} />
          <Label>Show YouTube Video</Label>
        </div>

        {showVideo && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>H1 Text</Label>
              <Input
                value={h1Text}
                onChange={(e) => setH1Text(e.target.value)}
                placeholder="Enter main heading"
              />
            </div>

            <div className="space-y-2">
              <Label>H2 Text</Label>
              <Input
                value={h2Text}
                onChange={(e) => setH2Text(e.target.value)}
                placeholder="Enter sub heading"
              />
            </div>

            <div className="space-y-2">
              <Label>YouTube Link</Label>
              <Input
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoSection;
