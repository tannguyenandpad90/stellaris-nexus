import { useState, useCallback, useRef } from 'react'
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
import StarSystemViewer from './components/StarSystemViewer'
import ScaleNavigator from './components/ScaleNavigator'
import ScaleTransition from './components/ScaleTransition'
import ISSTracker from './components/ISSTracker'
import SpaceWeatherPanel from './components/SpaceWeatherPanel'
import GravitySimulator from './components/GravitySimulator'
import SizeComparison from './components/SizeComparison'
import MissionTimeline from './components/MissionTimeline'
import LoadingScreen from './components/LoadingScreen'
import AudioManager from './components/AudioManager'
import Header from './components/Header'
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts'
import planets from './data/planets.json'

function App() {
  const [loaded, setLoaded] = useState(false)
  const [scale, setScale] = useState('solar')
  const prevScaleRef = useRef(null)
  const [selectedPlanet, setSelectedPlanet] = useState(null)
  const [selectedStar, setSelectedStar] = useState(null)
  const [proceduralSystem, setProceduralSystem] = useState(null)
  const [proceduralPos, setProceduralPos] = useState(null)
  const [timeScale, setTimeScale] = useState(1)

  const [panels, setPanels] = useState({
    travel: false, chat: false, asteroids: false, mars: false,
    exoplanets: false, deepSpace: false, iss: false, weather: false,
    gravity: false, size: false, missions: false,
  })

  const togglePanel = useCallback((name) => {
    setPanels((prev) => {
      const next = { ...prev, [name]: !prev[name] }
      const leftPanels = ['asteroids', 'mars', 'exoplanets', 'deepSpace', 'missions']
      if (leftPanels.includes(name) && next[name]) {
        leftPanels.forEach((p) => { if (p !== name) next[p] = false })
        setSelectedPlanet(null)
      }
      const rightPanels = ['travel', 'iss', 'weather']
      if (rightPanels.includes(name) && next[name]) {
        rightPanels.forEach((p) => { if (p !== name) next[p] = false })
      }
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
    setSelectedPlanet(planets.find(p => p.id === planetId))
    setPanels((prev) => ({ ...prev, asteroids: false, mars: false, missions: false }))
  }, [])

  const handleStarSelect = useCallback((star) => {
    setSelectedStar(star)
    setProceduralSystem(null)
    setProceduralPos(null)
  }, [])

  const handleProceduralStarSelect = useCallback((system) => {
    setProceduralSystem(system)
    setProceduralPos([system.wx, system.wy, system.wz])
    setSelectedStar(null)
  }, [])

  const handleScaleChange = useCallback((newScale) => {
    prevScaleRef.current = scale
    setSelectedPlanet(null)
    setSelectedStar(null)
    setProceduralSystem(null)
    setProceduralPos(null)
    setPanels((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((k) => { if (k !== 'chat') next[k] = false })
      if (newScale === 'deepspace') next.deepSpace = true
      return next
    })
    setScale(newScale)
  }, [scale])

  const handleGoToSolarSystem = useCallback(() => {
    prevScaleRef.current = scale
    setScale('solar')
    setSelectedStar(null)
    setProceduralSystem(null)
    setProceduralPos(null)
    setPanels((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((k) => { if (k !== 'chat') next[k] = false })
      return next
    })
  }, [scale])

  const handleEscape = useCallback(() => {
    setSelectedPlanet(null)
    setSelectedStar(null)
    if (proceduralSystem) {
      setProceduralSystem(null)
      setProceduralPos(null)
    } else {
      setPanels((prev) => {
        const next = { ...prev }
        Object.keys(next).forEach((k) => { next[k] = false })
        return next
      })
    }
  }, [proceduralSystem])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onScaleChange: handleScaleChange,
    onEscape: handleEscape,
    onTogglePanel: togglePanel,
    currentScale: scale,
  })

  const isSolar = scale === 'solar'
  const isGalaxy = scale === 'galaxy'
  const isDeepSpace = scale === 'deepspace'

  return (
    <div className="w-full h-full relative">
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}

      {/* Scale transition overlay */}
      <ScaleTransition scale={scale} prevScale={prevScaleRef.current} />

      <ApodBackground />

      {isSolar && (
        <SolarSystem onPlanetSelect={handlePlanetSelect} selectedPlanet={selectedPlanet} timeScale={timeScale} />
      )}
      {(isGalaxy || isDeepSpace) && (
        <GalaxyView
          onStarSelect={handleStarSelect} selectedStar={selectedStar}
          onProceduralStarSelect={handleProceduralStarSelect} selectedProceduralPos={proceduralPos}
        />
      )}

      <ScaleNavigator currentScale={scale} onScaleChange={handleScaleChange} />

      <Header timeScale={timeScale} setTimeScale={setTimeScale} panels={panels} togglePanel={togglePanel} scale={scale} />

      {/* LEFT PANELS */}
      {isSolar && selectedPlanet && <PlanetDashboard planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />}
      {isSolar && panels.asteroids && <AsteroidAlert onClose={() => closePanel('asteroids')} />}
      {isSolar && panels.mars && <MarsGallery onClose={() => closePanel('mars')} />}
      {isSolar && panels.missions && <MissionTimeline onClose={() => closePanel('missions')} />}
      {(isGalaxy || isDeepSpace) && panels.exoplanets && <ExoplanetPanel onClose={() => closePanel('exoplanets')} />}
      {isDeepSpace && panels.deepSpace && <DeepSpacePanel onClose={() => closePanel('deepSpace')} />}

      {/* RIGHT PANELS */}
      {isGalaxy && selectedStar && !proceduralSystem && (
        <StarInfoPanel star={selectedStar} onClose={() => setSelectedStar(null)}
          onGoToSolarSystem={selectedStar.name === 'Sol' ? handleGoToSolarSystem : null} />
      )}
      {(isGalaxy || isDeepSpace) && proceduralSystem && (
        <StarSystemViewer system={proceduralSystem} onClose={() => { setProceduralSystem(null); setProceduralPos(null) }} />
      )}
      {isSolar && panels.travel && <TravelCalculator planets={planets} onClose={() => closePanel('travel')} />}
      {panels.iss && !proceduralSystem && <ISSTracker onClose={() => closePanel('iss')} />}
      {panels.weather && !proceduralSystem && <SpaceWeatherPanel onClose={() => closePanel('weather')} />}

      {/* CENTER PANELS */}
      {isSolar && panels.gravity && <GravitySimulator onClose={() => closePanel('gravity')} />}
      {isSolar && panels.size && <SizeComparison onClose={() => closePanel('size')} />}

      {/* GLOBAL */}
      {panels.chat && <AIChatPanel onClose={() => closePanel('chat')} />}
      <AudioManager scale={scale} />

      {/* Keyboard hint */}
      <div className="absolute bottom-4 left-4 z-10 text-[9px] text-gray-700 pointer-events-none">
        [1/2/3] Scale &middot; [Esc] Close &middot; [?] AI &middot; [I] ISS &middot; [W] Weather
      </div>
    </div>
  )
}

export default App
