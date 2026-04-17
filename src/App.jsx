import { useEffect, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'zodiacchat-state'

const SYMBOLS =
  'H+M8|CV@KEB*5k.LdR(UFz9<>#Z3PpOG2l%W&Db^4J)fY/j_q1S;cTNy7t-A:X6'

const LETTER_DISTRIBUTION = {
  E: 6,
  T: 5,
  A: 5,
  O: 4,
  I: 4,
  N: 4,
  S: 3,
  H: 3,
  R: 3,
  D: 3,
  L: 3,
  U: 2,
  C: 2,
  M: 2,
  W: 2,
  F: 2,
  G: 2,
  Y: 2,
  P: 2,
  B: 1,
  V: 1,
  K: 1,
  J: 1,
  X: 1,
  Q: 1,
  Z: 1,
}

const INITIAL_PLAINTEXT_MESSAGES = [
  { id: 1, from: 'Alice', to: 'Bob', plaintext: 'HELLO BOB' },
  { id: 2, from: 'Bob', to: 'Alice', plaintext: 'HI ALICE' },
]

function shuffleArray(items) {
  const array = [...items]

  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
  }

  return array
}

function generateSubstitutionKey() {
  const shuffledSymbols = shuffleArray(SYMBOLS.split(''))
  const key = {}
  let cursor = 0

  for (const letter of Object.keys(LETTER_DISTRIBUTION)) {
    const count = LETTER_DISTRIBUTION[letter]
    key[letter] = shuffledSymbols.slice(cursor, cursor + count)
    cursor += count
  }

  return key
}

function generateCyclePointers(key) {
  const pointers = {}

  for (const letter of Object.keys(key)) {
    pointers[letter] = 0
  }

  return pointers
}

function buildReverseKeyMap(key) {
  const reverseMap = {}

  for (const [letter, symbols] of Object.entries(key)) {
    for (const symbol of symbols) {
      reverseMap[symbol] = letter
    }
  }

  return reverseMap
}

function encryptWithHomophonicSubstitution(plaintext, key, cyclePointers) {
  const upper = plaintext.toUpperCase()
  let ciphertext = ''
  const nextPointers = { ...cyclePointers }

  for (const char of upper) {
    if (key[char] && key[char].length > 0) {
      const symbols = key[char]
      const currentIndex = nextPointers[char] ?? 0
      const symbol = symbols[currentIndex]

      ciphertext += symbol
      nextPointers[char] = (currentIndex + 1) % symbols.length
    } else {
      ciphertext += char
    }
  }

  return {
    ciphertext,
    updatedPointers: nextPointers,
  }
}

function decryptCiphertext(ciphertext, reverseKeyMap) {
  if (!ciphertext) return ''

  let plaintext = ''

  for (const char of ciphertext) {
    if (reverseKeyMap[char]) {
      plaintext += reverseKeyMap[char]
    } else {
      plaintext += char
    }
  }

  return plaintext
}

function buildInitialState() {
  const substitutionKey = generateSubstitutionKey()
  let cyclePointers = generateCyclePointers(substitutionKey)
  const reverseKeyMap = buildReverseKeyMap(substitutionKey)

  const messages = INITIAL_PLAINTEXT_MESSAGES.map((message) => {
    const { ciphertext, updatedPointers } = encryptWithHomophonicSubstitution(
      message.plaintext,
      substitutionKey,
      cyclePointers
    )

    cyclePointers = updatedPointers

    return {
      ...message,
      substitutionCiphertext: ciphertext,
      finalCiphertext: ciphertext,
    }
  })

  return {
    messages,
    substitutionKey,
    cyclePointers,
    transpositionEnabled: false,
    transpositionWidth: 5,
  }
}

