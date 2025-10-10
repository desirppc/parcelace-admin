// Enhanced caching service for better UX
// Shows cached data immediately while fetching fresh data in background

import { getCache, setCache, CacheKeys, CacheGroups, clearCacheByPrefix } from './cache';

export interface CacheStrategy {
  // Show cached data immediately if available
  showCachedFirst: boolean;
  // Fetch fresh data in background
  backgroundRefresh: boolean;
  // Cache TTL in milliseconds
  ttlMs: number;
  // Background refresh interval in milliseconds
  backgroundRefreshIntervalMs?: number;
}

export interface CachedData<T> {
  data: T;
  timestamp: number;
  isStale?: boolean; // Mark if data is being refreshed
}

export class SmartCache {
  private static backgroundRefreshTimers = new Map<string, NodeJS.Timeout>();
  private static lastActivityTime = Date.now();
  private static isUserActive = true;
  private static activityTimeout: NodeJS.Timeout | null = null;

  // Monitor user activity to reduce unnecessary API calls
  static {
    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.lastActivityTime = Date.now();
        this.isUserActive = true;
        
        // Clear existing timeout
        if (this.activityTimeout) {
          clearTimeout(this.activityTimeout);
        }
        
        // Set user as inactive after 5 minutes of no activity
        this.activityTimeout = setTimeout(() => {
          this.isUserActive = false;
          console.log('👤 User inactive - pausing background refreshes');
        }, 5 * 60 * 1000); // 5 minutes
      }, true);
    });
  }

  /**
   * Get data with smart caching strategy
   * 1. Return cached data immediately if available
   * 2. Fetch fresh data in background
   * 3. Update UI when fresh data arrives
   */
  static async getData<T>(
    cacheKey: string,
    fetchFunction: () => Promise<T>,
    strategy: CacheStrategy,
    onDataUpdate?: (data: T, isFromCache: boolean) => void
  ): Promise<T | null> {
    const { showCachedFirst, backgroundRefresh, ttlMs } = strategy;

    // 1. Try to get cached data first
    if (showCachedFirst) {
      const cached = getCache<CachedData<T>>(cacheKey);
      if (cached && cached.data) {
        console.log(`📦 Using cached data for ${cacheKey}`);
        
        // Mark as stale if we're going to refresh
        if (backgroundRefresh) {
          cached.isStale = true;
          setCache(cacheKey, cached, ttlMs);
        }
        
        // Call update callback with cached data
        if (onDataUpdate) {
          onDataUpdate(cached.data, true);
        }
        
        // Start background refresh if enabled
        if (backgroundRefresh) {
          this.startBackgroundRefresh(cacheKey, fetchFunction, strategy, onDataUpdate);
        }
        
        return cached.data;
      }
    }

    // 2. No cached data available, fetch fresh data
    console.log(`🔄 Fetching fresh data for ${cacheKey}`);
    try {
      const freshData = await fetchFunction();
      
      // Cache the fresh data
      const cachedData: CachedData<T> = {
        data: freshData,
        timestamp: Date.now(),
        isStale: false
      };
      setCache(cacheKey, cachedData, ttlMs);
      
      // Call update callback with fresh data
      if (onDataUpdate) {
        onDataUpdate(freshData, false);
      }
      
      return freshData;
    } catch (error) {
      console.error(`❌ Error fetching data for ${cacheKey}:`, error);
      return null;
    }
  }

  /**
   * Start background refresh for a cache key (only when user is active)
   */
  private static startBackgroundRefresh<T>(
    cacheKey: string,
    fetchFunction: () => Promise<T>,
    strategy: CacheStrategy,
    onDataUpdate?: (data: T, isFromCache: boolean) => void
  ): void {
    // Clear existing timer if any
    const existingTimer = this.backgroundRefreshTimers.get(cacheKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Only start background refresh if user is active
    if (!this.isUserActive) {
      console.log(`⏸️ Skipping background refresh for ${cacheKey} - user inactive`);
      return;
    }

    // Set up background refresh
    const timer = setTimeout(async () => {
      // Double-check if user is still active before making API call
      if (!this.isUserActive) {
        console.log(`⏸️ Skipping background refresh for ${cacheKey} - user became inactive`);
        return;
      }

      try {
        console.log(`🔄 Background refresh for ${cacheKey} (user active)`);
        const freshData = await fetchFunction();
        
        // Update cache with fresh data
        const cachedData: CachedData<T> = {
          data: freshData,
          timestamp: Date.now(),
          isStale: false
        };
        setCache(cacheKey, cachedData, strategy.ttlMs);
        
        // Call update callback with fresh data
        if (onDataUpdate) {
          onDataUpdate(freshData, false);
        }
        
        console.log(`✅ Background refresh completed for ${cacheKey}`);
        
        // Schedule next refresh (recursive)
        this.startBackgroundRefresh(cacheKey, fetchFunction, strategy, onDataUpdate);
      } catch (error) {
        console.error(`❌ Background refresh failed for ${cacheKey}:`, error);
        // Retry after a longer interval on error
        setTimeout(() => {
          this.startBackgroundRefresh(cacheKey, fetchFunction, strategy, onDataUpdate);
        }, strategy.maxRefreshIntervalMs || 15 * 60 * 1000);
      }
    }, strategy.backgroundRefreshIntervalMs || 5 * 60 * 1000);

    this.backgroundRefreshTimers.set(cacheKey, timer);
  }

  /**
   * Clear all background refresh timers
   */
  static clearAllTimers(): void {
    this.backgroundRefreshTimers.forEach(timer => clearTimeout(timer));
    this.backgroundRefreshTimers.clear();
  }

  /**
   * Resume background refreshes when user becomes active
   */
  static resumeBackgroundRefreshes(): void {
    if (!this.isUserActive) {
      console.log('👤 User became active - resuming background refreshes');
      this.isUserActive = true;
      // Background refreshes will resume automatically on next user interaction
    }
  }

  /**
   * Get current user activity status
   */
  static getUserActivityStatus(): { isActive: boolean; lastActivity: Date } {
    return {
      isActive: this.isUserActive,
      lastActivity: new Date(this.lastActivityTime)
    };
  }

  /**
   * Clear cache for a specific group
   */
  static clearCacheGroup(group: string): void {
    clearCacheByPrefix(group);
  }

  /**
   * Preload data for better UX
   */
  static async preloadData<T>(
    cacheKey: string,
    fetchFunction: () => Promise<T>,
    ttlMs: number
  ): Promise<void> {
    try {
      const data = await fetchFunction();
      const cachedData: CachedData<T> = {
        data,
        timestamp: Date.now(),
        isStale: false
      };
      setCache(cacheKey, cachedData, ttlMs);
      console.log(`✅ Preloaded data for ${cacheKey}`);
    } catch (error) {
      console.error(`❌ Preload failed for ${cacheKey}:`, error);
    }
  }
}

