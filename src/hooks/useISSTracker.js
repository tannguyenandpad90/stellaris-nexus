import { useState, useEffect, useCallback, useRef } from 'react'

const ISS_API = 'https://api.wheretheiss.at/v1/satellites/25544'

export function useISSTracker(enabled = true) {
  const [position, setPosition] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)

  const fetchPosition = useCallback(async () => {
    try {
      const res = await fetch(ISS_API)
      if (!res.ok) throw new Error(`ISS API error: ${res.status}`)
      const data = await res.json()

      const pos = {
        latitude: data.latitude,
        longitude: data.longitude,
        altitude: data.altitude, // km
        velocity: data.velocity, // km/h
        visibility: data.visibility,
        timestamp: data.timestamp,
      }

      setPosition(pos)
      setHistory((prev) => [...prev.slice(-60), pos]) // Keep last 60 positions for trail
      setLoading(false)
      setError(null)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    fetchPosition()
    // Update every 5 seconds
    intervalRef.current = setInterval(fetchPosition, 5000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [enabled, fetchPosition])

  return { position, history, loading, error }
}
