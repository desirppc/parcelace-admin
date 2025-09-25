
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Download, Receipt, TrendingUp, Clock, RefreshCw, FileText, Calendar, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import CODRemittanceService, { CODRemittance, CODRemittanceResponse } from '@/services/codRemittanceService';
import FinanceCounter from './FinanceCounter';
import FinanceTable from './FinanceTable';

const CODRemittance = () => {
  const navigate = useNavigate();
  const [codRemittances, setCodRemittances] = useState<CODRemittance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total_page: 1,
    per_page: 50,
    total: 0
  });
  const [selectedRemittance, setSelectedRemittance] = useState<CODRemittance | null>(null);
  const [utrDialogOpen, setUtrDialogOpen] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [utrDate, setUtrDate] = useState('');
  const [updatingUtr, setUpdatingUtr] = useState(false);
  const { toast } = useToast();

  // Calculate summary data from API response
  const calculateSummaryData = (data: CODRemittanceResponse) => {
    const totalAmount = data.cod_remittances.reduce((sum, item) => {
      return sum + parseFloat(item.total_amount.replace('₹', '').replace(',', ''));
    }, 0);
    
    const pendingAmount = data.cod_remittances
      .filter(item => !item.check_payment)
      .reduce((sum, item) => {
        return sum + parseFloat(item.total_amount.replace('₹', '').replace(',', ''));
      }, 0);
    
    const paidAmount = data.cod_remittances
      .filter(item => item.check_payment)
      .reduce((sum, item) => {
        return sum + parseFloat(item.total_amount.replace('₹', '').replace(',', ''));
      }, 0);

    return {
      totalAmount: `₹${totalAmount.toLocaleString('en-IN')}`,
      pendingAmount: `₹${pendingAmount.toLocaleString('en-IN')}`,
      paidAmount: `₹${paidAmount.toLocaleString('en-IN')}`,
      totalCount: data.total
    };
  };

  const counters = [
    {
      label: 'Total COD Remittances',
      value: calculateSummaryData({ cod_remittances: codRemittances, pagination }).totalAmount,
      icon: Receipt,
      trend: { value: `${pagination.total}`, isPositive: true }
    },
    {
      label: 'Pending Payments',
      value: calculateSummaryData({ cod_remittances: codRemittances, pagination }).pendingAmount,
      icon: Clock,
      trend: { value: 'Pending', isPositive: false }
    },
    {
      label: 'Paid Amount',
      value: calculateSummaryData({ cod_remittances: codRemittances, pagination }).paidAmount,
      icon: TrendingUp,
      trend: { value: 'Paid', isPositive: true }
    },
    {
      label: 'Total AWB Count',
      value: codRemittances.reduce((sum, item) => sum + item.total_awb, 0).toString(),
      icon: FileText,
      trend: { value: 'AWB', isPositive: true }
    }
  ];

  const fetchCODRemittances = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await CODRemittanceService.getCODRemittances(page);
      
      if (response.success && response.data) {
        setCodRemittances(response.data.cod_remittances);
        setPagination(response.data.pagination);
      } else {
        setError(response.error || 'Failed to fetch COD remittances');
        toast({
          title: "Error",
          description: response.error || 'Failed to fetch COD remittances',
          variant: "destructive"
        });
      }
    } catch (err) {
      setError('An unexpected error occurred');
      toast({
        title: "Error",
        description: 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCODRemittances();
  }, []);

  const handlePageChange = (page: number) => {
    fetchCODRemittances(page);
  };

  const handleUpdateUTR = async () => {
    if (!selectedRemittance || !utrNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid UTR number",
        variant: "destructive"
      });
      return;
    }

    try {
      setUpdatingUtr(true);
      const response = await CODRemittanceService.updateUTRNumber(
        selectedRemittance.id,
        utrNumber.trim(),
        utrDate || undefined
      );

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "UTR number updated successfully",
        });
        
        // Refresh the data
        fetchCODRemittances(pagination.current_page);
        
        // Close dialog and reset form
        setUtrDialogOpen(false);
        setUtrNumber('');
        setUtrDate('');
        setSelectedRemittance(null);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update UTR number",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setUpdatingUtr(false);
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    try {
      const response = await CODRemittanceService.markAsPaid(id);
      
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "COD remittance marked as paid",
        });
        
        // Refresh the data
        fetchCODRemittances(pagination.current_page);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to mark as paid",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const response = await CODRemittanceService.exportCODRemittances(format);
      
      if (response.success && response.data) {
        // Create download link
        const url = window.URL.createObjectURL(response.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cod-remittances.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Success",
          description: `Export successful - ${format.toUpperCase()} file downloaded`,
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to export data",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during export",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (remittance: CODRemittance) => {
    if (remittance.check_payment) {
      return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">Paid</Badge>;
    }
    
    if (remittance.utr_no) {
      return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400">UTR Added</Badge>;
    }
    
    return <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">Pending</Badge>;
  };

  const columns = [
    { 
      key: 'reference_id', 
      label: 'Reference ID',
      render: (value: string) => (
        <div className="font-mono text-sm">{value}</div>
      )
    },
    { 
      key: 'total_awb', 
      label: 'Total AWB',
      render: (value: number) => (
        <div className="text-center font-medium">{value}</div>
      )
    },
    { 
      key: 'due_date', 
      label: 'Due Date',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          {value}
        </div>
      )
    },
    { 
      key: 'total_amount', 
      label: 'Amount',
      render: (value: string) => (
        <div className="font-semibold text-green-600">₹{value}</div>
      )
    },
    { 
      key: 'utr_no', 
      label: 'UTR Number',
      render: (value: string | null) => (
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-gray-500" />
          {value || '-'}
        </div>
      )
    },
    { 
      key: 'check_payment', 
      label: 'Status',
      render: (value: boolean, row: CODRemittance) => getStatusBadge(row)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: CODRemittance) => (
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 w-8 p-0"
            onClick={() => {
              setSelectedRemittance(row);
              setUtrDialogOpen(true);
            }}
            title="Update UTR"
          >
            <Hash className="h-4 w-4" />
          </Button>
          
          {!row.check_payment && (
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
              onClick={() => handleMarkAsPaid(row.id)}
              title="Mark as Paid"
            >
              <Receipt className="h-4 w-4" />
            </Button>
          )}
          
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 w-8 p-0"
            title="View Details"
            onClick={() => navigate(`/dashboard/finance/cod-remittance/${row.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading COD remittances...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-red-500 mb-4">❌</div>
                <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => fetchCODRemittances()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FinanceCounter counters={counters} />
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>COD Remittance</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleExport('csv')}
              disabled={codRemittances.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExport('excel')}
              disabled={codRemittances.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button onClick={() => fetchCODRemittances()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <FinanceTable
            title=""
            data={codRemittances}
            columns={columns}
            searchPlaceholder="Search by Reference ID, UTR..."
            pagination={pagination}
            onPageChange={handlePageChange}
            useExternalPagination={true}
          />
        </CardContent>
      </Card>

      {/* UTR Update Dialog */}
      <Dialog open={utrDialogOpen} onOpenChange={setUtrDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update UTR Number</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="utr-number">UTR Number *</Label>
              <Input
                id="utr-number"
                placeholder="Enter UTR number"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="utr-date">UTR Date (Optional)</Label>
              <Input
                id="utr-date"
                type="date"
                value={utrDate}
                onChange={(e) => setUtrDate(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setUtrDialogOpen(false)}
                disabled={updatingUtr}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateUTR}
                disabled={updatingUtr || !utrNumber.trim()}
              >
                {updatingUtr ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update UTR'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CODRemittance;
