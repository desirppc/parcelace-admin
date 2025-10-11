// Test component for cache clearing functionality
// This can be used to test and verify that all caches are properly cleared

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  clearAllApplicationData, 
  clearAllDataExceptPasswords, 
  forceClearEverything,
  getDataClearingStats 
} from '@/utils/clearAllData';
import { getCacheStats } from '@/utils/cache';

const CacheClearingTest: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);

  const refreshStats = () => {
    setStats(getDataClearingStats());
    setCacheStats(getCacheStats());
  };

  useEffect(() => {
    refreshStats();
  }, []);

  const testClearAllExceptPasswords = () => {
    console.log('🧪 Testing clearAllDataExceptPasswords...');
    clearAllDataExceptPasswords();
    setTimeout(refreshStats, 100);
  };

  const testClearEverything = () => {
    console.log('🧪 Testing forceClearEverything...');
    forceClearEverything();
    setTimeout(refreshStats, 100);
  };

  const testClearAllApplicationData = () => {
    console.log('🧪 Testing clearAllApplicationData...');
    clearAllApplicationData();
    setTimeout(refreshStats, 100);
  };

  const addTestData = () => {
    // Add some test data to localStorage and sessionStorage
    localStorage.setItem('test_data', 'test_value');
    localStorage.setItem('parcelace_test', 'test_value');
    sessionStorage.setItem('test_session', 'test_value');
    
    // Add some cache data
    const { setCache } = require('@/utils/cache');
    setCache('test_cache', { test: 'data' }, 60000);
    
    refreshStats();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cache Clearing Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Current Storage Stats</h3>
              {stats && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>localStorage Keys:</span>
                    <Badge variant="outline">{stats.localStorageKeys}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>sessionStorage Keys:</span>
                    <Badge variant="outline">{stats.sessionStorageKeys}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Cache Entries:</span>
                    <Badge variant="outline">{stats.cacheEntries}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Passwords Preserved:</span>
                    <Badge variant={stats.preservedPasswords ? "default" : "secondary"}>
                      {stats.preservedPasswords ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Cache Stats</h3>
              {cacheStats && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Cache Entries:</span>
                    <Badge variant="outline">{cacheStats.totalEntries}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Cache Keys:</span>
                    <Badge variant="outline">{cacheStats.entries.length}</Badge>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Test Actions</h3>
            <div className="flex flex-wrap gap-2">
              <Button onClick={addTestData} variant="outline">
                Add Test Data
              </Button>
              <Button onClick={refreshStats} variant="outline">
                Refresh Stats
              </Button>
              <Button onClick={testClearAllExceptPasswords} variant="default">
                Clear All Except Passwords
              </Button>
              <Button onClick={testClearEverything} variant="destructive">
                Clear Everything
              </Button>
              <Button onClick={testClearAllApplicationData} variant="secondary">
                Clear Application Data
              </Button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Test Instructions:</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Click "Add Test Data" to populate storage with test data</li>
              <li>Click "Clear All Except Passwords" to test the main clearing function</li>
              <li>Verify that localStorage/sessionStorage keys are cleared but passwords remain</li>
              <li>Click "Clear Everything" to test complete clearing including passwords</li>
              <li>Use "Refresh Stats" to see updated counts after each operation</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CacheClearingTest;
