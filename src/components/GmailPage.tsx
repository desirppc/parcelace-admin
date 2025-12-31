import React, { useState, useEffect } from 'react';
import { Mail, Loader2, CheckCircle, XCircle, RefreshCw, Trash2, Building2, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { googleOAuth, GmailConnection } from '@/utils/googleOAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const GmailPage = () => {
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [connections, setConnections] = useState<GmailConnection[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | undefined>(undefined);
  const [companyName, setCompanyName] = useState<string>('');
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
  const [connectionToDisconnect, setConnectionToDisconnect] = useState<GmailConnection | null>(null);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [expandedConnections, setExpandedConnections] = useState<Set<string>>(new Set());
  const [visibleTokens, setVisibleTokens] = useState<Set<string>>(new Set());
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize Google OAuth on mount
  useEffect(() => {
    const init = async () => {
      try {
        const initialized = await googleOAuth.initialize();
        if (!initialized) {
          toast({
            title: "Configuration Error",
            description: "Google OAuth is not configured. Please set VITE_GOOGLE_CLIENT_ID in environment variables.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error initializing Google OAuth:', error);
        toast({
          title: "Error",
          description: "Failed to initialize Google OAuth",
          variant: "destructive",
        });
      } finally {
        setInitializing(false);
      }
    };

    init();
    loadConnections();
  }, []);

  // Load connections when company filter changes
  useEffect(() => {
    loadConnections();
  }, [selectedCompanyId]);

  const loadConnections = () => {
    const allConnections = googleOAuth.getConnections();
    
    if (selectedCompanyId) {
      setConnections(allConnections.filter(c => c.company_id === selectedCompanyId));
    } else {
      setConnections(allConnections);
    }
  };

  const handleConnectGmail = async () => {
    if (!companyName.trim()) {
      toast({
        title: "Company Name Required",
        description: "Please enter a company name for this Gmail connection",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('🔗 Starting Gmail connection process...');
      console.log('Company ID:', selectedCompanyId);
      console.log('Company Name:', companyName.trim());
      
      const connection = await googleOAuth.requestAccess(selectedCompanyId, companyName.trim());
      
      if (connection) {
        console.log('✅ Connection successful:', {
          id: connection.id,
          email: connection.email,
          has_access_token: !!connection.access_token,
          has_refresh_token: !!connection.refresh_token
        });
        
        const hasRefreshToken = !!connection.refresh_token;
        toast({
          title: "Success",
          description: `Gmail account ${connection.email} connected successfully. ${hasRefreshToken ? 'Refresh token received.' : 'Token valid for 1 hour - will need to re-authenticate when expired.'}`,
        });
        setConnectDialogOpen(false);
        setCompanyName('');
        loadConnections();
      } else {
        throw new Error('Connection returned null');
      }
    } catch (error: any) {
      console.error('❌ Error connecting Gmail:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        error: error
      });
      
      toast({
        title: "Error",
        description: error.message || "Failed to connect Gmail. Please check the browser console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!connectionToDisconnect) return;

    setLoading(true);
    try {
      await googleOAuth.revokeAccess(connectionToDisconnect);
      toast({
        title: "Success",
        description: "Gmail account disconnected successfully",
      });
      setDisconnectDialogOpen(false);
      setConnectionToDisconnect(null);
      loadConnections();
    } catch (error: any) {
      console.error('Error disconnecting Gmail:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to disconnect Gmail",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshToken = async (connection: GmailConnection) => {
    setLoading(true);
    try {
      const updated = await googleOAuth.refreshAccessToken(connection);
      if (updated) {
        toast({
          title: "Success",
          description: "Token refreshed successfully",
        });
        loadConnections();
      }
    } catch (error: any) {
      console.error('Error refreshing token:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to refresh token. Please reconnect your account.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: GmailConnection['status']) => {
    switch (status) {
      case 'connected':
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge variant="outline" className="border-gray-300">
            <XCircle className="w-3 h-3 mr-1" />
            Disconnected
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
            Expired
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get unique companies from connections
  const companies = Array.from(
    new Map(
      connections
        .filter(c => c.company_id && c.company_name)
        .map(c => [c.company_id, { id: c.company_id, name: c.company_name }])
    ).values()
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text text-transparent">
              Gmail Integration
            </h1>
            <p className="text-sm text-gray-600 mt-1">Connect and manage Gmail accounts for multiple companies</p>
          </div>
          {companies.length > 0 && (
            <div className="flex items-center space-x-3">
              <Select
                value={selectedCompanyId?.toString() || 'all'}
                onValueChange={(value) => setSelectedCompanyId(value === 'all' ? undefined : parseInt(value))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id!.toString()}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading && connections.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm text-gray-600">Loading connections...</p>
            </div>
          </div>
        ) : connections.length === 0 ? (
          // Empty State - Connect with Gmail
          <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Connect with Gmail</CardTitle>
                <CardDescription className="text-base mt-2">
                  Connect your Gmail account to read and send emails. 
                  Support for multiple company accounts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Read emails from Gmail</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Send emails through Gmail</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Manage multiple company accounts</span>
                  </div>
                </div>
                <Button
                  onClick={() => setConnectDialogOpen(true)}
                  disabled={loading || initializing}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-12 text-base"
                  size="lg"
                >
                  {loading || initializing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {initializing ? 'Initializing...' : 'Connecting...'}
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Connect with Gmail
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Connections List
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Connected Accounts ({connections.length})
              </h2>
              <Button
                onClick={() => setConnectDialogOpen(true)}
                disabled={loading || initializing}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Mail className="w-4 h-4 mr-2" />
                Connect Another Account
              </Button>
            </div>

            <div className="grid gap-4">
              {connections.map((connection) => {
                const isExpanded = expandedConnections.has(connection.id);
                const isTokenVisible = visibleTokens.has(connection.id);
                const timeUntilExpiry = connection.expires_at 
                  ? Math.max(0, Math.floor((connection.expires_at - Date.now()) / 1000))
                  : 0;
                const hoursUntilExpiry = Math.floor(timeUntilExpiry / 3600);
                const minutesUntilExpiry = Math.floor((timeUntilExpiry % 3600) / 60);

                const copyToClipboard = (text: string, fieldName: string) => {
                  navigator.clipboard.writeText(text);
                  setCopiedField(`${connection.id}_${fieldName}`);
                  setTimeout(() => setCopiedField(null), 2000);
                  toast({
                    title: "Copied!",
                    description: `${fieldName} copied to clipboard`,
                  });
                };

                return (
                  <Card key={connection.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Mail className="w-5 h-5 text-gray-500" />
                            <div>
                              <h3 className="font-semibold text-gray-900">{connection.email}</h3>
                              {connection.company_name && (
                                <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                                  <Building2 className="w-3 h-3" />
                                  <span>{connection.company_name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-3">
                            <span>Status: {getStatusBadge(connection.status)}</span>
                            {connection.expires_at && (
                              <span>
                                Expires: {new Date(connection.expires_at).toLocaleString()} 
                                {timeUntilExpiry > 0 && (
                                  <span className="text-gray-500">
                                    {' '}({hoursUntilExpiry}h {minutesUntilExpiry}m remaining)
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newExpanded = new Set(expandedConnections);
                              if (isExpanded) {
                                newExpanded.delete(connection.id);
                              } else {
                                newExpanded.add(connection.id);
                              }
                              setExpandedConnections(newExpanded);
                            }}
                          >
                            {isExpanded ? 'Hide Details' : 'Show Details'}
                          </Button>
                          {connection.status === 'expired' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRefreshToken(connection)}
                              disabled={loading}
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Refresh
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setConnectionToDisconnect(connection);
                              setDisconnectDialogOpen(true);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Disconnect
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Token Details */}
                      {isExpanded && (
                        <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                          <h4 className="font-semibold text-gray-900 mb-4">Token Details</h4>
                          
                          {/* Connection ID */}
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-gray-500">Connection ID</Label>
                            <div className="flex items-center space-x-2">
                              <code className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono">
                                {connection.id}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(connection.id, 'Connection ID')}
                                className="h-8 w-8 p-0"
                              >
                                {copiedField === `${connection.id}_Connection ID` ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Access Token */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-medium text-gray-500">Access Token</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newVisible = new Set(visibleTokens);
                                  if (isTokenVisible) {
                                    newVisible.delete(connection.id);
                                  } else {
                                    newVisible.add(connection.id);
                                  }
                                  setVisibleTokens(newVisible);
                                }}
                                className="h-6 px-2 text-xs"
                              >
                                {isTokenVisible ? (
                                  <>
                                    <EyeOff className="w-3 h-3 mr-1" />
                                    Hide
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-3 h-3 mr-1" />
                                    Show
                                  </>
                                )}
                              </Button>
                            </div>
                            <div className="flex items-center space-x-2">
                              <code className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono break-all">
                                {isTokenVisible ? connection.access_token : '••••••••' + connection.access_token.slice(-20)}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(connection.access_token, 'Access Token')}
                                className="h-8 w-8 p-0"
                              >
                                {copiedField === `${connection.id}_Access Token` ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Refresh Token */}
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-gray-500">
                              Refresh Token {!connection.refresh_token && <span className="text-orange-600">(Not Available)</span>}
                            </Label>
                            {connection.refresh_token ? (
                              <div className="flex items-center space-x-2">
                                <code className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono break-all">
                                  {isTokenVisible ? connection.refresh_token : '••••••••' + connection.refresh_token.slice(-20)}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(connection.refresh_token!, 'Refresh Token')}
                                  className="h-8 w-8 p-0"
                                >
                                  {copiedField === `${connection.id}_Refresh Token` ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            ) : (
                              <div className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                                Refresh token not provided by Google. Token will expire in ~1 hour and require re-authentication.
                              </div>
                            )}
                          </div>

                          {/* Token Expiry */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs font-medium text-gray-500">Expires At</Label>
                              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm">
                                {connection.expires_at 
                                  ? new Date(connection.expires_at).toLocaleString()
                                  : 'N/A'}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-medium text-gray-500">Time Remaining</Label>
                              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm">
                                {timeUntilExpiry > 0 
                                  ? `${hoursUntilExpiry}h ${minutesUntilExpiry}m`
                                  : 'Expired'}
                              </div>
                            </div>
                          </div>

                          {/* Scope */}
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-gray-500">Scopes</Label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm">
                              <div className="flex flex-wrap gap-2">
                                {connection.scope?.split(' ').map((scope, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {scope}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Company Info */}
                          {connection.company_id && (
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs font-medium text-gray-500">Company ID</Label>
                                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm">
                                  {connection.company_id}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs font-medium text-gray-500">Company Name</Label>
                                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm">
                                  {connection.company_name || 'N/A'}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Connect Dialog */}
      <Dialog open={connectDialogOpen} onOpenChange={(open) => {
        setConnectDialogOpen(open);
        if (!open) {
          setCompanyName('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Gmail Account</DialogTitle>
            <DialogDescription>
              Enter a company name for this Gmail connection. This helps organize multiple accounts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name *</Label>
              <Input
                id="company-name"
                placeholder="e.g., Acme Corp, My Company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && companyName.trim()) {
                    handleConnectGmail();
                  }
                }}
              />
            </div>
            {selectedCompanyId && (
              <div className="text-sm text-gray-500">
                This connection will be associated with the selected company filter.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConnectDialogOpen(false);
                setCompanyName('');
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConnectGmail}
              disabled={loading || !companyName.trim() || initializing}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Connect
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disconnect Dialog */}
      <Dialog open={disconnectDialogOpen} onOpenChange={setDisconnectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect Gmail Account?</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect {connectionToDisconnect?.email}? 
              You will no longer be able to read or send emails through this account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDisconnectDialogOpen(false);
                setConnectionToDisconnect(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                'Disconnect'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GmailPage;

