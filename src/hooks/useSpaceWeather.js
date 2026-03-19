import { useState, useEffect, useCallback } from 'react'
import { getCached, setCache } from './useDataCache'

const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY
const DONKI_BASE = 'https://api.nasa.gov/DONKI'
const CACHE_KEY = 'space-weather'

export function useSpaceWeather() {
  const [data, setData] = useState(() => getCached(CACHE_KEY))
  const [loading, setLoading] = useState(!data)
  const [error, setError] = useState(null)

  const fetchWeather = useCallback(async () => {
    const cached = getCached(CACHE_KEY)
    if (cached) { setData(cached); setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const [flares, cmes, storms] = await Promise.all([
        fetch(`${DONKI_BASE}/FLR?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_API_KEY}`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${DONKI_BASE}/CME?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_API_KEY}`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${DONKI_BASE}/GST?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_API_KEY}`).then(r => r.ok ? r.json() : []).catch(() => []),
      ])
      const solarFlares = (flares || []).map((f) => ({ type: 'Solar Flare', class: f.classType, time: f.beginTime, peakTime: f.peakTime, endTime: f.endTime, region: f.activeRegionNum, source: f.sourceLocation }))
      const coronalMassEjections = (cmes || []).map((c) => ({ type: 'CME', time: c.startTime, speed: c.cmeAnalyses?.[0]?.speed || null, halfAngle: c.cmeAnalyses?.[0]?.halfAngle || null, note: c.note }))
      const geoStorms = (storms || []).map((s) => ({ type: 'Geomagnetic Storm', time: s.startTime, kpIndex: s.allKpIndex?.[0]?.kpIndex || null, source: s.link }))
      let alertLevel = 'NOMINAL', alertColor = '#4ade80'
      if (solarFlares.some(f => f.class?.startsWith('X'))) { alertLevel = 'SEVERE'; alertColor = '#ef4444' }
      else if (solarFlares.some(f => f.class?.startsWith('M'))) { alertLevel = 'MODERATE'; alertColor = '#f59e0b' }
      else if (solarFlares.length > 0 || coronalMassEjections.length > 0) { alertLevel = 'ACTIVE'; alertColor = '#06b6d4' }
      const result = { flares: solarFlares, cmes: coronalMassEjections, storms: geoStorms, totalEvents: solarFlares.length + coronalMassEjections.length + geoStorms.length, alertLevel, alertColor, period: { start: startDate, end: endDate } }
      setCache(CACHE_KEY, result, 600000) // 10 min
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchWeather() }, [fetchWeather])
  return { data, loading, error, refetch: fetchWeather }
}
