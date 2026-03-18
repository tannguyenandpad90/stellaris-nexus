import { useState, useEffect, useCallback } from 'react'

const API_KEY = import.meta.env.VITE_NASA_API_KEY
const BASE_URL = 'https://api.nasa.gov'

export function useApod(date = null) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchApod = useCallback(async (targetDate) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ api_key: API_KEY })
      if (targetDate) params.append('date', targetDate)
      const res = await fetch(`${BASE_URL}/planetary/apod?${params}`)
      if (!res.ok) throw new Error(`APOD API error: ${res.status}`)
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchApod(date)
  }, [date, fetchApod])

  return { data, loading, error, refetch: fetchApod }
}

export function useAsteroids(startDate = null, endDate = null) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAsteroids = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const today = new Date().toISOString().split('T')[0]
      const start = startDate || today
      const end = endDate || today
      const params = new URLSearchParams({
        api_key: API_KEY,
        start_date: start,
        end_date: end,
      })
      const res = await fetch(`${BASE_URL}/neo/rest/v1/feed?${params}`)
      if (!res.ok) throw new Error(`Asteroids API error: ${res.status}`)
      const json = await res.json()

      // Flatten all asteroids from all dates and sort by size
      const allAsteroids = Object.values(json.near_earth_objects)
        .flat()
        .map((a) => ({
          id: a.id,
          name: a.name.replace(/[()]/g, '').trim(),
          diameter: {
            min: a.estimated_diameter.meters.estimated_diameter_min,
            max: a.estimated_diameter.meters.estimated_diameter_max,
          },
          isHazardous: a.is_potentially_hazardous_asteroid,
          velocity: parseFloat(a.close_approach_data[0]?.relative_velocity?.kilometers_per_hour || 0),
          missDistance: parseFloat(a.close_approach_data[0]?.miss_distance?.kilometers || 0),
          closeApproachDate: a.close_approach_data[0]?.close_approach_date_full || '',
        }))
        .sort((a, b) => b.diameter.max - a.diameter.max)

      setData({
        count: json.element_count,
        asteroids: allAsteroids,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    fetchAsteroids()
  }, [fetchAsteroids])

  return { data, loading, error, refetch: fetchAsteroids }
}

export function useMarsRoverPhotos(rover = 'curiosity', sol = 1000, camera = null) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPhotos = useCallback(async (targetSol) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        api_key: API_KEY,
        sol: String(targetSol || sol),
      })
      if (camera) params.append('camera', camera)
      // Limit to 25 photos for performance
      params.append('page', '1')
      const res = await fetch(`${BASE_URL}/mars-photos/api/v1/rovers/${rover}/photos?${params}`)
      if (!res.ok) throw new Error(`Mars Rover API error: ${res.status}`)
      const json = await res.json()
      setData(json.photos?.slice(0, 25) || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [rover, sol, camera])

  useEffect(() => {
    fetchPhotos(sol)
  }, [fetchPhotos, sol])

  return { data, loading, error, refetch: fetchPhotos }
}
