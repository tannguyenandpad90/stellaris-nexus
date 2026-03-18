// Deterministic procedural star system generator
// Same position always generates the same system

// Seeded PRNG (Mulberry32)
function mulberry32(seed) {
  return function () {
    let t = seed += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function hashPosition(x, y, z) {
  // Simple hash from 3D position
  const a = Math.floor(x * 1000)
  const b = Math.floor(y * 1000)
  const c = Math.floor(z * 1000)
  return Math.abs((a * 73856093) ^ (b * 19349663) ^ (c * 83492791))
}

const SPECTRAL_TYPES = [
  { type: 'O', color: '#9db4ff', temp: '30,000-50,000 K', mass: '16-150 M☉', radius: '6.6-15 R☉', rarity: 0.003, luminosity: 'Very high' },
  { type: 'B', color: '#aabfff', temp: '10,000-30,000 K', mass: '2.1-16 M☉', radius: '1.8-6.6 R☉', rarity: 0.01, luminosity: 'High' },
  { type: 'A', color: '#cad7ff', temp: '7,500-10,000 K', mass: '1.4-2.1 M☉', radius: '1.4-1.8 R☉', rarity: 0.03, luminosity: 'Moderate-High' },
  { type: 'F', color: '#f8f7ff', temp: '6,000-7,500 K', mass: '1.04-1.4 M☉', radius: '1.15-1.4 R☉', rarity: 0.06, luminosity: 'Moderate' },
  { type: 'G', color: '#fff4ea', temp: '5,200-6,000 K', mass: '0.8-1.04 M☉', radius: '0.96-1.15 R☉', rarity: 0.15, luminosity: 'Moderate-Low' },
  { type: 'K', color: '#ffd2a1', temp: '3,700-5,200 K', mass: '0.45-0.8 M☉', radius: '0.7-0.96 R☉', rarity: 0.24, luminosity: 'Low' },
  { type: 'M', color: '#ffcc6f', temp: '2,400-3,700 K', mass: '0.08-0.45 M☉', radius: '0.1-0.7 R☉', rarity: 0.49, luminosity: 'Very low' },
]

const PLANET_TYPES = [
  { type: 'Hot Jupiter', minDist: 0.01, maxDist: 0.1, minR: 8, maxR: 20, color: '#c88b3a', atmo: 'H₂/He, extreme heat' },
  { type: 'Gas Giant', minDist: 1, maxDist: 15, minR: 6, maxR: 20, color: '#d4a76a', atmo: 'H₂/He, ammonia clouds' },
  { type: 'Ice Giant', minDist: 10, maxDist: 40, minR: 3, maxR: 7, color: '#7ec8e3', atmo: 'H₂/He/CH₄' },
  { type: 'Super-Earth', minDist: 0.3, maxDist: 3, minR: 1.2, maxR: 3, color: '#8fbc8f', atmo: 'Variable — possibly habitable' },
  { type: 'Rocky', minDist: 0.2, maxDist: 5, minR: 0.3, maxR: 1.5, color: '#c1956b', atmo: 'Thin or none' },
  { type: 'Ocean World', minDist: 0.5, maxDist: 2, minR: 1, maxR: 2.5, color: '#4a90d9', atmo: 'H₂O, N₂, possibly breathable' },
  { type: 'Lava World', minDist: 0.01, maxDist: 0.3, minR: 0.5, maxR: 2, color: '#e8451c', atmo: 'Silicate vapor, extreme heat' },
  { type: 'Desert World', minDist: 0.5, maxDist: 3, minR: 0.8, maxR: 1.8, color: '#d4a055', atmo: 'CO₂, thin' },
]

const STAR_NAMES_PREFIX = [
  'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta',
  'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi',
  'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega',
]

const STAR_NAMES_SUFFIX = [
  'Centauri', 'Cygni', 'Eridani', 'Draconis', 'Lyrae', 'Aquarii',
  'Orionis', 'Ursae', 'Pegasi', 'Virginis', 'Leonis', 'Bootis',
  'Carinae', 'Velorum', 'Puppis', 'Crucis', 'Pavonis', 'Tucanae',
  'Phoenicis', 'Hydrae', 'Serpentis', 'Librae', 'Scorpii', 'Sagittarii',
]

export function generateStarSystem(x, y, z) {
  const seed = hashPosition(x, y, z)
  const rng = mulberry32(seed)

  // Generate star name
  const prefix = STAR_NAMES_PREFIX[Math.floor(rng() * STAR_NAMES_PREFIX.length)]
  const suffix = STAR_NAMES_SUFFIX[Math.floor(rng() * STAR_NAMES_SUFFIX.length)]
  const catalog = Math.floor(rng() * 9000) + 1000
  const name = rng() > 0.5 ? `${prefix} ${suffix}` : `HD ${catalog}`

  // Pick spectral type (weighted by rarity)
  let roll = rng()
  let spectral = SPECTRAL_TYPES[SPECTRAL_TYPES.length - 1]
  for (const s of SPECTRAL_TYPES) {
    if (roll < s.rarity) { spectral = s; break }
    roll -= s.rarity
  }

  // Distance from galactic center → distance from Earth (approximation)
  const galacticRadius = Math.sqrt(x * x + z * z)
  const distanceLy = Math.abs(galacticRadius - 8) * 3260 + rng() * 500

  // Number of planets (bigger/hotter stars tend to have more)
  const typeIndex = SPECTRAL_TYPES.indexOf(spectral)
  const maxPlanets = Math.max(1, 10 - typeIndex)
  const numPlanets = Math.floor(rng() * maxPlanets) + (rng() > 0.15 ? 1 : 0)

  // Generate planets
  const planets = []
  const usedOrbits = []

  for (let i = 0; i < numPlanets; i++) {
    const planetType = PLANET_TYPES[Math.floor(rng() * PLANET_TYPES.length)]

    // Orbital distance
    let orbit = planetType.minDist + rng() * (planetType.maxDist - planetType.minDist)
    // Avoid orbital collisions
    while (usedOrbits.some((o) => Math.abs(o - orbit) < 0.15)) {
      orbit += 0.2 + rng() * 0.5
    }
    usedOrbits.push(orbit)

    // Planet radius in Earth radii
    const radius = planetType.minR + rng() * (planetType.maxR - planetType.minR)

    // Temperature (rough approximation based on star temp and distance)
    const starTempBase = parseInt(spectral.temp.split('-')[0].replace(/,/g, ''))
    const temp = Math.round(starTempBase * 0.07 / Math.sqrt(orbit) * (0.8 + rng() * 0.4))

    // Habitability
    const habitable = temp > 200 && temp < 320 && radius > 0.5 && radius < 2.5

    // Moons
    const moons = radius > 5 ? Math.floor(rng() * 80) : Math.floor(rng() * 5)

    planets.push({
      name: `${name} ${String.fromCharCode(98 + i)}`, // b, c, d, ...
      type: planetType.type,
      color: planetType.color,
      orbitAU: parseFloat(orbit.toFixed(2)),
      radiusEarth: parseFloat(radius.toFixed(2)),
      tempK: temp,
      tempC: temp - 273,
      atmosphere: planetType.atmo,
      habitable,
      moons,
      orbitalPeriod: parseFloat((Math.sqrt(orbit * orbit * orbit) * 365.25).toFixed(1)), // Kepler's 3rd law approximation
    })
  }

  // Sort planets by orbit
  planets.sort((a, b) => a.orbitAU - b.orbitAU)

  // Age
  const ageBillion = parseFloat((1 + rng() * 12).toFixed(1))

  return {
    name,
    spectral,
    distanceLy: Math.round(distanceLy),
    position: { x, y, z },
    age: `${ageBillion} billion years`,
    numPlanets: planets.length,
    planets,
    hasHabitablePlanet: planets.some((p) => p.habitable),
    isMultiStar: rng() > 0.55,
    companionType: rng() > 0.55 ? SPECTRAL_TYPES[Math.min(typeIndex + 2, 6)] : null,
  }
}
