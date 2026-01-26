# Project Dependencies

This document lists all dependencies for the Swamp Hacks project.

## Installation

To install all dependencies, run:
```bash
npm install
```

## Production Dependencies

### UI & Styling
- **@chakra-ui/react** (^3.31.0) - Component library for React
- **@emotion/react** (^11.14.0) - CSS-in-JS library
- **@radix-ui/react-dialog** (^1.1.15) - Accessible dialog component
- **@radix-ui/react-popover** (^1.1.15) - Accessible popover component
- **@radix-ui/react-scroll-area** (^1.2.10) - Customizable scroll area component
- **@radix-ui/react-tooltip** (^1.2.8) - Accessible tooltip component
- **lucide-react** (^0.563.0) - Icon library
- **react-icons** (^5.5.0) - Popular icons library
- **tailwind-merge** (^3.4.0) - Utility to merge Tailwind CSS classes
- **tailwindcss-animate** (^1.0.7) - Animation utilities for Tailwind
- **next-themes** (^0.4.6) - Theme switching for Next.js
- **motion** (^12.29.0) - Animation library
- **gsap** (^3.14.2) - Animation library

### Framework & Core
- **next** (16.1.4) - React framework for production
- **react** (19.2.3) - React library
- **react-dom** (19.2.3) - React DOM renderer

### Authentication & Security
- **@clerk/nextjs** (^6.36.10) - Authentication and user management

### Database & ORM
- **@prisma/client** (^6.19.2) - Prisma ORM client
- **@prisma/adapter-pg** (^7.3.0) - PostgreSQL adapter for Prisma
- **prisma** (^6.19.2) - Prisma ORM
- **pg** (^8.17.2) - PostgreSQL client for Node.js
- **mongodb** (^7.0.0) - MongoDB driver
- **mongoose** (^9.1.5) - MongoDB object modeling

### AI & ML
- **@google/generative-ai** (^0.24.1) - Google Generative AI SDK
- **@deepgram/sdk** (^4.11.3) - Deepgram speech-to-text SDK
- **@elevenlabs/client** (^0.13.0) - ElevenLabs text-to-speech client

### Communication & Voice
- **twilio** (^5.12.0) - Twilio SDK for voice and messaging
- **@twilio/voice-sdk** (^2.18.0) - Twilio Voice SDK for browser

### Calendar Integration
- **googleapis** (^170.1.0) - Google APIs client library

### Data Fetching & State Management
- **@tanstack/react-query** (^5.90.20) - Data fetching and caching library

### Utilities
- **clsx** (^2.1.1) - Utility for constructing className strings
- **date-fns** (^4.1.0) - Date utility library
- **dotenv** (^17.2.3) - Environment variable loader
- **zod** (^4.3.6) - TypeScript-first schema validation

## Development Dependencies

### Build Tools
- **typescript** (^5) - TypeScript compiler
- **@types/node** (^20) - TypeScript definitions for Node.js
- **@types/react** (^19) - TypeScript definitions for React
- **@types/react-dom** (^19) - TypeScript definitions for React DOM
- **@types/pg** (^8.16.0) - TypeScript definitions for PostgreSQL

### Styling & CSS
- **tailwindcss** (^4) - Utility-first CSS framework
- **@tailwindcss/postcss** (^4) - PostCSS plugin for Tailwind CSS

### Linting & Code Quality
- **eslint** (^9) - JavaScript linter
- **eslint-config-next** (16.1.4) - ESLint configuration for Next.js

## Environment Variables

Make sure to set up the following environment variables (create a `.env.local` file):

- Database connection strings (PostgreSQL, MongoDB)
- API keys for:
  - Clerk (authentication)
  - Twilio (voice services)
  - Deepgram (transcription)
  - ElevenLabs (text-to-speech)
  - Google Generative AI
  - Google Calendar API

## Node.js Version

This project requires Node.js. Check `package.json` or `.nvmrc` for the recommended version.
