import { useState, useEffect, useCallback } from 'react'
import { getCached, setCache } from './useDataCache'

const API_KEY = import.meta.env.VITE_NASA_API_KEY
const BASE_URL = 'https://api.nasa.gov'

export function useApod(date = null) {
  const [data, setData] = useState(() => getCached(`apod-${date || 'today'}`))
  const [loading, setLoading] = useState(!data)
  const [error, setError] = useState(null)

  const fetchApod = useCallback(async (targetDate) => {
    const key = `apod-${targetDate || 'today'}`
    const cached = getCached(key)
    if (cached) { setData(cached); setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ api_key: API_KEY })
      if (targetDate) params.append('date', targetDate)
      const res = await fetch(`${BASE_URL}/planetary/apod?${params}`)
      if (!res.ok) throw new Error(`APOD API error: ${res.status}`)
      const json = await res.json()
      setCache(key, json, 3600000) // 1 hour
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchApod(date) }, [date, fetchApod])
  return { data, loading, error, refetch: fetchApod }
}

export function useAsteroids(startDate = null, endDate = null) {
  const today = new Date().toISOString().split('T')[0]
  const start = startDate || today
  const end = endDate || today
  const cacheKey = `neo-${start}-${end}`

  const [data, setData] = useState(() => getCached(cacheKey))
  const [loading, setLoading] = useState(!data)
  const [error, setError] = useState(null)

  const fetchAsteroids = useCallback(async () => {
    const cached = getCached(cacheKey)
    if (cached) { setData(cached); setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ api_key: API_KEY, start_date: start, end_date: end })
      const res = await fetch(`${BASE_URL}/neo/rest/v1/feed?${params}`)
      if (!res.ok) throw new Error(`Asteroids API error: ${res.status}`)
      const json = await res.json()
      const allAsteroids = Object.values(json.near_earth_objects)
        .flat()
        .map((a) => ({
          id: a.id,
          name: a.name.replace(/[()]/g, '').trim(),
          diameter: { min: a.estimated_diameter.meters.estimated_diameter_min, max: a.estimated_diameter.meters.estimated_diameter_max },
          isHazardous: a.is_potentially_hazardous_asteroid,
          velocity: parseFloat(a.close_approach_data[0]?.relative_velocity?.kilometers_per_hour || 0),
          missDistance: parseFloat(a.close_approach_data[0]?.miss_distance?.kilometers || 0),
          closeApproachDate: a.close_approach_data[0]?.close_approach_date_full || '',
        }))
        .sort((a, b) => b.diameter.max - a.diameter.max)
      const result = { count: json.element_count, asteroids: allAsteroids }
      setCache(cacheKey, result, 600000) // 10 min
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [cacheKey, start, end])

  useEffect(() => { fetchAsteroids() }, [fetchAsteroids])
  return { data, loading, error, refetch: fetchAsteroids }
}

export function useMarsRoverPhotos(rover = 'curiosity', sol = 1000, camera = null) {
  const cacheKey = `mars-${rover}-${sol}-${camera || 'all'}`
  const [data, setData] = useState(() => getCached(cacheKey))
  const [loading, setLoading] = useState(!data)
  const [error, setError] = useState(null)

  const fetchPhotos = useCallback(async (targetSol) => {
    const key = `mars-${rover}-${targetSol || sol}-${camera || 'all'}`
    const cached = getCached(key)
    if (cached) { setData(cached); setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ api_key: API_KEY, sol: String(targetSol || sol) })
      if (camera) params.append('camera', camera)
      params.append('page', '1')
      const res = await fetch(`${BASE_URL}/mars-photos/api/v1/rovers/${rover}/photos?${params}`)
      if (!res.ok) throw new Error(`Mars Rover API error: ${res.status}`)
      const json = await res.json()
      const photos = json.photos?.slice(0, 25) || []
      setCache(key, photos, 3600000) // 1 hour
      setData(photos)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [rover, sol, camera])

  useEffect(() => { fetchPhotos(sol) }, [fetchPhotos, sol])
  return { data, loading, error, refetch: fetchPhotos }
}
