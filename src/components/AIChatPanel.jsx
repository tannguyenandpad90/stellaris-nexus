import { useState, useRef, useEffect } from 'react'

export default function AIChatPanel({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI Space Guide powered by Claude. Ask me anything about the universe — planets, stars, galaxies, black holes, or space exploration!",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) throw new Error('API request failed')

      const data = await response.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content || data.message || 'I encountered an issue processing your request.',
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm currently unable to connect to the AI service. To enable the AI Guide, please set up the backend API with your Claude API key. Check the README for setup instructions.",
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="absolute right-4 bottom-4 w-96 h-[500px] z-30 flex flex-col">
      <div className="glass-panel rounded-2xl flex flex-col h-full animate-pulse-glow">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-panel-border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <h2 className="font-[family-name:var(--font-orbitron)] text-xs font-bold text-neon-purple tracking-wider">
              AI SPACE GUIDE
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-lg leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-neon-purple/20 text-white rounded-br-sm'
                    : 'glass-panel text-gray-200 rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="glass-panel rounded-xl px-4 py-3 text-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-neon-purple animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-neon-purple animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-neon-purple animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-panel-border">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about the universe..."
              className="flex-1 glass-panel rounded-lg px-3 py-2 text-sm text-white bg-transparent border border-panel-border outline-none focus:border-neon-purple placeholder-gray-500"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="glass-panel rounded-lg px-4 py-2 text-sm text-neon-purple hover:bg-neon-purple/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              Send
            </button>
          </div>
          <p className="text-[10px] text-gray-600 mt-1 text-center">
            Powered by Claude AI
          </p>
        </div>
      </div>
    </div>
  )
}