// Smart strategies that reduce server load
export const CacheStrategies = {
  // Orders: Show cached immediately, refresh only when user is active
  orders: {
    showCachedFirst: true,
    backgroundRefresh: true,
    ttlMs: 10 * 60 * 1000, // 10 minutes cache
    backgroundRefreshIntervalMs: 5 * 60 * 1000, // 5 minutes (only if user active)
    maxRefreshIntervalMs: 15 * 60 * 1000 // Never refresh more than every 15 minutes
  } as CacheStrategy,

  // Shipments: Show cached immediately, refresh only when user is active
  shipments: {
    showCachedFirst: true,
    backgroundRefresh: true,
    ttlMs: 10 * 60 * 1000, // 10 minutes cache
    backgroundRefreshIntervalMs: 5 * 60 * 1000, // 5 minutes (only if user active)
    maxRefreshIntervalMs: 15 * 60 * 1000 // Never refresh more than every 15 minutes
  } as CacheStrategy,

  // User profile: Show cached immediately, refresh every 10 minutes
  userProfile: {
    showCachedFirst: true,
    backgroundRefresh: true,
    ttlMs: 30 * 60 * 1000, // 30 minutes cache
    backgroundRefreshIntervalMs: 10 * 60 * 1000, // 10 minutes
    maxRefreshIntervalMs: 30 * 60 * 1000 // Never refresh more than every 30 minutes
  } as CacheStrategy,

  // Static data: Show cached immediately, refresh every 30 minutes
  static: {
    showCachedFirst: true,
    backgroundRefresh: true,
    ttlMs: 60 * 60 * 1000, // 1 hour cache
    backgroundRefreshIntervalMs: 30 * 60 * 1000, // 30 minutes
    maxRefreshIntervalMs: 60 * 60 * 1000 // Never refresh more than every hour
  } as CacheStrategy
};

// Enhanced cache keys with more granular control
export const EnhancedCacheKeys = {
  orders: (page: number, pageSize: number, pageType: string, filters?: any) => 
    `orders:${pageType}:${page}:${pageSize}:${JSON.stringify(filters || {})}`,
  
  shipments: (page: number, pageSize: number, pageType: string, filters?: any) => 
    `shipments:${pageType}:${page}:${pageSize}:${JSON.stringify(filters || {})}`,
  
  userProfile: () => 'user:profile',
  
  warehouses: () => 'warehouses:list'
};

export default SmartCache;
