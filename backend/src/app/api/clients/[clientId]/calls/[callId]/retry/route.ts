import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createApiError } from '@/lib/utils'

interface RouteParams {
  params: Promise<{ clientId: string; callId: string }>
}

/** Stub: re-trigger analysis for a failed call. Replace with real job enqueue when ready. */
export async function POST(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<{ ok: boolean; message?: string } | { error: unknown }>> {
  try {
    const { userId, orgId } = await auth()
    if (!userId || !orgId) {
      return NextResponse.json(
        createApiError('UNAUTHORIZED', 'No user session or organization selected'),
        { status: 401 }
      )
    }

    const { clientId, callId } = await params
    // Stub: acknowledge retry. In production, enqueue analysis job.
    return NextResponse.json({
      ok: true,
      message: `Retry requested for call ${callId} (client ${clientId}). Stub.`,
    })
  } catch (error) {
    console.error('[API] POST /api/clients/[clientId]/calls/[callId]/retry error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    if (msg.startsWith('Unauthorized') || msg.includes('organization')) {
      return NextResponse.json(createApiError('UNAUTHORIZED', msg), { status: 401 })
    }
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to retry analysis'),
      { status: 500 }
    )
  }
}
