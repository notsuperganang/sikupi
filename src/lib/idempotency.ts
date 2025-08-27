/**
 * Simple in-memory idempotency service for webhook reliability
 * Prevents duplicate processing of webhook events
 */

interface IdempotencyEntry {
  processed: boolean
  timestamp: number
}

const idempotencyCache = new Map<string, IdempotencyEntry>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

/**
 * Generate idempotency key for webhook events
 */
export function generateIdempotencyKey(source: 'midtrans' | 'biteship', orderId: string, status: string): string {
  return `${source}:${orderId}:${status}`
}

/**
 * Check if an operation has already been processed
 */
export function isAlreadyProcessed(key: string): boolean {
  const entry = idempotencyCache.get(key)
  
  if (!entry) {
    return false
  }
  
  // Check if entry has expired
  if (entry.timestamp + CACHE_TTL < Date.now()) {
    idempotencyCache.delete(key)
    return false
  }
  
  return entry.processed
}

/**
 * Mark an operation as processed
 */
export function markAsProcessed(key: string): void {
  idempotencyCache.set(key, {
    processed: true,
    timestamp: Date.now()
  })
}

/**
 * Clean up expired entries (optional background cleanup)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now()
  
  for (const [key, entry] of idempotencyCache.entries()) {
    if (entry.timestamp + CACHE_TTL < now) {
      idempotencyCache.delete(key)
    }
  }
}

/**
 * Get cache statistics for debugging
 */
export function getIdempotencyStats() {
  return {
    totalEntries: idempotencyCache.size,
    entries: Array.from(idempotencyCache.entries()).map(([key, entry]) => ({
      key,
      processed: entry.processed,
      age_minutes: Math.round((Date.now() - entry.timestamp) / (1000 * 60))
    }))
  }
}