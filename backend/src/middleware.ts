import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/api/webhooks(.*)',
  '/api/twilio(.*)',
  '/api/chat(.*)',
  '/api/embeddings(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/api/(.*)',
  ],
}
