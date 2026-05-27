# Booklist E2E App

This repo turns the original client-only Booklist into a full end-to-end app with a Node.js + Express backend, MongoDB persistence, JWT auth, and a minimal vanilla JS frontend that consumes the APIs.

## Backend (server)

1. Copy env file and configure

```
cp server/.env.example server/.env
```

Edit `server/.env` and set:
- `MONGO_URI` (e.g., mongodb://localhost:27017/booklist)
- `JWT_SECRET` (use a strong random string)
- `PORT=5000` (optional, defaults to 5000)

2. Install dependencies and start

```
cd server
npm install
npm run dev  # or npm start
```

The server exposes:
- `POST /api/auth/signup` -> { token, user }
- `POST /api/auth/login` -> { token, user }
- `GET /api/books` (auth)
- `POST /api/books` (auth)

CORS is enabled permissively for local development.

## Frontend

The frontend is static (index.html, app.js). The API base is configured in app.js via `API_BASE` (defaults to `http://localhost:5000`). If your backend runs elsewhere, set `window.API_BASE` before loading app.js or edit the constant.

Open `index.html` directly in the browser, or serve via a simple static server. If you encounter CORS issues when opening via `file://`, serve the frontend using a static HTTP server (e.g., `npx serve` from the project root).

### Flow
- Sign up (or log in) to receive a JWT stored in localStorage
- After auth, the Books screen appears
- Create books using the form; they are persisted to MongoDB and listed in the table

## Notes
- This demo keeps JWT in localStorage for simplicity (beware XSS in real apps)
- No refresh tokens, roles, or advanced validation included
- Email is unique; passwords are hashed with bcrypt
