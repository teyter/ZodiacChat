# ZodiacChat

ZodiacChat is an educational web application that demonstrates classical cryptographic techniques inspired by the Zodiac Killer ciphers (e.g. Z340).

The app simulates a simple peer-to-peer messaging system between two users (Alice and Bob), while a third party (Eve) passively intercepts all messages.

---

## Features

### Homophonic substitution cipher
- Each letter maps to multiple symbols
- Reduces obvious frequency patterns
- Symbols are selected cyclically to mimic real homophonic systems

### Optional transposition layer
- Fixed-width columnar transposition
- Toggle ON/OFF during runtime
- Demonstrates how reordering affects ciphertext without changing symbol counts

### Eve (attacker dashboard)
- Intercepts all ciphertext
- Displays metadata:
  - message length
  - transposition mode
  - transposition width
- Includes **symbol frequency analysis**

### Encryption pipeline visualization
Each message shows the full transformation:

Plaintext
↓
Substitution
↓
(Transposition)
↓
Ciphertext

And for Bob:

Ciphertext
↓
Reverse transposition
↓
Reverse substitution
↓
Plaintext

### Dynamic key system
- Random substitution key generated per session
- "New key" button re-encrypts all messages
- Demonstrates how different keys produce different ciphertext

---

## Educational Purpose

ZodiacChat is **not a secure messaging system**.

It is designed to demonstrate:

- How classical ciphers work
- Why homophonic substitution improves over simple substitution
- Why transposition alone does not prevent statistical attacks
- How ciphertext can still be analyzed by an attacker

---

## Tech Stack

- React (Vite)
- JavaScript (client-side only)
- No backend / no real networking

---

## Running Locally

```bash
npm install
npm run dev