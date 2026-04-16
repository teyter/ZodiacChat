import { useState } from 'react'
import './App.css'

const INITIAL_MESSAGES = [
  {
    id: 1,
    from: 'Alice',
    to: 'Bob',
    plaintext: 'Hi Bob!',
  },
  {
    id: 2,
    from: 'Bob',
    to: 'Alice',
    plaintext: 'Hey Alice 👋',
  },
]

export default function App() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [draft, setDraft] = useState('')

  function sendAsAlice(e) {
    e.preventDefault()

    const trimmed = draft.trim()
    if (!trimmed) return

    const newMessage = {
      id: Date.now(),
      from: 'Alice',
      to: 'Bob',
      plaintext: trimmed,
    }

    setMessages((prev) => [...prev, newMessage])
    setDraft('')
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>ZodiacChat</h1>
        <p className="subtitle">Educational peer-to-peer cipher demo</p>
      </header>

      <main className="panel-grid">
        <section className="panel">
          <h2>Alice</h2>
          <p className="panel-subtitle">Sender</p>

          <form className="composer" onSubmit={sendAsAlice}>
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message to Bob..."
            />
            <button type="submit">Send to Bob</button>
          </form>

          <div className="message-list">
            {messages
              .filter((msg) => msg.from === 'Alice')
              .map((msg) => (
                <div key={msg.id} className="message-card">
                  <div className="message-meta">
                    {msg.from} → {msg.to}
                  </div>
                  <div>{msg.plaintext}</div>
                </div>
              ))}
          </div>
        </section>

        <section className="panel">
          <h2>Bob</h2>
          <p className="panel-subtitle">Receiver</p>

          <div className="message-list">
            {messages
              .filter((msg) => msg.to === 'Bob')
              .map((msg) => (
                <div key={msg.id} className="message-card">
                  <div className="message-meta">Received from {msg.from}</div>
                  <div>{msg.plaintext}</div>
                </div>
              ))}
          </div>
        </section>

        <section className="panel">
          <h2>Eve</h2>
          <p className="panel-subtitle">Third-party sniffer</p>

          <div className="message-list">
            {messages.map((msg) => (
              <div key={msg.id} className="message-card sniffed">
                <div className="message-meta">
                  Intercepted: {msg.from} → {msg.to}
                </div>
                <div>{msg.plaintext}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}