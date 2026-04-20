import { useEffect, useMemo, useState } from 'react'
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

function transposeText(text, width) {
  if (!text || width <= 1) return text

  const rows = []
  for (let i = 0; i < text.length; i += width) {
    rows.push(text.slice(i, i + width))
  }

  let result = ''

  for (let col = 0; col < width; col += 1) {
    for (let row = 0; row < rows.length; row += 1) {
      const char = rows[row][col]
      if (char !== undefined) {
        result += char
      }
    }
  }

  return result
}

function reverseTransposeText(text, width) {
  if (!text || width <= 1) return text

  const length = text.length
  const fullRows = Math.floor(length / width)
  const remainder = length % width
  const rowCount = Math.ceil(length / width)

  const columnLengths = Array.from({ length: width }, (_, col) => {
    if (remainder === 0) return fullRows
    return col < remainder ? fullRows + 1 : fullRows
  })

  const columns = []
  let cursor = 0

  for (let col = 0; col < width; col += 1) {
    const columnLength = columnLengths[col]
    columns[col] = text.slice(cursor, cursor + columnLength)
    cursor += columnLength
  }

  let result = ''

  for (let row = 0; row < rowCount; row += 1) {
    for (let col = 0; col < width; col += 1) {
      const char = columns[col][row]
      if (char !== undefined) {
        result += char
      }
    }
  }

  return result
}

function applyTranspositionIfEnabled(text, transpositionEnabled, transpositionWidth) {
  if (!transpositionEnabled) return text
  return transposeText(text, transpositionWidth)
}

function reverseTranspositionIfEnabled(text, transpositionEnabled, transpositionWidth) {
  if (!transpositionEnabled) return text
  return reverseTransposeText(text, transpositionWidth)
}

function createEncryptedMessage({
  id,
  from,
  to,
  plaintext,
  substitutionKey,
  cyclePointers,
  transpositionEnabled,
  transpositionWidth,
}) {
  const { ciphertext: substitutionCiphertext, updatedPointers } =
    encryptWithHomophonicSubstitution(plaintext, substitutionKey, cyclePointers)

  const finalCiphertext = applyTranspositionIfEnabled(
    substitutionCiphertext,
    transpositionEnabled,
    transpositionWidth
  )

  return {
    message: {
      id,
      from,
      to,
      plaintext: plaintext.toUpperCase(),
      substitutionCiphertext,
      finalCiphertext,
      transpositionEnabled,
      transpositionWidth,
    },
    updatedPointers,
  }
}

function buildInitialState() {
  const substitutionKey = generateSubstitutionKey()
  let cyclePointers = generateCyclePointers(substitutionKey)

  const messages = INITIAL_PLAINTEXT_MESSAGES.map((message) => {
    const { message: encryptedMessage, updatedPointers } = createEncryptedMessage({
      ...message,
      substitutionKey,
      cyclePointers,
      transpositionEnabled: false,
      transpositionWidth: 5,
    })

    cyclePointers = updatedPointers
    return encryptedMessage
  })

  return {
    messages,
    substitutionKey,
    cyclePointers,
    transpositionEnabled: false,
    transpositionWidth: 5,
  }
}

function PipelineStep({ label, children, emphasized = false }) {
  return (
    <div className={`pipeline-step ${emphasized ? 'emphasized' : ''}`}>
      <div className="label">{label}</div>
      <div className="pipeline-value">{children}</div>
    </div>
  )
}

function PipelineArrow() {
  return <div className="pipeline-arrow">↓</div>
}

function countCipherSymbols(messages) {
  const counts = {}

  for (const message of messages) {
    const text = message.finalCiphertext || ''

    for (const char of text) {
      if (char === ' ') continue
      counts[char] = (counts[char] || 0) + 1
    }
  }

  return counts
}

