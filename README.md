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

## Running locally (without Docker)

### Server

```bash
cd server
npm install
cp ../.env.example ../.env
node index.js
```

The server runs at `http://localhost:4000`.

### Client

```bash
cd client
npm install
npm start
```

The client runs at `http://localhost:3000`.

Notes:
- The client needs an API base URL. Set `REACT_APP_API_URL` (see `client/src/config/apiBase.js`). If you don’t set it, it defaults to local development behavior.

## Running with Docker (recommended)

From the repo root (`PlaylisterYT/`):

```bash
docker compose up --build
```

- **Client**: `http://localhost:3000`
- **Server**: `http://localhost:4000`

Notes:
- The client image bakes `REACT_APP_API_URL` at build time (CRA behavior).
