import { getTranslations } from "./getTranslations";
import logger from "./logger";

export type RouteMap = Record<string, string>;

type RouteMapsPayload = {
  "route-maps": RouteMap;
};

type CacheEntry = {
  value: RouteMapsPayload;
  expiresAt: number;
};

/** In-memory L1 — works on VPS; also speeds up CF within the same isolate. */
const memoryCache = new Map<string, CacheEntry>();

const log = logger.child("lib/routeMapsCache");

function getTtlSeconds(): number {
  const raw = process.env.ROUTE_MAPS_TTL_SECONDS;
  if (raw === undefined || raw === "") return 3600;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 3600;
}

function getDriver(): "auto" | "memory" | "cache-api" {
  const raw = (process.env.ROUTE_MAPS_CACHE_DRIVER ?? "auto").toLowerCase();
  if (raw === "memory" || raw === "cache-api") return raw;
  return "auto";
}

function cacheKey(locale: string, zone: string): string {
  return `route-maps:${locale}:${zone}`;
}

/** Synthetic URL for Cache API (Workers / Cloudflare). */
function cacheApiRequest(key: string): Request {
  return new Request(`https://fxrebate.internal/cache/${key}`);
}

function canUseCacheApi(): boolean {
  return (
    typeof caches !== "undefined" &&
    typeof caches.open === "function"
  );
}

function shouldUseCacheApi(): boolean {
  const driver = getDriver();
  if (driver === "memory") return false;
  if (driver === "cache-api") return canUseCacheApi();
  return canUseCacheApi(); // auto
}

function readMemory(key: string): RouteMapsPayload | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value;
}

function writeMemory(key: string, value: RouteMapsPayload, ttlSeconds: number): void {
  if (ttlSeconds <= 0) return;
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

async function readCacheApi(key: string): Promise<RouteMapsPayload | null> {
  try {
    const cache = await caches.open("route-maps");
    const hit = await cache.match(cacheApiRequest(key));
    if (!hit) return null;
    return (await hit.json()) as RouteMapsPayload;
  } catch (error) {
    log.error("Cache API read failed", {
      error: error instanceof Error ? error.message : error,
      key,
    });
    return null;
  }
}

async function writeCacheApi(
  key: string,
  value: RouteMapsPayload,
  ttlSeconds: number,
): Promise<void> {
  if (ttlSeconds <= 0) return;
  try {
    const cache = await caches.open("route-maps");
    const body = JSON.stringify(value);
    const response = new Response(body, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${ttlSeconds}`,
      },
    });
    await cache.put(cacheApiRequest(key), response);
  } catch (error) {
    log.error("Cache API write failed", {
      error: error instanceof Error ? error.message : error,
      key,
    });
  }
}

async function deleteCacheApi(key: string): Promise<void> {
  try {
    if (!canUseCacheApi()) return;
    const cache = await caches.open("route-maps");
    await cache.delete(cacheApiRequest(key));
  } catch (error) {
    log.error("Cache API delete failed", {
      error: error instanceof Error ? error.message : error,
      key,
    });
  }
}

/**
 * Route-maps for middleware/proxy.
 * - VPS (Node): in-memory Map + TTL
 * - Cloudflare Workers: Cache API (+ memory L1), when available
 *
 * Env:
 * - ROUTE_MAPS_TTL_SECONDS (default 3600; 0 = bypass cache)
 * - ROUTE_MAPS_CACHE_DRIVER = auto | memory | cache-api
 */
export async function getCachedRouteMaps(
  locale: string,
  zone: string,
): Promise<RouteMapsPayload> {
  const ttl = getTtlSeconds();
  const key = cacheKey(locale, zone);
  const useCacheApi = shouldUseCacheApi();

  if (ttl > 0) {
    const fromMemory = readMemory(key);
    if (fromMemory) {
      log.debug("route-maps memory hit", { key });
      return fromMemory;
    }

    if (useCacheApi) {
      const fromCacheApi = await readCacheApi(key);
      if (fromCacheApi) {
        log.debug("route-maps cache-api hit", { key });
        writeMemory(key, fromCacheApi, ttl);
        return fromCacheApi;
      }
    }
  }

  log.debug("route-maps cache miss, fetching", { key, ttl });
  const data = (await getTranslations(
    locale,
    zone,
    "layout",
    "route-maps",
  )) as RouteMapsPayload;

  if (ttl > 0) {
    writeMemory(key, data, ttl);
    if (useCacheApi) {
      await writeCacheApi(key, data, ttl);
    }
  }

  return data;
}

/** Call from a protected purge endpoint / admin webhook after editing route-maps. */
export async function invalidateRouteMapsCache(
  locale?: string,
  zone?: string,
): Promise<void> {
  if (locale && zone) {
    const key = cacheKey(locale, zone);
    memoryCache.delete(key);
    await deleteCacheApi(key);
    log.debug("route-maps cache invalidated", { key });
    return;
  }

  memoryCache.clear();
  // Cache API has no clear-all; entries expire via TTL.
  log.debug("route-maps memory cache cleared (all)");
}
