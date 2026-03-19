const cache = new Map()

export function getCached(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expires) {
    cache.delete(key)
    return null
  }
  return entry.data
}

export function setCache(key, data, ttlMs = 300000) {
  cache.set(key, { data, expires: Date.now() + ttlMs })
}

export function clearCache(key) {
  if (key) cache.delete(key)
  else cache.clear()
}
