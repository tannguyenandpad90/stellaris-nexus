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
import LoadingScreen from './components/LoadingScreen'
import AudioManager from './components/AudioManager'
import Header from './components/Header'
import planets from './data/planets.json'

function App() {
  const [loaded, setLoaded] = useState(false)
  const [scale, setScale] = useState('solar') // solar | galaxy | deepspace
  const [selectedPlanet, setSelectedPlanet] = useState(null)
  const [selectedStar, setSelectedStar] = useState(null)
  const [showTravel, setShowTravel] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showAsteroids, setShowAsteroids] = useState(false)
  const [showMars, setShowMars] = useState(false)
  const [showExoplanets, setShowExoplanets] = useState(false)
  const [showDeepSpace, setShowDeepSpace] = useState(false)
  const [timeScale, setTimeScale] = useState(1)

  // Close all left panels
  const closeLeftPanels = useCallback(() => {
    setSelectedPlanet(null)
    setShowAsteroids(false)
    setShowMars(false)
    setShowExoplanets(false)
    setShowDeepSpace(false)
  }, [])

  const handlePlanetSelect = useCallback((planetId) => {
    const planet = planets.find(p => p.id === planetId)
    setSelectedPlanet(planet)
    setShowAsteroids(false)
    setShowMars(false)
  }, [])

  const handleStarSelect = useCallback((star) => {
    setSelectedStar(star)
  }, [])

  const handleScaleChange = useCallback((newScale) => {
    closeLeftPanels()
    setSelectedStar(null)
    setShowTravel(false)
    setScale(newScale)
    // Auto-open relevant panel
    if (newScale === 'deepspace') setShowDeepSpace(true)
    if (newScale === 'galaxy') setShowExoplanets(false)
  }, [closeLeftPanels])

  const handleGoToSolarSystem = useCallback(() => {
    setScale('solar')
    setSelectedStar(null)
    closeLeftPanels()
  }, [closeLeftPanels])

  const handleShowAsteroids = useCallback(() => {
    setShowAsteroids(v => !v)
    setShowMars(false)
    setShowExoplanets(false)
    setShowDeepSpace(false)
    setSelectedPlanet(null)
  }, [])

  const handleShowMars = useCallback(() => {
    setShowMars(v => !v)
    setShowAsteroids(false)
    setShowExoplanets(false)
    setShowDeepSpace(false)
    setSelectedPlanet(null)
  }, [])

  const handleShowExoplanets = useCallback(() => {
    setShowExoplanets(v => !v)
    setShowAsteroids(false)
    setShowMars(false)
    setShowDeepSpace(false)
    setSelectedPlanet(null)
  }, [])

  const handleShowDeepSpace = useCallback(() => {
    setShowDeepSpace(v => !v)
    setShowAsteroids(false)
    setShowMars(false)
    setShowExoplanets(false)
    setSelectedPlanet(null)
  }, [])

  const isSolarMode = scale === 'solar'
  const isGalaxyMode = scale === 'galaxy'
  const isDeepSpaceMode = scale === 'deepspace'

  return (
    <div className="w-full h-full relative">
      {/* Cinematic Loading Screen */}
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}

      {/* NASA APOD Background */}
      <ApodBackground />

      {/* 3D Scenes — switch by scale */}
      {isSolarMode && (
        <SolarSystem
          onPlanetSelect={handlePlanetSelect}
          selectedPlanet={selectedPlanet}
          timeScale={timeScale}
        />
      )}

      {(isGalaxyMode || isDeepSpaceMode) && (
        <GalaxyView
          onStarSelect={handleStarSelect}
          selectedStar={selectedStar}
        />
      )}

      {/* Scale Navigator */}
      <ScaleNavigator currentScale={scale} onScaleChange={handleScaleChange} />

      {/* UI Overlay — Header */}
      <Header
        timeScale={timeScale}
        setTimeScale={setTimeScale}
        showTravel={showTravel}
        setShowTravel={setShowTravel}
        showChat={showChat}
        setShowChat={setShowChat}
        showAsteroids={showAsteroids}
        setShowAsteroids={handleShowAsteroids}
        showMars={showMars}
        setShowMars={handleShowMars}
        showExoplanets={showExoplanets}
        setShowExoplanets={handleShowExoplanets}
        showDeepSpace={showDeepSpace}
        setShowDeepSpace={handleShowDeepSpace}
        scale={scale}
      />

      {/* === SOLAR MODE PANELS === */}
      {isSolarMode && selectedPlanet && (
        <PlanetDashboard planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />
      )}
      {isSolarMode && showAsteroids && (
        <AsteroidAlert onClose={() => setShowAsteroids(false)} />
      )}
      {isSolarMode && showMars && (
        <MarsGallery onClose={() => setShowMars(false)} />
      )}
      {isSolarMode && showTravel && (
        <TravelCalculator planets={planets} onClose={() => setShowTravel(false)} />
      )}

      {/* === GALAXY MODE PANELS === */}
      {isGalaxyMode && selectedStar && (
        <StarInfoPanel
          star={selectedStar}
          onClose={() => setSelectedStar(null)}
          onGoToSolarSystem={selectedStar.name === 'Sol' ? handleGoToSolarSystem : null}
        />
      )}
      {(isGalaxyMode || isDeepSpaceMode) && showExoplanets && (
        <ExoplanetPanel onClose={() => setShowExoplanets(false)} />
      )}

      {/* === DEEP SPACE PANELS === */}
      {isDeepSpaceMode && showDeepSpace && (
        <DeepSpacePanel onClose={() => setShowDeepSpace(false)} />
      )}

      {/* === GLOBAL PANELS === */}
      {showChat && <AIChatPanel onClose={() => setShowChat(false)} />}

      {/* Ambient Space Audio */}
      <AudioManager />
    </div>
  )
}

export default App
