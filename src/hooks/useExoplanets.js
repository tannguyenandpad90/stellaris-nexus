import { useState, useEffect, useCallback } from 'react'
import { getCached, setCache } from './useDataCache'

const TAP_URL = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync'
const CACHE_KEY = 'exoplanets-200'

export function useExoplanets() {
  const [data, setData] = useState(() => getCached(CACHE_KEY)?.planets || null)
  const [loading, setLoading] = useState(!data)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(() => getCached(CACHE_KEY)?.stats || null)

  const fetchExoplanets = useCallback(async () => {
    const cached = getCached(CACHE_KEY)
    if (cached) { setData(cached.planets); setStats(cached.stats); setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const query = `SELECT TOP 200 pl_name,hostname,sy_dist,pl_rade,pl_bmasse,pl_orbper,pl_eqt,disc_year,discoverymethod,pl_orbsmax,sy_snum,sy_pnum,st_spectype,st_teff,st_rad FROM ps WHERE default_flag=1 AND pl_rade IS NOT NULL ORDER BY disc_year DESC`
      const params = new URLSearchParams({ query, format: 'json' })
      const res = await fetch(`${TAP_URL}?${params}`)
      if (!res.ok) throw new Error(`Exoplanet API error: ${res.status}`)
      const json = await res.json()
      const planets = json.map((p) => ({
        name: p.pl_name, hostStar: p.hostname, distance: p.sy_dist,
        radius: p.pl_rade, mass: p.pl_bmasse, orbitalPeriod: p.pl_orbper,
        temperature: p.pl_eqt, discoveryYear: p.disc_year, discoveryMethod: p.discoverymethod,
        semiMajorAxis: p.pl_orbsmax, numStars: p.sy_snum, numPlanets: p.sy_pnum,
        spectralType: p.st_spectype, starTemp: p.st_teff, starRadius: p.st_rad,
      }))
      const methods = {}
      const years = {}
      planets.forEach((p) => {
        if (p.discoveryMethod) methods[p.discoveryMethod] = (methods[p.discoveryMethod] || 0) + 1
        if (p.discoveryYear) years[p.discoveryYear] = (years[p.discoveryYear] || 0) + 1
      })
      const s = {
        total: planets.length,
        methods: Object.entries(methods).sort((a, b) => b[1] - a[1]),
        yearlyDiscoveries: Object.entries(years).sort((a, b) => a[0] - b[0]),
        habitable: planets.filter((p) => p.temperature && p.temperature > 200 && p.temperature < 320).length,
      }
      setCache(CACHE_KEY, { planets, stats: s }, 3600000) // 1 hour
      setData(planets)
      setStats(s)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchExoplanets() }, [fetchExoplanets])
  return { data, loading, error, stats, refetch: fetchExoplanets }
}
