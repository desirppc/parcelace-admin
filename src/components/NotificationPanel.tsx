
import React, { useState } from 'react';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Order Shipped',
    message: 'Order ORD-001 has been shipped successfully',
    time: '5 minutes ago',
    isRead: false,
    type: 'success'
  },
  {
    id: '2',
    title: 'Payment Received',
    message: 'Payment of ₹2,450 received for order ORD-002',
    time: '15 minutes ago',
    isRead: false,
    type: 'success'
  },
  {
    id: '3',
    title: 'Low Stock Alert',
    message: 'Wireless Headphones stock is running low (5 units left)',
    time: '1 hour ago',
    isRead: true,
    type: 'warning'
  },
  {
    id: '4',
    title: 'New Order',
    message: 'New order ORD-005 received from Mumbai',
    time: '2 hours ago',
    isRead: true,
    type: 'info'
  }
];

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast({
      title: "Notifications Cleared",
      description: "All notifications have been cleared successfully.",
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="relative hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-blue-600/10 hover:border-primary/20"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              {notifications.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllNotifications}
                  className="h-8 px-2 text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No notifications
              </div>
            ) : (
              <div className="space-y-0">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 border-b last:border-b-0 ${
                      !notification.isRead ? 'bg-muted/30' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getTypeColor(notification.type)}`} />
                          <p className="font-medium text-sm">{notification.title}</p>
                          {!notification.isRead && (
                            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-6 w-6 p-0 ml-2"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPanel;
