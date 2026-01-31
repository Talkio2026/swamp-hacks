This repo is split into two separate Next.js apps for hosting on different services:

- `frontend/`: UI app (pages, components, client logic)
- `backend/`: API app (App Router `app/api` routes + server logic)

## Getting Started

Install dependencies in both apps, then run them on separate ports:

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
BACKEND_URL=http://localhost:4000 npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the frontend.
The frontend proxies `/api/*` requests to the backend via `BACKEND_URL`.

You can start editing the page by modifying `frontend/src/app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
