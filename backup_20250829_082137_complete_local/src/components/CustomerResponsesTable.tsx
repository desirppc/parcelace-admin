import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import API_CONFIG, { apiRequest } from '@/config/api';

interface CustomerResponsesTableProps {
  searchQuery: string;
}

interface FeedbackData {
  shipment_id: number;
  awb: string;
  order_id: string;
  order_date: string;
  delivery_date: string;
  first_product_name: string;
  customer_name: string;
  remark: string | null;
  remark_score: string | null;
  rate: string | null;
}

const CustomerResponsesTable: React.FC<CustomerResponsesTableProps> = ({ searchQuery }) => {
  const [responses, setResponses] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredResponses, setFilteredResponses] = useState<FeedbackData[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    fetchFeedbackData();
  }, []);

  useEffect(() => {
    // Apply search filter
    if (searchQuery.trim()) {
      handleSearch(searchQuery.trim());
    } else {
      setFilteredResponses(responses);
    }
  }, [searchQuery, responses]);

  const handleSearch = async (query: string) => {
    // Check if the query looks like an AWB (numeric, 12-14 digits)
    const isAWB = /^\d{12,14}$/.test(query);
    
    if (isAWB) {
      // Search by AWB using API
      await searchByAWB(query);
    } else {
      // Local search for other fields
      const filtered = responses.filter(feedback => 
        feedback.customer_name?.toLowerCase().includes(query.toLowerCase()) ||
        feedback.order_id?.toLowerCase().includes(query.toLowerCase()) ||
        feedback.awb?.toLowerCase().includes(query.toLowerCase()) ||
        feedback.first_product_name?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredResponses(filtered);
    }
  };

  const searchByAWB = async (awb: string) => {
    try {
      setSearchLoading(true);
      const response = await apiRequest(API_CONFIG.ENDPOINTS.SHIPMENT_FEEDBACK_VIEW, 'POST', {
        awb: awb
      });
      
      if (response.success && response.data) {
        // Convert single response to array format for consistency
        const singleResponse = response.data;
        setFilteredResponses([singleResponse]);
        console.log('🔍 AWB Search Result:', singleResponse);
      } else {
        // No results found for this AWB
        setFilteredResponses([]);
        console.log('🔍 No AWB results found for:', awb);
      }
    } catch (error) {
      console.error('Error searching by AWB:', error);
      setFilteredResponses([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(API_CONFIG.ENDPOINTS.SHIPMENT_FEEDBACK, 'GET');
      
      if (response.success && response.data) {
        setResponses(response.data);
        setFilteredResponses(response.data);
      }
    } catch (error) {
      console.error('Error fetching feedback data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (rate: string | null) => {
    switch (rate) {
      case 'good':
        return <Badge className="bg-green-600 text-white">Good</Badge>;
      case 'bad':
        return <Badge className="bg-red-600 text-white">Bad</Badge>;
      default:
        return <Badge className="bg-gray-600 text-white">Not Rated</Badge>;
    }
  };

  const getNPSClassificationBadge = (remarkScore: string | null) => {
    if (!remarkScore) {
      return <span className="text-gray-400 text-sm">N/A</span>;
    }
    
    const score = parseInt(remarkScore);
    if (isNaN(score)) {
      return <span className="text-gray-400 text-sm">Invalid</span>;
    }
    
    if (score >= 9) {
      return <Badge className="bg-green-600 text-white">Promoter</Badge>;
    } else if (score >= 7) {
      return <Badge className="bg-yellow-600 text-white">Passive</Badge>;
    } else {
      return <Badge className="bg-red-600 text-white">Detractor</Badge>;
    }
  };

  const getRatingColor = (score: string | null) => {
    if (!score) return 'text-gray-500';
    const numScore = parseInt(score);
    if (numScore >= 9) return 'text-green-500';
    if (numScore >= 7) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Card className="bg-white border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-900 text-lg font-semibold">Customer Responses</h3>
          <div className="text-sm text-gray-600">
            Loading...
          </div>
        </div>
        <div className="animate-pulse">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                    <th key={i} className="text-left py-4 px-4">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[1, 2, 3].map((i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((j) => (
                      <td key={j} className="py-4 px-4">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-gray-900 text-lg font-semibold">Customer Responses</h3>
        <div className="text-sm text-gray-600">
          {searchLoading ? (
            <span className="text-blue-600">🔍 Searching AWB...</span>
          ) : (
            <>
              Total: <span className="font-semibold text-gray-900">{filteredResponses.length}</span> responses
              {searchQuery.trim() && (
                <span className="ml-2 text-blue-600">
                  (Search: "{searchQuery}")
                </span>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Information Note */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-800">
          <div className="font-semibold mb-1">📊 Data Explanation:</div>
          <div>• <strong>NPS Classification:</strong> Based on remark_score (1-10 scale) - Promoters (9-10), Passives (7-8), Detractors (1-6)</div>
          <div>• <strong>Delivery Rate:</strong> Customer's delivery experience feedback (good/bad) - separate from NPS scoring</div>
        </div>
      </div>
      
      {filteredResponses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <div className="text-gray-600 text-lg mb-2">
            {searchQuery.trim() ? 'No responses found for your search' : 'No customer responses yet'}
          </div>
          <div className="text-gray-500 text-sm max-w-md mx-auto">
            {searchQuery.trim() ? (
              searchQuery.match(/^\d{12,14}$/) ? (
                <>
                  No feedback found for AWB: <strong>{searchQuery}</strong><br/>
                  This AWB may not have any feedback yet, or it might not exist in our system.
                </>
              ) : (
                'Try adjusting your search terms or browse all responses. You can search by customer name, order ID, AWB, or product name.'
              )
            ) : (
              'Customer feedback will appear here once they start responding to your NPS surveys. The data will be automatically populated from your shipment feedback API.'
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wide">AWB</th>
                <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wide">Order ID</th>
                <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wide">Order Date</th>
                <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wide">Delivery Date</th>
                <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wide">First Product Name</th>
                <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wide">Customer Name</th>
                <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wide">Remark</th>
                <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wide">Remark Score</th>
                <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wide">NPS Classification</th>
                <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wide">Delivery Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredResponses.map((response) => (
                <tr key={response.shipment_id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="py-4 px-4">
                    <div className="text-gray-900 font-medium text-sm">{response.awb}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-gray-900 font-medium text-sm">{response.order_id}</div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-sm">
                    {formatDate(response.order_date)}
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-sm">
                    {formatDate(response.delivery_date)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-gray-900 text-sm">
                      {response.first_product_name || 'N/A'}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <div className="text-gray-900 font-medium">{response.customer_name || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-gray-900 max-w-xs">
                      {response.remark || 'No feedback provided'}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {response.remark_score ? (
                      <span className={`text-2xl font-bold ${getRatingColor(response.remark_score)}`}>
                        {response.remark_score}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">N/A</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {getNPSClassificationBadge(response.remark_score)}
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(response.rate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default CustomerResponsesTable;
