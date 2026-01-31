# Setup Guide

This repo is split into two Next.js apps:

- `frontend/` (UI)
- `backend/` (API)

## 1) Install dependencies

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

## 2) Start both apps (local dev)

```bash
cd backend
npm run dev
```

```bash
cd frontend
BACKEND_URL=http://localhost:4000 npm run dev
```

Frontend runs on `http://localhost:3000` and proxies `/api/*` to the backend.

## 3) Required environment variables (backend)

Create `backend/.env` (or set these in your hosting provider):

- `DATABASE_URL`
- `MONGODB_URI`
- `CLERK_SECRET_KEY`
- `CLERK_PUBLISHABLE_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` (example: `https://your-backend-host/api/auth/google/callback`)
- `BACKEND_URL` (example: `https://your-backend-host`)
- `OPENROUTER_API_KEY`
- `ELEVENLABS_API_KEY`
- `DEEPGRAM_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_API_KEY`
- `TWILIO_API_SECRET`
- `TWILIO_PHONE_NUMBER`

Optional:

- `NGROK_URL` (local Twilio webhooks)
- `NEXT_PUBLIC_BASE_URL` (used by Twilio routes)

## 4) Frontend environment variables

Create `frontend/.env.local` (or set in hosting):

- `BACKEND_URL` (example: `https://your-backend-host`)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

## 5) Build and start (production)

```bash
cd backend
npm run build
npm run start
```

```bash
cd frontend
npm run build
BACKEND_URL=https://your-backend-host npm run start
```

## 6) Seed mock data (optional)

```bash
cd backend
npm run seed:mock
```
