// Simple localStorage-based cache with TTL and namespacing
// Keys are prefixed to avoid collisions and allow bulk invalidation

const CACHE_PREFIX = 'parcelace_cache:';

export interface CacheEntry<T> {
  value: T;
  expiresAt: number; // epoch ms
}

function buildKey(key: string): string {
  return `${CACHE_PREFIX}${key}`;
}

export function setCache<T>(key: string, value: T, ttlMs: number): void {
  try {
    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + ttlMs,
    };
    localStorage.setItem(buildKey(key), JSON.stringify(entry));
  } catch (_) {
    // Ignore storage errors (quota, private mode), fail silently
  }
}

export function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(buildKey(key));
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (!entry || typeof entry.expiresAt !== 'number') {
      localStorage.removeItem(buildKey(key));
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(buildKey(key));
      return null;
    }
    return entry.value;
  } catch (_) {
    return null;
  }
}

export function deleteCache(key: string): void {
  try {
    localStorage.removeItem(buildKey(key));
  } catch (_) {
    // ignore
  }
}

export function clearCacheByPrefix(prefix: string): void {
  try {
    const fullPrefix = buildKey(prefix);
    const keysToDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(fullPrefix)) keysToDelete.push(k);
    }
    keysToDelete.forEach(k => localStorage.removeItem(k));
  } catch (_) {
    // ignore
  }
}

// Common keys
export const CacheKeys = {
  orders: (page: number, pageSize: number, pageType: string) => `orders:${pageType}:${page}:${pageSize}`,
  shipments: (page: number, pageSize: number, pageType: string) => `shipments:${pageType}:${page}:${pageSize}`,
};

export const CacheGroups = {
  orders: 'orders:',
  shipments: 'shipments:',
};


