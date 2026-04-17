import { useEffect, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'zodiacchat-messages'

const INITIAL_MESSAGES = [
  {
    id: 1,
    from: 'Alice',
    to: 'Bob',
    plaintext: 'Hi Bob!',
    ciphertext: '!BOB IH',
  },
  {
    id: 2,
    from: 'Bob',
    to: 'Alice',
    plaintext: 'Hey Alice 👋',
    ciphertext: '👋 ECILA YEH',
  },
]

function encryptMessage(plaintext) {
  return plaintext.toUpperCase().split('').reverse().join('')
}

export default function App() {
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY)

    if (savedMessages) {
      try {
        return JSON.parse(savedMessages)
      } catch (error) {
        console.error('Failed to parse saved messages:', error)
      }
    }

    return INITIAL_MESSAGES
  })

  const [draft, setDraft] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  function sendAsAlice(e) {
    e.preventDefault()

    const trimmed = draft.trim()
    if (!trimmed) return

    const newMessage = {
      id: Date.now(),
      from: 'Alice',
      to: 'Bob',
      plaintext: trimmed,
      ciphertext: encryptMessage(trimmed),
    }

    setMessages((prev) => [...prev, newMessage])
    setDraft('')
  }

  function resetConversation() {
    setMessages(INITIAL_MESSAGES)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>ZodiacChat</h1>
          <p className="subtitle">Educational peer-to-peer cipher demo</p>
        </div>

        <button className="reset-button" onClick={resetConversation}>
          Reset chat
        </button>
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

                  <div className="label">Plaintext</div>
                  <div>{msg.plaintext}</div>

                  <div className="label spaced">Ciphertext produced</div>
                  <div className="ciphertext">{msg.ciphertext}</div>
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

                  <div className="label">What Bob reads</div>
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

                <div className="label">Captured ciphertext</div>
                <div className="ciphertext">{msg.ciphertext}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}