import { useState, useEffect } from 'react'

// Simplified astronomical computations (client-side)
function getMoonPhase() {
  const now = new Date()
  const synodicMonth = 29.53058770576
  const knownNew = new Date('2024-01-11T11:57:00Z')
  const daysSinceNew = (now - knownNew) / (1000 * 60 * 60 * 24)
  const phase = ((daysSinceNew % synodicMonth) + synodicMonth) % synodicMonth
  const illumination = (1 - Math.cos((phase / synodicMonth) * 2 * Math.PI)) / 2
  let name = 'New Moon'
  if (phase < 1.85) name = 'New Moon'
  else if (phase < 7.38) name = 'Waxing Crescent'
  else if (phase < 9.23) name = 'First Quarter'
  else if (phase < 14.77) name = 'Waxing Gibbous'
  else if (phase < 16.62) name = 'Full Moon'
  else if (phase < 22.15) name = 'Waning Gibbous'
  else if (phase < 24.00) name = 'Last Quarter'
  else name = 'Waning Crescent'
  return { name, illumination: Math.round(illumination * 100), daysSinceNew: phase }
}

function getVisiblePlanets() {
  const month = new Date().getMonth()
  // Simplified visibility — updates roughly per season
  const visibility = {
    0: [{ name: 'Mars', when: 'Evening', brightness: 'Bright' }, { name: 'Jupiter', when: 'Evening', brightness: 'Very bright' }, { name: 'Saturn', when: 'Evening', brightness: 'Moderate' }],
    1: [{ name: 'Mars', when: 'Evening', brightness: 'Bright' }, { name: 'Jupiter', when: 'Evening', brightness: 'Very bright' }],
    2: [{ name: 'Venus', when: 'Morning', brightness: 'Very bright' }, { name: 'Jupiter', when: 'Evening', brightness: 'Bright' }],
    3: [{ name: 'Venus', when: 'Morning', brightness: 'Very bright' }, { name: 'Mars', when: 'Pre-dawn', brightness: 'Moderate' }],
    4: [{ name: 'Venus', when: 'Evening', brightness: 'Very bright' }, { name: 'Saturn', when: 'Morning', brightness: 'Moderate' }],
    5: [{ name: 'Venus', when: 'Evening', brightness: 'Very bright' }, { name: 'Jupiter', when: 'Morning', brightness: 'Bright' }, { name: 'Saturn', when: 'Morning', brightness: 'Moderate' }],
    6: [{ name: 'Venus', when: 'Evening', brightness: 'Bright' }, { name: 'Saturn', when: 'Evening', brightness: 'Moderate' }],
    7: [{ name: 'Saturn', when: 'Evening', brightness: 'Bright' }, { name: 'Jupiter', when: 'Late evening', brightness: 'Very bright' }],
    8: [{ name: 'Saturn', when: 'Evening', brightness: 'Bright' }, { name: 'Jupiter', when: 'Evening', brightness: 'Very bright' }],
    9: [{ name: 'Jupiter', when: 'Evening', brightness: 'Very bright' }, { name: 'Saturn', when: 'Evening', brightness: 'Moderate' }],
    10: [{ name: 'Jupiter', when: 'Evening', brightness: 'Very bright' }, { name: 'Mars', when: 'Late evening', brightness: 'Moderate' }],
    11: [{ name: 'Jupiter', when: 'Evening', brightness: 'Very bright' }, { name: 'Mars', when: 'Evening', brightness: 'Bright' }],
  }
  return visibility[month] || []
}

