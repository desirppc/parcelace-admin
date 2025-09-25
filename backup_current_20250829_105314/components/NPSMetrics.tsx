import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import API_CONFIG, { apiRequest } from '@/config/api';

interface NPSMetricsProps {
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

const NPSMetrics: React.FC<NPSMetricsProps> = ({ searchQuery }) => {
  const [npsData, setNpsData] = useState({
    score: 0.00,
    responses: 0,
    satisfaction: {
      positive: { percentage: 0.00, count: 0 },
      neutral: { percentage: 0.00, count: 0 },
      negative: { percentage: 0.00, count: 0 }
    }
  });
  const [loading, setLoading] = useState(true);
  const [totalResponses, setTotalResponses] = useState(0);

  useEffect(() => {
    fetchFeedbackData();
  }, [searchQuery]);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(API_CONFIG.ENDPOINTS.SHIPMENT_FEEDBACK, 'GET');
      
      console.log('🌐 API Response:', response);
      
      if (response.success && response.data) {
        let feedbackData: FeedbackData[] = response.data;
        
        // Validate data structure
        if (!Array.isArray(feedbackData)) {
          console.error('❌ Invalid data structure: expected array, got:', typeof feedbackData);
          return;
        }
        
        // Log the first few items to verify structure
        console.log('📋 Sample feedback data:', feedbackData.slice(0, 3));
        
        // Apply search filter if searchQuery exists
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          feedbackData = feedbackData.filter(feedback => 
            feedback.customer_name?.toLowerCase().includes(query) ||
            feedback.order_id?.toLowerCase().includes(query) ||
            feedback.awb?.toLowerCase().includes(query) ||
            feedback.first_product_name?.toLowerCase().includes(query)
          );
        }

        // Calculate NPS metrics based ONLY on remark_score (ignore rate field)
        const totalCount = feedbackData.length;
        let ratedResponses = 0; // Only count responses with remark_score
        let positiveCount = 0;
        let neutralCount = 0;
        let negativeCount = 0;

        // Calculate NPS metrics based ONLY on remark_score (ignore rate field)
        feedbackData.forEach(feedback => {
          // Validate feedback object structure
          if (!feedback || typeof feedback !== 'object') {
            console.warn('⚠️ Invalid feedback object:', feedback);
            return;
          }
          
          if (feedback.remark_score) {
            ratedResponses++; // Count only rated responses
            const score = parseInt(feedback.remark_score);
            if (!isNaN(score)) {
              if (score >= 9) {
                positiveCount++; // Promoters: scores 9-10
              } else if (score <= 6) {
                negativeCount++; // Detractors: scores 1-6
              } else {
                neutralCount++; // Passives: scores 7-8
              }
            } else {
              console.warn('⚠️ Invalid remark_score:', feedback.remark_score);
              ratedResponses--; // Decrement if invalid score
            }
          }
          // If no remark_score, don't count at all for NPS
        });

        // Calculate percentages based on rated responses only
        const positivePercentage = ratedResponses > 0 ? (positiveCount / ratedResponses) * 100 : 0;
        const neutralPercentage = ratedResponses > 0 ? (neutralCount / ratedResponses) * 100 : 0;
        const negativePercentage = ratedResponses > 0 ? (negativeCount / ratedResponses) * 100 : 0;

        // Calculate NPS Score: % Promoters - % Detractors (only from rated responses)
        const npsScore = positivePercentage - negativePercentage;

        console.log('📊 NPS Calculation Results (Remark Score Based):', {
          totalResponses: totalCount,
          ratedResponses,
          positiveCount,
          negativeCount,
          neutralCount,
          positivePercentage: positivePercentage.toFixed(1),
          negativePercentage: negativePercentage.toFixed(1),
          neutralPercentage: neutralPercentage.toFixed(1),
          npsScore: npsScore.toFixed(1)
        });

        setTotalResponses(totalCount);
        setNpsData({
          score: npsScore,
          responses: ratedResponses, // Show only rated responses count
          satisfaction: {
            positive: { percentage: positivePercentage, count: positiveCount },
            neutral: { percentage: neutralPercentage, count: neutralCount },
            negative: { percentage: negativePercentage, count: negativeCount }
          }
        });
      }
    } catch (error) {
      console.error('Error fetching feedback data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-white border border-gray-200 p-6 shadow-sm">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4 w-24"></div>
            <div className="text-center">
              <div className="h-16 bg-gray-200 rounded mb-2 w-20 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
            </div>
          </div>
        </Card>
        <Card className="bg-white border border-gray-200 p-6 shadow-sm">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4 w-40"></div>
            <div className="text-center mb-4">
              <div className="h-12 bg-gray-200 rounded mb-2 w-24 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center">
                  <div className="h-8 bg-gray-200 rounded mb-2 w-8 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded mb-1 w-16 mx-auto"></div>
                  <div className="h-3 bg-gray-200 rounded mb-1 w-12 mx-auto"></div>
                  <div className="h-3 bg-gray-200 rounded w-8 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* NPS Score Card */}
      <Card className="bg-white border border-gray-200 p-6 shadow-sm">
        <h3 className="text-gray-900 text-lg font-semibold mb-4">NPS Score</h3>
        <div className="text-center mb-4">
          <div className={`text-4xl font-bold mb-2 ${
            npsData.score >= 50 ? 'text-green-500' : 
            npsData.score >= 0 ? 'text-yellow-500' : 'text-red-500'
          }`}>
            {npsData.score.toFixed(1)}
          </div>
          <div className="text-gray-600 text-sm">Net Promoter Score</div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-gray-900 font-medium">
              {npsData.responses}
            </div>
            <div className="text-gray-600 text-sm">Rated</div>
            <div className="text-xs text-gray-500">({totalResponses} Total)</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl mb-2">⭐</div>
            <div className="text-gray-900 font-medium">
              {npsData.score >= 50 ? 'Excellent' : npsData.score >= 0 ? 'Good' : 'Poor'}
            </div>
            <div className="text-gray-600 text-sm">Status</div>
            <div className="text-xs text-gray-500">NPS Range</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-gray-900 font-medium">
              {npsData.score >= 50 ? '50+' : npsData.score >= 0 ? '0-49' : '<0'}
            </div>
            <div className="text-gray-600 text-sm">Target</div>
            <div className="text-xs text-gray-500">Industry</div>
          </div>
        </div>
      </Card>

      {/* Customer Satisfaction Card */}
      <Card className="bg-white border border-gray-200 p-6 shadow-sm">
        <h3 className="text-gray-900 text-lg font-semibold mb-4">Customer Satisfaction</h3>
        <div className="text-center mb-4">
          <div className="text-4xl font-bold text-cyan-600 mb-2">
            {npsData.satisfaction.positive.percentage.toFixed(1)}%
          </div>
          <div className="text-gray-600 text-sm">Promoters (9-10 Score)</div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">😊</div>
            <div className="text-gray-900 font-medium">
              {npsData.satisfaction.positive.percentage.toFixed(1)}%
            </div>
            <div className="text-gray-600 text-sm">Promoters</div>
            <div className="text-xs text-gray-500">({npsData.satisfaction.positive.count})</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl mb-2">😐</div>
            <div className="text-gray-900 font-medium">
              {npsData.satisfaction.neutral.percentage.toFixed(1)}%
            </div>
            <div className="text-gray-600 text-sm">Passives</div>
            <div className="text-xs text-gray-500">({npsData.satisfaction.neutral.count})</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl mb-2">😞</div>
            <div className="text-gray-900 font-medium">
              {npsData.satisfaction.negative.percentage.toFixed(1)}%
            </div>
            <div className="text-gray-600 text-sm">Detractors</div>
            <div className="text-xs text-gray-500">({npsData.satisfaction.negative.count})</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NPSMetrics;
