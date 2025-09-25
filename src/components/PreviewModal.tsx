import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, ExternalLink, ArrowLeft, Video, Phone, MoreVertical } from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: string;
}

export function PreviewModal({ isOpen, onClose, status }: PreviewModalProps) {
  const getStatusContent = (status: string) => {
    switch (status) {
      case 'Order Confirmed':
        return {
          title: "Order Confirmed! 🎉",
          message: "Great news! Your order has been successfully confirmed and is being prepared for shipment.",
          details: "We're getting your items ready for dispatch. You'll receive another update once your order is packed and ready to ship.",
          illustration: "📦",
          color: "from-green-500 to-green-600"
        };
      case 'Packed':
        return {
          title: "Your Order is Packed! 📦",
          message: "Excellent! Your order has been carefully packed and is ready for dispatch.",
          details: "Our team has carefully packed your items with love and attention. Your package will be handed over to our shipping partner soon.",
          illustration: "📦",
          color: "from-blue-500 to-blue-600"
        };
      case 'Shipped':
        return {
          title: "Your Order is Shipped! 🚚",
          message: "Exciting news! Your order is now on its way to you and should arrive soon.",
          details: "Your package has left our warehouse and is in transit. You can track its journey in real-time using the tracking link below.",
          illustration: "🚚",
          color: "from-purple-500 to-purple-600"
        };
      case 'Out For Delivery':
        return {
          title: "Out for Delivery! 🚛",
          message: "Your package is out for delivery and will reach you today!",
          details: "Our delivery partner is on their way to your location. Please keep your phone handy for any delivery updates.",
          illustration: "🚛",
          color: "from-orange-500 to-orange-600"
        };
      case 'Arriving Early':
        return {
          title: "Arriving Early! ⚡",
          message: "Great news! Your order is arriving earlier than expected.",
          details: "Your package is making excellent progress and will reach you sooner than the estimated delivery date.",
          illustration: "⚡",
          color: "from-yellow-500 to-yellow-600"
        };
      case 'Delivery Delayed':
        return {
          title: "Delivery Update 📋",
          message: "We apologize, but there's a slight delay in your delivery due to unforeseen circumstances.",
          details: "We're working hard to get your package to you as soon as possible. We'll keep you updated on any changes.",
          illustration: "⏰",
          color: "from-red-500 to-red-600"
        };
      case 'Delivered':
        return {
          title: "It's Delivered! 😊",
          message: "Woohoo! Your order from Mamaearth has been Delivered Today.",
          details: "Your package has been successfully delivered. We hope you love your purchase! Thank you for choosing us.",
          illustration: "✅",
          color: "from-green-500 to-green-600"
        };
      case 'Picked Up':
        return {
          title: "Package Picked Up! 📬",
          message: "Your package has been picked up from our location and is on its way to you.",
          details: "The package is now in transit and will be delivered to your specified address soon.",
          illustration: "📬",
          color: "from-indigo-500 to-indigo-600"
        };
      default:
        return {
          title: "Order Update 📋",
          message: "Here's the latest update on your order status.",
          details: "We'll keep you informed about any changes to your order status.",
          illustration: "📋",
          color: "from-gray-500 to-gray-600"
        };
    }
  };

  const content = getStatusContent(status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4 h-8 w-8 p-0 z-10 bg-white/80 hover:bg-white rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-center p-4">
          <div className="flex justify-center mb-4">
          <div className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">{status}</span>
          </div>
        </div>

          {/* Mobile Phone Mockup */}
          <div className="relative mx-auto border-gray-800 bg-gray-900 border-[14px] rounded-[2.5rem] h-[640px] w-[320px]">
            {/* Dynamic Island */}
            <div className="w-[140px] h-[24px] bg-gray-900 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
            
            {/* Screen */}
            <div className="rounded-[2rem] overflow-hidden w-[292px] h-[612px] bg-white relative">
              
              {/* Status Bar */}
              <div className="flex justify-between items-center px-6 pt-4 pb-2 text-sm font-semibold text-gray-900 bg-white">
                <div>3:14</div>
                <div className="flex space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 8h1v8H2V8zm2 2h1v6H4v-6zm2 2h1v4H6v-4zm2 2h1v2H8v-2z"/>
                  </svg>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9z"/>
                    <path d="M8.5 16.5a5 5 0 0 1 7 0l-1.5 1.5a2.5 2.5 0 0 0-4 0l-1.5-1.5z"/>
                  </svg>
                  <div className="w-6 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              
              {/* Top Header */}
              <div className="bg-white px-4 py-2 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">ParcelAce</div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0L3.293 10.707a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-xs text-green-600 font-medium">Verified</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Background Area */}
              <div className="h-full bg-gray-50 relative">
                
                {/* Notification Popup */}
                <div className="absolute inset-4 top-8">
                  <div className="bg-white rounded-2xl p-6 max-w-xs mx-auto border border-gray-100">
                    
                    {/* Product Image */}
                    <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl p-4 mb-4">
                      <div className="flex justify-center items-center h-20">
                        <div className="relative">
                          {/* Dynamic illustration based on status */}
                          <div className={`w-16 h-16 bg-gradient-to-br ${content.color} rounded-lg transform rotate-12`}></div>
                          <div className={`absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br ${content.color} rounded-full`}></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Message Content */}
                    <div className="space-y-3 text-sm">
                      <p className="text-gray-800 leading-relaxed text-justify">
                        Hey! Just wanted to let you know that your order has been successfully booked
                      </p>
                      
                      <p className="text-gray-800 text-justify">
                        We'll make sure to deliver your orders with smile and speed 🚀
                      </p>
                      
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-gray-800 font-medium mb-2 text-justify">Here are your order details:</p>
                        
                        <div className="space-y-1 text-xs text-gray-700">
                          <div className="flex justify-between">
                            <span>Order ID:</span>
                            <span className="font-semibold">BUI9023</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Product Name:</span>
                            <span className="font-semibold">Heel Shoes</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Qty:</span>
                            <span className="font-semibold">1</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Order Amount:</span>
                            <span className="font-semibold">₹890</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Payment Mode:</span>
                            <span className="font-semibold">COD</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Track Button */}
                      <div className="pt-3">
                        <button className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors">
                          Track Current Status
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* WhatsApp Icon */}
          <div className="absolute bottom-6 right-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white animate-pulse">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </div>
          
          <div className="absolute -bottom-4 -right-4 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white animate-bounce">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
