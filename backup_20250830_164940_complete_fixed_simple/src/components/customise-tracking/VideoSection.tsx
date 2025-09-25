import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Plus, Trash2, ExternalLink, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VideoContent, Video } from '@/services/trackingCustomizationService';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface VideoSectionProps {
  data?: VideoContent[];
  onDataChange?: (data: VideoContent[]) => void;
}

const VideoSection: React.FC<VideoSectionProps> = ({ data, onDataChange }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [localData, setLocalData] = useState<VideoContent[]>([
    {
      show_video: false,
      videos: []
    }
  ]);

  // Initialize with props data or default values
  useEffect(() => {
    if (data && data.length > 0) {
      setLocalData(data);
    }
  }, [data]);

  const handleDataChange = (field: keyof VideoContent, value: any) => {
    const updatedData = localData.map((item, index) => 
      index === 0 ? { ...item, [field]: value } : item
    );
    setLocalData(updatedData);
    
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  const addVideo = () => {
    const currentVideos = localData[0]?.videos || [];
    if (currentVideos.length < 5) {
      const newVideo: Video = {
        id: Date.now().toString(),
        youtube_url: '',
        title: '',
        description: '',
        is_active: true
      };
      const updatedVideos = [...currentVideos, newVideo];
      handleDataChange('videos', updatedVideos);
    }
  };

  const removeVideo = (videoId: string) => {
    const currentVideos = localData[0]?.videos || [];
    const updatedVideos = currentVideos.filter(video => video.id !== videoId);
    handleDataChange('videos', updatedVideos);
  };

  const updateVideo = (videoId: string, field: keyof Video, value: any) => {
    const currentVideos = localData[0]?.videos || [];
    const updatedVideos = currentVideos.map(video =>
      video.id === videoId ? { ...video, [field]: value } : video
    );
    handleDataChange('videos', updatedVideos);
  };

  const toggleVideoStatus = (videoId: string) => {
    const currentVideos = localData[0]?.videos || [];
    const updatedVideos = currentVideos.map(video =>
      video.id === videoId ? { ...video, is_active: !video.is_active } : video
    );
    handleDataChange('videos', updatedVideos);
  };

  const extractVideoId = (url: string): string => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  };

  const getThumbnailUrl = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const currentData = localData[0];

  return (
    <div className="space-y-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Play className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Embed YouTube videos to engage customers with rich content</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Show Videos</span>
            <Switch 
              checked={currentData?.show_video || false} 
              onCheckedChange={(checked) => handleDataChange('show_video', checked)} 
              className="data-[state=checked]:bg-blue-600" 
            />
            <ChevronDown className={`w-5 h-5 text-blue-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-6 pt-4">

      {currentData?.show_video && (
        <div className="space-y-6">
          {/* Videos List */}
          <div className="space-y-4">
            {currentData.videos.map((video, index) => {
              const videoId = extractVideoId(video.youtube_url);
              const thumbnailUrl = videoId ? getThumbnailUrl(videoId) : '';
              
              return (
                <Card key={video.id} className="border-2 border-gray-100 hover:border-blue-200 transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Video Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Video {index + 1}</h4>
                            <p className="text-sm text-gray-500">Configure your video details</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={video.is_active ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => toggleVideoStatus(video.id)}
                          >
                            {video.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeVideo(video.id)}
                            className="text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Video Details Form */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Video Title</Label>
                          <Input
                            value={video.title}
                            onChange={(e) => updateVideo(video.id, 'title', e.target.value)}
                            placeholder="Enter video title"
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">YouTube URL</Label>
                          <Input
                            value={video.youtube_url}
                            onChange={(e) => updateVideo(video.id, 'youtube_url', e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Description</Label>
                        <Input
                          value={video.description}
                          onChange={(e) => updateVideo(video.id, 'description', e.target.value)}
                          placeholder="Enter video description"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      {/* Video Preview */}
                      {videoId && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Video Preview</Label>
                          <div className="relative">
                            <img
                              src={thumbnailUrl}
                              alt="Video thumbnail"
                              className="w-full h-48 object-cover rounded-lg border border-gray-200"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                                <Play className="w-8 h-8 text-white ml-1" />
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                              onClick={() => window.open(video.youtube_url, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Watch
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Video URL Validation */}
                      {video.youtube_url && !videoId && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            ⚠️ Please enter a valid YouTube URL to see the video preview
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Add Video Button */}
          <div className="text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={addVideo}
              disabled={(currentData?.videos?.length || 0) >= 5}
              className="border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Video {(currentData?.videos?.length || 0) > 0 && `(${currentData.videos.length}/5)`}
            </Button>
            {(currentData?.videos?.length || 0) >= 5 && (
              <p className="text-sm text-gray-500 mt-2">Maximum 5 videos allowed</p>
            )}
          </div>

          {/* Information Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <Play className="w-3 h-3 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-blue-900">Video Content Benefits</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Increase customer engagement with rich media</li>
                  <li>• Showcase product demonstrations and tutorials</li>
                  <li>• Build trust through educational content</li>
                  <li>• Improve tracking page dwell time</li>
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

export default VideoSection;
