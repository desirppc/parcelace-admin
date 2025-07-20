
import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import FinanceCounter from './FinanceCounter';
import FinanceTable from './FinanceTable';
import { walletService, WalletTransaction as WalletTransactionType, WalletSummary } from '../services/walletService';
import API_CONFIG from '../config/api';

const WalletTransaction = () => {
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<WalletTransactionType[]>([]);
  const [walletSummary, setWalletSummary] = useState<WalletSummary>({
    total_credited: 0,
    total_debited: 0,
    current_balance: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        // Fetch wallet balance
        const balance = await walletService.getWalletBalance();
        setWalletBalance(balance.balance);
        
        // Fetch transactions
        const transactionData = await walletService.getWalletTransactions();
        console.log('📊 Received transactions:', transactionData);
        setTransactions(transactionData);
        
        // Fetch wallet summary
        const summary = await walletService.getWalletSummary();
        setWalletSummary(summary);
      } catch (err) {
        console.error('Error fetching wallet data:', err);
        setError('Failed to load wallet data');
      } finally {
        setLoading(false);
      }
    };
    fetchWalletData();
  }, []);

  // Calculate summary data from transactions
  const thisMonthTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    const now = new Date();
    return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonthTransactions.reduce((sum, tx) => {
    return tx.type === 'credit' ? sum + tx.credit : sum - tx.debit;
  }, 0);

  const counters = [
    {
      label: 'Current Balance',
      value: `₹${(walletBalance || 0).toLocaleString()}`,
      icon: Wallet,
      trend: { value: 'N/A', isPositive: true }
    },
    {
      label: 'Total Credits',
      value: `₹${(walletSummary.total_credited || 0).toLocaleString()}`,
      icon: TrendingUp,
      trend: { value: 'N/A', isPositive: true }
    },
    {
      label: 'Total Debits',
      value: `₹${(walletSummary.total_debited || 0).toLocaleString()}`,
      icon: TrendingDown,
      trend: { value: 'N/A', isPositive: false }
    },
    {
      label: 'This Month',
      value: `₹${(thisMonthTotal || 0).toLocaleString()}`,
      icon: CreditCard,
      trend: { value: 'N/A', isPositive: (thisMonthTotal || 0) >= 0 }
    }
  ];

  const getTypeBadge = (type: string) => {
    return type === 'credit' ? (
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
    const statusColors = {
      'completed': 'bg-green-500/10 text-green-700 dark:text-green-400',
      'pending': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
      'failed': 'bg-red-500/10 text-red-700 dark:text-red-400'
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || statusColors.pending}>
        {status}
      </Badge>
    );
  };

  const columns = [
    { 
      key: 'date', 
      label: 'Date',
      render: (value: string) => new Date(value).toLocaleDateString('en-IN')
    },
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => getTypeBadge(value)
    },
    {
      key: 'transaction_id',
      label: 'Transaction ID',
      render: (value: string) => (
        <span className="font-mono text-xs">{value || 'N/A'}</span>
      )
    },
    { 
      key: 'debit', 
      label: 'Debit',
      render: (value: number) => (
        <span className="text-red-600">
          {value > 0 ? `₹${value.toLocaleString()}` : '-'}
        </span>
      )
    },
    { 
      key: 'credit', 
      label: 'Credit',
      render: (value: number) => (
        <span className="text-green-600">
          {value > 0 ? `₹${value.toLocaleString()}` : '-'}
        </span>
      )
    },
    { 
      key: 'closing_balance', 
      label: 'Closing Balance',
      render: (value: number) => `₹${(value || 0).toLocaleString()}`
    },
    { key: 'description', label: 'Description' },
    { 
      key: 'status', 
      label: 'Status', 
      render: (value: string) => getStatusBadge(value) 
    },
    { key: 'source', label: 'Source' },
  ];

  if (loading) return <div className="p-8 text-center">Loading wallet data...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Wallet className="w-6 h-6 text-blue-500" /> Wallet Transactions
      </h2>
      <FinanceCounter counters={counters} />
      <FinanceTable
        columns={columns}
        data={transactions}
        title="Wallet Transactions"
      />
    </div>
  );
};

export default WalletTransaction;
