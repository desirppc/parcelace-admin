import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
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
  X,
  Navigation,
  Headphones,
  ChevronRight
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
import { TrackingService } from '@/services/trackingService';
import { useParams } from 'react-router-dom';

interface TrackingV2Props {
  trackingData?: {
    warehouse_details?: {
      city: string;
    };
    customer_details?: {
      shipping_city: string;
    };
  };
}

const TrackingV2: React.FC<TrackingV2Props> = ({ trackingData: propTrackingData }) => {
  const { toast } = useToast();
  const { awbNumber } = useParams<{ awbNumber: string }>();
  
  // State for API tracking data
  const [apiTrackingData, setApiTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use API data if available, otherwise use prop data
  const trackingData = apiTrackingData || propTrackingData;
  
  // Fetch tracking data from API
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
        setApiTrackingData(response.data);
        console.log('🔍 API Tracking Data:', response.data);
        console.log('🏭 Warehouse City:', response.data.warehouse_details?.city);
        console.log('🚚 Shipping City:', response.data.customer_details?.shipping_city);
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
  
  // City coordinates mapping
  const getCityCoordinates = (cityName: string): [number, number] => {
    const cityCoords: { [key: string]: [number, number] } = {
      'Mumbai': [19.0760, 72.8777],
      'Delhi': [28.6139, 77.2090],
      'Bangalore': [12.9716, 77.5946],
      'Hyderabad': [17.3850, 78.4867],
      'Ahmedabad': [23.0225, 72.5714],
      'Chennai': [13.0827, 80.2707],
      'Kolkata': [22.5726, 88.3639],
      'Pune': [18.5204, 73.8567],
      'Jaipur': [26.9124, 75.7873],
      'Lucknow': [26.8467, 80.9462],
      'Kanpur': [26.4499, 80.3319],
      'Nagpur': [21.1458, 79.0882],
      'Indore': [22.7196, 75.8577],
      'Thane': [19.2183, 72.9781],
      'Bhopal': [23.2599, 77.4126],
      'Visakhapatnam': [17.6868, 83.2185],
      'Pimpri-Chinchwad': [18.6298, 73.7997],
      'Patna': [25.5941, 85.1376],
      'Vadodara': [22.3072, 73.1812],
      'Gurgaon': [28.4595, 77.0266],
      'Coimbatore': [11.0168, 76.9558],
      'Rajkot': [22.3039, 70.8022],
      'Meerut': [28.9845, 77.7064],
      'Ranchi': [23.3441, 85.3096],
      'Noida': [28.5355, 77.3910],
      'Chandigarh': [30.7333, 76.7794],
      'Ghaziabad': [28.6692, 77.4538],
      'Faridabad': [28.4089, 77.3178],
      'Dehradun': [30.3165, 78.0322],
      'Mysore': [12.2958, 76.6394]
    };
    
    return cityCoords[cityName] || [28.6139, 77.2090]; // Default to Delhi if city not found
  };
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [deliveryRating, setDeliveryRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Support ticket states
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const [supportStep, setSupportStep] = useState(1); // 1: OTP, 2: Category, 3: Success
  const [otp, setOtp] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedIssue, setSelectedIssue] = useState('');
  const [ticketRemarks, setTicketRemarks] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [showNpsThankYou, setShowNpsThankYou] = useState(false);
  
  // Return journey states
  const [showReturnPopup, setShowReturnPopup] = useState(false);
  const [returnStep, setReturnStep] = useState(1); // 1: OTP, 2: Timing, 3: Address, 4: Processing, 5: Success, 6: Rating
  const [returnOtp, setReturnOtp] = useState('');
  const [pickupTiming, setPickupTiming] = useState('');
  const [sameAddress, setSameAddress] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderAddress, setSenderAddress] = useState('');
  const [senderPincode, setSenderPincode] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [returnAwb, setReturnAwb] = useState('');
  const [returnRating, setReturnRating] = useState<number | null>(null);

  // Ecom Return states
  const [showEcomReturnPopup, setShowEcomReturnPopup] = useState(false);
  const [ecomStep, setEcomStep] = useState(1); // 1: OTP, 2: Return/Exchange Selection
  const [ecomOtp, setEcomOtp] = useState('');
                  const [returnType, setReturnType] = useState(''); // 'return' or 'exchange'
                const [currentPage, setCurrentPage] = useState(0); // 0: reason, 1: products, 2: refund, 3: review
                const [returnReason, setReturnReason] = useState('');
                const [returnComment, setReturnComment] = useState('');
                const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
                const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
                const [refundMode, setRefundMode] = useState('');
                const [upiId, setUpiId] = useState('');
                const [payeeName, setPayeeName] = useState('');
                const [bankAccount, setBankAccount] = useState('');
                const [confirmBankAccount, setConfirmBankAccount] = useState('');
                const [ecomAwb, setEcomAwb] = useState('');
                const [ecomProcessing, setEcomProcessing] = useState(false);
                const [processingStep, setProcessingStep] = useState(1);
                
                // Exchange flow states
                const [exchangeStep, setExchangeStep] = useState(1); // 1: OTP, 2: products, 3: exchange details, 4: review, 5: success
                const [exchangeOtp, setExchangeOtp] = useState('');
                const [selectedExchangeProducts, setSelectedExchangeProducts] = useState<string[]>([]);
                const [exchangeDetails, setExchangeDetails] = useState<{[key: string]: any}>({});
                const [exchangeProcessing, setExchangeProcessing] = useState(false);
                const [exchangeProcessingStep, setExchangeProcessingStep] = useState(1);
                const [exchangeAwb, setExchangeAwb] = useState('');

  // Initialize map
  useEffect(() => {
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
      document.head.removeChild(script);
    };
  }, []);

  // Re-initialize map when tracking data changes
  useEffect(() => {
    if (mapLoaded && trackingData) {
      setTimeout(() => {
        initializeMap();
      }, 100);
    }
  }, [trackingData, mapLoaded]);

  const initializeMap = () => {
    // @ts-ignore
    if (typeof L !== 'undefined') {
      // Clear existing map if it exists
      const existingMap = document.getElementById('tracking-map');
      if (existingMap) {
        existingMap.innerHTML = '';
      }
      
      // Get actual cities from tracking data or use defaults
      const originCity = trackingData?.warehouse_details?.city || 'Delhi';
      const destinationCity = trackingData?.customer_details?.shipping_city || 'Mumbai';
      
      console.log('🗺️ Map Initialization:', {
        originCity,
        destinationCity,
        hasTrackingData: !!trackingData
      });
      
      // Get coordinates for origin and destination
      const originCoords = getCityCoordinates(originCity);
      const destinationCoords = getCityCoordinates(destinationCity);
      
      // Calculate center point between origin and destination
      const centerLat = (originCoords[0] + destinationCoords[0]) / 2;
      const centerLng = (originCoords[1] + destinationCoords[1]) / 2;
      
      // @ts-ignore
      const map = L.map('tracking-map').setView([centerLat, centerLng], 6);
      
      // @ts-ignore
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Origin (Warehouse)
      // @ts-ignore
      const originMarker = L.marker(originCoords).addTo(map);
      originMarker.bindPopup(`<b>Origin - ${originCity}</b><br>Warehouse Location`).openPopup();

      // Destination (Shipping City)
      // @ts-ignore
      const destinationMarker = L.marker(destinationCoords).addTo(map);
      destinationMarker.bindPopup(`<b>Destination - ${destinationCity}</b><br>Delivery Address`);

      // Route line from origin to destination
      // @ts-ignore
      const routeLine = L.polyline([originCoords, destinationCoords], {
        color: '#3B82F6',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 5'
      }).addTo(map);
      
      console.log('✅ Map initialized with:', {
        origin: `${originCity} (${originCoords})`,
        destination: `${destinationCity} (${destinationCoords})`,
        center: `[${centerLat}, ${centerLng}]`
      });
    }
  };

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

  // Support ticket handlers
  const handleSupportClick = () => {
    setShowSupportPopup(true);
    setSupportStep(1);
    setOtp('');
    setSelectedCategory('');
    setSelectedIssue('');
    setTicketRemarks('');
    setTicketId('');
  };

  const handleOtpSubmit = () => {
    if (otp === '123456') {
      // Check if this is from NPS submission
      if (npsScore !== null && selectedCategory === '' && selectedIssue === '') {
        // This is from NPS feedback - go directly to thank you
        setShowSupportPopup(false);
        setShowNpsThankYou(true);
        toast({
          title: "OTP Verified! ✅",
          description: "Thank you for your feedback",
        });
      } else {
        // This is from support ticket - continue to category selection
        setSupportStep(2);
        toast({
          title: "OTP Verified! ✅",
          description: "Please select your issue category",
        });
      }
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct OTP",
        variant: "destructive"
      });
    }
  };

  const handleResendOtp = () => {
    toast({
      title: "OTP Resent! 📱",
      description: "A new OTP has been sent to your registered number",
    });
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedIssue('');
  };

  const handleIssueSelect = (issue: string) => {
    setSelectedIssue(issue);
  };

  const handleTicketSubmit = () => {
    if (selectedCategory && selectedIssue) {
      // Generate ticket ID
      const newTicketId = `TKT${Date.now().toString().slice(-8)}`;
      setTicketId(newTicketId);
      setSupportStep(3);
      toast({
        title: "Ticket Raised Successfully! 🎫",
        description: `Your ticket ${newTicketId} has been submitted. We'll contact you soon.`,
      });
    } else {
      toast({
        title: "Incomplete Information",
        description: "Please select both category and issue type",
        variant: "destructive"
      });
    }
  };

  const getIssueOptions = () => {
    if (selectedCategory === 'pickup') {
      return [
        'Pickup not happening',
        'Fake remarks by courier partner',
        'Other pickup related issue'
      ];
    } else if (selectedCategory === 'delivery') {
      return [
        'Delivery not happening',
        'Wrong delivery address',
        'Other delivery related issue'
      ];
    }
    return [];
  };

  const handleArrangeReturn = () => {
    setShowReturnPopup(true);
    setReturnStep(1);
    setReturnOtp('');
    setPickupTiming('');
    setSameAddress('');
    setSenderName('');
    setSenderAddress('');
    setSenderPincode('');
    setSenderPhone('');
    setReturnAwb('');
    setReturnRating(null);
  };

  // Return journey handlers
  const handleReturnOtpSubmit = () => {
    if (returnOtp === '123456') {
      setReturnStep(2);
      toast({
        title: "OTP Verified! ✅",
        description: "Please select pickup timing",
      });
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct OTP",
        variant: "destructive"
      });
    }
  };

  const handleReturnResendOtp = () => {
    toast({
      title: "OTP Resent! 📱",
      description: "A new OTP has been sent to your registered number",
    });
  };

  const handleTimingSelection = (timing: string) => {
    setPickupTiming(timing);
    if (timing === 'now') {
      setReturnStep(3);
    } else {
      // For "later", we could add scheduling logic, but for now go to address
      setReturnStep(3);
    }
  };

  const handleAddressSelection = (same: string) => {
    setSameAddress(same);
    if (same === 'yes') {
      // Use same address, proceed to processing
      setReturnStep(4);
      processReturn();
    } else {
      // Need new address details, stay on step 3 to show form
    }
  };

  const handleReturnSubmit = () => {
    if (senderName && senderAddress && senderPincode && senderPhone) {
      setReturnStep(4);
      processReturn();
    } else {
      toast({
        title: "Incomplete Information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
    }
  };

  const processReturn = () => {
    // Generate AWB
    const awb = `RTN${Date.now().toString().slice(-6)}`;
    setReturnAwb(awb);
    
    // Simulate processing delay
    setTimeout(() => {
      setReturnStep(5);
    }, 5000);
  };

  const handleCopyReturnLink = () => {
    const trackingLink = `https://track.parcelace.com/${returnAwb}`;
    navigator.clipboard.writeText(trackingLink);
    toast({
      title: "Tracking Link Copied! 📋",
      description: "Return tracking link copied to clipboard",
    });
  };

  const handleReturnRatingSubmit = () => {
    if (returnRating !== null) {
      toast({
        title: "Thank you! ⭐",
        description: "Your rating helps us improve our service",
      });
      setShowReturnPopup(false);
    }
  };

  // Ecom Return Handlers
  const handleEcomOtpSubmit = () => {
    if (ecomOtp === '123456') {
      setEcomStep(2);
      setEcomOtp('');
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct OTP",
        variant: "destructive"
      });
    }
  };

  const handleEcomResendOtp = () => {
    toast({
      title: "OTP Resent! 📱",
      description: "Please check your mobile for the new OTP",
    });
  };

  const handleReturnTypeSelection = (type: string) => {
    setReturnType(type);
    if (type === 'return') {
      setCurrentPage(0);
      setEcomStep(3);
    } else if (type === 'exchange') {
      setExchangeStep(2); // Skip OTP step, go directly to product selection
      setEcomStep(2); // Stay on step 2 but show exchange flow
    }
  };

  const handleFileUpload = (files: File[]) => {
    if (uploadedFiles.length + files.length <= 3) {
      setUploadedFiles([...uploadedFiles, ...files]);
    } else {
      toast({
        title: "Upload Limit",
        description: "Maximum 3 files allowed",
        variant: "destructive"
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleProductToggle = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const validateUpi = () => {
    if (upiId && upiId.includes('@')) {
      toast({
        title: "UPI Validated! ✅",
        description: "UPI ID is valid",
      });
      return true;
    } else {
      toast({
        title: "Invalid UPI ID",
        description: "Please enter a valid UPI ID",
        variant: "destructive"
      });
      return false;
    }
  };

  const validateBank = () => {
    if (payeeName && bankAccount && confirmBankAccount && bankAccount === confirmBankAccount) {
      toast({
        title: "Bank Details Validated! ✅",
        description: "Bank account details are valid",
      });
      return true;
    } else {
      toast({
        title: "Invalid Bank Details",
        description: "Please check all fields and ensure account numbers match",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleEcomSubmit = async () => {
    setEcomProcessing(true);
    setProcessingStep(1);
    
    // Step 1: Raising return request
    await new Promise(resolve => setTimeout(resolve, 8000));
    setProcessingStep(2);
    
    // Step 2: Generating tracking number
    await new Promise(resolve => setTimeout(resolve, 5000));
    setEcomAwb(`ECM${Date.now().toString().slice(-6)}`);
    setEcomProcessing(false);
    setEcomStep(4);
  };

  const resetEcomFlow = () => {
    setShowEcomReturnPopup(false);
    setEcomStep(1);
    setEcomOtp('');
    setReturnType('');
    setCurrentPage(0);
    setReturnReason('');
    setReturnComment('');
    setUploadedFiles([]);
    setSelectedProducts([]);
    setRefundMode('');
    setUpiId('');
    setPayeeName('');
    setBankAccount('');
    setConfirmBankAccount('');
    setEcomAwb('');
    setEcomProcessing(false);
    setProcessingStep(1);
  };

  // Exchange flow handlers
  const handleExchangeOtpSubmit = () => {
    if (exchangeOtp.length === 6) {
      setExchangeStep(2);
      setExchangeOtp('');
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
    }
  };

  const handleExchangeResendOtp = () => {
    toast({
      title: "OTP Resent! 📱",
      description: "New OTP sent to your registered mobile number",
    });
  };

  const handleExchangeProductToggle = (productId: string) => {
    setSelectedExchangeProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleExchangeDetailChange = (productId: string, field: string, value: string) => {
    setExchangeDetails(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const handleExchangeSubmit = async () => {
    setExchangeProcessing(true);
    setExchangeProcessingStep(1);
    
    // Simulate processing steps
    setTimeout(() => {
      setExchangeProcessingStep(2);
      setTimeout(() => {
        setExchangeAwb('EX' + Math.random().toString(36).substr(2, 8).toUpperCase());
        setExchangeProcessing(false);
        setExchangeStep(5);
      }, 5000);
    }, 8000);
  };

  const resetExchangeFlow = () => {
    setExchangeStep(1);
    setExchangeOtp('');
    setSelectedExchangeProducts([]);
    setExchangeDetails({});
    setExchangeProcessing(false);
    setExchangeProcessingStep(1);
    setExchangeAwb('');
  };

  const handleNpsSubmit = () => {
    if (npsScore !== null) {
      setShowSupportPopup(true);
      setSupportStep(1);
      setOtp('');
      setSelectedCategory('');
      setSelectedIssue('');
      setTicketRemarks('');
      setTicketId('');
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

  const trackingEvents = [
    {
      status: "Order Received",
      description: "Your order has been received and is being processed",
      location: "Delhi Warehouse",
      timestamp: "2025-01-15T09:00:00Z",
      isCompleted: true,
      isActive: false,
    },
    {
      status: "Picked Up",
      description: "Package picked up from warehouse",
      location: "Delhi",
      timestamp: "2025-01-15T14:30:00Z",
      isCompleted: true,
      isActive: false,
    },
    {
      status: "In Transit",
      description: "Package is on the way to destination",
      location: "Gurgaon",
      timestamp: "2025-01-15T18:45:00Z",
      isCompleted: false,
      isActive: true,
    },
    {
      status: "Out for Delivery",
      description: "Package will be delivered today",
      location: "Jaipur",
      timestamp: null,
      isCompleted: false,
      isActive: false,
    },
    {
      status: "Delivered",
      description: "Package delivered successfully",
      location: "Jaipur",
      timestamp: null,
      isCompleted: false,
      isActive: false,
    },
  ];

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
        {/* Hero Section - 2 Cards */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Tracking Info Card - Same as V1 */}
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

                {/* Action Buttons */}
                <div className="pt-4 space-y-3">
                  <Button 
                    onClick={handleArrangeReturn}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 hover:from-blue-600 hover:to-indigo-700 font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Request return
                  </Button>
                  <Button 
                    onClick={() => setShowEcomReturnPopup(true)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 hover:from-green-600 hover:to-emerald-700 font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Ecom Return
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
                            <span className="text-white text-xs font-bold">D</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">Delhivery</h4>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">AWB</p>
                          <p className="text-xs font-medium text-gray-700">PP0001260168</p>
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
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{event.status}</span>
                                {event.isActive && <CheckCircle className="h-3 w-3 text-blue-500" />}
                                {event.isCompleted && <CheckCircle className="h-3 w-3 text-green-500" />}
                              </div>
                              <p className="text-xs text-gray-600 mb-1">{event.description}</p>
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
                  <span className="font-medium">5464081442</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Placed On:</span>
                  <span className="font-medium">07th Nov 2022</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Name of The Buyer:</span>
                  <span className="font-medium">Rajan Singh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone Number:</span>
                  <span className="font-medium">+91-9999999999</span>
                </div>
                <div className="mt-3">
                  <span className="text-gray-600 text-sm">Address:</span>
                  <p className="text-sm font-medium mt-1">2nd floor, New Apartment, A-Block, Sector-B, New Delhi, Delhi - 110010, India</p>
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
                    <tr className="border-b border-gray-100">
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <img src="/placeholder.svg" alt="Product" className="w-12 h-12 rounded object-cover bg-gray-100" />
                          <span className="font-medium">Shampoo</span>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600">2</td>
                      <td className="p-3 text-gray-600">349.00</td>
                      <td className="p-3 font-semibold text-gray-900">698.00</td>
                    </tr>
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
        <Card className="mb-8 shadow-lg border-0" style={{ background: 'linear-gradient(to bottom right, #FEFEFE, #F8FAFC)' }}>
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

        {/* Feedback Section */}
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

        {/* Rate Us Section */}
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
      </div>

      {/* Support Floating Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {/* Raise Ticket Button */}
        <div className="group">
          <Button
            onClick={handleSupportClick}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
          >
            <Headphones className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </Button>
          <div className="absolute bottom-16 right-0 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Raise Ticket
          </div>
        </div>
        
        {/* WhatsApp Support Button */}
        <div className="group">
          <Button
            onClick={handleWhatsAppSupport}
            className="bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
          >
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </Button>
          <div className="absolute bottom-16 right-0 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            WhatsApp Support
          </div>
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

      {/* Support Ticket Dialog */}
      {showSupportPopup && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-40"
          style={{ zIndex: 9998 }}
          onClick={() => setShowSupportPopup(false)}
        />
      )}
      <Dialog open={showSupportPopup} onOpenChange={setShowSupportPopup}>

      {/* NPS Thank You Dialog */}
      {showNpsThankYou && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-40"
          style={{ zIndex: 9998 }}
          onClick={() => setShowNpsThankYou(false)}
        />
      )}
      <Dialog open={showNpsThankYou} onOpenChange={setShowNpsThankYou}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto bg-white border-0 shadow-2xl backdrop-blur-sm"
          style={{ 
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center">
              <Headphones className="w-5 h-5" />
              Thank You!
            </DialogTitle>
          </DialogHeader>
          
          {/* NPS Thank You Message */}
          <div className="text-center space-y-6 p-2">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl mx-auto flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-700">
                Thank you for your valuable feedback!
              </h3>
              <p className="text-sm text-gray-600">
                Your feedback helps us improve our service and provide better experience for all our customers.
              </p>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-700 font-medium">
                  Your Rating: {npsScore}/10
                </p>
                {feedback && (
                  <p className="text-xs text-gray-600 mt-2">
                    <strong>Your Remarks:</strong> {feedback}
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={() => setShowNpsThankYou(false)}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto bg-white border-0 shadow-2xl backdrop-blur-sm"
          style={{ 
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center">
              <Headphones className="w-5 h-5" />
              {supportStep === 1 && "OTP Verification"}
              {supportStep === 2 && "Select Issue Category"}
              {supportStep === 3 && "Ticket Raised Successfully"}
            </DialogTitle>
          </DialogHeader>
          
          {/* Step 1: OTP Verification */}
          {supportStep === 1 && (
            <div className="space-y-6 p-2">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mx-auto flex items-center justify-center mb-4">
                  <Headphones className="w-10 h-10 text-white" />
                </div>
                <p className="text-sm text-gray-600">
                  We have sent an OTP on this number
                </p>
                <p className="font-medium text-lg">+91-******1852</p>
                <p className="text-sm text-gray-600">
                  to verify you as a buyer.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mx-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-xs text-yellow-800">💡</span>
                    </div>
                    <p className="text-sm text-yellow-800">
                      A OTP will be generated on your customer's number. Please enter OTP: <strong>123456</strong> for this demo.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-6 text-center">
                    Enter 6-digit verification code
                  </label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                      containerClassName="gap-2"
                    >
                      <InputOTPGroup className="gap-2">
                        {[0,1,2,3,4,5].map(i => (
                          <InputOTPSlot 
                            key={i} 
                            index={i} 
                            className="w-10 h-10 text-base border-2 border-gray-200 rounded-lg focus:border-blue-400 bg-white/80 backdrop-blur-sm" 
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button
                    onClick={handleOtpSubmit}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                    disabled={otp.length !== 6}
                  >
                    Verify OTP
                  </Button>
                  <Button
                    onClick={handleResendOtp}
                    variant="outline"
                    className="w-full h-11 border-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl font-medium"
                  >
                    Resend OTP
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Category & Issue Selection */}
          {supportStep === 2 && (
            <div className="space-y-4">
              {/* Category Selection */}
              <div className="space-y-3">
                <h4 className="font-medium">Select Category:</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={selectedCategory === 'pickup' ? 'default' : 'outline'}
                    onClick={() => handleCategorySelect('pickup')}
                    className={`h-auto p-4 flex flex-col gap-2 ${
                      selectedCategory === 'pickup' 
                        ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-2 border-blue-200' 
                        : 'border border-blue-100 bg-blue-25 hover:bg-blue-50 hover:border-blue-200'
                    }`}
                  >
                    <Package className="w-5 h-5" />
                    <span className="text-sm">Pickup Related Issue</span>
                  </Button>
                  <Button
                    variant={selectedCategory === 'delivery' ? 'default' : 'outline'}
                    onClick={() => handleCategorySelect('delivery')}
                    className={`h-auto p-4 flex flex-col gap-2 ${
                      selectedCategory === 'delivery' 
                        ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-2 border-blue-200' 
                        : 'border border-blue-100 bg-blue-25 hover:bg-blue-50 hover:border-blue-200'
                    }`}
                  >
                    <Truck className="w-5 h-5" />
                    <span className="text-sm">Delivery Related Issue</span>
                  </Button>
                </div>
              </div>

              {/* Issue Selection */}
              {selectedCategory && (
                <div className="space-y-3">
                  <h4 className="font-medium">Select Issue:</h4>
                  <div className="space-y-2">
                    {getIssueOptions().map((issue, index) => (
                      <Button
                        key={index}
                        variant={selectedIssue === issue ? 'default' : 'outline'}
                        onClick={() => handleIssueSelect(issue)}
                        className={`w-full justify-between text-left h-auto p-3 ${
                          selectedIssue === issue 
                            ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-2 border-blue-200' 
                            : 'border border-blue-100 bg-blue-25 hover:bg-blue-50 hover:border-blue-200'
                        }`}
                      >
                        <span className="text-sm">{issue}</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Remarks Section */}
              {selectedIssue && (
                <div className="space-y-3">
                  <h4 className="font-medium">Additional Remarks (Optional):</h4>
                  <Textarea
                    placeholder="Please provide additional details about your issue..."
                    value={ticketRemarks}
                    onChange={(e) => setTicketRemarks(e.target.value)}
                    className="min-h-[80px] border border-blue-100 focus:border-blue-300 bg-blue-25 rounded-lg"
                  />
                </div>
              )}

              {/* Submit Button */}
              {selectedCategory && selectedIssue && (
                <Button
                  onClick={handleTicketSubmit}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Raise Ticket
                </Button>
              )}
            </div>
          )}

          {/* Step 3: Success Message */}
          {supportStep === 3 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-700">
                  Ticket Raised Successfully!
                </h3>
                
                {/* Prominent Ticket ID Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-2">Your Ticket ID</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(ticketId);
                      toast({
                        title: "Ticket ID Copied! 📋",
                        description: `${ticketId} copied to clipboard`,
                      });
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 mx-auto"
                  >
                    <Copy className="w-4 h-4" />
                    {ticketId}
                  </button>
                  <p className="text-xs text-blue-600 mt-2">Click to copy</p>
                </div>

                <p className="text-sm text-gray-600">
                  Your ticket has been submitted successfully. Our support team will contact you soon.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg mt-4 text-left">
                  <p className="text-xs text-gray-500 mb-3 text-center">Ticket Details:</p>
                  <p className="text-sm mb-2"><strong>Category:</strong> {selectedCategory === 'pickup' ? 'Pickup Related Issue' : 'Delivery Related Issue'}</p>
                  <p className="text-sm mb-2"><strong>Issue:</strong> {selectedIssue}</p>
                  {ticketRemarks && <p className="text-sm"><strong>Remarks:</strong> {ticketRemarks}</p>}
                </div>
              </div>
              <Button
                onClick={() => setShowSupportPopup(false)}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Return/Exchange Dialog */}
      {showReturnPopup && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-40"
          style={{ zIndex: 9998 }}
          onClick={() => setShowReturnPopup(false)}
        />
      )}
      <Dialog open={showReturnPopup} onOpenChange={setShowReturnPopup}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto bg-white border-0 shadow-2xl backdrop-blur-sm"
          style={{ 
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center">
              <Package className="w-5 h-5" />
              {returnStep === 1 && "OTP Verification"}
              {returnStep === 2 && "Pickup Timing"}
              {returnStep === 3 && "Pickup Address"}
              {returnStep === 4 && "Processing Return"}
              {returnStep === 5 && "Return Confirmed"}
              {returnStep === 6 && "Rate Experience"}
            </DialogTitle>
          </DialogHeader>
          
                     {/* Step 1: OTP Verification */}
           {returnStep === 1 && (
             <div className="space-y-6 p-2">
               <div className="text-center space-y-3">
                 <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mx-auto flex items-center justify-center mb-4">
                   <Package className="w-10 h-10 text-white" />
                 </div>
                 <p className="text-sm text-gray-600">
                   We have sent an OTP on this number
                 </p>
                 <p className="font-medium text-lg">+91-******1852</p>
                 <p className="text-sm text-gray-600">
                   to verify your return request.
                 </p>
                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mx-2">
                   <div className="flex items-center gap-2">
                     <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                       <span className="text-xs text-yellow-800">💡</span>
                     </div>
                     <p className="text-sm text-yellow-800">
                       A OTP will be generated on your customer's number. Please enter OTP: <strong>123456</strong> for this demo.
                     </p>
                   </div>
                 </div>
               </div>
               
               <div className="space-y-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-6 text-center">
                     Enter 6-digit verification code
                   </label>
                   <div className="flex justify-center">
                     <InputOTP
                       maxLength={6}
                       value={returnOtp}
                       onChange={setReturnOtp}
                       containerClassName="gap-2"
                     >
                       <InputOTPGroup className="gap-2">
                         {[0,1,2,3,4,5].map(i => (
                           <InputOTPSlot 
                             key={i} 
                             index={i} 
                             className="w-10 h-10 text-base border-2 border-gray-200 rounded-lg focus:border-blue-400 bg-white/80 backdrop-blur-sm" 
                           />
                         ))}
                       </InputOTPGroup>
                     </InputOTP>
                   </div>
                 </div>
                 
                 <div className="space-y-3">
                   <Button
                     onClick={handleReturnOtpSubmit}
                     className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                     disabled={returnOtp.length !== 6}
                   >
                     Verify OTP
                   </Button>
                   <Button
                     onClick={handleReturnResendOtp}
                     variant="outline"
                     className="w-full h-11 border-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl font-medium"
                   >
                     Resend OTP
                   </Button>
                 </div>
               </div>
             </div>
           )}

          {/* Step 2: Pickup Timing */}
          {returnStep === 2 && (
            <div className="space-y-6 p-2">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">When do you want to arrange Reverse Pickup?</h3>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => handleTimingSelection('now')}
                  variant="outline"
                  className={`w-full h-auto p-4 text-left border-2 transition-all duration-200 ${
                    pickupTiming === 'now' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${pickupTiming === 'now' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <div>
                      <div className="font-medium">Arrange Now</div>
                      <div className="text-sm text-gray-500">Schedule pickup immediately</div>
                    </div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => handleTimingSelection('later')}
                  variant="outline"
                  className={`w-full h-auto p-4 text-left border-2 transition-all duration-200 ${
                    pickupTiming === 'later' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${pickupTiming === 'later' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <div>
                      <div className="font-medium">Arrange Later</div>
                      <div className="text-sm text-gray-500">Schedule pickup for later</div>
                    </div>
                  </div>
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setReturnStep(1)}
                  variant="outline"
                  className="w-20 h-12 border-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl font-medium"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setReturnStep(3)}
                  disabled={!pickupTiming}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Address Selection */}
          {returnStep === 3 && (
            <div className="space-y-6 p-2">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Pickup Address</h3>
              </div>
              
              {!sameAddress && (
                <div className="space-y-4">
                  <h4 className="font-medium text-center">Do you want to arrange pickup from same delivery location?</h4>
                  
                  {/* Current Delivery Address Display */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                    <p className="text-sm font-medium text-blue-700 mb-2">Current Delivery Address:</p>
                    <div className="text-sm text-gray-700">
                      <p className="font-medium">Prateek Sharma</p>
                      <p>123, Green Valley Apartments, Sector 12</p>
                      <p>Noida, Uttar Pradesh - 201301</p>
                      <p>Phone: +91-9876543210</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleAddressSelection('yes')}
                      variant="outline"
                      className="h-auto p-4 border-2 border-green-200 bg-green-50/50 hover:bg-green-100/70 hover:border-green-300"
                    >
                      <div className="text-center">
                        <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
                        <span className="text-sm font-medium">Yes</span>
                      </div>
                    </Button>
                    <Button
                      onClick={() => handleAddressSelection('no')}
                      variant="outline"
                      className="h-auto p-4 border-2 border-red-200 bg-red-50/50 hover:bg-red-100/70 hover:border-red-300"
                    >
                      <div className="text-center">
                        <X className="w-6 h-6 mx-auto mb-2 text-red-600" />
                        <span className="text-sm font-medium">No</span>
                      </div>
                    </Button>
                  </div>
                  
                  <div className="flex gap-3 mt-4">
                    <Button
                      onClick={() => setReturnStep(2)}
                      variant="outline"
                      className="w-20 h-12 border-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl font-medium"
                    >
                      Back
                    </Button>
                  </div>
                </div>
              )}

              {sameAddress === 'no' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-center mb-4">Enter Pickup Address Details</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Sender Name *</label>
                      <Input
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="Enter sender name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Address *</label>
                      <Textarea
                        value={senderAddress}
                        onChange={(e) => setSenderAddress(e.target.value)}
                        placeholder="Enter complete address"
                        className="mt-1 min-h-[60px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Pincode *</label>
                        <Input
                          value={senderPincode}
                          onChange={(e) => setSenderPincode(e.target.value)}
                          placeholder="Enter pincode"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Phone *</label>
                        <Input
                          value={senderPhone}
                          onChange={(e) => setSenderPhone(e.target.value)}
                          placeholder="Enter phone number"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button
                        onClick={() => setReturnStep(2)}
                        variant="outline"
                        className="w-20 h-12 border-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl font-medium"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleReturnSubmit}
                        className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        Request Pickup
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Processing */}
          {returnStep === 4 && (
            <div className="text-center space-y-6 p-2">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mx-auto flex items-center justify-center mb-4">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Processing Your Return Request
                </h3>
                <p className="text-sm text-gray-600">
                  Please wait while we are fetching details and creating reverse shipment.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    This usually takes a few seconds...
                  </p>
                </div>
              </div>
            </div>
          )}

                     {/* Step 5: Success */}
           {returnStep === 5 && (
             <div className="text-center space-y-6 p-2">
               <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                 <CheckCircle className="w-8 h-8 text-green-600" />
               </div>
               <div className="space-y-6">
                 <h3 className="text-lg font-semibold text-green-700">
                   Return Pickup Booked Successfully!
                 </h3>
                 
                 {/* Highlighted AWB Section */}
                 <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
                   <div className="space-y-4">
                     <div className="text-center">
                       <p className="text-sm text-gray-600 mb-2">AWB Number</p>
                       <button
                         onClick={() => {
                           navigator.clipboard.writeText(returnAwb);
                           toast({
                             title: "AWB Copied! 📋",
                             description: `${returnAwb} copied to clipboard`,
                           });
                         }}
                         className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-bold text-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 mx-auto"
                       >
                         <Copy className="w-5 h-5" />
                         {returnAwb}
                       </button>
                       <p className="text-xs text-blue-600 mt-2">Click to copy AWB</p>
                     </div>
                     
                     <div className="grid grid-cols-1 gap-3 text-left">
                       <div className="bg-white/50 rounded-lg p-3">
                         <p className="text-sm font-medium text-gray-700">Courier Partner:</p>
                         <p className="text-lg font-bold text-gray-900">Delhivery</p>
                       </div>
                       <div className="bg-white/50 rounded-lg p-3">
                         <p className="text-sm font-medium text-gray-700">Expected Pickup:</p>
                         <p className="text-sm font-semibold text-orange-600">Within 24-48 working hours</p>
                       </div>
                     </div>
                     
                     <Button
                       onClick={handleCopyReturnLink}
                       variant="outline"
                       className="w-full border-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl font-medium flex items-center gap-2 justify-center"
                     >
                       <Copy className="w-4 h-4" />
                       Copy Tracking Link
                     </Button>
                   </div>
                 </div>

                 {/* Rating Section - Auto-shown */}
                 <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
                   <div className="space-y-4">
                     <div className="text-center">
                       <Heart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                       <h4 className="text-lg font-semibold text-gray-800">
                         Rate Your Experience with ParcelAce
                       </h4>
                     </div>
                     
                     <div className="flex justify-center gap-3">
                       {[1, 2, 3, 4, 5].map((rating) => (
                         <Button
                           key={rating}
                           variant="outline"
                           size="sm"
                           onClick={() => setReturnRating(rating)}
                           className={`w-12 h-12 rounded-full text-base font-medium transition-all ${
                             returnRating === rating 
                               ? 'bg-purple-500 text-white border-purple-500'
                               : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                           }`}
                         >
                           {rating}
                         </Button>
                       ))}
                     </div>

                     <Button
                       onClick={handleReturnRatingSubmit}
                       disabled={returnRating === null}
                       className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                     >
                       Submit Rating
                     </Button>
                   </div>
                 </div>
               </div>
             </div>
           )}

          
        </DialogContent>
      </Dialog>

      {/* Ecom Return Dialog */}
      {showEcomReturnPopup && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-40"
          style={{ zIndex: 9998 }}
          onClick={() => setShowEcomReturnPopup(false)}
        />
      )}
      <Dialog open={showEcomReturnPopup} onOpenChange={setShowEcomReturnPopup}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-white border-0 shadow-2xl backdrop-blur-sm"
          style={{ 
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center">
              <ShoppingCart className="w-5 h-5" />
              {ecomStep === 1 && "OTP Verification"}
              {ecomStep === 2 && "Return Type"}
              {ecomStep === 3 && !ecomProcessing && (
                currentPage === 0 ? "Return Reason" : 
                currentPage === 1 ? "Select Products" : 
                currentPage === 2 ? "Refund Mode" : 
                "Review"
              )}
              {ecomProcessing && "Processing"}
              {ecomStep === 4 && "Return Confirmed"}
            </DialogTitle>
          </DialogHeader>
          
          {/* Step 1: OTP Verification */}
          {ecomStep === 1 && (
            <div className="space-y-6 p-2">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mx-auto flex items-center justify-center mb-4">
                  <ShoppingCart className="w-10 h-10 text-white" />
                </div>
                <p className="text-sm text-gray-600">
                  We have sent an OTP on this number
                </p>
                <p className="font-medium text-lg">+91-******1852</p>
                <p className="text-sm text-gray-600">
                  to verify your return request.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mx-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-xs text-yellow-800">💡</span>
                    </div>
                    <p className="text-sm text-yellow-800">
                      A OTP will be generated on your customer's number. Please enter OTP: <strong>123456</strong> for this demo.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-6 text-center">
                    Enter 6-digit verification code
                  </label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={ecomOtp}
                      onChange={setEcomOtp}
                      containerClassName="gap-2"
                    >
                      <InputOTPGroup className="gap-2">
                        {[0,1,2,3,4,5].map(i => (
                          <InputOTPSlot 
                            key={i} 
                            index={i} 
                            className="w-10 h-10 text-base border-2 border-gray-200 rounded-lg focus:border-blue-400 bg-white/80 backdrop-blur-sm" 
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button
                    onClick={handleEcomOtpSubmit}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                    disabled={ecomOtp.length !== 6}
                  >
                    Verify OTP
                  </Button>
                  <Button
                    onClick={handleEcomResendOtp}
                    variant="outline"
                    className="w-full h-11 border-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl font-medium"
                  >
                    Resend OTP
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Return Type Selection */}
          {ecomStep === 2 && !returnType && (
            <div className="space-y-6 p-2">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mx-auto flex items-center justify-center mb-4">
                  <ShoppingCart className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  What would you like to do?
                </h3>
              </div>
              
              <div className="space-y-4">
                <div 
                  onClick={() => handleReturnTypeSelection('return')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    returnType === 'return' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      returnType === 'return' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`} />
                    <div className="flex items-center gap-3">
                      <Package className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-800">Return</p>
                        <p className="text-sm text-gray-600">Get refund for your order</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div 
                  onClick={() => handleReturnTypeSelection('exchange')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    returnType === 'exchange' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      returnType === 'exchange' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`} />
                    <div className="flex items-center gap-3">
                      <ArrowRight className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-800">Exchange</p>
                        <p className="text-sm text-gray-600">Replace with different item</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Return Flow with Progress Bar */}
          {ecomStep === 3 && !ecomProcessing && (
            <div className="space-y-6 p-2">
              {/* Progress Bar */}
              <div className="flex items-center justify-between mb-6">
                {["Reason", "Products", "Refund", "Review"].map((step, index) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentPage >= index 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`ml-2 text-sm ${currentPage >= index ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                      {step}
                    </span>
                    {index < 3 && (
                      <div className={`w-8 h-0.5 mx-2 ${currentPage > index ? 'bg-blue-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Page 0: Reason Selection */}
              {currentPage === 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-center">Select Return Reason</h3>
                  
                  <div className="space-y-3">
                    {[
                      "Defective/Damaged Product",
                      "Wrong Product Delivered", 
                      "Product Not as Described",
                      "Size/Fit Issues",
                      "Changed Mind",
                      "Other"
                    ].map((reason) => (
                      <Button
                        key={reason}
                        onClick={() => setReturnReason(reason)}
                        variant="outline"
                        className={`w-full p-3 text-left border-2 transition-all ${
                          returnReason === reason 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        {reason}
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Additional Comments</label>
                    <Textarea
                      value={returnComment}
                      onChange={(e) => setReturnComment(e.target.value)}
                      placeholder="Please provide additional details about your return..."
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">Upload Images/Videos (Max 3)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={(e) => handleFileUpload(Array.from(e.target.files || []))}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload files</p>
                      </label>
                    </div>
                    
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">{file.name}</span>
                            <Button
                              onClick={() => handleRemoveFile(index)}
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => setCurrentPage(1)}
                    disabled={!returnReason}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
              )}

              {/* Page 1: Product Selection */}
              {currentPage === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-center">Select Products to Return</h3>
                  
                  <div className="space-y-3">
                    {[
                      { id: "1", name: "Wireless Bluetooth Headphones", price: "₹2,999", image: "/placeholder.svg" },
                      { id: "2", name: "USB-C Cable (2m)", price: "₹499", image: "/placeholder.svg" },
                      { id: "3", name: "Phone Case - Clear", price: "₹799", image: "/placeholder.svg" }
                    ].map((product) => (
                      <div key={product.id} className="flex items-center p-3 border rounded-lg">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleProductToggle(product.id)}
                          className="mr-3"
                        />
                        <img src={product.image} alt={product.name} className="w-12 h-12 rounded mr-3" />
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setCurrentPage(0)}
                      variant="outline"
                      className="w-20 h-12 border-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl font-medium"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentPage(2)}
                      disabled={selectedProducts.length === 0}
                      className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl disabled:opacity-50"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Page 2: Refund Mode Selection */}
              {currentPage === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-center">Select Refund Mode</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Select Refund Mode</label>
                      <select
                        value={refundMode}
                        onChange={(e) => setRefundMode(e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
                      >
                        <option value="">Choose refund mode...</option>
                        <option value="store_credit">Store Credit - Get credit in your wallet</option>
                        <option value="upi">UPI - Instant refund to UPI ID</option>
                        <option value="bank">Bank Account - Transfer to bank account</option>
                      </select>
                    </div>
                  </div>

                  {/* UPI Details */}
                  {refundMode === 'upi' && (
                    <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-700">UPI ID</label>
                      <div className="flex gap-2">
                        <Input
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="example@upi"
                          className="flex-1"
                        />
                        <Button
                          onClick={validateUpi}
                          variant="outline"
                          className="text-blue-600 border-blue-300"
                        >
                          Validate
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Bank Details */}
                  {refundMode === 'bank' && (
                    <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Payee Name</label>
                        <Input
                          value={payeeName}
                          onChange={(e) => setPayeeName(e.target.value)}
                          placeholder="Account holder name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Bank Account Number</label>
                        <Input
                          value={bankAccount}
                          onChange={(e) => setBankAccount(e.target.value)}
                          placeholder="Account number"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Confirm Account Number</label>
                        <div className="flex gap-2">
                          <Input
                            value={confirmBankAccount}
                            onChange={(e) => setConfirmBankAccount(e.target.value)}
                            placeholder="Confirm account number"
                            className="flex-1"
                          />
                          <Button
                            onClick={validateBank}
                            variant="outline"
                            className="text-blue-600 border-blue-300"
                          >
                            Validate
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setCurrentPage(1)}
                      variant="outline"
                      className="w-20 h-12 border-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl font-medium"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentPage(3)}
                      disabled={!refundMode}
                      className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl disabled:opacity-50"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Page 3: Review */}
              {currentPage === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-center">Review Return Details</h3>
                  
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-700">Return Reason:</p>
                      <p className="text-gray-600">{returnReason}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-700">Selected Products:</p>
                      <p className="text-gray-600">{selectedProducts.length} item(s) selected</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-700">Refund Mode:</p>
                      <p className="text-gray-600 capitalize">{refundMode.replace('_', ' ')}</p>
                    </div>
                    
                    {returnComment && (
                      <div>
                        <p className="font-medium text-gray-700">Additional Comments:</p>
                        <p className="text-gray-600">{returnComment}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setCurrentPage(2)}
                      variant="outline"
                      className="w-20 h-12 border-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl font-medium"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleEcomSubmit}
                      className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl"
                    >
                      Submit Return Request
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Processing Steps */}
          {ecomProcessing && (
            <div className="text-center space-y-6 p-2">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mx-auto flex items-center justify-center mb-4">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {processingStep === 1 && "Raising Return Request..."}
                  {processingStep === 2 && "Generating Tracking Number..."}
                </h3>
                <p className="text-sm text-gray-600">
                  {processingStep === 1 && "Please wait while we process your return request."}
                  {processingStep === 2 && "Almost done! Generating your tracking details."}
                </p>
                {processingStep === 1 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-700 font-medium">
                      ✅ We have successfully raised your request with Return ID: 12322
                    </p>
                  </div>
                )}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    This usually takes a few moments...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {ecomStep === 4 && (
            <div className="text-center space-y-6 p-2">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-green-700">
                  Return Request Confirmed!
                </h3>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">AWB Number</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(ecomAwb);
                          toast({
                            title: "AWB Copied! 📋",
                            description: `${ecomAwb} copied to clipboard`,
                          });
                        }}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-bold text-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 mx-auto"
                      >
                        <Copy className="w-5 h-5" />
                        {ecomAwb}
                      </button>
                      <p className="text-xs text-blue-600 mt-2">Click to copy AWB</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3 text-left">
                      <div className="bg-white/50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-700">Courier Partner:</p>
                        <p className="text-lg font-bold text-gray-900">Delhivery</p>
                      </div>
                      <div className="bg-white/50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-700">Expected Pickup:</p>
                        <p className="text-sm font-semibold text-orange-600">Within 24-48 working hours</p>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(`Track your return: ${ecomAwb}`);
                        toast({
                          title: "Tracking Link Copied! 🔗",
                          description: "Tracking link copied to clipboard",
                        });
                      }}
                      variant="outline"
                      className="w-full border-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl font-medium flex items-center gap-2 justify-center"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Tracking Link
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={resetEcomFlow}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* Exchange Flow */}
          {returnType === 'exchange' && ecomStep === 2 && (
            <div className="space-y-6 p-2">
              {/* Exchange Step 1: OTP */}
              {exchangeStep === 1 && (
                              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mx-auto flex items-center justify-center mb-4">
                  <ShoppingCart className="w-10 h-10 text-white" />
                </div>
                <p className="text-sm text-gray-600">
                  We have sent an OTP on this number
                </p>
                <p className="font-medium text-lg">+91-******1852</p>
                <p className="text-sm text-gray-600">
                  to verify your exchange request.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mx-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-xs text-yellow-800">💡</span>
                    </div>
                    <p className="text-sm text-yellow-800">
                      A OTP will be generated on your customer's number. Please enter OTP: <strong>123456</strong> for this demo.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-6 text-center">
                      Enter 6-digit verification code
                    </label>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={exchangeOtp}
                        onChange={setExchangeOtp}
                        containerClassName="gap-2"
                      >
                        <InputOTPGroup className="gap-2">
                          {[0,1,2,3,4,5].map(i => (
                            <InputOTPSlot 
                              key={i} 
                              index={i} 
                              className="w-10 h-10 text-base border-2 border-gray-200 rounded-lg focus:border-blue-400 bg-white/80 backdrop-blur-sm" 
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={handleExchangeOtpSubmit}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                      disabled={exchangeOtp.length !== 6}
                    >
                      Verify OTP
                    </Button>
                    <Button
                      onClick={handleExchangeResendOtp}
                      variant="outline"
                      className="w-full h-11 border-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl font-medium"
                    >
                      Resend OTP
                    </Button>
                  </div>
                </div>
              </div>
              )}

              {/* Exchange Step 2: Return Window Check & Product Selection */}
              {exchangeStep === 2 && (
                <div className="space-y-4">
                  {/* Return Window Check */}
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                      <Clock className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Return Window Check</h3>
                  </div>

                  {/* Middle Section - Eligibility Status */}
                  <div className="flex justify-center">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-800">✅ Eligible for Exchange/Return</p>
                          <p className="text-xs text-green-600">Order delivered on: 07th Nov 2022 (5 days ago)</p>
                          <p className="text-xs text-green-600">Return window: 7 days from delivery</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Uncomment below to test expired window scenario */}
                  {/* 
                  <div className="flex justify-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm">
                      <div className="flex items-center gap-2">
                        <X className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-red-800">❌ Sorry, your item is beyond exchange/return window</p>
                          <p className="text-xs text-red-600">Order delivered on: 01st Nov 2022 (12 days ago)</p>
                          <p className="text-xs text-red-600">Return window: 7 days from delivery</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  */}

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-center mb-4">Select Products for Exchange</h3>
                    
                    <div className="space-y-3">
                      {[
                        { id: "1", name: "Wireless Bluetooth Headphones", price: "₹2,999", image: "/placeholder.svg" },
                        { id: "2", name: "USB-C Cable (2m)", price: "₹499", image: "/placeholder.svg" },
                        { id: "3", name: "Phone Case - Clear", price: "₹799", image: "/placeholder.svg" }
                      ].map((product) => (
                        <div key={product.id} className="flex items-center p-3 border rounded-lg">
                          <input
                            type="checkbox"
                            checked={selectedExchangeProducts.includes(product.id)}
                            onChange={() => handleExchangeProductToggle(product.id)}
                            className="mr-3"
                          />
                          <img src={product.image} alt={product.name} className="w-12 h-12 rounded mr-3" />
                          <div className="flex-1">
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600">{product.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => setExchangeStep(3)}
                      disabled={selectedExchangeProducts.length === 0}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl disabled:opacity-50 mt-4"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Exchange Step 3: Exchange Details */}
              {exchangeStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-center">Exchange Details</h3>
                  
                  <div className="space-y-4">
                    {selectedExchangeProducts.map((productId) => {
                      const product = [
                        { id: "1", name: "Wireless Bluetooth Headphones", price: "₹2,999" },
                        { id: "2", name: "USB-C Cable (2m)", price: "₹499" },
                        { id: "3", name: "Phone Case - Clear", price: "₹799" }
                      ].find(p => p.id === productId);
                      
                      return (
                        <div key={productId} className="p-4 border rounded-lg space-y-3">
                          <h4 className="font-medium text-gray-800">{product?.name}</h4>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Exchange Reason</label>
                              <select
                                value={exchangeDetails[productId]?.reason || ''}
                                onChange={(e) => handleExchangeDetailChange(productId, 'reason', e.target.value)}
                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
                              >
                                <option value="">Select reason...</option>
                                <option value="size">Size/Fit Issues</option>
                                <option value="color">Color Preference</option>
                                <option value="defective">Defective/Damaged</option>
                                <option value="wrong">Wrong Product</option>
                                <option value="other">Other</option>
                              </select>
                            </div>

                            {/* Size Selection */}
                            {exchangeDetails[productId]?.reason === 'size' && (
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">New Size</label>
                                <select
                                  value={exchangeDetails[productId]?.newSize || ''}
                                  onChange={(e) => handleExchangeDetailChange(productId, 'newSize', e.target.value)}
                                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
                                >
                                  <option value="">Select size...</option>
                                  <option value="XS">XS</option>
                                  <option value="S">S</option>
                                  <option value="M">M</option>
                                  <option value="L">L</option>
                                  <option value="XL">XL</option>
                                  <option value="XXL">XXL</option>
                                </select>
                              </div>
                            )}

                            {/* Color Selection */}
                            {exchangeDetails[productId]?.reason === 'color' && (
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">New Color</label>
                                <select
                                  value={exchangeDetails[productId]?.newColor || ''}
                                  onChange={(e) => handleExchangeDetailChange(productId, 'newColor', e.target.value)}
                                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
                                >
                                  <option value="">Select color...</option>
                                  <option value="red">Red</option>
                                  <option value="blue">Blue</option>
                                  <option value="green">Green</option>
                                  <option value="black">Black</option>
                                  <option value="white">White</option>
                                  <option value="gray">Gray</option>
                                </select>
                              </div>
                            )}

                            {/* Other Product Selection */}
                            {exchangeDetails[productId]?.reason === 'other' && (
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Exchange for Different Product</label>
                                <select
                                  value={exchangeDetails[productId]?.newProduct || ''}
                                  onChange={(e) => handleExchangeDetailChange(productId, 'newProduct', e.target.value)}
                                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
                                >
                                  <option value="">Select product...</option>
                                  <option value="product1">Premium Wireless Headphones</option>
                                  <option value="product2">Fast Charging Cable</option>
                                  <option value="product3">Premium Phone Case</option>
                                  <option value="product4">Bluetooth Speaker</option>
                                </select>
                              </div>
                            )}

                            {/* Additional Comments */}
                            <div>
                              <label className="text-sm font-medium text-gray-700">Additional Comments</label>
                              <Textarea
                                value={exchangeDetails[productId]?.comments || ''}
                                onChange={(e) => handleExchangeDetailChange(productId, 'comments', e.target.value)}
                                placeholder="Please provide additional details..."
                                className="min-h-[60px]"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setExchangeStep(2)}
                      variant="outline"
                      className="w-20 h-12 border-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl font-medium"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setExchangeStep(4)}
                      disabled={!selectedExchangeProducts.every(id => exchangeDetails[id]?.reason)}
                      className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl disabled:opacity-50"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Exchange Step 4: Review */}
              {exchangeStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-center">Review Exchange Details</h3>
                  
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-700">Products for Exchange:</p>
                      <p className="text-gray-600">{selectedExchangeProducts.length} item(s) selected</p>
                    </div>
                    
                    {selectedExchangeProducts.map((productId) => {
                      const product = [
                        { id: "1", name: "Wireless Bluetooth Headphones" },
                        { id: "2", name: "USB-C Cable (2m)" },
                        { id: "3", name: "Phone Case - Clear" }
                      ].find(p => p.id === productId);
                      
                      return (
                        <div key={productId} className="p-3 bg-white rounded border">
                          <p className="font-medium text-sm">{product?.name}</p>
                          <p className="text-xs text-gray-600">
                            Reason: {exchangeDetails[productId]?.reason}
                            {exchangeDetails[productId]?.newSize && ` → Size: ${exchangeDetails[productId].newSize}`}
                            {exchangeDetails[productId]?.newColor && ` → Color: ${exchangeDetails[productId].newColor}`}
                            {exchangeDetails[productId]?.newProduct && ` → Product: ${exchangeDetails[productId].newProduct}`}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setExchangeStep(3)}
                      variant="outline"
                      className="w-20 h-12 border-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl font-medium"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleExchangeSubmit}
                      className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl"
                    >
                      Submit Exchange Request
                    </Button>
                  </div>
                </div>
              )}

              {/* Exchange Processing */}
              {exchangeProcessing && (
                <div className="text-center space-y-6 p-2">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mx-auto flex items-center justify-center mb-4">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {exchangeProcessingStep === 1 && "Processing Exchange Request..."}
                      {exchangeProcessingStep === 2 && "Generating Exchange Details..."}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {exchangeProcessingStep === 1 && "Please wait while we process your exchange request."}
                      {exchangeProcessingStep === 2 && "Almost done! Generating your exchange details."}
                    </p>
                    {exchangeProcessingStep === 1 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-700 font-medium">
                          ✅ We have successfully processed your exchange request with Exchange ID: 12345
                        </p>
                      </div>
                    )}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-700">
                        This usually takes a few moments...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Exchange Success */}
              {exchangeStep === 5 && (
                <div className="text-center space-y-6 p-2">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-green-700">
                      Exchange Request Confirmed!
                    </h3>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">Exchange AWB Number</p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(exchangeAwb);
                              toast({
                                title: "Exchange AWB Copied! 📋",
                                description: `${exchangeAwb} copied to clipboard`,
                              });
                            }}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-bold text-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 mx-auto"
                          >
                            <Copy className="w-5 h-5" />
                            {exchangeAwb}
                          </button>
                          <p className="text-xs text-blue-600 mt-2">Click to copy Exchange AWB</p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3 text-left">
                          <div className="bg-white/50 rounded-lg p-3">
                            <p className="text-sm font-medium text-gray-700">Courier Partner:</p>
                            <p className="text-lg font-bold text-gray-900">Delhivery</p>
                          </div>
                          <div className="bg-white/50 rounded-lg p-3">
                            <p className="text-sm font-medium text-gray-700">Expected Pickup:</p>
                            <p className="text-sm font-semibold text-orange-600">Within 24-48 working hours</p>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(`Track your exchange: ${exchangeAwb}`);
                            toast({
                              title: "Exchange Tracking Link Copied! 🔗",
                              description: "Exchange tracking link copied to clipboard",
                            });
                          }}
                          variant="outline"
                          className="w-full border-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl font-medium flex items-center gap-2 justify-center"
                        >
                          <Copy className="w-4 h-4" />
                          Copy Exchange Tracking Link
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={resetExchangeFlow}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* PostShip Section with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          {/* Main Content - 3 columns */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                  <Truck className="w-6 h-6 mr-3 text-blue-600" />
                  PostShip Services
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* PostShip Overview */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Complete Post-Delivery Solutions</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Our PostShip services provide comprehensive solutions for all your post-delivery needs, 
                      including returns, exchanges, customer support, and analytics to enhance your business operations.
                    </p>
                  </div>

                  {/* Service Cards */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">Returns Management</h4>
                            <p className="text-sm text-gray-600">Streamlined return process with tracking</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">Exchange Services</h4>
                            <p className="text-sm text-gray-600">Easy product exchanges and replacements</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Headphones className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">Customer Support</h4>
                            <p className="text-sm text-gray-600">24/7 support with ticket system</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Navigation className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">Analytics Dashboard</h4>
                            <p className="text-sm text-gray-600">Comprehensive business insights</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Features List */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-4">Key Features</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">Automated return processing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">Real-time tracking updates</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">Multi-courier integration</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">Customer feedback system</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">Performance analytics</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">Automated notifications</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1 column */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Brand Details Card */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg font-bold text-gray-800">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">B</span>
                    </div>
                    Brand Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Brand Logo */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <Truck className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-800">ParcelAce</h3>
                      <p className="text-sm text-gray-600">Your Logistics Partner</p>
                    </div>

                    {/* Brand Information */}
                    <div className="space-y-3">
                      <div className="bg-white/60 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Company</p>
                        <p className="text-sm font-medium text-gray-800">ParcelAce Logistics Pvt. Ltd.</p>
                      </div>
                      
                      <div className="bg-white/60 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Industry</p>
                        <p className="text-sm font-medium text-gray-800">E-commerce Logistics</p>
                      </div>
                      
                      <div className="bg-white/60 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Founded</p>
                        <p className="text-sm font-medium text-gray-800">2020</p>
                      </div>
                      
                      <div className="bg-white/60 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Headquarters</p>
                        <p className="text-sm font-medium text-gray-800">Mumbai, India</p>
                      </div>
                    </div>

                    {/* Brand Values */}
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-2">Core Values</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-xs text-gray-700">Reliability</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-xs text-gray-700">Innovation</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-xs text-gray-700">Customer Focus</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-xs text-gray-700">Sustainability</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-2">Contact</p>
                      <div className="space-y-2 text-xs text-gray-700">
                        <p>📧 support@parcelace.com</p>
                        <p>📞 +91-1800-123-4567</p>
                        <p>🌐 www.parcelace.com</p>
                      </div>
                    </div>

                    {/* Social Media */}
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-2">Follow Us</p>
                      <div className="flex justify-center space-x-3">
                        <a href="#" className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                          <Facebook className="w-4 h-4 text-white" />
                        </a>
                        <a href="#" className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors">
                          <Instagram className="w-4 h-4 text-white" />
                        </a>
                        <a href="#" className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center hover:bg-blue-800 transition-colors">
                          <Linkedin className="w-4 h-4 text-white" />
                        </a>
                        <a href="#" className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center hover:bg-sky-600 transition-colors">
                          <Twitter className="w-4 h-4 text-white" />
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-800">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Package className="w-4 h-4 mr-2" />
                      Create Return
                    </Button>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Request Exchange
                    </Button>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      <Headphones className="w-4 h-4 mr-2" />
                      Get Support
                    </Button>
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                      <Navigation className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Statistics Card */}
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-800">Performance Stats</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">98.5%</div>
                      <p className="text-xs text-gray-600">Delivery Success Rate</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">24h</div>
                      <p className="text-xs text-gray-600">Average Delivery Time</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">4.8★</div>
                      <p className="text-xs text-gray-600">Customer Rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

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

export default TrackingV2; 