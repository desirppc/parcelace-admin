import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Hash, FileText, Receipt, Package, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import CODRemittanceService, { CODRemittanceDetailsResponse, CODRemittanceDetail } from '@/services/codRemittanceService';

const CODRemittanceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<CODRemittanceDetailsResponse | null>(null);
  const [summary, setSummary] = useState({
    totalAWB: 0,
    totalValue: 0,
    pendingUTR: 0,
    completedUTR: 0
  });

  useEffect(() => {
    if (id) {
      fetchCODRemittanceDetails(parseInt(id));
    }
  }, [id]);

  const fetchCODRemittanceDetails = async (remittanceId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await CODRemittanceService.getCODRemittanceDetails(remittanceId);
      
      if (response.success && response.data) {
        setDetails(response.data);
        calculateSummary(response.data);
      } else {
        setError(response.error || 'Failed to fetch COD remittance details');
        toast({
          title: "Error",
          description: response.error || 'Failed to fetch COD remittance details',
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

  const calculateSummary = (data: CODRemittanceDetailsResponse) => {
    const totalAWB = data.cod_remittance_details.length;
    const totalValue = data.cod_remittance_details.reduce((sum, item) => {
      return sum + parseFloat(item.invoice_value.replace('₹', '').replace(',', ''));
    }, 0);
    const pendingUTR = data.cod_remittance_details.filter(item => !item.utr_no).length;
    const completedUTR = data.cod_remittance_details.filter(item => item.utr_no).length;

    setSummary({
      totalAWB,
      totalValue,
      pendingUTR,
      completedUTR
    });
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      // For now, we'll create a simple export of the current data
      const data = details?.cod_remittance_details || [];
      const csvContent = [
        ['AWB', 'Due Date', 'Invoice Value', 'UTR Number', 'Reference ID'],
        ...data.map(item => [
          item.awb,
          item.due_date,
          item.invoice_value,
          item.utr_no || 'Not Set',
          item.remittance.reference_id
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cod-remittance-${id}-details.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: `Export successful - ${format.toUpperCase()} file downloaded`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during export",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (detail: CODRemittanceDetail) => {
    if (detail.utr_no) {
      return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">UTR Added</Badge>;
    }
    return <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">Pending UTR</Badge>;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading COD remittance details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-red-500 mb-4">❌</div>
                <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => id && fetchCODRemittanceDetails(parseInt(id))}>
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

  if (!details) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No Data Found</h3>
              <p className="text-gray-600 mb-4">No COD remittance details available.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">

      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard/finance/cod-remittance')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to COD Remittances
          </Button>
          <div>
            <h1 className="text-2xl font-bold">COD Remittance Details</h1>
            <p className="text-gray-600">
              Reference ID: {details.cod_remittance_details[0]?.remittance.reference_id || 'N/A'}
            </p>

          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleExport('csv')}
            disabled={details.cod_remittance_details.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total AWB</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalAWB}</div>
            <p className="text-xs text-muted-foreground">
              Total shipments in this remittance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.totalValue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              Combined invoice value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending UTR</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary.pendingUTR}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting UTR numbers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed UTR</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.completedUTR}</div>
            <p className="text-xs text-muted-foreground">
              UTR numbers added
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            AWB Details
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Showing {details.pagination.total} AWB entries for this remittance
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>AWB Number</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Invoice Value</TableHead>
                  <TableHead>UTR Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reference ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {details.cod_remittance_details.map((detail) => (
                  <TableRow key={detail.id}>
                    <TableCell>
                      <div className="font-mono text-sm">{detail.awb}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {detail.due_date}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-green-600">₹{detail.invoice_value}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-gray-500" />
                        {detail.utr_no || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(detail)}
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm">{detail.remittance.reference_id}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Info */}
          {details.pagination.total > details.pagination.per_page && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Showing {details.pagination.total} of {details.pagination.total} entries
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  );
};

export default CODRemittanceDetails;
