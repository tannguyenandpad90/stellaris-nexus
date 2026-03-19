import { useState, useCallback } from 'react'
import { getCached, setCache } from './useDataCache'

const NASA_IMAGES_API = 'https://images-api.nasa.gov'

export function useNasaImages() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const search = useCallback(async (query, mediaType = 'image', page = 1) => {
    if (!query.trim()) return
    const key = `nasa-img-${query}-${mediaType}-${page}`
    const cached = getCached(key)
    if (cached) { setResults(cached); setLoading(false); return }

    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ q: query, media_type: mediaType, page: String(page), page_size: '24' })
      const res = await fetch(`${NASA_IMAGES_API}/search?${params}`)
      if (!res.ok) throw new Error(`NASA Images API error: ${res.status}`)
      const json = await res.json()
      const items = (json.collection?.items || []).map((item) => ({
        nasaId: item.data?.[0]?.nasa_id,
        title: item.data?.[0]?.title,
        description: item.data?.[0]?.description?.slice(0, 300),
        date: item.data?.[0]?.date_created?.split('T')[0],
        center: item.data?.[0]?.center,
        keywords: item.data?.[0]?.keywords?.slice(0, 5),
        thumbnail: item.links?.[0]?.href,
        mediaType: item.data?.[0]?.media_type,
      })).filter((i) => i.thumbnail)

      const result = {
        items,
        total: json.collection?.metadata?.total_hits || 0,
        page,
        query,
      }
      setCache(key, result, 1800000) // 30 min
      setResults(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { results, loading, error, search }
}
