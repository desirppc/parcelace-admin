
import React from 'react';
import { Eye, Download, FileText, CreditCard, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import FinanceCounter from './FinanceCounter';
import FinanceTable from './FinanceTable';

const InvoiceManagement = () => {
  const counters = [
    {
      label: 'Total Invoices',
      value: '24',
      icon: FileText,
      trend: { value: '3', isPositive: true }
    },
    {
      label: 'Paid Invoices',
      value: '20',
      icon: CreditCard,
      trend: { value: '2', isPositive: true }
    },
    {
      label: 'Pending Amount',
      value: '₹45,670',
      icon: AlertCircle,
      trend: { value: '12.5%', isPositive: false }
    },
    {
      label: 'This Month',
      value: '₹1,23,450',
      icon: FileText,
      trend: { value: '8.3%', isPositive: true }
    }
  ];

  const invoiceData = [
    {
      id: 'INV001',
      invoiceNumber: 'INV-2024-001',
      monthYear: 'January 2024',
      amount: '₹12,450',
      status: 'Paid',
      dueDate: '2024-01-31',
      issueDate: '2024-01-01',
      paymentDate: '2024-01-28'
    },
    {
      id: 'INV002',
      invoiceNumber: 'INV-2023-012',
      monthYear: 'December 2023',
      amount: '₹15,670',
      status: 'Paid',
      dueDate: '2023-12-31',
      issueDate: '2023-12-01',
      paymentDate: '2023-12-29'
    },
    {
      id: 'INV003',
      invoiceNumber: 'INV-2023-011',
      monthYear: 'November 2023',
      amount: '₹18,900',
      status: 'Paid',
      dueDate: '2023-11-30',
      issueDate: '2023-11-01',
      paymentDate: '2023-11-25'
    },
    {
      id: 'INV004',
      invoiceNumber: 'INV-2023-010',
      monthYear: 'October 2023',
      amount: '₹22,340',
      status: 'Overdue',
      dueDate: '2023-10-31',
      issueDate: '2023-10-01',
      paymentDate: ''
    },
    {
      id: 'INV005',
      invoiceNumber: 'INV-2023-009',
      monthYear: 'September 2023',
      amount: '₹16,780',
      status: 'Paid',
      dueDate: '2023-09-30',
      issueDate: '2023-09-01',
      paymentDate: '2023-09-28'
    },
    {
      id: 'INV006',
      invoiceNumber: 'INV-2023-008',
      monthYear: 'August 2023',
      amount: '₹19,560',
      status: 'Paid',
      dueDate: '2023-08-31',
      issueDate: '2023-08-01',
      paymentDate: '2023-08-30'
    },
    {
      id: 'INV007',
      invoiceNumber: 'INV-2023-007',
      monthYear: 'July 2023',
      amount: '₹21,230',
      status: 'Paid',
      dueDate: '2023-07-31',
      issueDate: '2023-07-01',
      paymentDate: '2023-07-29'
    },
    {
      id: 'INV008',
      invoiceNumber: 'INV-2023-006',
      monthYear: 'June 2023',
      amount: '₹14,890',
      status: 'Pending',
      dueDate: '2023-06-30',
      issueDate: '2023-06-01',
      paymentDate: ''
    },
    {
      id: 'INV009',
      invoiceNumber: 'INV-2023-005',
      monthYear: 'May 2023',
      amount: '₹17,650',
      status: 'Paid',
      dueDate: '2023-05-31',
      issueDate: '2023-05-01',
      paymentDate: '2023-05-28'
    },
    {
      id: 'INV010',
      invoiceNumber: 'INV-2023-004',
      monthYear: 'April 2023',
      amount: '₹20,100',
      status: 'Paid',
      dueDate: '2023-04-30',
      issueDate: '2023-04-01',
      paymentDate: '2023-04-27'
    },
    {
      id: 'INV011',
      invoiceNumber: 'INV-2023-003',
      monthYear: 'March 2023',
      amount: '₹18,450',
      status: 'Paid',
      dueDate: '2023-03-31',
      issueDate: '2023-03-01',
      paymentDate: '2023-03-30'
    },
    {
      id: 'INV012',
      invoiceNumber: 'INV-2023-002',
      monthYear: 'February 2023',
      amount: '₹16,320',
      status: 'Paid',
      dueDate: '2023-02-28',
      issueDate: '2023-02-01',
      paymentDate: '2023-02-26'
    },
    {
      id: 'INV013',
      invoiceNumber: 'INV-2023-001',
      monthYear: 'January 2023',
      amount: '₹19,870',
      status: 'Paid',
      dueDate: '2023-01-31',
      issueDate: '2023-01-01',
      paymentDate: '2023-01-29'
    },
    {
      id: 'INV014',
      invoiceNumber: 'INV-2022-012',
      monthYear: 'December 2022',
      amount: '₹22,540',
      status: 'Paid',
      dueDate: '2022-12-31',
      issueDate: '2022-12-01',
      paymentDate: '2022-12-28'
    },
    {
      id: 'INV015',
      invoiceNumber: 'INV-2022-011',
      monthYear: 'November 2022',
      amount: '₹15,760',
      status: 'Paid',
      dueDate: '2022-11-30',
      issueDate: '2022-11-01',
      paymentDate: '2022-11-27'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Paid': 'bg-green-500/10 text-green-700 dark:text-green-400',
      'Pending': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
      'Overdue': 'bg-red-500/10 text-red-700 dark:text-red-400'
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-500/10 text-gray-700'}>
        {status}
      </Badge>
    );
  };

  const columns = [
    { 
      key: 'invoiceNumber', 
      label: 'Invoice Number',
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    { key: 'monthYear', label: 'Month/Year' },
    { key: 'amount', label: 'Amount' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => getStatusBadge(value)
    },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'issueDate', label: 'Issue Date' },
    { 
      key: 'paymentDate', 
      label: 'Payment Date',
      render: (value: string) => value || '-'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <FinanceCounter counters={counters} />
      <FinanceTable
        title="Invoice Management"
        data={invoiceData}
        columns={columns}
        searchPlaceholder="Search by Invoice Number, Month..."
      />
    </div>
  );
};

export default InvoiceManagement;
