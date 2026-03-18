import { useState, useCallback } from 'react'
import SolarSystem from './components/SolarSystem'
import PlanetDashboard from './components/PlanetDashboard'
import TravelCalculator from './components/TravelCalculator'
import AIChatPanel from './components/AIChatPanel'
import Header from './components/Header'
import planets from './data/planets.json'

function App() {
  const [selectedPlanet, setSelectedPlanet] = useState(null)
  const [showTravel, setShowTravel] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [timeScale, setTimeScale] = useState(1)

  const handlePlanetSelect = useCallback((planetId) => {
    const planet = planets.find(p => p.id === planetId)
    setSelectedPlanet(planet)
  }, [])

  const handleClose = useCallback(() => {
    setSelectedPlanet(null)
  }, [])

  return (
    <div className="w-full h-full relative">
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
      />

      {/* Planet Dashboard */}
      {selectedPlanet && (
        <PlanetDashboard
          planet={selectedPlanet}
          onClose={handleClose}
        />
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
