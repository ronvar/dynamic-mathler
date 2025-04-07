<p align="center">
  <img src="./public/img/logo.png" alt="Mathler logo" height="120" />
</p>

<h1 align="center">M4+HL3R - Wordle but for Math ✏️🧠</h1>

> A fun and crypto-friendly number puzzle game powered by React, Next.js, Dynamic SDK, and XMTP.

---

## 🧩 What is M4+HL3R?

Mathler is inspired by [Wordle](https://www.nytimes.com/games/wordle/index.html) but for individuals who like impossibly hard games. Each day, players are given a **target number**, and must **guess the equation** that results in that number using standard operators.

- 🎯 Order of operations applies
- ➗ Operators and numbers can appear multiple times
- 🟩 Color-coded feedback after each guess
- 🔐 User progress and history stored using **Dynamic SDK**
- 🎁 Surprise crypto integrations (NFTs, tokens, and messaging)

Try to solve the equation in **6 attempts or less!**

---

## 📸 Demo

<!-- If deployed, add a live link below -->
https://dynamic-mathler-six.vercel.app/

---

## 🚀 Getting Started

### 🛠️ Prerequisites

- Node.js **v20+**
- An Ehereum wallet (you can create one here!)

---

### 📦 Install dependencies

```bash
npm install
```

### 🧪 Run the app locally

```bash
npm run dev
```

### 🧱 Project Structure
```bash
.
├── app/                   # Next.js app directory (routes, modals)
├── components/            # Game UI and shared UI components
├── hooks/                 # Custom React hooks (e.g. useXMTPMessenger, usePuzzleGrabber)
├── state/                 # Jotai atoms for global game state
├── utils/                 # Game logic, compression, evaluation, etc.
├── types/                 # TypeScript types
├── public/                # Static assets (including logo)
└── supabase/              # Optional server functions if needed
```

### 🧠 Features
- ✅ Daily math puzzles pulled from a shared source
- ✅ Fully keyboard-accessible tile input grid
- ✅ Game history stored in Dynamic user metadata (compressed) and visible to user
- ✅ XMTP integration to share scores with wallets
- ✅ Supports multiple attempts with exact match logic (order of operations-aware)


### 🔒 Crypto Features
- ✅ Dynamic SDK authentication
- ✅ User metadata for game tracking
- ✅ XMTP messaging (share game with wallet addresses) (coming soon...)


### 🧪 Testing

All guesses are tested using `evaluateTileRow` and `compareEquationStructure` methods for order of operations and evaluation validity.
- Jotai atoms were tested via state hooks
- Defining unit tests were deprioritized by time management in favor of E2E testing from login/sign up/log out to sucessful and unsuccessful guesses
- More testing around edge cases such as various duplicate operands could be helpful but deprioritized for more common use cases
- UI bugs and inconsistencies were deprioritized in favor of evaluation logic stability

### 🧠 Design Decisions
- Jotai for global state to avoid duplicate variables (lightweight, flexible)
- Mantine UI for fast styling and accessibility
- lz-string used to compress user metadata under 2KB limit
- Game logic is order-of-operations aware, not string-matching
- Global hooks were used for organization and more readable code, however this lead to some unnecessary re-renders
- Hooks were rendered client-side for simplicity of production-building but could result in security risks if more sensitive variables are added


### 🧭 Possible Improvements and Ideas not Pursued at the Time
- ⏱️ Track daily streaks, average solve time (deprioritized)
- 📱 Mobile-friendly keyboard layout (deprioritized)
- 🏆 Leaderboard by wallet address (more time & resource intensive)
- 📤 Share puzzles with friends via DM / XMTP group chat (required more time and debugging, code was commented out)
- 💬 Add tooltip/hints or powerups (deprioritized)
- 🧠 Generate daily puzzles using algorithm vs fixed list

### 🧾 Submission Notes
A good percentage of time was spent refining the algorithm that returns whether a submitted row is valid without linear character matching. This was first achieved using basic unstyled Input components for testing on different puzzles and permutations. Once I reached a comfortable spot with aaccuracy, priority was switched to login/logout/updateUser flows and state management. I utilized MantineUI to speed up and streamline frontend implementation which allowed me to give it some pizzazz. Towards the end and during E2E testing, I discovered I was passing the 2kb metadata limit after ~2 games, so I intruduced a compression layer (~60% - 90%) for larger history retention.