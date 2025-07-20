
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Copy, 
  Share2, 
  CheckCircle, 
  Clock, 
  Package, 
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  ArrowLeft,
  ArrowRight,
  Play,
  Heart,
  ShoppingCart,
  Truck,
  Calendar,
  MapPin,
  MessageCircle,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const TrackingPage = () => {
  const { toast } = useToast();
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [deliveryRating, setDeliveryRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [showSharePopup, setShowSharePopup] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://track.parcelace.com/TRK789123456');
    toast({
      title: "Link copied! ✅",
      description: "Tracking link copied to clipboard",
    });
  };

  const handleShare = () => {
    console.log('Share button clicked');
    setShowSharePopup(true);
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent('Track my order: https://track.parcelace.com/TRK789123456');
    window.open(`https://wa.me/?text=${message}`, '_blank');
    setShowSharePopup(false);
  };

  const handleWhatsAppSupport = () => {
    const message = encodeURIComponent('Hi! I need help with my order tracking.');
    window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
  };

  const handleArrangeReturn = () => {
    toast({
      title: "Return Request",
      description: "Your return request has been initiated",
    });
  };

  const handleNpsSubmit = () => {
    if (npsScore !== null) {
      toast({
        title: "Thank you! 🙏",
        description: "Your feedback helps us improve our service",
      });
    }
  };

  const handleDeliveryRatingSubmit = () => {
    if (deliveryRating !== null) {
      toast({
        title: "Rating submitted! ⭐",
        description: "Thank you for rating your delivery experience",
      });
    }
  };

  const getNpsButtonColor = (score: number) => {
    if (score <= 3) return 'border-red-400 text-red-600 bg-red-50';
    if (score <= 6) return 'border-orange-400 text-orange-600 bg-orange-50';
    if (score <= 8) return 'border-yellow-400 text-yellow-600 bg-yellow-50';
    return 'border-green-400 text-green-600 bg-green-50';
  };

  const getNpsSelectedColor = (score: number) => {
    if (score <= 3) return 'bg-red-500 text-white border-red-500';
    if (score <= 6) return 'bg-orange-500 text-white border-orange-500';
    if (score <= 8) return 'bg-yellow-500 text-white border-yellow-500';
    return 'bg-green-500 text-white border-green-500';
  };

  const getRatingEmoji = (rating: number) => {
    const emojis = ['😞', '😔', '😐', '😊', '😍'];
    return emojis[rating - 1] || '😐';
  };

  const getRatingLabel = (rating: number) => {
    const labels = ['TERRIBLE', 'BAD', 'OKAY', 'GOOD', 'EXCELLENT'];
    return labels[rating - 1] || 'OKAY';
  };

  const getRatingColor = (rating: number) => {
    if (rating === 1) return 'bg-red-100 border-red-200';
    if (rating === 2) return 'bg-orange-100 border-orange-200';
    if (rating === 3) return 'bg-gray-100 border-gray-200';
    if (rating === 4) return 'bg-blue-100 border-blue-200';
    return 'bg-green-100 border-green-200';
  };

  const getRatingSelectedColor = (rating: number) => {
    if (rating === 1) return 'bg-red-500 border-red-500';
    if (rating === 2) return 'bg-orange-500 border-orange-500';
    if (rating === 3) return 'bg-gray-500 border-gray-500';
    if (rating === 4) return 'bg-blue-500 border-blue-500';
    return 'bg-green-500 border-green-500';
  };

  const getTrackingDotColor = (event: any) => {
    if (event.isCompleted) return 'bg-green-500';
    if (event.isActive) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  const hotSellingProducts = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: "₹2,999",
      image: "/placeholder.svg",
    },
    {
      id: 2,
      name: "Smart Fitness Watch",
      price: "₹4,599",
      image: "/placeholder.svg",
    },
    {
      id: 3,
      name: "Bluetooth Speaker",
      price: "₹1,899",
      image: "/placeholder.svg",
    },
    {
      id: 4,
      name: "Phone Case Pro",
      price: "₹799",
      image: "/placeholder.svg",
    },
    {
      id: 5,
      name: "Wireless Charger",
      price: "₹1,299",
      image: "/placeholder.svg",
    },
    {
      id: 6,
      name: "Gaming Mouse",
      price: "₹2,199",
      image: "/placeholder.svg",
    },
    {
      id: 7,
      name: "USB-C Hub",
      price: "₹1,599",
      image: "/placeholder.svg",
    },
  ];

  const instagramFeeds = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
      caption: "New collection drop! 🔥",
      likes: 1234,
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
      caption: "Style meets comfort ✨",
      likes: 987,
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
      caption: "Weekend vibes 💫",
      likes: 2156,
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772",
      caption: "Fresh arrivals 🌟",
      likes: 876,
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a",
      caption: "Perfect fit guaranteed 💯",
      likes: 1543,
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43",
      caption: "Trending now 📈",
      likes: 2087,
    },
  ];

  const mockOrder = {
    tracking: [
      {
        status: "Yet to Pickup",
        description: "Package details changed by Delhivery",
        location: "Ramtek_ShivajiWard_D (Maharashtra)",
        timestamp: "2025-07-02T21:12:20Z",
        isCompleted: false,
        isActive: false,
      },
      {
        status: "Pickup scheduled",
        description: "Package is scheduled for pickup",
        location: "Alwar_TuleraRoad_D (Rajasthan)",
        timestamp: "2025-07-12T21:12:30Z",
        isCompleted: false,
        isActive: false,
      },
      {
        status: "Out for pickup",
        description: "Package is out for pickup",
        location: "Alwar_TuleraRoad_D (Rajasthan)",
        timestamp: "2025-07-13T08:48:25Z",
        isCompleted: true,
        isActive: false,
      },
      {
        status: "In Transit",
        description: "Package is on the way to destination",
        location: "Gurgaon_PalamVihar_C (Haryana)",
        timestamp: "2025-07-18T16:32:17Z",
        isCompleted: false,
        isActive: true,
      },
      {
        status: "Out for Delivery",
        description: "Package will be delivered today",
        location: "Delhi_Central (Delhi)",
        timestamp: null,
        isCompleted: false,
        isActive: false,
      },
      {
        status: "Delivered",
        description: "Package delivered successfully",
        location: "Delhi_Central (Delhi)",
        timestamp: null,
        isCompleted: false,
        isActive: false,
      },
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
      {/* Top Promo Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-medium">
            Get 20% off on all footwear products{' '}
            <span className="underline cursor-pointer hover:text-blue-200">Shop Now</span>
          </p>
        </div>
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-white to-blue-50 shadow-sm border-b border-gray-200 text-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="hover:text-blue-600 transition-colors font-medium">Men</a>
              <a href="#" className="hover:text-blue-600 transition-colors font-medium">Women</a>
              <a href="#" className="hover:text-blue-600 transition-colors font-medium">Accessories</a>
            </nav>

            {/* Logo */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ParcelAce
              </span>
            </div>

            {/* Navigation Right */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="hover:text-blue-600 transition-colors font-medium">About</a>
              <a href="#" className="hover:text-blue-600 transition-colors font-medium">Contact</a>
              <a href="#" className="hover:text-blue-600 transition-colors font-medium">Blog</a>
            </nav>
          </div>
        </div>
      </header>

        {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - 3 Cards */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Tracking Info Card */}
          <Card className="border-0 shadow-xl text-gray-800 relative overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #FFFDE6, #FFDEFC)' }}>
            <CardContent className="p-6 relative">
              {/* Top Row: Title and COD Label */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Delivered On</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-500 text-white border-0 px-3 py-1 text-xs font-medium">
                    COD ₹5700
                  </Badge>
                  <button 
                    onClick={handleShare}
                    className="text-gray-600 hover:bg-gray-200/80 h-8 w-8 p-0 rounded transition-colors duration-200 flex items-center justify-center"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
                    </div>
                    
              {/* Main Content */}
              <div className="space-y-4">
                {/* Large Date Display */}
                <div className="flex items-baseline gap-2">
                  <div className="text-6xl font-bold text-blue-600">23</div>
                  <div className="text-2xl font-medium text-gray-500">rd</div>
                </div>

                {/* Date and Status */}
                <div className="space-y-2">
                  <p className="text-lg text-gray-600">Friday, October</p>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">Status:</div>
                    <div className="text-2xl font-bold text-gray-900">RTO</div>
                      </div>
                    </div>

                                {/* Action Button */}
                <div className="pt-4">
                      <Button 
                    onClick={handleArrangeReturn}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 hover:from-blue-600 hover:to-indigo-700 font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Request return
                      </Button>
                    </div>
                  </div>

              {/* Background decoration */}
              <div className="absolute top-0 right-0 opacity-5">
                <div className="w-32 h-32 rounded-full bg-gray-400/20 -mr-16 -mt-16"></div>
              </div>
              <div className="absolute bottom-0 left-0 opacity-5">
                <div className="w-24 h-24 rounded-full bg-gray-300/20 -ml-12 -mb-12"></div>
                          </div>
            </CardContent>
          </Card>

          {/* Enhanced Tracking with Scroll */}
          <Card className="shadow-sm border-0" style={{ background: 'linear-gradient(to bottom right, #FFFDE6, #FFDEFC)' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Truck className="h-4 w-4 text-indigo-700" />
                Tracking Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-64 pr-4">
                <div className="space-y-3">
                  {mockOrder.tracking.map((event, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-2.5 h-2.5 rounded-full ${getTrackingDotColor(event)}`} />
                        {index < mockOrder.tracking.length - 1 && (
                          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mt-1" />
                        )}
                          </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{event.status}</span>
                          {event.isActive && <CheckCircle className="h-3 w-3 text-blue-500" />}
                          {event.isCompleted && <CheckCircle className="h-3 w-3 text-green-500" />}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{event.description}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {event.timestamp && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-2.5 w-2.5" />
                              {new Date(event.timestamp).toLocaleDateString()}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <MapPin className="h-2.5 w-2.5" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Order Details Card */}
          <Card className="border-0 shadow-lg" style={{ background: 'linear-gradient(to bottom right, #FEFCE8, #F3E8FF)' }}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-indigo-900">Order Details</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">ORD-2024-001234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ordered on:</span>
                    <span className="font-medium">24 Oct 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">John D***</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">9876****10</span>
                  </div>
                  <div className="mt-3">
                    <span className="text-gray-600 text-xs">Address:</span>
                    <p className="text-sm font-medium mt-1">123 Main Street, Delhi Area, Delhi - 110001</p>
                  </div>
                  <div className="flex justify-between mt-3">
                    <span className="text-gray-600">Type:</span>
                    <Badge className="bg-green-500 text-white">Prepaid</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        {/* Product Details Section */}
        <Card className="mb-8 shadow-sm border-0 bg-gradient-to-br from-white to-slate-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2 text-blue-600" />
              Product Details
            </CardTitle>
                  </CardHeader>
          <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-3 font-medium text-gray-700">Product</th>
                    <th className="text-left p-3 font-medium text-gray-700">Dimensions(CM)</th>
                    <th className="text-left p-3 font-medium text-gray-700">Weight(KG)</th>
                    <th className="text-left p-3 font-medium text-gray-700">Qty</th>
                    <th className="text-left p-3 font-medium text-gray-700">Price(₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <img src="/placeholder.svg" alt="Product" className="w-12 h-12 rounded object-cover bg-gray-100" />
                        <span className="font-medium">Wireless Bluetooth Headphones</span>
                      </div>
                          </td>
                    <td className="p-3 text-gray-600">20x15x8</td>
                    <td className="p-3 text-gray-600">0.5</td>
                    <td className="p-3 text-gray-600">1</td>
                    <td className="p-3 font-semibold text-gray-900">₹2,999</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <img src="/placeholder.svg" alt="Product" className="w-12 h-12 rounded object-cover bg-gray-100" />
                        <span className="font-medium">Phone Case</span>
                      </div>
                          </td>
                    <td className="p-3 text-gray-600">15x8x2</td>
                    <td className="p-3 text-gray-600">0.1</td>
                    <td className="p-3 text-gray-600">2</td>
                    <td className="p-3 font-semibold text-gray-900">₹598</td>
                        </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

        {/* Hot Selling Products Section */}
        <Card className="mb-8 shadow-sm border-0 bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
                Hot Selling Products
              </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
            <Carousel className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {hotSellingProducts.map((product) => (
                  <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                            >
                              <Heart className="h-4 w-4" />
                            </Button>
                          </div>
                <div>
                            <h4 className="font-medium text-sm text-gray-900 line-clamp-2">{product.name}</h4>
                            <p className="text-lg font-bold text-blue-600 mt-1">{product.price}</p>
                          </div>
                          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                            Buy Now
                          </Button>
                      </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </CardContent>
        </Card>

        {/* Latest Product Launch Video Section */}
        <Card className="mb-8 shadow-lg border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Latest Product Launch</h2>
                <p className="text-gray-600">Discover our newest collection in action</p>
                  </div>
              <div className="relative max-w-2xl mx-auto">
                <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5" 
                    alt="Product Launch Video"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Button 
                      size="lg" 
                      className="bg-white/90 hover:bg-white text-gray-900 rounded-full h-16 w-16 p-0"
                    >
                      <Play className="h-8 w-8 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Feeds from Instagram */}
        <Card className="mb-8 shadow-sm border-0 bg-gradient-to-br from-white to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Instagram className="w-5 h-5 mr-2 text-pink-600" />
              Live from Instagram
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {instagramFeeds.map((feed) => (
                <Card key={feed.id} className="border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="aspect-square relative overflow-hidden rounded-lg">
                        <img 
                          src={feed.image} 
                          alt="Instagram post"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 line-clamp-2">{feed.caption}</p>
                        <div className="flex items-center mt-1">
                          <Heart className="h-3 w-3 text-red-500 mr-1" />
                          <span className="text-xs text-gray-500">{feed.likes.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Visual Banners Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg h-32 flex items-center justify-center">
            <span className="text-white font-semibold">Banner 1</span>
          </div>
          <div className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-lg h-32 flex items-center justify-center">
            <span className="text-white font-semibold">Banner 2</span>
          </div>
          <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-lg h-32 flex items-center justify-center">
            <span className="text-white font-semibold">Banner 3</span>
          </div>
        </div>

        {/* Feedback Section */}
        <Card className="mb-8 shadow-sm border-0 bg-gradient-to-br from-white to-yellow-50">
          <CardContent className="p-8">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h3 className="text-lg font-semibold mb-6 text-gray-800">
                  Based on your recent interaction with Parcelace, how likely are you to recommend to friends & family?
                </h3>
                <div className="flex flex-wrap gap-3 mb-6">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                    <Button
                      key={score}
                      variant="outline"
                      size="sm"
                      onClick={() => setNpsScore(score)}
                      className={`w-12 h-12 rounded-full text-base font-medium transition-all ${
                        npsScore === score 
                          ? getNpsSelectedColor(score)
                          : `${getNpsButtonColor(score)} hover:shadow-md`
                      }`}
                    >
                      {score}
                    </Button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-6">
                  <span>Not at all likely</span>
                  <span>Extremely likely</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-gray-800">Remarks</h4>
                <Textarea
                  placeholder="Please enter your remarks (Max. 250 characters)"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value.slice(0, 250))}
                  className="resize-none mb-4 h-32 border-2 focus:border-blue-400"
                  rows={4}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{feedback.length}/250</span>
                  <Button 
                    onClick={handleNpsSubmit} 
                    disabled={npsScore === null} 
                    className="bg-blue-600 hover:bg-blue-700 px-8 py-2"
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rate Us Section */}
        <Card className="mb-8 shadow-sm border-0 bg-gradient-to-br from-white to-green-50">
          <CardContent className="p-8">
            <h3 className="text-lg font-semibold mb-8 text-center text-gray-800">How Was Your Delivery Experience?</h3>
            <div className="flex justify-center space-x-8 mb-8">
              {[1, 2, 3, 4, 5].map((rating) => (
                <div key={rating} className="flex flex-col items-center space-y-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setDeliveryRating(rating)}
                    className={`w-20 h-20 text-3xl rounded-full border-2 transition-all ${
                      deliveryRating === rating 
                        ? `${getRatingSelectedColor(rating)} text-white shadow-lg`
                        : `${getRatingColor(rating)} hover:shadow-md`
                    }`}
                  >
                    {getRatingEmoji(rating)}
                  </Button>
                  <span className={`text-xs font-medium tracking-wide ${
                    deliveryRating === rating ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {getRatingLabel(rating)}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Button 
                onClick={handleDeliveryRatingSubmit} 
                disabled={deliveryRating === null}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-2"
              >
                Submit
              </Button>
              </div>
            </CardContent>
          </Card>
      </div>

      {/* WhatsApp Support Button */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <Button
          onClick={handleWhatsAppSupport}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </Button>
        <div className="absolute bottom-16 right-0 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Reach out for support
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={showSharePopup} onOpenChange={setShowSharePopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Button
              onClick={handleWhatsAppShare}
              className="w-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-3"
            >
              <MessageCircle className="w-5 h-5" />
              Share on WhatsApp
            </Button>
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="w-full flex items-center justify-center gap-3"
            >
              <Copy className="w-5 h-5" />
              Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <span className="font-medium">Follow Us</span>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-blue-400 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
              <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
            </div>
            <div>
              <p className="text-sm text-gray-400">Powered by ParcelAce</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TrackingPage;
