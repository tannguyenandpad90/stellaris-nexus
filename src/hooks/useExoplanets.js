import { useState, useEffect, useCallback } from 'react'

const TAP_URL = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync'

export function useExoplanets() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)

  const fetchExoplanets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch confirmed exoplanets with key data — limit to most interesting ones
      const query = `SELECT TOP 200 pl_name,hostname,sy_dist,pl_rade,pl_bmasse,pl_orbper,pl_eqt,disc_year,discoverymethod,pl_orbsmax,sy_snum,sy_pnum,st_spectype,st_teff,st_rad FROM ps WHERE default_flag=1 AND pl_rade IS NOT NULL ORDER BY disc_year DESC`

      const params = new URLSearchParams({
        query,
        format: 'json',
      })

      const res = await fetch(`${TAP_URL}?${params}`)
      if (!res.ok) throw new Error(`Exoplanet API error: ${res.status}`)
      const json = await res.json()

      const planets = json.map((p) => ({
        name: p.pl_name,
        hostStar: p.hostname,
        distance: p.sy_dist, // parsecs
        radius: p.pl_rade, // Earth radii
        mass: p.pl_bmasse, // Earth masses
        orbitalPeriod: p.pl_orbper, // days
        temperature: p.pl_eqt, // Kelvin
        discoveryYear: p.disc_year,
        discoveryMethod: p.discoverymethod,
        semiMajorAxis: p.pl_orbsmax, // AU
        numStars: p.sy_snum,
        numPlanets: p.sy_pnum,
        spectralType: p.st_spectype,
        starTemp: p.st_teff, // Kelvin
        starRadius: p.st_rad, // Solar radii
      }))

      // Compute stats
      const methods = {}
      const years = {}
      planets.forEach((p) => {
        if (p.discoveryMethod) methods[p.discoveryMethod] = (methods[p.discoveryMethod] || 0) + 1
        if (p.discoveryYear) years[p.discoveryYear] = (years[p.discoveryYear] || 0) + 1
      })

      setData(planets)
      setStats({
        total: planets.length,
        methods: Object.entries(methods).sort((a, b) => b[1] - a[1]),
        yearlyDiscoveries: Object.entries(years).sort((a, b) => a[0] - b[0]),
        habitable: planets.filter((p) => p.temperature && p.temperature > 200 && p.temperature < 320).length,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchExoplanets()
  }, [fetchExoplanets])

  return { data, loading, error, stats, refetch: fetchExoplanets }
}