function getSortedSymbolCounts(messages) {
  const counts = countCipherSymbols(messages)

  return Object.entries(counts).sort((a, b) => b[1] - a[1])
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
          transpositionEnabled: message.transpositionEnabled ?? false,
          transpositionWidth:
            message.transpositionWidth ?? parsedState.transpositionWidth ?? 5,
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
  const [transpositionDemoInput, setTranspositionDemoInput] = useState('HELLOTHERE')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState))
  }, [appState])

  const reverseKeyMap = buildReverseKeyMap(appState.substitutionKey)

  const sortedSymbolCounts = useMemo(
    () => getSortedSymbolCounts(appState.messages),
    [appState.messages]
  )

  const totalInterceptedCharacters = useMemo(
    () =>
      appState.messages.reduce(
        (sum, msg) => sum + (msg.finalCiphertext?.replaceAll(' ', '').length || 0),
        0
      ),
    [appState.messages]
  )

  const uniqueInterceptedSymbols = sortedSymbolCounts.length

  const transposedDemo = useMemo(
    () => transposeText(transpositionDemoInput, appState.transpositionWidth),
    [transpositionDemoInput, appState.transpositionWidth]
  )

  const reversedDemo = useMemo(
    () => reverseTransposeText(transposedDemo, appState.transpositionWidth),
    [transposedDemo, appState.transpositionWidth]
  )

  function sendAsAlice(e) {
    e.preventDefault()

    const trimmed = draft.trim()
    if (!trimmed) return

    const { message: newMessage, updatedPointers } = createEncryptedMessage({
      id: Date.now(),
      from: 'Alice',
      to: 'Bob',
      plaintext: trimmed,
      substitutionKey: appState.substitutionKey,
      cyclePointers: appState.cyclePointers,
      transpositionEnabled: appState.transpositionEnabled,
      transpositionWidth: appState.transpositionWidth,
    })

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

  function handleTranspositionWidthChange(e) {
    const nextWidth = Number(e.target.value)

    setAppState((prev) => ({
      ...prev,
      transpositionWidth: Number.isNaN(nextWidth) ? 5 : Math.max(2, nextWidth),
    }))
  }

  function resetConversation() {
    setAppState((prev) => {
      const freshState = buildInitialState()

      return {
        ...freshState,
        transpositionEnabled: prev.transpositionEnabled,
        transpositionWidth: prev.transpositionWidth,
      }
    })
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
                <div key={msg.id} className="message-card pipeline-card">
                  <div className="message-meta">
                    {msg.from} → {msg.to}
                  </div>

                  <PipelineStep label="Plaintext">
                    {msg.plaintext}
                  </PipelineStep>

                  <PipelineArrow />

                  <PipelineStep label="After substitution" emphasized>
                    <span className="ciphertext">{msg.substitutionCiphertext}</span>
                  </PipelineStep>

                  <PipelineArrow />

                  <PipelineStep
                    label={
                      msg.transpositionEnabled
                        ? `Final ciphertext sent (transposition ON, width ${msg.transpositionWidth})`
                        : 'Final ciphertext sent (transposition OFF)'
                    }
                    emphasized
                  >
                    <span className="ciphertext">{msg.finalCiphertext}</span>
                  </PipelineStep>
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
              .map((msg) => {
                const substitutionRecovered = reverseTranspositionIfEnabled(
                  msg.finalCiphertext,
                  msg.transpositionEnabled,
                  msg.transpositionWidth
                )

                const decryptedPlaintext = decryptCiphertext(
                  substitutionRecovered,
                  reverseKeyMap
                )

                return (
                  <div key={msg.id} className="message-card pipeline-card">
                    <div className="message-meta">Received from {msg.from}</div>

                    <PipelineStep label="Ciphertext received" emphasized>
                      <span className="ciphertext">{msg.finalCiphertext}</span>
                    </PipelineStep>

                    <PipelineArrow />

                    <PipelineStep label="After reversing transposition" emphasized>
                      <span className="ciphertext">{substitutionRecovered}</span>
                    </PipelineStep>

                    <PipelineArrow />

                    <PipelineStep label="Bob decrypts as">
                      {decryptedPlaintext}
                    </PipelineStep>
                  </div>
                )
              })}
          </div>
        </section>

        <section className="panel">
          <h2>Eve</h2>
          <p className="panel-subtitle">Third-party sniffer / attacker view</p>

          <div className="attacker-summary">
            <div className="attacker-summary-card">
              <span className="attacker-meta-label">Messages intercepted</span>
              <span className="attacker-summary-value">{appState.messages.length}</span>
            </div>

            <div className="attacker-summary-card">
              <span className="attacker-meta-label">Total cipher symbols</span>
              <span className="attacker-summary-value">
                {totalInterceptedCharacters}
              </span>
            </div>

            <div className="attacker-summary-card">
              <span className="attacker-meta-label">Unique symbols seen</span>
              <span className="attacker-summary-value">
                {uniqueInterceptedSymbols}
              </span>
            </div>
          </div>

          <div className="frequency-panel">
            <div className="label">Symbol frequency analysis</div>

            {sortedSymbolCounts.length === 0 ? (
              <div className="empty-state">No intercepted ciphertext yet.</div>
            ) : (
              <div className="frequency-grid">
                {sortedSymbolCounts.map(([symbol, count]) => (
                  <div key={symbol} className="frequency-chip">
                    <span className="frequency-symbol ciphertext">{symbol}</span>
                    <span className="frequency-count">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="message-list">
            {appState.messages.map((msg) => (
              <div key={msg.id} className="message-card sniffed attacker-card">
                <div className="message-meta">
                  Intercepted: {msg.from} → {msg.to}
                </div>

                <div className="attacker-meta-grid">
                  <div className="attacker-meta-item">
                    <span className="attacker-meta-label">Length</span>
                    <span className="attacker-meta-value">
                      {msg.finalCiphertext.length}
                    </span>
                  </div>

                  <div className="attacker-meta-item">
                    <span className="attacker-meta-label">Transposition</span>
                    <span className="attacker-meta-value">
                      {msg.transpositionEnabled ? 'ON' : 'OFF'}
                    </span>
                  </div>

                  <div className="attacker-meta-item">
                    <span className="attacker-meta-label">Width</span>
                    <span className="attacker-meta-value">
                      {msg.transpositionWidth}
                    </span>
                  </div>

                  <div className="attacker-meta-item">
                    <span className="attacker-meta-label">Route</span>
                    <span className="attacker-meta-value">
                      {msg.from} → {msg.to}
                    </span>
                  </div>
                </div>

                <PipelineStep label="Captured ciphertext" emphasized>
                  <span className="ciphertext">{msg.finalCiphertext}</span>
                </PipelineStep>
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
          <div>
            <strong>Transposition:</strong>{' '}
            {appState.transpositionEnabled ? 'ON' : 'OFF'}
          </div>
          <div>
            <strong>Transposition width:</strong>{' '}
            <input
              className="width-input"
              type="number"
              min="2"
              value={appState.transpositionWidth}
              onChange={handleTranspositionWidthChange}
            />
          </div>
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

      <section className="panel key-panel">
        <h2>Transposition test area</h2>
        <p className="panel-subtitle">
          Testing the transposition functions before wiring them into the chat
        </p>

        <div className="composer">
          <input
            type="text"
            value={transpositionDemoInput}
            onChange={(e) => setTranspositionDemoInput(e.target.value.toUpperCase())}
            placeholder="Enter text to transpose..."
          />
        </div>

        <div className="message-list">
          <div className="message-card">
            <div className="label">Original text</div>
            <div className="ciphertext">{transpositionDemoInput}</div>

            <div className="label spaced">After transposition</div>
            <div className="ciphertext">{transposedDemo}</div>

            <div className="label spaced">After reversing transposition</div>
            <div className="ciphertext">{reversedDemo}</div>
          </div>
        </div>
      </section>
    </div>
  )
}