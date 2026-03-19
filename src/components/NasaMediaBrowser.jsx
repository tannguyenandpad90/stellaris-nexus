import { useState, useEffect } from 'react'
import { useNasaImages } from '../hooks/useNasaImages'

const QUICK_SEARCHES = ['Nebula', 'Mars', 'Galaxy', 'ISS', 'Moon', 'Jupiter', 'Shuttle', 'JWST', 'Earth', 'Apollo']

export default function NasaMediaBrowser({ onClose }) {
  const { results, loading, error, search } = useNasaImages()
  const [query, setQuery] = useState('')
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => { search('nebula') }, [search])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) search(query.trim())
  }

  return (
    <div className="absolute left-4 top-20 bottom-4 w-[460px] z-20 flex flex-col">
      <div className="glass-panel rounded-2xl flex flex-col h-full animate-pulse-glow">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-panel-border shrink-0">
          <div>
            <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-neon-cyan tracking-wider">NASA MEDIA</h2>
            <p className="text-[10px] text-gray-500 mt-0.5">Image & Video Library</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none cursor-pointer">&times;</button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="px-4 py-2 border-b border-panel-border shrink-0">
          <div className="flex gap-2">
            <input
              type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search NASA images..."
              className="flex-1 glass-panel rounded-lg px-3 py-1.5 text-xs text-white bg-transparent border border-panel-border outline-none focus:border-neon-cyan placeholder-gray-500"
            />
            <button type="submit" className="glass-panel rounded-lg px-3 py-1.5 text-xs text-neon-cyan hover:bg-neon-cyan/10 cursor-pointer">Search</button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {QUICK_SEARCHES.map((q) => (
              <button key={q} type="button" onClick={() => { setQuery(q); search(q) }}
                className="text-[9px] px-2 py-0.5 rounded-full glass-panel text-gray-400 hover:text-neon-cyan hover:bg-neon-cyan/10 cursor-pointer transition-colors">
                {q}
              </button>
            ))}
          </div>
        </form>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-3">
          {loading && (
            <div className="flex items-center justify-center h-32">
              <div className="flex gap-1.5">
                {[0, 150, 300].map((d) => <span key={d} className="w-2 h-2 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            </div>
          )}
          {error && <p className="text-red-400 text-xs p-3">{error}</p>}
          {results && (
            <>
              <p className="text-[10px] text-gray-500 mb-2">{results.total.toLocaleString()} results for &quot;{results.query}&quot;</p>
              <div className="grid grid-cols-3 gap-2">
                {results.items.map((item) => (
                  <button key={item.nasaId} onClick={() => setLightbox(item)}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer group relative">
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                      <span className="text-[8px] text-white line-clamp-2">{item.title}</span>
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
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8" onClick={() => setLightbox(null)}>
          <div className="max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.thumbnail?.replace('thumb', 'medium') || lightbox.thumbnail} alt={lightbox.title} className="max-w-full max-h-[75vh] rounded-xl object-contain" />
            <div className="glass-panel rounded-lg p-3 mt-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neon-cyan font-semibold">{lightbox.title}</p>
                  <p className="text-[10px] text-gray-400 mt-1 line-clamp-3">{lightbox.description}</p>
                  <p className="text-[9px] text-gray-600 mt-1">{lightbox.date} &middot; {lightbox.center || 'NASA'}</p>
                </div>
                <button onClick={() => setLightbox(null)} className="text-gray-400 hover:text-white text-2xl leading-none cursor-pointer ml-3">&times;</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