export default function App() {
  const [appState, setAppState] = useState(() => {
    const savedState = localStorage.getItem(STORAGE_KEY)

    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState)

        const migratedMessages = (parsedState.messages || []).map((message) => ({
          ...message,
          substitutionCiphertext:
            message.substitutionCiphertext ?? message.ciphertext ?? '',
          finalCiphertext:
            message.finalCiphertext ??
            message.substitutionCiphertext ??
            message.ciphertext ??
            '',
        }))

        return {
          ...parsedState,
          messages: migratedMessages,
          transpositionEnabled: parsedState.transpositionEnabled ?? false,
          transpositionWidth: parsedState.transpositionWidth ?? 5,
        }
      } catch (error) {
        console.error('Failed to parse saved app state:', error)
      }
    }

    return buildInitialState()
  })

  const [draft, setDraft] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState))
  }, [appState])

  const reverseKeyMap = buildReverseKeyMap(appState.substitutionKey)

  function sendAsAlice(e) {
    e.preventDefault()

    const trimmed = draft.trim()
    if (!trimmed) return

    const { ciphertext, updatedPointers } = encryptWithHomophonicSubstitution(
      trimmed,
      appState.substitutionKey,
      appState.cyclePointers
    )

    const newMessage = {
      id: Date.now(),
      from: 'Alice',
      to: 'Bob',
      plaintext: trimmed.toUpperCase(),
      substitutionCiphertext: ciphertext,
      finalCiphertext: ciphertext,
    }

    setAppState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      cyclePointers: updatedPointers,
    }))

    setDraft('')
  }

  function toggleTransposition() {
    setAppState((prev) => ({
      ...prev,
      transpositionEnabled: !prev.transpositionEnabled,
    }))
  }

  function resetConversation() {
    const freshState = buildInitialState()
    setAppState(freshState)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>ZodiacChat</h1>
          <p className="subtitle">
            Educational peer-to-peer homophonic cipher demo
          </p>
        </div>

        <div className="topbar-controls">
          <button className="toggle-button" onClick={toggleTransposition}>
            Transposition: {appState.transpositionEnabled ? 'ON' : 'OFF'}
          </button>

          <button className="reset-button" onClick={resetConversation}>
            Reset chat
          </button>
        </div>
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
            {appState.messages
              .filter((msg) => msg.from === 'Alice')
              .map((msg) => (
                <div key={msg.id} className="message-card">
                  <div className="message-meta">
                    {msg.from} → {msg.to}
                  </div>

                  <div className="label">Plaintext</div>
                  <div>{msg.plaintext}</div>

                  <div className="label spaced">After substitution</div>
                  <div className="ciphertext">{msg.substitutionCiphertext}</div>

                  <div className="label spaced">Final ciphertext sent</div>
                  <div className="ciphertext">{msg.finalCiphertext}</div>
                </div>
              ))}
          </div>
        </section>

        <section className="panel">
          <h2>Bob</h2>
          <p className="panel-subtitle">Receiver</p>

          <div className="message-list">
            {appState.messages
              .filter((msg) => msg.to === 'Bob')
              .map((msg) => (
                <div key={msg.id} className="message-card">
                  <div className="message-meta">Received from {msg.from}</div>

                  <div className="label">Ciphertext received</div>
                  <div className="ciphertext">{msg.finalCiphertext}</div>

                  <div className="label spaced">Bob decrypts as</div>
                  <div>{decryptCiphertext(msg.finalCiphertext, reverseKeyMap)}</div>
                </div>
              ))}
          </div>
        </section>

        <section className="panel">
          <h2>Eve</h2>
          <p className="panel-subtitle">Third-party sniffer</p>

          <div className="message-list">
            {appState.messages.map((msg) => (
              <div key={msg.id} className="message-card sniffed">
                <div className="message-meta">
                  Intercepted: {msg.from} → {msg.to}
                </div>

                <div className="label">Captured ciphertext</div>
                <div className="ciphertext">{msg.finalCiphertext}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <section className="panel key-panel">
        <h2>Chat settings and substitution key</h2>
        <p className="panel-subtitle">
          Randomly generated once for this chat session
        </p>

        <div className="settings-row">
          <div><strong>Transposition:</strong> {appState.transpositionEnabled ? 'ON' : 'OFF'}</div>
          <div><strong>Transposition width:</strong> {appState.transpositionWidth}</div>
        </div>

        <div className="key-grid">
          {Object.entries(appState.substitutionKey).map(([letter, symbols]) => (
            <div key={letter} className="key-row">
              <span className="key-letter">{letter}</span>
              <span className="key-symbols">{symbols.join(' ')}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}