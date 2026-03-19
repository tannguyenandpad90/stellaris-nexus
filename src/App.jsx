import { useState, useCallback, useRef } from 'react'
import SolarSystem from './components/SolarSystem'
import GalaxyView from './components/GalaxyView'
import StarSystem3D from './components/StarSystem3D'
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
import StellarEvolution from './components/StellarEvolution'
import CosmicAddress from './components/CosmicAddress'
import LaunchSimulator from './components/LaunchSimulator'
import NasaMediaBrowser from './components/NasaMediaBrowser'
import SkyTonightPanel from './components/SkyTonightPanel'
import LoadingScreen from './components/LoadingScreen'
import AudioManager from './components/AudioManager'
import CanvasErrorBoundary from './components/CanvasErrorBoundary'
import KeyboardOverlay from './components/KeyboardOverlay'
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
  const [viewingSystem3D, setViewingSystem3D] = useState(null)
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [timeScale, setTimeScale] = useState(1)

  const [panels, setPanels] = useState({
    travel: false, chat: false, asteroids: false, mars: false,
    exoplanets: false, deepSpace: false, iss: false, weather: false,
    gravity: false, size: false, missions: false, media: false, sky: false,
    launch: false, cosmic: false, evolution: false,
  })

  const togglePanel = useCallback((name) => {
    setPanels((prev) => {
      const next = { ...prev, [name]: !prev[name] }
      const leftPanels = ['asteroids', 'mars', 'exoplanets', 'deepSpace', 'missions', 'media']
      if (leftPanels.includes(name) && next[name]) {
        leftPanels.forEach((p) => { if (p !== name) next[p] = false })
        setSelectedPlanet(null)
      }
      const rightPanels = ['travel', 'iss', 'weather', 'sky']
      if (rightPanels.includes(name) && next[name]) {
        rightPanels.forEach((p) => { if (p !== name) next[p] = false })
      }
      const centerPanels = ['gravity', 'size', 'launch', 'cosmic', 'evolution']
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

  const handleEnterSystem3D = useCallback((system) => {
    setViewingSystem3D(system)
  }, [])

  const handleExitSystem3D = useCallback(() => {
    setViewingSystem3D(null)
  }, [])

  const handleScaleChange = useCallback((newScale) => {
    if (viewingSystem3D) return // Don't switch scale while in 3D system view
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
  }, [scale, viewingSystem3D])

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
    if (viewingSystem3D) {
      setViewingSystem3D(null)
      return
    }
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
  }, [proceduralSystem, viewingSystem3D])

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

      <ScaleTransition scale={scale} prevScale={prevScaleRef.current} />

      {/* === 3D Star System View (fullscreen overlay) === */}
      {viewingSystem3D && (
        <CanvasErrorBoundary label="Star System 3D">
          <StarSystem3D system={viewingSystem3D} onBack={handleExitSystem3D} />
        </CanvasErrorBoundary>
      )}

      {/* Main scenes (hidden when viewing a star system) */}
      {!viewingSystem3D && (
        <>
          <ApodBackground />

          {isSolar && (
            <CanvasErrorBoundary label="Solar System">
              <SolarSystem onPlanetSelect={handlePlanetSelect} selectedPlanet={selectedPlanet} timeScale={timeScale} />
            </CanvasErrorBoundary>
          )}
          {(isGalaxy || isDeepSpace) && (
            <CanvasErrorBoundary label="Galaxy View">
              <GalaxyView
                onStarSelect={handleStarSelect} selectedStar={selectedStar}
                onProceduralStarSelect={handleProceduralStarSelect} selectedProceduralPos={proceduralPos}
              />
            </CanvasErrorBoundary>
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
          {panels.media && <NasaMediaBrowser onClose={() => closePanel('media')} />}

          {/* RIGHT PANELS */}
          {isGalaxy && selectedStar && !proceduralSystem && (
            <StarInfoPanel star={selectedStar} onClose={() => setSelectedStar(null)}
              onGoToSolarSystem={selectedStar.name === 'Sol' ? handleGoToSolarSystem : null} />
          )}
          {(isGalaxy || isDeepSpace) && proceduralSystem && (
            <StarSystemViewer
              system={proceduralSystem}
              onClose={() => { setProceduralSystem(null); setProceduralPos(null) }}
              onEnterSystem={handleEnterSystem3D}
              onShowEvolution={() => togglePanel('evolution')}
            />
          )}
          {isSolar && panels.travel && <TravelCalculator planets={planets} onClose={() => closePanel('travel')} />}
          {panels.iss && !proceduralSystem && <ISSTracker onClose={() => closePanel('iss')} />}
          {panels.weather && !proceduralSystem && <SpaceWeatherPanel onClose={() => closePanel('weather')} />}
          {panels.sky && <SkyTonightPanel onClose={() => closePanel('sky')} />}

          {/* CENTER PANELS */}
          {isSolar && panels.gravity && <GravitySimulator onClose={() => closePanel('gravity')} />}
          {isSolar && panels.size && <SizeComparison onClose={() => closePanel('size')} />}
          {isSolar && panels.launch && <LaunchSimulator onClose={() => closePanel('launch')} />}
          {panels.cosmic && <CosmicAddress onClose={() => closePanel('cosmic')} />}
          {(isGalaxy || isDeepSpace) && panels.evolution && proceduralSystem && (
            <StellarEvolution system={proceduralSystem} onClose={() => closePanel('evolution')} />
          )}

          {/* GLOBAL */}
          {panels.chat && <AIChatPanel onClose={() => closePanel('chat')} />}

          {/* Keyboard hint */}
          <div className="absolute bottom-4 left-4 z-10 text-[9px] text-gray-700 pointer-events-auto">
            <button onClick={() => setShowKeyboard(true)} className="hover:text-gray-400 transition-colors cursor-pointer">
              [1/2/3] Scale &middot; [Esc] Close &middot; [?] AI &middot; Click for all shortcuts
            </button>
          </div>
        </>
      )}

      <AudioManager scale={viewingSystem3D ? 'deepspace' : scale} />
      <KeyboardOverlay show={showKeyboard} onClose={() => setShowKeyboard(false)} />
    </div>
  )
}

export default App
