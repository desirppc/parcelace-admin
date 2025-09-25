import React, { useState } from 'react';
import { analyticsService } from '@/services/analyticsService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const AnalyticsTest = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const sampleQueries = [
    'What is my return rate?',
    'Show me total orders',
    'What is my delivery rate?',
    'Check my wallet balance',
    'How many RTO orders do I have?',
    'What is my average order value?'
  ];

  const handleQuery = async (queryText: string) => {
    setQuery(queryText);
    setLoading(true);
    setResult(null);

    try {
      const analyticsResult = await analyticsService.processQuery(queryText);
      setResult(analyticsResult);
    } catch (error) {
      console.error('Analytics error:', error);
      setResult({ error: 'Failed to process query' });
    } finally {
      setLoading(false);
    }
  };

  const formatResult = (result: any) => {
    if (result?.error) {
      return <div className="text-red-500">Error: {String(result.error)}</div>;
    }

    if (!result) {
      return <div className="text-gray-500">No result found</div>;
    }

    const { metric, value, unit, description, calculation, data_points } = result;
    
    return (
      <div className="space-y-4">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
            📊 {metric}
          </h3>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-300">
                    {Number(value).toFixed(2)} {unit}
                  </p>
        </div>
        
        <div className="space-y-2">
          <div>
            <span className="font-medium">Description:</span> {description}
          </div>
          <div>
            <span className="font-medium">Calculation:</span> {calculation}
          </div>
          
          {Object.keys(data_points).length > 0 && (
            <div>
              <span className="font-medium">Data Points:</span>
              <ul className="list-disc list-inside mt-1 space-y-1">
                {Object.entries(data_points).map(([key, value]) => (
                  <li key={key} className="text-sm">
                    {key}: {String(value)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics Service Test
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Test the analytics service with sample queries
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter Query
              </label>
              <div className="flex space-x-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., What is my return rate?"
                  className="flex-1"
                />
                <Button 
                  onClick={() => handleQuery(query)}
                  disabled={!query.trim() || loading}
                >
                  {loading ? 'Processing...' : 'Query'}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sample Queries
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {sampleQueries.map((sampleQuery, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => handleQuery(sampleQuery)}
                    disabled={loading}
                    className="justify-start text-left h-auto p-3"
                  >
                    {sampleQuery}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {result && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Result</h2>
            {formatResult(result)}
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Available Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsService.getAvailableMetrics().map((metric, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <h3 className="font-medium">{metric.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {metric.description}
                </p>
                <div className="mt-2">
                  <span className="text-xs text-gray-500">Aliases:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {metric.aliases.slice(0, 3).map((alias, aliasIndex) => (
                      <span
                        key={aliasIndex}
                        className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded"
                      >
                        {alias}
                      </span>
                    ))}
                    {metric.aliases.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{metric.aliases.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsTest; 