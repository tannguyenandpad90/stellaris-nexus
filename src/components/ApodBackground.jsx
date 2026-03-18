import { useState } from 'react'
import { useApod } from '../hooks/useNasaData'

export default function ApodBackground() {
  const { data, loading, error } = useApod()
  const [imgLoaded, setImgLoaded] = useState(false)

  // Debug: log to console so we can see what's happening
  if (error) console.warn('APOD error:', error)

  const isImage = data && data.media_type === 'image'
  const isVideo = data && data.media_type === 'video'
  const imageUrl = data?.hdurl || data?.url

  return (
    <>
      {/* Background image (preload + display) */}
      {isImage && imageUrl && (
        <>
          {/* Hidden img to trigger load event */}
          <img
            src={imageUrl}
            alt=""
            className="hidden"
            onLoad={() => setImgLoaded(true)}
          />
          {imgLoaded && (
            <div
              className="absolute inset-0 opacity-20 transition-opacity duration-[3000ms]"
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 1,
                pointerEvents: 'none',
              }}
            />
          )}
        </>
      )}

      {/* APOD Info Badge — top left under header */}
      {data && (
        <div className="absolute top-20 left-4 max-w-xs pointer-events-auto" style={{ zIndex: 15 }}>
          <div className="glass-panel rounded-xl p-3 group hover:max-h-80 max-h-20 overflow-hidden transition-all duration-500 cursor-pointer">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-orange animate-pulse" />
              <span className="font-[family-name:var(--font-orbitron)] text-[10px] tracking-widest text-neon-orange uppercase">
                NASA — Photo of the Day
              </span>
            </div>

            {/* Thumbnail */}
            {isImage && imageUrl && (
              <div className="w-full h-20 rounded-lg overflow-hidden mb-2 hidden group-hover:block">
                <img src={imageUrl} alt={data.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Video embed hint */}
            {isVideo && (
              <div className="text-[9px] text-neon-cyan mb-1">
                Today&apos;s APOD is a video
              </div>
            )}

            <h4 className="text-xs font-semibold text-white leading-tight truncate group-hover:whitespace-normal">
              {data.title}
            </h4>
            <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 group-hover:line-clamp-none">
              {data.explanation}
            </p>
            <p className="text-[9px] text-gray-600 mt-1">
              {data.date} &middot; {data.copyright || 'NASA/Public Domain'}
            </p>
          </div>
        </div>
      )}

      {/* Error indicator */}
      {error && (
        <div className="absolute top-20 left-4 pointer-events-auto" style={{ zIndex: 15 }}>
          <div className="glass-panel rounded-xl p-2 text-[9px] text-red-400">
            APOD: {error}
          </div>
        </div>
      )}
    </>
  )
}
