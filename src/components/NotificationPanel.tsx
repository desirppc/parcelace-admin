
import React, { useState } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
}

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Order Shipped',
      message: 'Order #ORD-001 has been shipped successfully',
      time: '2 mins ago',
      type: 'success',
      read: false
    },
    {
      id: '2',
      title: 'Payment Received',
      message: 'Payment of ₹2,450 received for order #ORD-002',
      time: '15 mins ago',
      type: 'success',
      read: false
    },
    {
      id: '3',
      title: 'Low Balance Alert',
      message: 'Your wallet balance is below ₹1,000',
      time: '1 hour ago',
      type: 'warning',
      read: true
    },
    {
      id: '4',
      title: 'New Order',
      message: 'New order #ORD-003 received from Sarah Johnson',
      time: '2 hours ago',
      type: 'info',
      read: false
    },
    {
      id: '5',
      title: 'Delivery Completed',
      message: 'Order #ORD-001 delivered successfully',
      time: '3 hours ago',
      type: 'success',
      read: true
    }
  ]);

  const [showPanel, setShowPanel] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const clearAll = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      default: return 'text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        className="h-10 w-10 p-0 relative border-purple-200/50 dark:border-purple-800/50 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300"
        onClick={() => setShowPanel(!showPanel)}
      >
        <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-xs text-white font-medium">{unreadCount}</span>
          </div>
        )}
      </Button>

      {showPanel && (
        <div className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-lg shadow-xl border border-purple-200/30 dark:border-purple-800/30 z-50">
          <div className="p-4 border-b border-purple-200/30 dark:border-purple-800/30">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Notifications</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30"
                >
                  Clear All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPanel(false)}
                  className="h-6 w-6 p-0 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-b border-purple-200/20 dark:border-purple-800/20 last:border-b-0 ${
                  !notification.read ? 'bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className={`text-sm font-medium ${getTypeColor(notification.type)}`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-blue-600 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      className="h-6 w-6 p-0 ml-2 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showPanel && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowPanel(false)}
        />
      )}
    </div>
  );
};

export default NotificationPanel;
