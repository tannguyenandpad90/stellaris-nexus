import Anthropic from '@anthropic-ai/sdk'
import { createServer } from 'http'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are an expert AI Space Guide for the "Stellaris Nexus" solar system explorer application.
You have deep knowledge about astronomy, astrophysics, space exploration, and planetary science.

Guidelines:
- Give concise, engaging answers (2-4 sentences for simple questions, more for complex ones)
- Use real NASA/ESA data and scientific facts
- Be enthusiastic about space!
- If asked about something non-space-related, gently redirect to space topics
- Include interesting comparisons to help users understand scale (e.g., "Jupiter could fit 1,300 Earths inside it")
- Mention ongoing or recent space missions when relevant`

const server = createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', async () => {
      try {
        const { messages } = JSON.parse(body)

        const response = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: messages,
        })

        const content = response.content[0]?.text || 'No response generated.'

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ content }))
      } catch (error) {
        console.error('API Error:', error.message)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: error.message }))
      }
    })
  } else {
    res.writeHead(404)
    res.end('Not found')
  }
})

const PORT = 3001
server.listen(PORT, () => {
  console.log(`Stellaris Nexus API server running on http://localhost:${PORT}`)
})
