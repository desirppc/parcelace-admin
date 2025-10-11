import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, RefreshCw, Info } from 'lucide-react';
import { clearAllCache, clearCacheByPrefix, getCacheStats, CacheGroups } from '@/utils/cache';
import { useToast } from '@/hooks/use-toast';

const CacheDebug: React.FC = () => {
  const [cacheStats, setCacheStats] = useState(getCacheStats());
  const { toast } = useToast();

  const refreshStats = () => {
    setCacheStats(getCacheStats());
  };

  const clearOrdersCache = () => {
    clearCacheByPrefix(CacheGroups.orders);
    refreshStats();
    toast({
      title: "Orders Cache Cleared",
      description: "All orders cache has been cleared. Fresh data will be loaded on next page visit.",
    });
  };

  const clearShipmentsCache = () => {
    clearCacheByPrefix(CacheGroups.shipments);
    refreshStats();
    toast({
      title: "Shipments Cache Cleared",
      description: "All shipments cache has been cleared. Fresh data will be loaded on next page visit.",
    });
  };

  const clearAllCaches = () => {
    clearAllCache();
    refreshStats();
    toast({
      title: "All Cache Cleared",
      description: "All cache has been cleared. Fresh data will be loaded on next page visit.",
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          Cache Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Cache Entries</p>
            <Badge variant="outline">{cacheStats.totalEntries}</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={refreshStats}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Stats
          </Button>
        </div>

        {cacheStats.entries.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Cache Entries:</p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {cacheStats.entries.map((entry, index) => (
                <div key={index} className="text-xs font-mono bg-gray-100 p-1 rounded">
                  {entry}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium">Clear Specific Cache:</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearOrdersCache}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Orders Cache
            </Button>
            <Button variant="outline" size="sm" onClick={clearShipmentsCache}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Shipments Cache
            </Button>
          </div>
        </div>

        <div className="pt-2 border-t">
          <Button variant="destructive" size="sm" onClick={clearAllCaches}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Cache
          </Button>
        </div>

        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
          <strong>Note:</strong> This panel helps debug caching issues. If you're seeing old data, 
          try clearing the relevant cache and refreshing the page.
        </div>
      </CardContent>
    </Card>
  );
};

export default CacheDebug;