function getUpcomingMeteorShowers() {
  const month = new Date().getMonth()
  const day = new Date().getDate()
  const showers = [
    { name: 'Quadrantids', peak: 'Jan 3-4', month: 0, zhr: 120 },
    { name: 'Lyrids', peak: 'Apr 22-23', month: 3, zhr: 18 },
    { name: 'Eta Aquariids', peak: 'May 5-6', month: 4, zhr: 50 },
    { name: 'Perseids', peak: 'Aug 12-13', month: 7, zhr: 100 },
    { name: 'Draconids', peak: 'Oct 8-9', month: 9, zhr: 10 },
    { name: 'Orionids', peak: 'Oct 21-22', month: 9, zhr: 20 },
    { name: 'Leonids', peak: 'Nov 17-18', month: 10, zhr: 15 },
    { name: 'Geminids', peak: 'Dec 13-14', month: 11, zhr: 150 },
  ]
  // Find next shower
  return showers.filter((s) => s.month >= month).slice(0, 3)
}

function SunMoonWidget({ moon }) {
  return (
    <div className="glass-panel rounded-xl p-3 flex items-center gap-4">
      {/* Moon phase circle */}
      <div className="relative w-14 h-14 shrink-0">
        <div className="w-14 h-14 rounded-full bg-gray-800 overflow-hidden">
          <div
            className="h-full bg-gray-200 rounded-full transition-all"
            style={{
              width: `${moon.illumination}%`,
              marginLeft: moon.daysSinceNew > 14.77 ? `${100 - moon.illumination}%` : 0,
            }}
          />
        </div>
      </div>
      <div>
        <p className="text-xs text-white font-semibold">{moon.name}</p>
        <p className="text-[10px] text-gray-400">{moon.illumination}% illuminated</p>
      </div>
    </div>
  )
}

export default function SkyTonightPanel({ onClose }) {
  const [moon, setMoon] = useState(null)
  const [planets, setPlanets] = useState([])
  const [showers, setShowers] = useState([])

  useEffect(() => {
    setMoon(getMoonPhase())
    setPlanets(getVisiblePlanets())
    setShowers(getUpcomingMeteorShowers())
  }, [])

  const now = new Date()

  return (
    <div className="absolute right-4 top-20 w-80 z-20 max-h-[calc(100vh-120px)]">
      <div className="glass-panel rounded-2xl flex flex-col max-h-full animate-pulse-glow">
        <div className="flex items-center justify-between px-4 py-3 border-b border-panel-border shrink-0">
          <div>
            <h2 className="font-[family-name:var(--font-orbitron)] text-xs font-bold text-neon-purple tracking-wider">SKY TONIGHT</h2>
            <p className="text-[9px] text-gray-500 mt-0.5">{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none cursor-pointer">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Moon Phase */}
          {moon && <SunMoonWidget moon={moon} />}

          {/* Visible Planets */}
          <div>
            <h3 className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Visible Planets</h3>
            {planets.length === 0 && <p className="text-xs text-gray-500">No planets easily visible tonight</p>}
            {planets.map((p) => (
              <div key={p.name} className="glass-panel rounded-lg p-2 mb-1.5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-white font-semibold">{p.name}</span>
                  <span className="text-[10px] text-gray-400 ml-2">{p.when}</span>
                </div>
                <span className={`text-[9px] font-bold ${p.brightness === 'Very bright' ? 'text-yellow-400' : 'text-gray-400'}`}>
                  {p.brightness}
                </span>
              </div>
            ))}
          </div>

          {/* Meteor Showers */}
          <div>
            <h3 className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Upcoming Meteor Showers</h3>
            {showers.map((s) => (
              <div key={s.name} className="glass-panel rounded-lg p-2 mb-1.5">
                <div className="flex justify-between">
                  <span className="text-xs text-white font-semibold">{s.name}</span>
                  <span className="text-[10px] text-neon-cyan font-mono">{s.zhr}/hr</span>
                </div>
                <p className="text-[10px] text-gray-500">Peak: {s.peak}</p>
              </div>
            ))}
          </div>

          {/* Tip */}
          <div className="glass-panel rounded-lg p-2 border-l-2 border-neon-purple/40">
            <p className="text-[10px] text-gray-400">
              Best viewing: get away from city lights, let your eyes adjust for 20 minutes, and look up!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
