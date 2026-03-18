import { useState } from 'react'
import { useMarsRoverPhotos } from '../hooks/useNasaData'

const ROVERS = [
  { id: 'curiosity', name: 'Curiosity', defaultSol: 3000 },
  { id: 'perseverance', name: 'Perseverance', defaultSol: 800 },
]

const CAMERAS = [
  { id: '', name: 'All Cameras' },
  { id: 'fhaz', name: 'Front Hazard' },
  { id: 'rhaz', name: 'Rear Hazard' },
  { id: 'navcam', name: 'Navigation' },
  { id: 'mast', name: 'Mast (Curiosity)' },
  { id: 'chemcam', name: 'ChemCam' },
]

export default function MarsGallery({ onClose }) {
  const [rover, setRover] = useState('curiosity')
  const [sol, setSol] = useState(3000)
  const [camera, setCamera] = useState('')
  const [lightbox, setLightbox] = useState(null)

  const { data: photos, loading, error, refetch } = useMarsRoverPhotos(rover, sol, camera || null)

  const handleRoverChange = (newRover) => {
    const r = ROVERS.find(rv => rv.id === newRover)
    setRover(newRover)
    setSol(r.defaultSol)
  }

  const handleRandomSol = () => {
    const maxSol = rover === 'curiosity' ? 4000 : 1000
    const newSol = Math.floor(Math.random() * maxSol) + 1
    setSol(newSol)
  }

  return (
    <div className="absolute left-4 top-20 bottom-4 w-[480px] z-20 flex flex-col">
      <div className="glass-panel rounded-2xl flex flex-col h-full animate-pulse-glow">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-panel-border shrink-0">
          <div>
            <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-neon-orange text-glow-orange tracking-wider">
              MARS SURFACE
            </h2>
            <p className="text-[10px] text-gray-500 mt-0.5">Rover Photography Archives</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Controls */}
        <div className="px-4 py-3 border-b border-panel-border shrink-0 space-y-2">
          {/* Rover selector */}
          <div className="flex gap-2">
            {ROVERS.map(r => (
              <button
                key={r.id}
                onClick={() => handleRoverChange(r.id)}
                className={`flex-1 text-xs py-1.5 rounded-lg transition-all cursor-pointer ${
                  rover === r.id
                    ? 'bg-neon-orange/20 text-neon-orange border border-neon-orange/40'
                    : 'glass-panel hover:bg-white/5 text-gray-400'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>

          {/* Sol + Camera */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
                Sol (Mars Day)
              </label>
              <div className="flex gap-1">
                <input
                  type="number"
                  value={sol}
                  onChange={(e) => setSol(Number(e.target.value))}
                  min={1}
                  className="flex-1 glass-panel rounded-lg px-2 py-1.5 text-xs text-white bg-transparent border border-panel-border outline-none focus:border-neon-orange w-20"
                />
                <button
                  onClick={handleRandomSol}
                  className="glass-panel rounded-lg px-2 py-1.5 text-xs text-neon-orange hover:bg-neon-orange/10 transition-colors cursor-pointer"
                  title="Random Sol"
                >
                  Rand
                </button>
              </div>
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
                Camera
              </label>
              <select
                value={camera}
                onChange={(e) => setCamera(e.target.value)}
                className="w-full glass-panel rounded-lg px-2 py-1.5 text-xs text-white bg-transparent border border-panel-border outline-none focus:border-neon-orange"
              >
                {CAMERAS.map(c => (
                  <option key={c.id} value={c.id} className="bg-space-dark">{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Photo Grid */}
        <div className="flex-1 overflow-y-auto p-3">
          {loading && (
            <div className="flex items-center justify-center h-32">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-neon-orange animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-neon-orange animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-neon-orange animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm p-3 glass-panel rounded-lg">Error: {error}</div>
          )}

          {!loading && photos && photos.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-400 text-sm">No photos found for Sol {sol}</p>
              <button
                onClick={handleRandomSol}
                className="mt-2 text-neon-orange text-xs underline cursor-pointer"
              >
                Try a random Sol
              </button>
            </div>
          )}

          {photos && photos.length > 0 && (
            <>
              <p className="text-[10px] text-gray-500 mb-2">
                {photos.length} photos &middot; Sol {sol} &middot; {photos[0]?.earth_date}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => setLightbox(photo)}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer group relative"
                  >
                    <img
                      src={photo.img_src}
                      alt={`Mars - ${photo.camera.full_name}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                      <span className="text-[9px] text-white truncate">{photo.camera.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8"
          onClick={() => setLightbox(null)}
        >
          <div
            className="max-w-4xl max-h-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightbox.img_src}
              alt={`Mars - ${lightbox.camera.full_name}`}
              className="max-w-full max-h-[80vh] rounded-xl object-contain"
            />
            <div className="glass-panel rounded-lg p-3 mt-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-neon-orange font-semibold">{lightbox.camera.full_name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {lightbox.rover.name} &middot; Sol {lightbox.sol} &middot; {lightbox.earth_date}
                  </p>
                </div>
                <button
                  onClick={() => setLightbox(null)}
                  className="text-gray-400 hover:text-white transition-colors text-2xl leading-none cursor-pointer"
                >
                  &times;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
