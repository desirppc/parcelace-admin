import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  Copy, 
  Share2, 
  CheckCircle, 
  Package, 
  ShoppingCart,
  Truck,
  Calendar,
  MapPin,
  Heart,
  Play,
  Instagram,
  Loader2,
  Clock,
  Activity,
  MessageCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useParams } from 'react-router-dom';
import TrackingService, { TrackingResponse } from '@/services/trackingService';

const PublicTracking = () => {
  const { awbNumber } = useParams();
  const { toast } = useToast();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [deliveryRating, setDeliveryRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  
  // Tracking data state
  const [trackingData, setTrackingData] = useState<TrackingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tracking data when component mounts
  useEffect(() => {
    if (awbNumber) {
      fetchTrackingData();
    }
  }, [awbNumber]);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await TrackingService.getTrackingByAWB(awbNumber!);
      
      if (response.status && response.data) {
        setTrackingData(response);
        // Update page title if available
        if (response.data.tracking_page?.browser_settings?.[0]?.page_title) {
          document.title = response.data.tracking_page.browser_settings[0].page_title;
        }
      } else {
        setError(response.message || 'Failed to fetch tracking data');
        toast({
          title: "Error",
          description: response.message || 'Failed to fetch tracking data',
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error fetching tracking data:', err);
      setError('Network error occurred');
      toast({
        title: "Error",
        description: 'Network error occurred while fetching tracking data',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize map only when both Leaflet is loaded AND API data is available
  useEffect(() => {
    // Only proceed if we have API data
    if (!trackingData || !trackingData.data) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(linkElement);
      
      setTimeout(() => {
        initializeMap();
        setMapLoaded(true);
      }, 100);
    };
    document.head.appendChild(script);
    
    return () => {
      // Clean up script if component unmounts
      const existingScript = document.querySelector('script[src*="leaflet"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [trackingData]); // Re-run when trackingData changes

  const initializeMap = () => {
    // Check if Leaflet is loaded and data is available
    // @ts-ignore
    if (typeof L === 'undefined') {
      console.error('Leaflet library not loaded');
      return;
    }

    if (!trackingData || !trackingData.data) {
      console.error('Tracking data not available for map initialization');
      return;
    }

    try {
      // Get coordinates for warehouse and customer cities
      const getCityCoordinates = (cityName: string) => {
        const cityCoords: { [key: string]: [number, number] } = {
          'ahmedabad': [23.0225, 72.5714],
          'jaipur': [26.9124, 75.7873],
          'delhi': [28.6139, 77.2090],
          'mumbai': [19.0760, 72.8777],
          'bangalore': [12.9716, 77.5946],
          'chennai': [13.0827, 80.2707],
          'kolkata': [22.5726, 88.3639],
          'hyderabad': [17.3850, 78.4867],
          'pune': [18.5204, 73.8567],
          'noida': [28.5355, 77.3910],
          'gurgaon': [28.4595, 77.0266],
          'faridabad': [28.4089, 77.3178],
          'ghaziabad': [28.6692, 77.4538],
          'lucknow': [26.8467, 80.9462],
          'kanpur': [26.4499, 80.3319],
          'indore': [22.7196, 75.8577],
          'bhopal': [23.2599, 77.4126],
          'patna': [25.5941, 85.1376],
          'vadodara': [22.3072, 73.1812],
          'surat': [21.1702, 72.8311]
        };
        
        const normalizedCity = cityName.toLowerCase().trim();
        return cityCoords[normalizedCity] || [23.0225, 72.5714]; // Default to Ahmedabad if city not found
      };

      // Get warehouse and customer city coordinates
      const warehouseCity = trackingData.data.warehouse_details?.city || 'ahmedabad';
      const customerCity = trackingData.data.customer_details?.shipping_city || 'jaipur';
      
      const warehouseCoords = getCityCoordinates(warehouseCity);
      const customerCoords = getCityCoordinates(customerCity);
      
      // Calculate center point between warehouse and customer
      const centerLat = (warehouseCoords[0] + customerCoords[0]) / 2;
      const centerLng = (warehouseCoords[1] + customerCoords[1]) / 2;
      const centerCoords: [number, number] = [centerLat, centerLng];
      
      // @ts-ignore
      const map = L.map('tracking-map').setView(centerCoords, 6);
      
      // @ts-ignore
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Warehouse Marker
      // @ts-ignore
      const warehouseMarker = L.marker(warehouseCoords).addTo(map);
      warehouseMarker.bindPopup(`<b>Warehouse - ${warehouseCity.charAt(0).toUpperCase() + warehouseCity.slice(1)}</b><br>Order Picked Up`).openPopup();

      // Customer Destination Marker
      // @ts-ignore
      const customerMarker = L.marker(customerCoords).addTo(map);
      customerMarker.bindPopup(`<b>Destination - ${customerCity.charAt(0).toUpperCase() + customerCity.slice(1)}</b><br>Delivery Address`);

      // Current Location (Latest tracking event location)
      const latestTracking = trackingData.data.trakings_details?.[0];
      let currentCoords = warehouseCoords; // Default to warehouse if no tracking data
      
      if (latestTracking?.location) {
        // Try to extract city from location string
        const locationStr = latestTracking.location.toLowerCase();
        if (locationStr.includes('ahmedabad')) {
          currentCoords = [23.0225, 72.5714];
        } else if (locationStr.includes('jaipur')) {
          currentCoords = [26.9124, 75.7873];
        } else if (locationStr.includes('delhi')) {
          currentCoords = [28.6139, 77.2090];
        } else if (locationStr.includes('mumbai')) {
          currentCoords = [19.0760, 72.8777];
        } else if (locationStr.includes('bangalore')) {
          currentCoords = [12.9716, 77.5946];
        } else if (locationStr.includes('chennai')) {
          currentCoords = [13.0827, 80.2707];
        } else if (locationStr.includes('kolkata')) {
          currentCoords = [22.5726, 88.3639];
        } else if (locationStr.includes('hyderabad')) {
          currentCoords = [17.3850, 78.4867];
        } else if (locationStr.includes('pune')) {
          currentCoords = [18.5204, 73.8567];
        } else if (locationStr.includes('noida')) {
          currentCoords = [28.5355, 77.3910];
        } else if (locationStr.includes('gurgaon')) {
          currentCoords = [28.4595, 77.0266];
        } else if (locationStr.includes('faridabad')) {
          currentCoords = [28.4089, 77.3178];
        } else if (locationStr.includes('ghaziabad')) {
          currentCoords = [28.6692, 77.4538];
        } else if (locationStr.includes('lucknow')) {
          currentCoords = [26.8467, 80.9462];
        } else if (locationStr.includes('kanpur')) {
          currentCoords = [26.4499, 80.3319];
        } else if (locationStr.includes('indore')) {
          currentCoords = [22.7196, 75.8577];
        } else if (locationStr.includes('bhopal')) {
          currentCoords = [23.2599, 77.4126];
        } else if (locationStr.includes('patna')) {
          currentCoords = [25.5941, 85.1376];
        } else if (locationStr.includes('vadodara')) {
          currentCoords = [22.3072, 73.1812];
        } else if (locationStr.includes('surat')) {
          currentCoords = [21.1702, 72.8311];
        }
      }

      // @ts-ignore
      const currentIcon = L.divIcon({
        className: 'current-location-marker',
        html: '<div style="background: #3B82F6; border: 3px solid white; border-radius: 50%; width: 20px; height: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      // @ts-ignore
      const currentMarker = L.marker(currentCoords, { icon: currentIcon }).addTo(map);
      currentMarker.bindPopup(`<b>Current Location - ${latestTracking?.location || 'In Transit'}</b><br>${latestTracking?.status || 'In Transit'}`);

      // Route line from warehouse to customer
      // @ts-ignore
      const routeLine = L.polyline([warehouseCoords, currentCoords, customerCoords], {
        color: '#3B82F6',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 5'
      }).addTo(map);

      // Completed route (warehouse to current location)
      // @ts-ignore
      const completedRoute = L.polyline([warehouseCoords, currentCoords], {
        color: '#10B981',
        weight: 6,
        opacity: 0.9
      }).addTo(map);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  const handleCopyLink = () => {
    const trackingUrl = window.location.href;
    navigator.clipboard.writeText(trackingUrl);
    toast({
      title: "Link copied! ✅",
      description: "Tracking link copied to clipboard",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Track my package',
        text: `Track my package with AWB: ${awbNumber}`,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      handleCopyLink();
    }
  };

  const handleNpsSubmit = () => {
    if (npsScore !== null) {
      toast({
        title: "Thank you for your feedback! ⭐",
        description: "Your feedback helps us improve our service",
      });
      // Reset form
      setNpsScore(null);
      setFeedback('');
    }
  };

  const handleDeliveryRatingSubmit = () => {
    if (deliveryRating !== null) {
      toast({
        title: "Rating submitted! ⭐",
        description: "Thank you for rating your delivery experience",
      });
      // Reset form
      setDeliveryRating(null);
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
    if (rating === 2) return 'bg-orange-500 border-red-500';
    if (rating === 3) return 'bg-gray-500 border-gray-500';
    if (rating === 4) return 'bg-blue-500 border-blue-500';
    return 'bg-green-500 border-green-500';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading tracking information...</h2>
          <p className="text-gray-500">Please wait while we fetch your package details</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !trackingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Unable to load tracking</h2>
          <p className="text-gray-500 mb-6">{error || 'Failed to fetch tracking information'}</p>
          <Button onClick={fetchTrackingData} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const { data } = trackingData;
  const { order_details, customer_details, product_details, trakings_details, tracking_page } = data;

  // Debug logging for footer data
  console.log('Footer section data:', tracking_page?.footer_section);
  console.log('Video content data:', tracking_page?.video_content);

  // Get latest tracking status - Use first item from reversed array
  const latestTracking = trakings_details?.slice().reverse()[0];
  const isCOD = order_details.shipment_mod === 'cod';
  const codAmount = order_details.collectable_amount;

  // Format tracking events for display - Latest first (descending order)
  const trackingEvents = trakings_details?.slice().reverse().map((tracking, index) => {
    // Determine status based on tracking data
    // First event (index 0) is now the latest and should be active
    // Previous events are completed
    const isLatest = index === 0;
    const isCompleted = !isLatest;
    
    return {
      status: tracking.status,
      description: tracking.instructions,
      location: tracking.location,
      timestamp: tracking.status_time,
      isCompleted: isCompleted,
      isActive: isLatest,
    };
  }) || [];

  // Get hot selling products from tracking page config or use defaults
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading tracking information...</h2>
          <p className="text-gray-500">Please wait while we fetch your package details</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !trackingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Unable to load tracking</h2>
          <p className="text-gray-500 mb-6">{error || 'Failed to fetch tracking information'}</p>
          <Button onClick={fetchTrackingData} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
      {/* Top Promo Bar - Dynamic from API */}
      {tracking_page?.header_top?.[0] && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-2">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm font-medium">
              {tracking_page.header_top[0].text}{' '}
              {tracking_page.header_top[0].button_label && (
                <span className="underline cursor-pointer hover:text-blue-200">
                  {tracking_page.header_top[0].button_label}
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Header - Dynamic from API */}
      <header className="bg-gradient-to-r from-white to-blue-50 shadow-sm border-b border-gray-200 text-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Navigation - Dynamic from API */}
            <nav className="hidden md:flex items-center space-x-8">
              {tracking_page?.menu_top?.map((menu, index) => (
                <a key={index} href={menu.url} className="hover:text-blue-600 transition-colors font-medium">
                  {menu.label}
                </a>
              ))}
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

            {/* Navigation Right - Dynamic from API */}
            <nav className="hidden md:flex items-center space-x-8">
              {tracking_page?.header_section?.[0]?.menu_items?.map((menu, index) => (
                <a key={index} href={menu.url} className="hover:text-blue-600 transition-colors font-medium">
                  {menu.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Debug Section - Remove in production */}
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Info (Remove in production)</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p><strong>Footer Section:</strong> {tracking_page?.footer_section ? 'Available' : 'Not available'}</p>
            <p><strong>Video Content:</strong> {tracking_page?.video_content ? 'Available' : 'Not available'}</p>
            <p><strong>Footer Data:</strong> {JSON.stringify(tracking_page?.footer_section?.[0], null, 2)}</p>
            <p><strong>Video Data:</strong> {JSON.stringify(tracking_page?.video_content?.[0], null, 2)}</p>
          </div>
        </div>

        {/* Hero Section - 2 Cards */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Tracking Info Card - New Design */}
          <Card className="border-0 shadow-lg text-gray-800 relative overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #FFFDE6, #FFDEFC)' }}>
            {/* Blue Header */}
            <div className="bg-blue-600 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Tracking Info</h3>
                <Badge className="bg-white text-blue-600 border-0 px-3 py-1 text-sm font-medium">
                  {order_details?.shipment_mod === 'cod' ? 'COD' : 'Prepaid'} - ₹{order_details?.total || '0'}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-6">
              {/* Two Column Layout */}
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column - Estimated Delivery Date */}
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">Estimated Delivery Date</p>
                  <div className="text-4xl text-gray-700 font-medium text-center">
                    Friday, October
                  </div>
                  <div className="text-5xl font-bold text-blue-600 text-center">
                    23
                  </div>
                </div>
                
                {/* Right Column - Status and Actions */}
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className="bg-orange-500 text-white border-0 px-3 py-2 text-sm font-medium">
                    {latestTracking?.status || order_details?.shipment_status || 'Loading...'}
                  </Badge>
                  
                  {/* Copy Button */}
                  <Button 
                    onClick={handleCopyLink}
                    className="w-full bg-blue-600 text-white border-0 hover:bg-blue-700"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unified Map and Timeline Section */}
          <Card className="lg:col-span-2 shadow-lg border-0 bg-white">
            <CardContent className="p-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Map Section - Left Side */}
                <div>
                  <div className="relative">
                    <div 
                      id="tracking-map" 
                      className="w-full h-80 rounded-lg bg-gray-100 border"
                      style={{ minHeight: '320px' }}
                    >
                      {!mapLoaded && (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">Loading map...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tracking Details Section - Right Side */}
                <div>
                  <div className="space-y-3">
                    {/* Sticky Courier Info */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 sticky top-0 z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {TrackingService.getDeliveryPartnerIcon(order_details.delivery_partner)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">{order_details.delivery_partner}</h4>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">AWB</p>
                          <p className="text-xs font-medium text-gray-700">{awbNumber}</p>
                        </div>
                      </div>
                    </div>

                    {/* Scrollable Timeline */}
                    <ScrollArea className="h-64 pr-4">
                      <div className="space-y-3">
                        {trackingEvents.map((event, index) => (
                          <div key={index} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-2.5 h-2.5 rounded-full ${
                                event.isCompleted ? 'bg-green-500' : 
                                event.isActive ? 'bg-blue-500' : 'bg-gray-300'
                              }`} />
                              {index < trackingEvents.length - 1 && (
                                <div className="w-px h-6 bg-gray-200 mt-1" />
                              )}
                            </div>
                            <div className="flex-1 pb-2">
                              {/* Status Header */}
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-sm text-gray-900">{event.status}</span>
                                {event.isActive && <CheckCircle className="h-3 w-3 text-blue-500" />}
                                {event.isCompleted && <CheckCircle className="h-3 w-3 text-green-500" />}
                              </div>
                              
                              {/* Instructions and Time on same line */}
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-sm text-gray-700 font-medium">{event.description}</p>
                                {event.timestamp && (
                                  <span className="text-xs text-gray-500">{event.timestamp}</span>
                                )}
                              </div>
                              
                              {/* Location */}
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <MapPin className="h-3 w-3 text-gray-500" />
                                <span className="font-medium">{event.location}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Details Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Order Details Card */}
          <Card className="shadow-sm border-0" style={{ background: 'linear-gradient(to bottom right, #FEFEFE, #F8FAFC)' }}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2 text-blue-600" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium">{order_details.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Placed On:</span>
                  <span className="font-medium">{order_details.sync_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Name of The Buyer:</span>
                  <span className="font-medium">
                    {customer_details.shipping_first_name} {customer_details.shipping_last_name || ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone Number:</span>
                  <span className="font-medium">{customer_details.shipping_phone}</span>
                </div>
                <div className="mt-3">
                  <span className="text-gray-600 text-sm">Address:</span>
                  <p className="text-sm font-medium mt-1">
                    {customer_details.shipping_address1}, {customer_details.shipping_city} - {customer_details.shipping_zipcode}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Details Card */}
          <Card className="shadow-sm border-0" style={{ background: 'linear-gradient(to bottom right, #FEFEFE, #F8FAFC)' }}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left p-3 font-medium text-gray-700">Product Name</th>
                      <th className="text-left p-3 font-medium text-gray-700">Qty</th>
                      <th className="text-left p-3 font-medium text-gray-700">Unit Price</th>
                      <th className="text-left p-3 font-medium text-gray-700">Sub Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product_details?.map((product, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="p-3">
                          <div className="flex items-center space-x-3">
                            <img src="/placeholder.svg" alt="Product" className="w-12 h-12 rounded object-cover bg-gray-100" />
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-gray-600">{product.quantity}</td>
                        <td className="p-3 text-gray-600">₹{product.price}</td>
                        <td className="p-3 font-semibold text-gray-900">₹{product.total_price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hot Selling Products Section */}
        <Card className="mb-8 shadow-sm border-0" style={{ background: 'linear-gradient(to bottom right, #FEFEFE, #F8FAFC)' }}>
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
        {tracking_page?.video_content?.[0]?.show_video && tracking_page.video_content[0].videos && tracking_page.video_content[0].videos.length > 0 && (
          <Card className="mb-8 shadow-lg border-0" style={{ background: 'linear-gradient(to bottom right, #FEFEFE, #F8FAFC)' }}>
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {tracking_page.video_content[0].videos[0].title || 'Latest Product Launch'}
                  </h2>
                  <p className="text-gray-600">
                    {tracking_page.video_content[0].videos[0].description || 'Discover our newest collection in action'}
                  </p>
                </div>
                <div className="relative max-w-2xl mx-auto">
                  <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
                    {tracking_page.video_content[0].videos[0].youtube_url ? (
                      <iframe
                        src={tracking_page.video_content[0].videos[0].youtube_url.replace('youtu.be/', 'youtube.com/embed/').replace('youtube.com/watch?v=', 'youtube.com/embed/')}
                        title={tracking_page.video_content[0].videos[0].title || 'Product Launch Video'}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-white">
                          <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">Video not available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Live Feeds from Instagram */}
        <Card className="mb-8 shadow-sm border-0" style={{ background: 'linear-gradient(to bottom right, #FEFEFE, #F8FAFC)' }}>
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

        {/* Feedback Section - Dynamic from API */}
        {tracking_page?.nps_section?.[0]?.show_nps_section && (
          <Card className="mb-8 shadow-sm border-0" style={{ background: 'linear-gradient(to bottom right, #FEFEFE, #F8FAFC)' }}>
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
        )}

        {/* Rate Us Section - Dynamic from API */}
        {tracking_page?.nps_section?.[0]?.show_delivery_feedback_section && (
          <Card className="mb-8 shadow-sm border-0" style={{ background: 'linear-gradient(to bottom right, #FEFEFE, #F8FAFC)' }}>
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
        )}
      </div>

      {/* Footer - Dynamic from API */}
      {tracking_page?.footer_section?.[0] ? (
        <>
          {/* Main Footer */}
          <footer className="bg-gray-800 text-white py-4 mb-0" data-testid="api-footer">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                {/* Left Section - Follow Us + Social Icons */}
                <div className="flex items-center space-x-6">
                  <span className="font-medium">Follow Us</span>
                  <div className="flex space-x-4">
                    <a href="#" className="hover:text-blue-400 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                    <a href="#" className="hover:text-pink-400 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                      </svg>
                    </a>
                    <a href="#" className="hover:text-blue-600 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                    <a href="#" className="hover:text-blue-400 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                  </div>
                  <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
                </div>
                
                {/* Right Section - Powered by ParcelAce */}
                <div>
                  <p className="text-sm text-gray-400">Powered by ParcelAce</p>
                </div>
              </div>
            </div>
          </footer>
          
          {/* Sticky Footer - Appears AFTER main footer, not overlapping */}
          {tracking_page.footer_section[0].sticky_footer && (
            <div 
              className="w-full text-white py-3 px-4 z-40"
              style={{ backgroundColor: tracking_page.footer_section[0].button_color || '#374151' }}
              data-testid="sticky-footer"
            >
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <span className="text-sm font-medium">
                  {tracking_page.footer_section[0].sticky_footer_text || 'Get the latest updates and offers!'}
                </span>
                {tracking_page.footer_section[0].button_label && (
                  <a 
                    href={tracking_page.footer_section[0].button_link || '#'}
                    className="bg-white text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all duration-300"
                  >
                    {tracking_page.footer_section[0].button_label}
                  </a>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        // Fallback footer for debugging
        <footer className="bg-red-900 text-white py-12" data-testid="no-footer-data">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-white text-lg">🚨 NO FOOTER DATA FROM API</p>
            <p className="text-sm mt-2">Debug: tracking_page?.footer_section = {JSON.stringify(tracking_page?.footer_section)}</p>
            <p className="text-sm mt-2">Full tracking_page data: {JSON.stringify(tracking_page, null, 2)}</p>
          </div>
        </footer>
      )}

      {/* WhatsApp Support Button */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <Button
          onClick={() => window.open('https://wa.me/919876543210', '_blank')}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </Button>
        <div className="absolute bottom-16 right-0 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Reach out for support
        </div>
      </div>
    </div>
  );
};

export default PublicTracking;
