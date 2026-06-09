## Overview

PlaylisterYT is a full‑stack web app for building and sharing playlists that play directly from YouTube. Create an account, curate playlists, publish them, and browse what others have shared.

## What you can do

- **Create playlists**: add, edit, reorder, and remove songs.
- **Play in-app**: open a playlist player powered by YouTube IDs.
- **Publish & discover**: publish playlists and browse public playlists.
- **Social signals**: like/dislike playlists and leave comments.

## Why it’s unique

- **YouTube-first playlists**: playlists are playable without leaving the app (songs store YouTube IDs).
- **Public feed with engagement**: published playlists support listens, likes/dislikes, and comments.
- **Multi-environment friendly**: run locally or via Docker with a single command.

## Tech stack

- **Frontend**: React (Create React App), Material UI
- **Backend**: Node.js, Express
- **Database**: MongoDB (default) or Postgres (Sequelize) depending on server configuration
- **Auth**: JWT + http-only cookies (server-managed sessions)
- **DevOps**: Docker + Docker Compose

## Running locally (manual testing)

Use this flow before you commit: run the app locally, click through the site, then run unit tests.

### 1. One-time setup

From the repo root (`PlaylisterYT/`):

```bash
npm install
npm run install:all
cp .env.example server/.env   # then fill in DB, JWT_SECRET, API keys
```

`server/.env` needs at least `DB_CONNECT` (MongoDB) or Postgres vars, plus `JWT_SECRET`.

### 2. Start client + server together

```bash
npm run dev
```

- **Client**: http://localhost:3000  
- **Server**: http://localhost:4000  

Or run them in separate terminals: `npm run dev:server` and `npm run dev:client`.

### 3. Manual testing checklist

Walk through these in the browser before pushing:

- [ ] Register a new account and log in / log out
- [ ] Create a playlist, add songs (with YouTube IDs), reorder, save
- [ ] Play a playlist in the in-app player (play / pause / next / repeat)
- [ ] Publish a playlist and find it on the public feed
- [ ] Like/dislike and comment on a published playlist
- [ ] Open AI song recommendations (if `HF_TOKEN` or OpenAI is configured)
- [ ] Browse the songs catalog and search

### 4. Run unit tests locally

```bash
npm test
```

Optional — integration tests against a real database (local or Atlas):

```bash
RUN_DB_TESTS=true npm run test:db
```

### Running locally (separate terminals)

**Server**

```bash
cd server
npm install
node index.js
```

**Client**

```bash
cd client
npm install
npm start
```

Notes:
- The client needs an API base URL. Set `REACT_APP_API_URL` in `client/.env` (see `client/src/config/apiBase.js`). Defaults to local development behavior if unset.

## CI/CD (GitHub Actions → Render)

```
local dev + manual testing  →  git push/PR  →  CI runs tests  →  deploy to Render (main only)
```

### CI (`/.github/workflows/ci.yml`)

Runs on every push and pull request to `main`:

1. Server unit tests (`vitest`)
2. Client unit tests (Jest / React Testing Library)
3. Production client build

### Deploy (`/.github/workflows/deploy.yml`)

After CI succeeds on a **push to `main`**, triggers Render deploy hooks.

**GitHub repository secrets** (Settings → Secrets and variables → Actions):

| Secret | Where to get it |
|--------|-----------------|
| `RENDER_SERVER_DEPLOY_HOOK` | Render dashboard → your API service → Settings → Deploy Hook |
| `RENDER_CLIENT_DEPLOY_HOOK` | Render dashboard → your static site → Settings → Deploy Hook |

Disable **Auto-Deploy** on Render for those services so only the GitHub workflow deploys after tests pass.

**Recommended:** enable branch protection on `main` requiring the **CI** check to pass before merge.

## Running with Docker (recommended)

From the repo root (`PlaylisterYT/`):

```bash
docker compose up --build
```

- **Client**: `http://localhost:3000`
- **Server**: `http://localhost:4000`

Notes:
- The client image bakes `REACT_APP_API_URL` at build time (CRA behavior).
