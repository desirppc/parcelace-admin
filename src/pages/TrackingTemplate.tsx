import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  Loader2,
  Clock,
  Activity,
  MessageCircle,
  X,
  Phone,
  Shield,
  Star,
  Gift,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Mockup data for template - no API calls needed

// OTP Modal Component
const OTPModal = ({ 
  isOpen, 
  onClose, 
  awbNumber, 
  onOTPSubmit, 
  onResendOTP,
  isLoading,
  error 
}: {
  isOpen: boolean;
  onClose: () => void;
  awbNumber: string;
  onOTPSubmit: (otp: string) => void;
  onResendOTP: () => void;
  isLoading: boolean;
  error: string | null;
}) => {
  const [otp, setOtp] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const handleSubmit = () => {
    if (otp.length === 6) {
      onOTPSubmit(otp);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    await onResendOTP();
    setResendLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && otp.length === 6) {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Verify Your Identity</h3>
              <p className="text-sm text-gray-500">Enter the 6-digit OTP sent for</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* AWB Number Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-blue-700">
            <Package className="w-4 h-4" />
            <span className="font-medium">AWB: {awbNumber}</span>
          </div>
          <p className="text-sm text-blue-600 mt-1">
            OTP sent successfully! Check your messages.
          </p>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Enter 6-digit OTP
          </label>
          <Input
            type="text"
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyPress={handleKeyPress}
            className="text-center text-2xl font-mono tracking-widest h-14 border-2 focus:border-blue-500"
            maxLength={6}
            disabled={isLoading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleSubmit}
            disabled={otp.length !== 6 || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleResend}
            disabled={resendLoading}
            className="w-full h-10"
          >
            {resendLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              'Resend OTP'
            )}
          </Button>
        </div>

        {/* Info Text */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Didn't receive the OTP? Check your spam folder or try resending.
        </p>
      </div>
    </div>
  );
};

// Scratch Card Modal Component
const ScratchCardModal = ({ 
  isOpen, 
  onClose, 
  promoCode,
  expiryDate 
}: {
  isOpen: boolean;
  onClose: () => void;
  promoCode: string;
  expiryDate?: string;
}) => {
  const { toast } = useToast();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promoCode);
    toast({
      title: "Promo code copied! 🎉",
      description: "Code copied to clipboard successfully",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Special Promo Code from ParcelAce',
        text: `Use promo code ${promoCode} for amazing discounts!`,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      handleCopyCode();
    }
  };

  // Format expiry date for display
  const formatExpiryDate = (dateString: string) => {
    if (!dateString) return 'Valid until December 31, 2024'; // Fallback
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Valid until December 31, 2024'; // Fallback for invalid dates
      
      return `Valid until ${date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`;
    } catch (error) {
      return 'Valid until December 31, 2024'; // Fallback
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-all">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">🎉 Congratulations!</h3>
          <p className="text-gray-600">You've unlocked an exclusive promo code</p>
        </div>

        {/* Promo Code Display */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 rounded-xl p-6 mb-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Your Promo Code</p>
          <div className="text-3xl font-bold text-blue-600 tracking-wider mb-2">
            {promoCode}
          </div>
          <p className="text-sm text-gray-500">{formatExpiryDate(expiryDate || '')}</p>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">Quick Terms & Conditions:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Minimum order value: ₹499</li>
            <li>• Maximum discount: ₹200</li>
            <li>• Valid on first order only</li>
            <li>• Cannot be combined with other offers</li>
            <li>• Valid on selected products only</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleCopyCode}
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-medium"
          >
            <Copy className="w-5 h-5 mr-2" />
            Copy Promo Code
          </Button>
          
          <Button
            variant="outline"
            onClick={handleShare}
            className="w-full h-12 text-lg font-medium"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share with Friends
          </Button>
        </div>

        {/* Close Button */}
        <Button
          variant="ghost"
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 p-0 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Scratch Card Component
const ScratchCard = ({ 
  onReveal, 
  reward 
}: { 
  onReveal: (promoCode: string, expiryDate?: string) => void;
  reward?: {
    discount_code: string;
    valid_until: string;
    title: string;
    description: string;
    discount_percentage: number;
  };
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPixels, setScratchedPixels] = useState(0);
  const [totalPixels, setTotalPixels] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  // Use reward data if available, otherwise fallback to default
  const promoCode = reward?.discount_code || "PARCEL20";
  const expiryDate = reward?.valid_until || '';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const initializeCanvas = () => {
      // Get container dimensions for responsive sizing
      const container = canvas.parentElement;
      const containerWidth = container?.clientWidth || 400;
      const containerHeight = Math.max(200, containerWidth * 0.5); // Maintain aspect ratio

      // Set canvas size to fill container
      canvas.width = containerWidth;
      canvas.height = containerHeight;

      // Calculate total pixels
      const total = canvas.width * canvas.height;
      setTotalPixels(total);

      // Create scratch layer
      ctx.fillStyle = '#6B7280';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add scratch texture
      ctx.fillStyle = '#9CA3AF';
      const speckleCount = Math.floor((canvas.width * canvas.height) / 1000); // Scale speckles with size
      for (let i = 0; i < speckleCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.max(1, Math.random() * 3);
        ctx.fillRect(x, y, size, size);
      }

      // Add text overlay with responsive font size
      ctx.fillStyle = '#374151';
      const fontSize = Math.max(14, Math.min(24, canvas.width / 20));
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('Scratch to reveal your reward!', canvas.width / 2, canvas.height / 2);
    };

    // Initialize canvas
    initializeCanvas();

    // Add resize observer to handle container size changes
    const resizeObserver = new ResizeObserver(() => {
      initializeCanvas();
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Cleanup
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleMouseDown = () => {
    setIsScratching(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isScratching || isRevealed) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear scratched area
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();

    // Count scratched pixels
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let scratched = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) {
        scratched++;
      }
    }
    setScratchedPixels(scratched);

    // Check if 60% is scratched
    const scratchedPercentage = (scratched / totalPixels) * 100;
    if (scratchedPercentage >= 60 && !isRevealed) {
      setIsRevealed(true);
      onReveal(promoCode, expiryDate);
    }
  };

  const handleMouseUp = () => {
    setIsScratching(false);
  };

  const handleMouseLeave = () => {
    setIsScratching(false);
  };

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className="cursor-crosshair border-2 border-gray-300 rounded-lg shadow-lg w-full h-auto"
        style={{ 
          touchAction: 'none',
          width: '100%',
          height: 'auto',
          minHeight: '200px'
        }}
      />
      
      {/* Progress indicator */}
      <div className="mt-3 text-center">
        <div className="text-sm text-gray-600 mb-1">
          Scratch progress: {Math.round((scratchedPixels / totalPixels) * 100)}%
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(scratchedPixels / totalPixels) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const TrackingTemplate = () => {
  // Template version - using static AWB for demonstration
  const awbNumber = "18045011180841";
  const { toast } = useToast();
  
  // Mockup data for template - no API calls needed
  const mockupData = {
    order_details: {
      order_id: "ORD-2024-001",
      shipment_mod: "cod",
      total: "2499",
      collectable_amount: "2499",
      shipment_status: "In Transit",
      sync_date: "2024-01-15",
      delivery_partner: "ParcelAce Express"
    },
    customer_details: {
      shipping_first_name: "John",
      shipping_last_name: "Doe",
      shipping_phone: "+91 98765 43210",
      shipping_address1: "123 Main Street",
      shipping_city: "Mumbai",
      shipping_zipcode: "400001"
    },
    product_details: [
      {
        name: "Premium Wireless Headphones",
        quantity: 1,
        price: "2400",
        total_price: "2400"
      }
    ],
    trakings_details: [
      {
        status: "In Transit",
        instructions: "Package is out for delivery",
        location: "Mumbai",
        status_time: "2024-01-17 10:30 AM"
      },
      {
        status: "Shipped",
        instructions: "Package has been shipped from warehouse",
        location: "Ahmedabad",
        status_time: "2024-01-16 02:15 PM"
      },
      {
        status: "Processing",
        instructions: "Order is being processed",
        location: "Ahmedabad",
        status_time: "2024-01-15 11:45 AM"
      },
      {
        status: "Order Placed",
        instructions: "Order has been placed successfully",
        location: "Ahmedabad",
        status_time: "2024-01-15 09:30 AM"
      }
    ],
    warehouse_details: {
      city: "Ahmedabad"
    },
    tracking_page: {
      header_top: [{
        text: "🎉 Special Offer: Get 20% off on your next order!",
        button_label: "Shop Now"
      }],
      menu_top: [
        { label: "Home", url: "#" },
        { label: "Products", url: "#" },
        { label: "About", url: "#" },
        { label: "Contact", url: "#" }
      ],
      header_section: [{
        menu_items: [
          { label: "Login", url: "#" },
          { label: "Register", url: "#" }
        ]
      }],
      nps_section: [{
        show_nps_section: true,
        show_delivery_feedback_section: true
      }],
      video_content: [{
        show_video: true,
        videos: [{
          title: "Latest Product Launch",
          description: "Discover our newest collection in action",
          youtube_url: "https://youtu.be/dQw4w9WgXcQ"
        }]
      }],
      footer_section: [{
        sticky_footer: true,
        sticky_footer_text: "Get the latest updates and offers!",
        button_label: "Subscribe Now",
        button_link: "#",
        button_color: "#374151"
      }],
      browser_settings: [{
        page_title: "Track Your Package - ParcelAce"
      }]
    }
  };
  const [mapLoaded, setMapLoaded] = useState(false);
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [deliveryRating, setDeliveryRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  
  // OTP Authentication State
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<'nps' | 'delivery' | 'unified' | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  
  // Tracking data state
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scratch Card State
  const [showScratchCardModal, setShowScratchCardModal] = useState(false);
  const [currentPromoCode, setCurrentPromoCode] = useState('');
  const [currentExpiryDate, setCurrentExpiryDate] = useState('');

  // Get customer phone number for OTP
  const getCustomerPhone = () => {
    return trackingData?.data?.customer_details?.shipping_phone || '';
  };

  // Handle section click - trigger OTP if not authenticated
  const handleSectionClick = (section: 'nps' | 'delivery' | 'unified') => {
    if (!isAuthenticated) {
      setSelectedSection(section);
      setShowOTPModal(true);
      setOtpError(null);
      // Automatically send OTP when modal opens
      handleResendOTP();
    }
  };

  // Handle OTP submission - Mockup version
  const handleOTPSubmit = async (otp: string) => {
    setOtpLoading(true);
    setOtpError(null);
    
    // Simulate API delay
    setTimeout(() => {
      // Mockup OTP verification - accept any 6-digit OTP
      if (otp.length === 6) {
        console.log('Mockup OTP verification successful for AWB:', awbNumber);
        
        // Generate a session token for this authenticated session
        const sessionToken = `tracking_auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        setAuthToken(sessionToken);
        setIsAuthenticated(true);
        setShowOTPModal(false);
        
        toast({
          title: "Authentication Successful! ✅",
          description: "Mockup verification successful - You can now submit your feedback",
        });
        
        // Auto-focus on the selected section
        if (selectedSection === 'nps') {
          // Focus on NPS section
          document.getElementById('nps-section')?.scrollIntoView({ behavior: 'smooth' });
        } else if (selectedSection === 'delivery') {
          // Focus on delivery section
          document.getElementById('delivery-section')?.scrollIntoView({ behavior: 'smooth' });
        } else if (selectedSection === 'unified') {
          // Focus on unified feedback section
          document.getElementById('unified-feedback-section')?.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        setOtpError('Invalid OTP format. Please enter 6 digits.');
        toast({
          title: "Authentication Failed",
          description: 'Invalid OTP format. Please enter 6 digits.',
          variant: "destructive"
        });
      }
      setOtpLoading(false);
    }, 500);
  };

  // Handle resend OTP - Mockup version
  const handleResendOTP = async () => {
    console.log('Mockup: Sending OTP for AWB:', awbNumber);
    
    toast({
      title: "OTP Sent! 📱",
      description: "Mockup OTP sent successfully (any 6-digit code will work)",
    });
  };

  // Handle NPS submission with authentication
  const handleNpsSubmit = () => {
    if (!isAuthenticated) {
      handleSectionClick('nps');
      return;
    }
    
    if (npsScore !== null) {
      // TODO: Submit to API with authToken
      console.log('Submitting NPS with token:', authToken);
      
      toast({
        title: "Thank you for your feedback! ⭐",
        description: "Your feedback helps us improve our service",
      });
      
      // Reset form
      setNpsScore(null);
      setFeedback('');
    }
  };

  // Handle delivery rating submission with authentication
  const handleDeliveryRatingSubmit = () => {
    if (!isAuthenticated) {
      handleSectionClick('delivery');
      return;
    }
    
    if (deliveryRating !== null) {
      // TODO: Submit to API with authToken
      console.log('Submitting delivery rating with token:', authToken);
      
      toast({
        title: "Rating submitted! ⭐",
        description: "Thank you for rating your delivery experience",
      });
      
      // Reset form
      setDeliveryRating(null);
    }
  };

  // Handle unified feedback submission
  const handleUnifiedSubmit = () => {
    if (!isAuthenticated) {
      handleSectionClick('unified');
      return;
    }
    
    let hasFeedback = false;
    
    // Submit NPS if provided
    if (npsScore !== null) {
      console.log('Submitting NPS with token:', authToken, 'Score:', npsScore);
      hasFeedback = true;
    }
    
    // Submit delivery rating if provided
    if (deliveryRating !== null) {
      console.log('Submitting delivery rating with token:', authToken, 'Rating:', deliveryRating);
      hasFeedback = true;
    }
    
    if (hasFeedback) {
      toast({
        title: "Feedback submitted! ⭐",
        description: "Thank you for sharing your experience with us",
      });
      
      // Reset forms
      setNpsScore(null);
      setDeliveryRating(null);
      setFeedback('');
    } else {
      toast({
        title: "No feedback to submit",
        description: "Please provide at least one rating before submitting",
        variant: "destructive"
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
    if (rating === 2) return 'bg-orange-500 border-red-500';
    if (rating === 3) return 'bg-gray-500 border-gray-500';
    if (rating === 4) return 'bg-blue-500 border-blue-500';
    return 'bg-green-500 border-green-500';
  };

  // Load mockup data when component mounts
  useEffect(() => {
    fetchTrackingData();
  }, []);

  // No API calls needed - using mockup data
  const fetchTrackingData = () => {
    setLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setTrackingData({ status: true, data: mockupData });
      setLoading(false);
      // Set page title
      document.title = "Tracking Template - ParcelAce";
    }, 500);
  };

  // Initialize map only when both Leaflet is loaded AND API data is available
  useEffect(() => {
    // Template version - always proceed with mockup data

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(linkElement);
      
      // Add custom CSS for map stretching
      const customCSS = document.createElement('style');
      customCSS.textContent = `
        #tracking-map {
          width: 100% !important;
          height: 100% !important;
          min-height: 400px !important;
          aspect-ratio: 4/3 !important;
        }
        #tracking-map .leaflet-container {
          width: 100% !important;
          height: 100% !important;
          min-height: 400px !important;
          aspect-ratio: 4/3 !important;
        }
        #tracking-map .leaflet-map-pane {
          width: 100% !important;
          height: 100% !important;
        }
        #tracking-map .leaflet-pane {
          width: 100% !important;
          height: 100% !important;
        }
        
        /* Scratch Card Stretching */
        .scratch-card-container canvas {
          width: 100% !important;
          height: auto !important;
          min-height: 200px !important;
          max-width: 100% !important;
        }
      `;
      document.head.appendChild(customCSS);
      
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
  }, []); // Only run once for template

  const initializeMap = () => {
    // Check if Leaflet is loaded and data is available
    // @ts-ignore
    if (typeof L === 'undefined') {
      console.error('Leaflet library not loaded');
      return;
    }

    // Template version - always proceed with mockup data

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
      const warehouseCity = mockupData.warehouse_details?.city || 'ahmedabad';
      const customerCity = mockupData.customer_details?.shipping_city || 'mumbai';
      
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

      // Force map to resize and fill container properly
      setTimeout(() => {
        // @ts-ignore
        map.invalidateSize();
      }, 100);

      // Add resize event listener to handle window resizing
      const handleResize = () => {
        // @ts-ignore
        map.invalidateSize();
      };
      window.addEventListener('resize', handleResize);
      
      // Clean up event listener when map is destroyed
      map.on('remove', () => {
        window.removeEventListener('resize', handleResize);
      });

      // Warehouse Marker
      // @ts-ignore
      const warehouseMarker = L.marker(warehouseCoords).addTo(map);
      warehouseMarker.bindPopup(`<b>Warehouse - ${warehouseCity.charAt(0).toUpperCase() + warehouseCity.slice(1)}</b><br>Order Picked Up`).openPopup();

      // Customer Destination Marker
      // @ts-ignore
      const customerMarker = L.marker(customerCoords).addTo(map);
      customerMarker.bindPopup(`<b>Destination - ${customerCity.charAt(0).toUpperCase() + customerCity.slice(1)}</b><br>Delivery Address`);

      // Current Location (Latest tracking event location)
      const latestTracking = mockupData.trakings_details?.[0];
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

  const handleScratchCardReveal = (promoCode: string, expiryDate?: string) => {
    setCurrentPromoCode(promoCode);
    setCurrentExpiryDate(expiryDate || '');
    setShowScratchCardModal(true);
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

  // Template version - no error state needed

  // Use mockup data directly
  const { order_details, customer_details, product_details, trakings_details, tracking_page } = mockupData;

  // Default reward for scratch card (since tracking_page doesn't have rewards_promotions)
  const defaultReward = {
    discount_code: "PARCEL20",
    valid_until: "2024-12-31",
    title: "Welcome Discount",
    description: "Get 20% off on your next order",
    discount_percentage: 20
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">

      {/* Template Indicator Banner */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-medium">
            🎯 <strong>TRACKING TEMPLATE PAGE</strong> - This is a demonstration template with sample data
          </p>
          <p className="text-xs mt-1 opacity-90">
            📱 <strong>Mockup OTP:</strong> Enter any 6-digit code to test authentication | 🗺️ <strong>Interactive Map:</strong> Shows delivery route | 🎁 <strong>Scratch Card:</strong> Interactive reward system
          </p>
        </div>
      </div>

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
              <img 
                src="/logo.png" 
                alt="ParcelAce Logo" 
                className="object-cover"
                style={{ 
                  height: '60px', 
                  width: '300px',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  imageRendering: 'crisp-edges',
                  imageRendering: '-webkit-optimize-contrast',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}
              />
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

        {/* Authentication Status Banner */}
        {isAuthenticated && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  ✅ Identity Verified Successfully
                </p>
                <p className="text-xs text-green-600 mt-1">
                  You can now submit feedback and ratings for your delivery experience
                </p>
              </div>
            </div>
          </div>
        )}



        {/* Hero Section - 2 Cards */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8 min-h-[500px]">
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
              <div className="grid lg:grid-cols-2 gap-6 h-full">
                {/* Map Section - Left Side */}
                <div className="h-full">
                  <div className="relative h-full">
                    <div 
                      id="tracking-map" 
                      className="w-full h-full min-h-[400px] rounded-lg bg-gray-100 border"
                      style={{ 
                        minHeight: '400px',
                        height: '100%',
                        aspectRatio: '4/3'
                      }}
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
                              PA
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

        {/* Unified Feedback Section - Dynamic from API */}
        {(tracking_page?.nps_section?.[0]?.show_nps_section || tracking_page?.nps_section?.[0]?.show_delivery_feedback_section) && (
          <Card 
            id="unified-feedback-section"
            className="mb-8 shadow-sm border-0 cursor-pointer transition-all hover:shadow-md" 
            style={{ background: 'linear-gradient(to bottom right, #FEFEFE, #F8FAFC)' }}
            onClick={() => handleSectionClick('unified')}
          >
            <CardContent className="p-8">
              {/* Authentication Status Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Share Your Experience</h3>
                    <p className="text-sm text-gray-600">Help us improve by providing your feedback</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isAuthenticated ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                      <Shield className="w-3 h-3 mr-1" />
                      Click to Verify
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Left Column - NPS Section */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-4">
                      How likely are you to recommend Parcelace to friends & family?
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                        <Button
                          key={score}
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isAuthenticated) {
                              setNpsScore(score);
                            } else {
                              handleSectionClick('unified');
                            }
                          }}
                          className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
                            npsScore === score 
                              ? getNpsSelectedColor(score)
                              : `${getNpsButtonColor(score)} hover:shadow-md`
                          }`}
                        >
                          {score}
                        </Button>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Not at all likely</span>
                      <span>Extremely likely</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-4">How was your delivery experience?</h4>
                    <div className="flex space-x-4">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <div key={rating} className="flex flex-col items-center space-y-2">
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isAuthenticated) {
                                setDeliveryRating(rating);
                              } else {
                                handleSectionClick('unified');
                              }
                            }}
                            className={`w-16 h-16 text-2xl rounded-full border-2 transition-all ${
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
                  </div>
                </div>
                
                {/* Right Column - Remarks and Submit */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-4">Additional Comments</h4>
                    <Textarea
                      placeholder={isAuthenticated ? "Share your thoughts about your experience (Max. 250 characters)" : "Please verify your identity first"}
                      value={feedback}
                      onChange={(e) => {
                        if (isAuthenticated) {
                          setFeedback(e.target.value.slice(0, 250));
                        }
                      }}
                      className={`resize-none h-40 border-2 focus:border-blue-400 ${
                        !isAuthenticated ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      rows={6}
                      disabled={!isAuthenticated}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">{feedback.length}/250</span>
                      <span className="text-xs text-gray-400">Optional</span>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isAuthenticated) {
                          // Submit both NPS and delivery rating
                          handleUnifiedSubmit();
                        } else {
                          handleSectionClick('unified');
                        }
                      }}
                      disabled={!isAuthenticated || (npsScore === null && deliveryRating === null)} 
                      className={`w-full py-3 text-lg font-medium ${
                        isAuthenticated 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isAuthenticated ? 'Submit Feedback' : 'Verify Identity to Submit'}
                    </Button>
                    
                    {isAuthenticated && (
                      <p className="text-xs text-gray-500 text-center mt-2">
                        You can submit feedback even if you only rate one section
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Authentication Prompt */}
              {!isAuthenticated && (
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-base font-medium text-blue-800 mb-1">
                        Verify your identity to submit feedback
                      </h5>
                      <p className="text-sm text-blue-600">
                        Click anywhere on this card to receive an OTP on your registered phone number. 
                        This ensures only genuine customers can provide feedback.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Scratch Card Section - At Bottom Before Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8 shadow-2xl border-4 border-yellow-400 bg-gradient-to-br from-yellow-50 to-pink-50">
          <CardHeader className="bg-gradient-to-r from-yellow-100 to-orange-100 border-b-4 border-yellow-300 text-center">
            <CardTitle className="flex flex-col sm:flex-row items-center justify-center text-2xl sm:text-3xl md:text-4xl font-black text-yellow-800 mb-2 px-4">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-0 sm:mr-4 text-yellow-600" />
              <span className="text-center">🎁 SCRATCH & WIN YOUR REWARD! 🎁</span>
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 mt-2 sm:mt-0 sm:ml-4 text-yellow-600" />
            </CardTitle>
            <p className="text-center text-yellow-700 text-lg sm:text-xl font-bold px-4">🎯 SCRATCH 60% TO REVEAL YOUR EXCLUSIVE PROMO CODE! 🎯</p>
          </CardHeader>
          <CardContent className="p-8 bg-gradient-to-br from-yellow-50 to-pink-50">
            <div className="max-w-4xl mx-auto">
              {/* Scratch Card Component */}
              <div className="mb-6 w-full scratch-card-container">
                <ScratchCard 
                  onReveal={handleScratchCardReveal} 
                  reward={defaultReward}
                />
              </div>
              
              {/* Instructions */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-400 rounded-xl p-6 shadow-lg">
                  <h4 className="font-bold text-blue-800 mb-3 text-xl">🎮 How to play:</h4>
                  <ul className="text-sm text-blue-700 space-y-2 text-left">
                    <li className="flex items-center">🖱️ <span className="ml-2">Use your mouse to scratch the gray area</span></li>
                    <li className="flex items-center">🎯 <span className="ml-2">Scratch at least 60% to reveal your reward</span></li>
                    <li className="flex items-center">⚠️ <span className="ml-2">Each scratch card can only be used once</span></li>
                    <li className="flex items-center">⏰ <span className="ml-2">Promo codes have specific expiry dates</span></li>
                    <li className="flex items-center">🎉 <span className="ml-2">Win amazing discounts on your next order!</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer - Dynamic from API */}
      {tracking_page?.footer_section?.[0] ? (
        <>
          {/* Main Footer */}
          <footer className="bg-gradient-to-r from-white to-blue-50 shadow-sm border-t border-gray-200 text-gray-800 py-4 mb-0" data-testid="api-footer">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                {/* Left Section - Follow Us + Social Icons */}
                <div className="flex items-center space-x-6">
                  <span className="font-medium text-gray-700">Follow Us</span>
                  <div className="flex space-x-4">
                    <a href="#" className="hover:text-blue-600 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                    <a href="#" className="hover:text-pink-500 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                      </svg>
                    </a>
                    <a href="#" className="hover:text-blue-600 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                    <a href="#" className="hover:text-blue-600 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                  </div>
                  <a href="#" className="hover:text-blue-600 transition-colors text-gray-700">Privacy Policy</a>
                </div>
                
                {/* Right Section - Powered by ParcelAce Logo */}
                <div className="flex items-center justify-end space-x-3">
                  <span className="text-gray-800 font-medium">Powered by</span>
                  <img 
                    src="/logo.png" 
                    alt="Powered by ParcelAce" 
                    className="object-cover"
                    style={{ 
                      height: '60px', 
                      width: '250px',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      imageRendering: 'crisp-edges',
                      imageRendering: '-webkit-optimize-contrast',
                      transform: 'translateZ(0)',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden'
                    }}
                  />
                </div>
              </div>
            </div>
          </footer>
          

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

      {/* Scratch Card Modal */}
      <ScratchCardModal
        isOpen={showScratchCardModal}
        onClose={() => setShowScratchCardModal(false)}
        promoCode={currentPromoCode}
        expiryDate={currentExpiryDate}
      />

      {/* OTP Modal */}
      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        awbNumber={awbNumber || ''}
        onOTPSubmit={handleOTPSubmit}
        onResendOTP={handleResendOTP}
        isLoading={otpLoading}
        error={otpError}
      />
    </div>
  );
};

export default TrackingTemplate;
