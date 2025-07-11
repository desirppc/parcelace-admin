
import React from 'react';
import { Eye, Download, Receipt, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import FinanceCounter from './FinanceCounter';
import FinanceTable from './FinanceTable';

const CODRemittance = () => {
  const counters = [
    {
      label: 'Total COD Received',
      value: '₹1,24,850',
      icon: Receipt,
      trend: { value: '12.5%', isPositive: true }
    },
    {
      label: 'COD Pending',
      value: '₹45,230',
      icon: Clock,
      trend: { value: '5.2%', isPositive: false }
    },
    {
      label: 'Early COD',
      value: '₹32,450',
      icon: TrendingUp,
      trend: { value: '18.3%', isPositive: true }
    },
    {
      label: 'This Month',
      value: '₹89,650',
      icon: Receipt,
      trend: { value: '8.7%', isPositive: true }
    }
  ];

  const codData = [
    {
      id: 'COD001',
      date: '2024-01-15',
      orderId: 'ORD-2024-001',
      amount: '₹2,450',
      status: 'Pending',
      customer: 'John Doe',
      phone: '+91 9876543210',
      location: 'Mumbai, MH'
    },
    {
      id: 'COD002',
      date: '2024-01-14',
      orderId: 'ORD-2024-002',
      amount: '₹1,890',
      status: 'Received',
      customer: 'Jane Smith',
      phone: '+91 9876543211',
      location: 'Delhi, DL'
    },
    {
      id: 'COD003',
      date: '2024-01-13',
      orderId: 'ORD-2024-003',
      amount: '₹3,200',
      status: 'In Transit',
      customer: 'Mike Johnson',
      phone: '+91 9876543212',
      location: 'Bangalore, KA'
    },
    {
      id: 'COD004',
      date: '2024-01-12',
      orderId: 'ORD-2024-004',
      amount: '₹1,650',
      status: 'Delivered',
      customer: 'Sarah Wilson',
      phone: '+91 9876543213',
      location: 'Chennai, TN'
    },
    {
      id: 'COD005',
      date: '2024-01-11',
      orderId: 'ORD-2024-005',
      amount: '₹2,890',
      status: 'Pending',
      customer: 'David Brown',
      phone: '+91 9876543214',
      location: 'Pune, MH'
    },
    {
      id: 'COD006',
      date: '2024-01-10',
      orderId: 'ORD-2024-006',
      amount: '₹4,200',
      status: 'Received',
      customer: 'Lisa Davis',
      phone: '+91 9876543215',
      location: 'Hyderabad, TS'
    },
    {
      id: 'COD007',
      date: '2024-01-09',
      orderId: 'ORD-2024-007',
      amount: '₹1,750',
      status: 'In Transit',
      customer: 'Chris Anderson',
      phone: '+91 9876543216',
      location: 'Kolkata, WB'
    },
    {
      id: 'COD008',
      date: '2024-01-08',
      orderId: 'ORD-2024-008',
      amount: '₹3,450',
      status: 'Delivered',
      customer: 'Emma Taylor',
      phone: '+91 9876543217',
      location: 'Ahmedabad, GJ'
    },
    {
      id: 'COD009',
      date: '2024-01-07',
      orderId: 'ORD-2024-009',
      amount: '₹2,100',
      status: 'Pending',
      customer: 'Robert Miller',
      phone: '+91 9876543218',
      location: 'Jaipur, RJ'
    },
    {
      id: 'COD010',
      date: '2024-01-06',
      orderId: 'ORD-2024-010',
      amount: '₹2,850',
      status: 'Received',
      customer: 'Olivia Garcia',
      phone: '+91 9876543219',
      location: 'Surat, GJ'
    },
    {
      id: 'COD011',
      date: '2024-01-05',
      orderId: 'ORD-2024-011',
      amount: '₹1,950',
      status: 'In Transit',
      customer: 'William Rodriguez',
      phone: '+91 9876543220',
      location: 'Lucknow, UP'
    },
    {
      id: 'COD012',
      date: '2024-01-04',
      orderId: 'ORD-2024-012',
      amount: '₹3,650',
      status: 'Delivered',
      customer: 'Sophia Martinez',
      phone: '+91 9876543221',
      location: 'Kanpur, UP'
    },
    {
      id: 'COD013',
      date: '2024-01-03',
      orderId: 'ORD-2024-013',
      amount: '₹2,300',
      status: 'Pending',
      customer: 'James Wilson',
      phone: '+91 9876543222',
      location: 'Nagpur, MH'
    },
    {
      id: 'COD014',
      date: '2024-01-02',
      orderId: 'ORD-2024-014',
      amount: '₹1,800',
      status: 'Received',
      customer: 'Isabella Lopez',
      phone: '+91 9876543223',
      location: 'Indore, MP'
    },
    {
      id: 'COD015',
      date: '2024-01-01',
      orderId: 'ORD-2024-015',
      amount: '₹4,100',
      status: 'Delivered',
      customer: 'Benjamin Lee',
      phone: '+91 9876543224',
      location: 'Thane, MH'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Pending': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
      'Received': 'bg-green-500/10 text-green-700 dark:text-green-400',
      'In Transit': 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
      'Delivered': 'bg-purple-500/10 text-purple-700 dark:text-purple-400'
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-500/10 text-gray-700'}>
        {status}
      </Badge>
    );
  };

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'orderId', label: 'Order ID' },
    { key: 'amount', label: 'Amount' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => getStatusBadge(value)
    },
    { key: 'customer', label: 'Customer' },
    { key: 'location', label: 'Location' },
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
        title="COD Remittance"
        data={codData}
        columns={columns}
        searchPlaceholder="Search by Order ID, Customer..."
      />
    </div>
  );
};

export default CODRemittance;
