import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { refreshSession, getSessionInfo } from '@/utils/authUtils';
import { useUser } from '@/contexts/UserContext';

interface SessionWarningProps {
  onDismiss?: () => void;
  onRefresh?: () => void;
}

const SessionWarning: React.FC<SessionWarningProps> = ({ 
  onDismiss, 
  onRefresh 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(getSessionInfo());
  const { toast } = useToast();
  const { validateSession } = useUser();

  useEffect(() => {
    // Check session status every minute
    const interval = setInterval(() => {
      const info = getSessionInfo();
      setSessionInfo(info);
      
      if (info.shouldShowWarning) {
        setIsVisible(true);
      }
    }, 60 * 1000);

    // Initial check
    const info = getSessionInfo();
    setSessionInfo(info);
    if (info.shouldShowWarning) {
      setIsVisible(true);
    }

    return () => clearInterval(interval);
  }, []);

  const handleRefreshSession = async () => {
    setIsRefreshing(true);
    try {
      const success = await refreshSession();
      if (success) {
        // Also validate with server
        await validateSession();
        
        toast({
          title: "Session Refreshed",
          description: "Your session has been extended successfully.",
          variant: "default",
        });
        
        setIsVisible(false);
        onRefresh?.();
      } else {
        toast({
          title: "Session Refresh Failed",
          description: "Unable to refresh your session. Please log in again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      toast({
        title: "Error",
        description: "An error occurred while refreshing your session.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 duration-300">
      <Card className="w-80 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-amber-800 dark:text-amber-200 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Session Warning</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-300 text-sm">
              <Clock className="h-4 w-4" />
              <span>
                Session active for {sessionInfo.sessionAgeMinutes} minutes
              </span>
            </div>
            
            <p className="text-amber-700 dark:text-amber-300 text-sm">
              Your session has been active for a while. Consider refreshing to maintain access.
            </p>
            
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={handleRefreshSession}
                disabled={isRefreshing}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isRefreshing ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh Session
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
                className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/40"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionWarning;
