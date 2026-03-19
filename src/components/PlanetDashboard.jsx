import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import planets from '../data/planets.json'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel rounded-lg px-3 py-2 text-xs">
        <p className="text-neon-cyan">{label}</p>
        <p className="text-white">{payload[0].value}</p>
      </div>
    )
  }
  return null
}

export default function PlanetDashboard({ planet, onClose }) {
  // Gravity comparison data
  const gravityData = planets.map(p => ({
    name: p.name.substring(0, 3),
    gravity: p.gravity,
    fill: p.id === planet.id ? '#00f5ff' : '#334155',
  }))

  // Temperature data for the selected planet
  const tempData = [
    { name: 'Min', value: planet.temperature.min },
    { name: 'Avg', value: planet.temperature.avg },
    { name: 'Max', value: planet.temperature.max },
  ]

  return (
    <div className="absolute left-4 top-20 bottom-4 w-96 z-20 overflow-y-auto">
      <div className="glass-panel rounded-2xl p-5 animate-pulse-glow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-[family-name:var(--font-orbitron)] text-xl font-bold text-neon-cyan text-glow-cyan">
              {planet.name}
            </h2>
            <p className="text-gray-400 text-sm">{planet.nameVi}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <StatBox label="Gravity" value={`${planet.gravity} m/s²`} />
          <StatBox label="Diameter" value={planet.diameter} />
          <StatBox label="Day Length" value={planet.dayLength} />
          <StatBox label="Year Length" value={planet.yearLength} />
          <StatBox label="Moons" value={planet.moons.toString()} />
          <StatBox label="Mass" value={planet.mass} />
        </div>

        {/* Atmosphere */}
        <div className="mb-5">
          <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Atmosphere</h3>
          <p className="text-sm text-gray-200 glass-panel rounded-lg p-3">{planet.atmosphere}</p>
        </div>

        {/* Composition */}
        <div className="mb-5">
          <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Composition</h3>
          <div className="flex flex-wrap gap-2">
            {planet.composition.map((comp, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-full glass-panel text-neon-cyan"
              >
                {comp}
              </span>
            ))}
          </div>
        </div>

        {/* Temperature Chart */}
        <div className="mb-5">
          <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2">
            Temperature (°C)
          </h3>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tempData}>
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#00f5ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gravity Comparison */}
        <div className="mb-5">
          <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2">
            Gravity Comparison (m/s²)
          </h3>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gravityData}>
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="gravity" radius={[3, 3, 0, 0]}>
                  {gravityData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fun Fact */}
        <div className="glass-panel rounded-lg p-3 border-l-2 border-neon-orange">
          <h3 className="text-xs uppercase tracking-wider text-neon-orange mb-1">
            Fun Fact
          </h3>
          <p className="text-sm text-gray-300">{planet.funFact}</p>
        </div>

        {/* Distance from Sun */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Distance from Sun: <span className="text-neon-cyan">{planet.distanceFromSun} million km</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value }) {
  return (
    <div className="glass-panel rounded-lg p-3">
      <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-white font-semibold mt-1 break-words">{value}</p>
    </div>
  )
}
