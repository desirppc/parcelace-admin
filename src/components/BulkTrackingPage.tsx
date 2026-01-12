import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Loader2, 
  Copy, 
  Download, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface TrackingData {
  awb: string;
  bookingDate: string | null;
  pickupDate: string | null;
  deliveryDate: string | null;
  orderId: string | null;
  invoiceValue: number | null;
  shipmentMod: string | null;
  warehouseName: string | null;
  warehouseCity: string | null;
  warehouseState: string | null;
  customerName: string | null;
  customerCity: string | null;
  customerState: string | null;
  product: string | null;
  status: string | null;
  statusInstructions: string | null;
  error?: boolean;
  errorMessage?: string;
}

interface ProgressMetrics {
  processed: number;
  pending: number;
  elapsedTime: number;
  estimatedTime: number;
  remainingTime: number;
}

const BulkTrackingPage = () => {
  const { toast } = useToast();
  const [awbInput, setAwbInput] = useState('');
  const [trackingData, setTrackingData] = useState<TrackingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ProgressMetrics>({
    processed: 0,
    pending: 0,
    elapsedTime: 0,
    estimatedTime: 0,
    remainingTime: 0
  });
  const [startTime, setStartTime] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);

  // Update elapsed time every second
  useEffect(() => {
    if (isLoading && startTime) {
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const processed = progress.processed;
        const total = progress.processed + progress.pending;
        
        if (processed > 0 && total > 0) {
          const avgTimePerAWB = elapsed / processed;
          const estimatedTime = Math.floor(avgTimePerAWB * total);
          const remainingTime = Math.max(0, estimatedTime - elapsed);
          
          setProgress(prev => ({
            ...prev,
            elapsedTime: elapsed,
            estimatedTime,
            remainingTime
          }));
        } else {
          setProgress(prev => ({
            ...prev,
            elapsedTime: elapsed
          }));
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLoading, startTime, progress.processed, progress.pending]);

  const parseAWBInput = (input: string): string[] => {
    // Split by newlines or commas, trim whitespace, and filter empty strings
    const awbs = input
      .split(/[\n,]+/)
      .map(awb => awb.trim())
      .filter(awb => awb.length > 0);
    
    return awbs;
  };

  const formatDate = (dateString: string | null | undefined): string | null => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return format(date, 'dd/MM/yyyy');
    } catch {
      return null;
    }
  };

  const extractDateFromTrackingDetails = (
    trackingDetails: any[],
    statusToFind: string
  ): string | null => {
    if (!trackingDetails || !Array.isArray(trackingDetails)) return null;
    
    const statusToFindLower = statusToFind.toLowerCase();
    const statusEntry = trackingDetails.find(
      (detail: any) => {
        const detailStatus = detail.status?.toLowerCase() || '';
        // Match exact or contains the status keyword
        return detailStatus === statusToFindLower || 
               detailStatus.includes(statusToFindLower) ||
               statusToFindLower.includes(detailStatus);
      }
    );
    
    if (!statusEntry || !statusEntry.status_time) return null;
    
    return formatDate(statusEntry.status_time);
  };

  const getLatestStatus = (trackingDetails: any[]): { status: string | null; instructions: string | null } => {
    if (!trackingDetails || !Array.isArray(trackingDetails) || trackingDetails.length === 0) {
      return { status: null, instructions: null };
    }

    // Sort by status_time descending to get the latest entry
    const sorted = [...trackingDetails].sort((a, b) => {
      const timeA = a.status_time ? new Date(a.status_time).getTime() : 0;
      const timeB = b.status_time ? new Date(b.status_time).getTime() : 0;
      return timeB - timeA;
    });

    const latest = sorted[0];
    return {
      status: latest.status || null,
      instructions: latest.instructions || latest.status_instructions || null
    };
  };

  const fetchAWBData = async (awb: string): Promise<TrackingData> => {
    const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    
    if (!authToken) {
      throw new Error('Authentication token not found');
    }

    const apiUrl = `${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/shipments/${awb}/view-web`;
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.status && data.data) {
        const shipmentData = data.data;
        // Handle both 'tracking_details' and 'trakings_details' (API typo)
        const trackingDetails = shipmentData.tracking_details || shipmentData.trakings_details || [];
        
        const { status, instructions } = getLatestStatus(trackingDetails);
        
        return {
          awb: shipmentData.order_details?.awb || shipmentData.awb || awb,
          bookingDate: extractDateFromTrackingDetails(trackingDetails, 'Booked'),
          pickupDate: extractDateFromTrackingDetails(trackingDetails, 'In Transit'),
          deliveryDate: extractDateFromTrackingDetails(trackingDetails, 'Delivered'),
          orderId: shipmentData.order_details?.order_id || shipmentData.store_order?.order_id || shipmentData.order_id || null,
          invoiceValue: shipmentData.order_details?.total 
            ? parseFloat(shipmentData.order_details.total) 
            : shipmentData.store_order?.total 
            ? parseFloat(shipmentData.store_order.total) 
            : shipmentData.total_amount || null,
          shipmentMod: shipmentData.order_details?.shipment_mod || shipmentData.store_order?.shipment_mod || shipmentData.shipment_mod || null,
          warehouseName: shipmentData.warehouse_details?.warehouse_name || shipmentData.warehouse?.warehouse_name || null,
          warehouseCity: shipmentData.warehouse_details?.city || shipmentData.warehouse?.city || null,
          warehouseState: shipmentData.warehouse_details?.state || shipmentData.warehouse?.state || null,
          customerName: shipmentData.customer_details?.shipping_first_name 
            ? `${shipmentData.customer_details.shipping_first_name} ${shipmentData.customer_details.shipping_last_name || ''}`.trim()
            : shipmentData.customer_name || null,
          customerCity: shipmentData.customer_details?.shipping_city || shipmentData.city || null,
          customerState: shipmentData.customer_details?.shipping_state || shipmentData.state || null,
          product: shipmentData.product_details?.length > 0
            ? shipmentData.product_details.map((item: any) => item.name).filter(Boolean).join(', ')
            : shipmentData.store_order?.store_order_items
            ?.map((item: any) => item.name)
            .filter(Boolean)
            .join(', ') || null,
          status,
          statusInstructions: instructions,
          error: false
        };
      } else {
        return {
          awb,
          bookingDate: null,
          pickupDate: null,
          deliveryDate: null,
          orderId: null,
          invoiceValue: null,
          shipmentMod: null,
          warehouseName: null,
          warehouseCity: null,
          warehouseState: null,
          customerName: null,
          customerCity: null,
          customerState: null,
          product: null,
          status: null,
          statusInstructions: null,
          error: true,
          errorMessage: data.message || 'Failed to fetch tracking data'
        };
      }
    } catch (error) {
      console.error(`Error fetching data for AWB ${awb}:`, error);
      return {
        awb,
        bookingDate: null,
        pickupDate: null,
        deliveryDate: null,
        orderId: null,
        invoiceValue: null,
        shipmentMod: null,
        warehouseName: null,
        warehouseCity: null,
        warehouseState: null,
        customerName: null,
        customerCity: null,
        customerState: null,
        product: null,
        status: null,
        statusInstructions: null,
        error: true,
        errorMessage: 'Network error occurred'
      };
    }
  };

  const processAWBs = async (awbs: string[]) => {
    setIsLoading(true);
    setStartTime(Date.now());
    setTrackingData([]);
    isProcessingRef.current = true;

    const total = awbs.length;
    const results: TrackingData[] = [];

    for (let i = 0; i < awbs.length; i++) {
      if (!isProcessingRef.current) {
        break; // Allow cancellation
      }

      const awb = awbs[i];
      const result = await fetchAWBData(awb);
      results.push(result);

      setTrackingData([...results]);
      setProgress({
        processed: i + 1,
        pending: total - (i + 1),
        elapsedTime: Math.floor((Date.now() - (startTime || Date.now())) / 1000),
        estimatedTime: 0,
        remainingTime: 0
      });
    }

    setIsLoading(false);
    setStartTime(null);
    isProcessingRef.current = false;

    const successCount = results.filter(r => !r.error).length;
    const errorCount = results.filter(r => r.error).length;

    toast({
      title: 'Tracking Complete',
      description: `Processed ${total} AWBs: ${successCount} successful, ${errorCount} failed`,
      variant: errorCount > 0 ? 'default' : 'default'
    });
  };

  const handleTrack = async () => {
    const awbs = parseAWBInput(awbInput);

    if (awbs.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter at least one AWB number',
        variant: 'destructive'
      });
      return;
    }

    if (awbs.length > 50) {
      toast({
        title: 'Limit Exceeded',
        description: 'Maximum 50 AWBs allowed per request',
        variant: 'destructive'
      });
      return;
    }

    setProgress({
      processed: 0,
      pending: awbs.length,
      elapsedTime: 0,
      estimatedTime: 0,
      remainingTime: 0
    });

    await processAWBs(awbs);
  };

  const handleCancel = () => {
    isProcessingRef.current = false;
    setIsLoading(false);
    setStartTime(null);
    toast({
      title: 'Cancelled',
      description: 'Bulk tracking has been cancelled',
    });
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const convertToCSV = (): string => {
    const headers = [
      'AWB',
      'Booking Date',
      'Pickup Date',
      'Delivery Date',
      'Order Id',
      'Invoice Value',
      'Shipment Mod',
      'Warehouse Name',
      'Warehouse City',
      'Warehouse State',
      'Customer Name',
      'Customer City',
      'Customer State',
      'Product',
      'Status',
      'Status Instructions'
    ];

    const rows = trackingData.map(row => [
      row.awb || '',
      row.bookingDate || '',
      row.pickupDate || '',
      row.deliveryDate || '',
      row.orderId || '',
      row.invoiceValue?.toString() || '',
      row.shipmentMod || '',
      row.warehouseName || '',
      row.warehouseCity || '',
      row.warehouseState || '',
      row.customerName || '',
      row.customerCity || '',
      row.customerState || '',
      row.product || '',
      row.status || '',
      row.statusInstructions || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return csvContent;
  };

  const handleCopyToClipboard = async () => {
    if (trackingData.length === 0) {
      toast({
        title: 'No Data',
        description: 'No tracking data to copy',
        variant: 'destructive'
      });
      return;
    }

    try {
      const csvContent = convertToCSV();
      await navigator.clipboard.writeText(csvContent);
      toast({
        title: 'Success',
        description: 'Data copied to clipboard',
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive'
      });
    }
  };

  const handleDownloadCSV = () => {
    if (trackingData.length === 0) {
      toast({
        title: 'No Data',
        description: 'No tracking data to download',
        variant: 'destructive'
      });
      return;
    }

    try {
      const csvContent = convertToCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const today = format(new Date(), 'yyyy-MM-dd');
      link.setAttribute('href', url);
      link.setAttribute('download', `bulk-tracking-${today}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Success',
        description: 'File downloaded successfully',
      });
    } catch (error) {
      console.error('Error downloading CSV:', error);
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive'
      });
    }
  };

  const progressPercentage = progress.processed + progress.pending > 0
    ? (progress.processed / (progress.processed + progress.pending)) * 100
    : 0;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="w-6 h-6 text-purple-600" />
            <CardTitle className="text-2xl">Bulk Tracking</CardTitle>
          </div>
          <CardDescription>
            Track multiple shipments by AWB number (up to 50 AWBs per request)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="space-y-2">
            <Label htmlFor="awb-input">AWB Numbers</Label>
            <Textarea
              id="awb-input"
              placeholder="Enter AWB numbers separated by newlines or commas (e.g., AWB123456&#10;AWB789012 or AWB123456, AWB789012)"
              value={awbInput}
              onChange={(e) => setAwbInput(e.target.value)}
              className="min-h-[120px] font-mono"
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500">
              {parseAWBInput(awbInput).length} AWB(s) detected (max 50)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleTrack}
              disabled={isLoading || parseAWBInput(awbInput).length === 0}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:from-pink-600 hover:via-purple-600 hover:to-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Tracking...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Track AWBs
                </>
              )}
            </Button>
            {isLoading && (
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={!isLoading}
              >
                Cancel
              </Button>
            )}
          </div>

          {/* Progress Section */}
          {isLoading && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Progress</span>
                    <span className="text-gray-600">
                      {progress.processed} / {progress.processed + progress.pending} processed
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Processed</div>
                      <div className="font-semibold">{progress.processed}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Pending</div>
                      <div className="font-semibold">{progress.pending}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Elapsed Time</div>
                      <div className="font-semibold">{formatTime(progress.elapsedTime)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Remaining Time</div>
                      <div className="font-semibold">
                        {progress.remainingTime > 0 ? formatTime(progress.remainingTime) : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Section */}
          {trackingData.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Results ({trackingData.length} {trackingData.length === 1 ? 'AWB' : 'AWBs'})
                </h3>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopyToClipboard}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy CSV
                  </Button>
                  <Button
                    onClick={handleDownloadCSV}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Excel
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>AWB</TableHead>
                      <TableHead>Booking Date</TableHead>
                      <TableHead>Pickup Date</TableHead>
                      <TableHead>Delivery Date</TableHead>
                      <TableHead>Order Id</TableHead>
                      <TableHead>Invoice Value</TableHead>
                      <TableHead>Shipment Mod</TableHead>
                      <TableHead>Warehouse Name</TableHead>
                      <TableHead>Warehouse City</TableHead>
                      <TableHead>Warehouse State</TableHead>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Customer City</TableHead>
                      <TableHead>Customer State</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Status Instructions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trackingData.map((row, index) => (
                      <TableRow
                        key={`${row.awb}-${index}`}
                        className={row.error ? 'bg-red-50' : ''}
                      >
                        <TableCell className="font-mono font-medium">
                          {row.error ? (
                            <div className="flex items-center gap-2">
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span>{row.awb}</span>
                            </div>
                          ) : (
                            row.awb
                          )}
                        </TableCell>
                        <TableCell>{row.bookingDate || '-'}</TableCell>
                        <TableCell>{row.pickupDate || '-'}</TableCell>
                        <TableCell>{row.deliveryDate || '-'}</TableCell>
                        <TableCell>{row.orderId || '-'}</TableCell>
                        <TableCell>
                          {row.invoiceValue !== null
                            ? `₹${row.invoiceValue.toFixed(2)}`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {row.shipmentMod ? (
                            <Badge variant={row.shipmentMod === 'COD' ? 'destructive' : 'default'}>
                              {row.shipmentMod}
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>{row.warehouseName || '-'}</TableCell>
                        <TableCell>{row.warehouseCity || '-'}</TableCell>
                        <TableCell>{row.warehouseState || '-'}</TableCell>
                        <TableCell>{row.customerName || '-'}</TableCell>
                        <TableCell>{row.customerCity || '-'}</TableCell>
                        <TableCell>{row.customerState || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate" title={row.product || ''}>
                          {row.product || '-'}
                        </TableCell>
                        <TableCell>
                          {row.status ? (
                            <Badge variant="outline">{row.status}</Badge>
                          ) : row.error ? (
                            <Badge variant="destructive" title={row.errorMessage}>
                              Error
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={row.statusInstructions || ''}>
                          {row.statusInstructions || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkTrackingPage;

