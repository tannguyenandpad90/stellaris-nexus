import { Component } from 'react'

export default class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('3D Scene Error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-space-dark" style={{ zIndex: 5 }}>
          <div className="glass-panel rounded-2xl p-8 text-center max-w-md animate-pulse-glow">
            <div className="text-4xl mb-4">⚠</div>
            <h2 className="font-[family-name:var(--font-orbitron)] text-lg text-neon-cyan text-glow-cyan mb-2">
              RENDERING ERROR
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              {this.props.label || '3D scene'} encountered an error. This may be due to WebGL compatibility.
            </p>
            <p className="text-xs text-gray-600 mb-4 font-mono break-all">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="glass-panel rounded-lg px-6 py-2 text-sm text-neon-cyan hover:bg-neon-cyan/10 transition-colors cursor-pointer border border-neon-cyan/30 font-[family-name:var(--font-orbitron)] tracking-wider"
            >
              RETRY
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
