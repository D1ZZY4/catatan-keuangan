import { db } from "@/shared/db/db";

interface UsagePattern {
  hourlyAccess: number[];
  frequentEntities: Record<string, number>;
  lastActiveRoute: string;
  averageSessionLength: number;
  sessionStart: number;
}

interface MemoryCacheEntry {
  data: unknown;
  timestamp: number;
  accessCount: number;
}

const PATTERN_KEY = "smartCachePattern";

class SmartCacheService {
  private memoryCache = new Map<string, MemoryCacheEntry>();
  private pattern: UsagePattern = {
    hourlyAccess: Array(24).fill(0) as number[],
    frequentEntities: {},
    lastActiveRoute: "/",
    averageSessionLength: 0,
    sessionStart: Date.now(),
  };
  private patternLoaded = false;

  private async loadPattern(): Promise<void> {
    if (this.patternLoaded) return;
    try {
      const row = await db.usage_patterns.get(PATTERN_KEY);
      if (row?.value) {
        this.pattern = JSON.parse(row.value) as UsagePattern;
      }
    } catch {
      // ignore — pattern is best-effort
    }
    this.pattern.sessionStart = Date.now();
    this.patternLoaded = true;
  }

  private async savePattern(): Promise<void> {
    try {
      await db.usage_patterns.put({ key: PATTERN_KEY, value: JSON.stringify(this.pattern) });
    } catch {
      // ignore
    }
  }

  recordAccess(entityType: string, entityId: string): void {
    const hour = new Date().getHours();
    if (this.pattern.hourlyAccess[hour] !== undefined) {
      this.pattern.hourlyAccess[hour]++;
    }
    const key = `${entityType}:${entityId}`;
    this.pattern.frequentEntities[key] = (this.pattern.frequentEntities[key] ?? 0) + 1;
    void this.savePattern();
  }

  recordRouteVisit(route: string): void {
    this.pattern.lastActiveRoute = route;
    const hour = new Date().getHours();
    if (this.pattern.hourlyAccess[hour] !== undefined) {
      this.pattern.hourlyAccess[hour]++;
    }
    void this.savePattern();
  }

  predictNextAccess(): string[] {
    const entries = Object.entries(this.pattern.frequentEntities);
    return entries
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([key]) => key);
  }

  async get<T>(key: string, ttlMs: number): Promise<T | null> {
    await this.loadPattern();
    const entry = this.memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > ttlMs) {
      this.memoryCache.delete(key);
      return null;
    }
    entry.accessCount++;
    return entry.data as T;
  }

  async set<T>(key: string, data: T): Promise<void> {
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      accessCount: 1,
    });
  }

  invalidate(pattern: string): void {
    const prefix = pattern.replace(/\*$/, "");
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
      }
    }
  }

  adaptiveTTL(key: string, baseTTL: number): number {
    const entry = this.memoryCache.get(key);
    if (!entry) return baseTTL;
    const multiplier = Math.min(1 + entry.accessCount * 0.2, 3);
    return baseTTL * multiplier;
  }

  evictStaleCache(maxAgeMs: number): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > maxAgeMs) {
        this.memoryCache.delete(key);
      }
    }
  }

  endSession(): void {
    const elapsed = (Date.now() - this.pattern.sessionStart) / 1000;
    this.pattern.averageSessionLength =
      this.pattern.averageSessionLength === 0
        ? elapsed
        : (this.pattern.averageSessionLength + elapsed) / 2;
    void this.savePattern();
  }
}

export const smartCache = new SmartCacheService();
