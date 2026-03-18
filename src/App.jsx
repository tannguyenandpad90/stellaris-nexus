import { useState, useCallback } from 'react'
import SolarSystem from './components/SolarSystem'
import PlanetDashboard from './components/PlanetDashboard'
import TravelCalculator from './components/TravelCalculator'
import AIChatPanel from './components/AIChatPanel'
import ApodBackground from './components/ApodBackground'
import AsteroidAlert from './components/AsteroidAlert'
import MarsGallery from './components/MarsGallery'
import Header from './components/Header'
import planets from './data/planets.json'

function App() {
  const [selectedPlanet, setSelectedPlanet] = useState(null)
  const [showTravel, setShowTravel] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showAsteroids, setShowAsteroids] = useState(false)
  const [showMars, setShowMars] = useState(false)
  const [timeScale, setTimeScale] = useState(1)

  const handlePlanetSelect = useCallback((planetId) => {
    const planet = planets.find(p => p.id === planetId)
    setSelectedPlanet(planet)
    // Close other left panels
    setShowAsteroids(false)
    setShowMars(false)
  }, [])

  const handleClose = useCallback(() => {
    setSelectedPlanet(null)
  }, [])

  const handleShowAsteroids = useCallback(() => {
    setShowAsteroids(v => !v)
    setShowMars(false)
    setSelectedPlanet(null)
  }, [])

  const handleShowMars = useCallback(() => {
    setShowMars(v => !v)
    setShowAsteroids(false)
    setSelectedPlanet(null)
  }, [])

  return (
    <div className="w-full h-full relative">
      {/* NASA APOD Background */}
      <ApodBackground />

      {/* 3D Scene */}
      <SolarSystem
        onPlanetSelect={handlePlanetSelect}
        selectedPlanet={selectedPlanet}
        timeScale={timeScale}
      />

      {/* UI Overlay */}
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
      />

      {/* Planet Dashboard */}
      {selectedPlanet && (
        <PlanetDashboard
          planet={selectedPlanet}
          onClose={handleClose}
        />
      )}

      {/* Asteroid NEO Tracker */}
      {showAsteroids && (
        <AsteroidAlert onClose={() => setShowAsteroids(false)} />
      )}

      {/* Mars Rover Gallery */}
      {showMars && (
        <MarsGallery onClose={() => setShowMars(false)} />
      )}

      {/* Travel Calculator */}
      {showTravel && (
        <TravelCalculator
          planets={planets}
          onClose={() => setShowTravel(false)}
        />
      )}

      {/* AI Chat */}
      {showChat && (
        <AIChatPanel onClose={() => setShowChat(false)} />
      )}
    </div>
  )
}

export default App
