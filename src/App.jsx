import { useState, useCallback } from 'react'
import SolarSystem from './components/SolarSystem'
import GalaxyView from './components/GalaxyView'
import PlanetDashboard from './components/PlanetDashboard'
import TravelCalculator from './components/TravelCalculator'
import AIChatPanel from './components/AIChatPanel'
import ApodBackground from './components/ApodBackground'
import AsteroidAlert from './components/AsteroidAlert'
import MarsGallery from './components/MarsGallery'
import ExoplanetPanel from './components/ExoplanetPanel'
import DeepSpacePanel from './components/DeepSpacePanel'
import StarInfoPanel from './components/StarInfoPanel'
import ScaleNavigator from './components/ScaleNavigator'
import ISSTracker from './components/ISSTracker'
import SpaceWeatherPanel from './components/SpaceWeatherPanel'
import GravitySimulator from './components/GravitySimulator'
import SizeComparison from './components/SizeComparison'
import MissionTimeline from './components/MissionTimeline'
import LoadingScreen from './components/LoadingScreen'
import AudioManager from './components/AudioManager'
import Header from './components/Header'
import planets from './data/planets.json'

function App() {
  const [loaded, setLoaded] = useState(false)
  const [scale, setScale] = useState('solar')
  const [selectedPlanet, setSelectedPlanet] = useState(null)
  const [selectedStar, setSelectedStar] = useState(null)
  const [timeScale, setTimeScale] = useState(1)

  // Panel visibility
  const [panels, setPanels] = useState({
    travel: false,
    chat: false,
    asteroids: false,
    mars: false,
    exoplanets: false,
    deepSpace: false,
    iss: false,
    weather: false,
    gravity: false,
    size: false,
    missions: false,
  })

  const togglePanel = useCallback((name) => {
    setPanels((prev) => {
      const next = { ...prev, [name]: !prev[name] }
      // Close conflicting left panels
      const leftPanels = ['asteroids', 'mars', 'exoplanets', 'deepSpace', 'missions']
      if (leftPanels.includes(name) && next[name]) {
        leftPanels.forEach((p) => { if (p !== name) next[p] = false })
        setSelectedPlanet(null)
      }
      // Close conflicting right panels
      const rightPanels = ['travel', 'iss', 'weather']
      if (rightPanels.includes(name) && next[name]) {
        rightPanels.forEach((p) => { if (p !== name) next[p] = false })
      }
      // Close conflicting center panels
      const centerPanels = ['gravity', 'size']
      if (centerPanels.includes(name) && next[name]) {
        centerPanels.forEach((p) => { if (p !== name) next[p] = false })
      }
      return next
    })
  }, [])

  const closePanel = useCallback((name) => {
    setPanels((prev) => ({ ...prev, [name]: false }))
  }, [])

  const handlePlanetSelect = useCallback((planetId) => {
    const planet = planets.find(p => p.id === planetId)
    setSelectedPlanet(planet)
    setPanels((prev) => ({ ...prev, asteroids: false, mars: false, missions: false }))
  }, [])

  const handleStarSelect = useCallback((star) => {
    setSelectedStar(star)
  }, [])

  const handleScaleChange = useCallback((newScale) => {
    setSelectedPlanet(null)
    setSelectedStar(null)
    setPanels((prev) => {
      const next = { ...prev }
      // Close scale-specific panels
      Object.keys(next).forEach((k) => { if (k !== 'chat') next[k] = false })
      if (newScale === 'deepspace') next.deepSpace = true
      return next
    })
    setScale(newScale)
  }, [])

  const handleGoToSolarSystem = useCallback(() => {
    setScale('solar')
    setSelectedStar(null)
    setPanels((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((k) => { if (k !== 'chat') next[k] = false })
      return next
    })
  }, [])

  const isSolar = scale === 'solar'
  const isGalaxy = scale === 'galaxy'
  const isDeepSpace = scale === 'deepspace'

  return (
    <div className="w-full h-full relative">
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}

      <ApodBackground />

      {/* 3D Scenes */}
      {isSolar && (
        <SolarSystem
          onPlanetSelect={handlePlanetSelect}
          selectedPlanet={selectedPlanet}
          timeScale={timeScale}
        />
      )}
      {(isGalaxy || isDeepSpace) && (
        <GalaxyView onStarSelect={handleStarSelect} selectedStar={selectedStar} />
      )}

      <ScaleNavigator currentScale={scale} onScaleChange={handleScaleChange} />

      <Header
        timeScale={timeScale}
        setTimeScale={setTimeScale}
        panels={panels}
        togglePanel={togglePanel}
        scale={scale}
      />

      {/* === LEFT PANELS === */}
      {isSolar && selectedPlanet && (
        <PlanetDashboard planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />
      )}
      {isSolar && panels.asteroids && (
        <AsteroidAlert onClose={() => closePanel('asteroids')} />
      )}
      {isSolar && panels.mars && (
        <MarsGallery onClose={() => closePanel('mars')} />
      )}
      {isSolar && panels.missions && (
        <MissionTimeline onClose={() => closePanel('missions')} />
      )}
      {(isGalaxy || isDeepSpace) && panels.exoplanets && (
        <ExoplanetPanel onClose={() => closePanel('exoplanets')} />
      )}
      {isDeepSpace && panels.deepSpace && (
        <DeepSpacePanel onClose={() => closePanel('deepSpace')} />
      )}

      {/* === RIGHT PANELS === */}
      {isGalaxy && selectedStar && (
        <StarInfoPanel
          star={selectedStar}
          onClose={() => setSelectedStar(null)}
          onGoToSolarSystem={selectedStar.name === 'Sol' ? handleGoToSolarSystem : null}
        />
      )}
      {isSolar && panels.travel && (
        <TravelCalculator planets={planets} onClose={() => closePanel('travel')} />
      )}
      {panels.iss && (
        <ISSTracker onClose={() => closePanel('iss')} />
      )}
      {panels.weather && (
        <SpaceWeatherPanel onClose={() => closePanel('weather')} />
      )}

      {/* === CENTER PANELS === */}
      {isSolar && panels.gravity && (
        <GravitySimulator onClose={() => closePanel('gravity')} />
      )}
      {isSolar && panels.size && (
        <SizeComparison onClose={() => closePanel('size')} />
      )}

      {/* === GLOBAL === */}
      {panels.chat && <AIChatPanel onClose={() => closePanel('chat')} />}
      <AudioManager />
    </div>
  )
}

export default App
