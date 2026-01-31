import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createApiError } from '@/lib/utils'
import type { ContextHistoryItem, ContextHistoryApiResponse } from '@/lib/types/clients'

type Role = 'ADMIN' | 'MANAGER' | 'REP'

function getMockRole(): Role {
  return 'MANAGER'
}

/** Mock context history: last 5–10 calls per client. Replace with Prisma when ready. */
function mockContextHistory(
  clientId: string,
  _orgId: string
): ContextHistoryItem[] {
  const base: Record<string, ContextHistoryItem[]> = {
    c1: [
      {
        id: 'call-c1-1',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        title: 'Discovery pricing discussion',
        oneLineSummary: 'Pricing concerns raised; follow-up on security add-ons with VP Eng.',
      },
      {
        id: 'call-c1-2',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        title: 'Intro and requirements',
        oneLineSummary: 'Initial discovery; demo requested.',
      },
    ],
    c2: [
      {
        id: 'call-c2-1',
        date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        title: 'First discovery',
        oneLineSummary: 'CTO confirmed fit; demo and pilot next.',
      },
    ],
    c3: [
      {
        id: 'call-c3-1',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        title: 'Stakeholder check-in',
        oneLineSummary: 'Timeline deferred; new contact expected.',
      },
    ],
    c4: [
      {
        id: 'call-c4-1',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        title: 'Initial outreach',
        oneLineSummary: 'First call; analysis in progress.',
      },
    ],
    c5: [
      {
        id: 'call-c5-1',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        title: 'Phased rollout proposal',
        oneLineSummary: 'Phased rollout agreed; ops lead follow-up.',
      },
    ],
  }
  return base[clientId] ?? []
}

interface RouteParams {
  params: Promise<{ clientId: string }>
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ContextHistoryApiResponse | { error: unknown }>> {
  try {
    const { userId, orgId } = await auth()
    if (!userId || !orgId) {
      return NextResponse.json(
        createApiError('UNAUTHORIZED', 'No user session or organization selected'),
        { status: 401 }
      )
    }

    const role = getMockRole()
    const isRep = role === 'REP'

    const { clientId } = await params
    let history = mockContextHistory(clientId, orgId)

    if (isRep) {
      // Rep: only their calls. Mock: unchanged; filter by session when using DB.
    }

    return NextResponse.json({ history })
  } catch (error) {
    console.error('[API] GET /api/clients/[clientId]/context error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    if (msg.startsWith('Unauthorized') || msg.includes('organization')) {
      return NextResponse.json(createApiError('UNAUTHORIZED', msg), { status: 401 })
    }
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to fetch context history'),
      { status: 500 }
    )
  }
}
