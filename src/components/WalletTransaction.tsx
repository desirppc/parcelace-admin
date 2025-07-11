
import React from 'react';
import { Wallet, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import FinanceCounter from './FinanceCounter';
import FinanceTable from './FinanceTable';

const WalletTransaction = () => {
  const counters = [
    {
      label: 'Current Balance',
      value: '₹2,450',
      icon: Wallet,
      trend: { value: '8.2%', isPositive: true }
    },
    {
      label: 'Total Credits',
      value: '₹1,45,670',
      icon: TrendingUp,
      trend: { value: '15.3%', isPositive: true }
    },
    {
      label: 'Total Debits',
      value: '₹1,43,220',
      icon: TrendingDown,
      trend: { value: '12.1%', isPositive: false }
    },
    {
      label: 'This Month',
      value: '₹23,450',
      icon: CreditCard,
      trend: { value: '5.7%', isPositive: true }
    }
  ];

  const transactionData = [
    {
      id: 'TXN001',
      date: '2024-01-15 14:30',
      type: 'Credit',
      transactionId: 'PAY_001234567890',
      debit: '',
      credit: '₹5,000',
      closingBalance: '₹2,450',
      description: 'Wallet Recharge via UPI',
      paymentStatus: 'Success',
      source: 'UPI Payment'
    },
    {
      id: 'TXN002',
      date: '2024-01-15 12:15',
      type: 'Debit',
      transactionId: 'SHP_001234567891',
      debit: '₹2,550',
      credit: '',
      closingBalance: '₹0',
      description: 'Shipping charges for Order #ORD-001',
      paymentStatus: 'Success',
      source: 'Shipping'
    },
    {
      id: 'TXN003',
      date: '2024-01-14 16:45',
      type: 'Credit',
      transactionId: 'COD_001234567892',
      debit: '',
      credit: '₹2,890',
      closingBalance: '₹2,550',
      description: 'COD Settlement for Order #ORD-002',
      paymentStatus: 'Success',
      source: 'COD Settlement'
    },
    {
      id: 'TXN004',
      date: '2024-01-14 10:20',
      type: 'Debit',
      transactionId: 'SHP_001234567893',
      debit: '₹1,200',
      credit: '',
      closingBalance: '₹-340',
      description: 'Shipping charges for Order #ORD-003',
      paymentStatus: 'Success',
      source: 'Shipping'
    },
    {
      id: 'TXN005',
      date: '2024-01-13 18:30',
      type: 'Credit',
      transactionId: 'REF_001234567894',
      debit: '',
      credit: '₹450',
      closingBalance: '₹860',
      description: 'Refund for cancelled Order #ORD-004',
      paymentStatus: 'Success',
      source: 'Refund'
    },
    {
      id: 'TXN006',
      date: '2024-01-13 15:10',
      type: 'Debit',
      transactionId: 'SHP_001234567895',
      debit: '₹890',
      credit: '',
      closingBalance: '₹410',
      description: 'Shipping charges for Order #ORD-005',
      paymentStatus: 'Success',
      source: 'Shipping'
    },
    {
      id: 'TXN007',
      date: '2024-01-12 20:45',
      type: 'Credit',
      transactionId: 'PAY_001234567896',
      debit: '',
      credit: '₹10,000',
      closingBalance: '₹1,300',
      description: 'Wallet Recharge via Net Banking',
      paymentStatus: 'Success',
      source: 'Net Banking'
    },
    {
      id: 'TXN008',
      date: '2024-01-12 14:25',
      type: 'Debit',
      transactionId: 'SHP_001234567897',
      debit: '₹1,650',
      credit: '',
      closingBalance: '₹-8,700',
      description: 'Shipping charges for Order #ORD-006',
      paymentStatus: 'Success',
      source: 'Shipping'
    },
    {
      id: 'TXN009',
      date: '2024-01-11 11:30',
      type: 'Credit',
      transactionId: 'COD_001234567898',
      debit: '',
      credit: '₹3,200',
      closingBalance: '₹-7,050',
      description: 'COD Settlement for Order #ORD-007',
      paymentStatus: 'Success',
      source: 'COD Settlement'
    },
    {
      id: 'TXN010',
      date: '2024-01-11 09:15',
      type: 'Debit',
      transactionId: 'SHP_001234567899',
      debit: '₹2,100',
      credit: '',
      closingBalance: '₹-10,250',
      description: 'Shipping charges for Order #ORD-008',
      paymentStatus: 'Success',
      source: 'Shipping'
    },
    {
      id: 'TXN011',
      date: '2024-01-10 17:20',
      type: 'Credit',
      transactionId: 'PAY_001234567900',
      debit: '',
      credit: '₹7,500',
      closingBalance: '₹-8,150',
      description: 'Wallet Recharge via Credit Card',
      paymentStatus: 'Success',
      source: 'Credit Card'
    },
    {
      id: 'TXN012',
      date: '2024-01-10 13:45',
      type: 'Debit',
      transactionId: 'SHP_001234567901',
      debit: '₹1,850',
      credit: '',
      closingBalance: '₹-15,650',
      description: 'Shipping charges for Order #ORD-009',
      paymentStatus: 'Success',
      source: 'Shipping'
    },
    {
      id: 'TXN013',
      date: '2024-01-09 16:30',
      type: 'Credit',
      transactionId: 'COD_001234567902',
      debit: '',
      credit: '₹4,200',
      closingBalance: '₹-13,800',
      description: 'COD Settlement for Order #ORD-010',
      paymentStatus: 'Success',
      source: 'COD Settlement'
    },
    {
      id: 'TXN014',
      date: '2024-01-09 12:10',
      type: 'Debit',
      transactionId: 'SHP_001234567903',
      debit: '₹2,350',
      credit: '',
      closingBalance: '₹-18,000',
      description: 'Shipping charges for Order #ORD-011',
      paymentStatus: 'Success',
      source: 'Shipping'
    },
    {
      id: 'TXN015',
      date: '2024-01-08 19:25',
      type: 'Credit',
      transactionId: 'REF_001234567904',
      debit: '',
      credit: '₹750',
      closingBalance: '₹-15,650',
      description: 'Refund for cancelled Order #ORD-012',
      paymentStatus: 'Success',
      source: 'Refund'
    }
  ];

  const getTypeBadge = (type: string) => {
    return type === 'Credit' ? (
      <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
        Credit
      </Badge>
    ) : (
      <Badge className="bg-red-500/10 text-red-700 dark:text-red-400">
        Debit
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
        {status}
      </Badge>
    );
  };

  const columns = [
    { key: 'date', label: 'Date' },
    { 
      key: 'type', 
      label: 'Type',
      render: (value: string) => getTypeBadge(value)
    },
    { 
      key: 'transactionId', 
      label: 'Transaction ID',
      render: (value: string) => (
        <span className="font-mono text-xs">{value}</span>
      )
    },
    { key: 'debit', label: 'Debit' },
    { key: 'credit', label: 'Credit' },
    { key: 'closingBalance', label: 'Closing Balance' },
    { key: 'description', label: 'Description' },
    { 
      key: 'paymentStatus', 
      label: 'Status',
      render: (value: string) => getStatusBadge(value)
    },
    { key: 'source', label: 'Source' }
  ];

  return (
    <div className="space-y-6">
      <FinanceCounter counters={counters} />
      <FinanceTable
        title="Wallet Transactions"
        data={transactionData}
        columns={columns}
        searchPlaceholder="Search by Transaction ID, Description..."
      />
    </div>
  );
};

export default WalletTransaction;
