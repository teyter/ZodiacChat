import { useState } from 'react'
import './App.css'

const USERS = ['Alice', 'Bob']

const INITIAL_MESSAGES = [
  { id: 1, from: 'Alice', to: 'Bob', text: 'Hi Bob!' },
  { id: 2, from: 'Bob', to: 'Alice', text: 'Hey Alice 👋' },
]

export default function App() {
  const [currentUser, setCurrentUser] = useState('Alice')
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [draft, setDraft] = useState('')

  const otherUser = USERS.find((user) => user !== currentUser)

  function handleSend(e) {
    e.preventDefault()

    const trimmed = draft.trim()
    if (!trimmed) return

    const newMessage = {
      id: Date.now(),
      from: currentUser,
      to: otherUser,
      text: trimmed,
    }

    setMessages((prev) => [...prev, newMessage])
    setDraft('')
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>ZodiacChat</h1>

        <div className="user-switcher">
          <span>Logged in as:</span>
          {USERS.map((user) => (
            <button
              key={user}
              className={user === currentUser ? 'active' : ''}
              onClick={() => setCurrentUser(user)}
            >
              {user}
            </button>
          ))}
        </div>
      </header>

      <main className="chat-shell">
        <div className="chat-header">
          <h2>{currentUser}'s chat</h2>
          <p>Conversation with {otherUser}</p>
        </div>

        <div className="messages">
          {messages.map((msg) => {
            const mine = msg.from === currentUser

            return (
              <div
                key={msg.id}
                className={`message-row ${mine ? 'mine' : 'theirs'}`}
              >
                <div className="message-bubble">
                  <div className="message-meta">
                    {msg.from} → {msg.to}
                  </div>
                  <div>{msg.text}</div>
                </div>
              </div>
            )
          })}
        </div>

        <form className="composer" onSubmit={handleSend}>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Message ${otherUser}...`}
          />
          <button type="submit">Send</button>
        </form>
      </main>
    </div>
  )
}