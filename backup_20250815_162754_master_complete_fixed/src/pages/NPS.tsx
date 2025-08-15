import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import NPSMetrics from '@/components/NPSMetrics';
import CustomerResponsesTable from '@/components/CustomerResponsesTable';

const NPS = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              NPS (Net Promoter Score)
            </h1>
            <p className="text-gray-600">
              NPS, or Net Promoter Score measures the willingness of customers to recommend your company's products or services to others.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by customer name, order ID, AWB, or product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Formula Card */}
        <Card className="bg-white border border-gray-200 p-4 mb-8 shadow-sm">
          <div className="text-gray-700 text-sm">
            % Positive - % Negative = NPS (Net Promoter Score)
          </div>
        </Card>

        {/* Summary Card */}
        <Card className="bg-white border border-gray-200 p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">📊</div>
              <div className="text-gray-900 font-semibold">Total Responses</div>
              <div className="text-gray-600 text-sm">Customer feedback collected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">⭐</div>
              <div className="text-gray-900 font-semibold">Rating System</div>
              <div className="text-gray-600 text-sm">1-10 scale with feedback</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">📝</div>
              <div className="text-gray-900 font-semibold">Detailed Feedback</div>
              <div className="text-gray-600 text-sm">Customer comments & scores</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">📅</div>
              <div className="text-gray-900 font-semibold">Date Tracking</div>
              <div className="text-gray-600 text-sm">Order & delivery dates</div>
            </div>
          </div>
        </Card>

        {/* NPS Metrics */}
        <NPSMetrics searchQuery={searchQuery} />

        {/* Customer Responses Table */}
        <CustomerResponsesTable searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default NPS;
