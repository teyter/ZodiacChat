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

function buildInitialState() {
  const substitutionKey = generateSubstitutionKey()
  let cyclePointers = generateCyclePointers(substitutionKey)

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
  const [transpositionDemoInput, setTranspositionDemoInput] = useState('HELLOTHERE')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState))
  }, [appState])

  const reverseKeyMap = buildReverseKeyMap(appState.substitutionKey)

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

  function handleTranspositionWidthChange(e) {
    const nextWidth = Number(e.target.value)

    setAppState((prev) => ({
      ...prev,
      transpositionWidth: Number.isNaN(nextWidth) ? 5 : Math.max(2, nextWidth),
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