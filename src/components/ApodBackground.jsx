import { useApod } from '../hooks/useNasaData'

export default function ApodBackground() {
  const { data, loading } = useApod()

  if (loading || !data || data.media_type !== 'image') return null

  return (
    <>
      {/* Fullscreen background image with fade */}
      <div
        className="absolute inset-0 z-0 opacity-15 transition-opacity duration-[3000ms]"
        style={{
          backgroundImage: `url(${data.hdurl || data.url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* APOD Info Badge — bottom left */}
      <div className="absolute bottom-4 left-4 z-10 max-w-sm pointer-events-auto">
        <div className="glass-panel rounded-xl p-3 group hover:max-h-60 max-h-16 overflow-hidden transition-all duration-500">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-orange animate-pulse" />
            <span className="font-[family-name:var(--font-orbitron)] text-[10px] tracking-widest text-neon-orange uppercase">
              NASA Photo of the Day
            </span>
          </div>
          <h4 className="text-xs font-semibold text-white leading-tight truncate group-hover:whitespace-normal">
            {data.title}
          </h4>
          <p className="text-[10px] text-gray-400 mt-1 line-clamp-3 group-hover:line-clamp-none">
            {data.explanation}
          </p>
          <p className="text-[9px] text-gray-600 mt-1">{data.date} &middot; {data.copyright || 'NASA'}</p>
        </div>
      </div>
    </>
  )
}
