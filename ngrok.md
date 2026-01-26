# Ngrok replacement guide

This document lists every place ngrok is referenced and how to swap it
when ngrok stops working or when you move to a new domain.

## Where ngrok is used

1. **Environment variables**
   - `.env` (local dev): `NGROK_URL=...`
   - `.env.example`: `NGROK_URL=...`

2. **Twilio outbound voice route**
   - `src/app/api/twilio/voice/route.ts`
   - Uses:
     - `NEXT_PUBLIC_BASE_URL` if set
     - otherwise `NGROK_URL`
   - Purpose: builds `recordingStatusCallback` for Twilio recordings.

3. **Twilio inbound voice route**
   - `src/app/api/twilio/inbound/route.ts`
   - Uses:
     - `NGROK_URL` env var
     - **hardcoded fallback**: `https://epibolic-rugulose-leda.ngrok-free.dev`
   - Purpose: builds `recordingStatusCallback` for Twilio recordings.

## What to update when changing domains

### 1) Production (DigitalOcean App Platform)
- Set your public base URL in App Platform environment variables:
  - `NEXT_PUBLIC_BASE_URL=https://your-app.ondigitalocean.app`
- Optional but recommended:
  - also set `NGROK_URL` to the same value for safety, or remove usage in code.

### 2) Local development
- Keep `NGROK_URL` pointing to your current ngrok tunnel.
- If you are not using ngrok locally, you can set:
  - `NEXT_PUBLIC_BASE_URL=http://localhost:3000`
  - and avoid `NGROK_URL` entirely.

### 3) Update the hardcoded fallback
- In `src/app/api/twilio/inbound/route.ts`, replace:
  - `https://epibolic-rugulose-leda.ngrok-free.dev`
- Prefer removing the hardcoded fallback so only env vars are used.

### 4) Update Twilio webhooks
- In the Twilio Console, update any webhook URLs to your new domain:
  - Example: `https://your-domain.com/api/twilio/inbound`
  - Example: `https://your-domain.com/api/twilio/recording-status`

## Quick checklist

- [ ] Update `NEXT_PUBLIC_BASE_URL` in production env vars
- [ ] Update or remove `NGROK_URL` in env vars
- [ ] Replace hardcoded fallback in `inbound/route.ts`
- [ ] Update Twilio webhook URLs in the Twilio Console
