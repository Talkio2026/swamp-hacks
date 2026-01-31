import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createApiError } from '@/lib/utils'
import type { CallRow, ClientCallsListApiResponse } from '@/lib/types/clients'

type Role = 'ADMIN' | 'MANAGER' | 'REP'

function getMockRole(): Role {
  return 'MANAGER'
}

function mockClientHeader(clientId: string): { id: string; name: string; accountName: string | null } | null {
  const map: Record<string, { id: string; name: string; accountName: string | null }> = {
    c1: { id: 'c1', name: 'Acme Corp', accountName: 'Acme Corporation' },
    c2: { id: 'c2', name: 'TechStart Inc', accountName: 'TechStart Inc' },
    c3: { id: 'c3', name: 'Enterprise Solutions', accountName: 'Enterprise Solutions LLC' },
    c4: { id: 'c4', name: 'Anderson & Co', accountName: null },
    c5: { id: 'c5', name: 'Taylor Industries', accountName: 'Taylor Industries' },
  }
  return map[clientId] ?? null
}

/** Mock calls per client. Replace with Prisma when schema is ready. */
function mockCallsForClient(clientId: string, _orgId: string): CallRow[] {
  const base: Record<string, CallRow[]> = {
    c1: [
      {
        id: 'call-c1-1',
        title: 'Discovery pricing discussion',
        startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        repName: 'Sarah Wilson',
        durationSeconds: 1842,
        outcomeLabel: 'Needs follow-up',
        followUpStatus: 'MISSING',
        status: 'READY',
      },
      {
        id: 'call-c1-2',
        title: 'Intro and requirements',
        startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        repName: 'Sarah Wilson',
        durationSeconds: 2100,
        outcomeLabel: 'Positive',
        followUpStatus: 'SCHEDULED',
        status: 'READY',
      },
    ],
    c2: [
      {
        id: 'call-c2-1',
        title: 'First discovery',
        startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        repName: 'Mike Johnson',
        durationSeconds: 1560,
        outcomeLabel: 'Demo requested',
        followUpStatus: 'SCHEDULED',
        status: 'READY',
      },
    ],
    c3: [
      {
        id: 'call-c3-1',
        title: 'Stakeholder check-in',
        startedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        repName: 'Jane Smith',
        durationSeconds: 900,
        outcomeLabel: 'Deferred',
        followUpStatus: 'MISSING',
        status: 'READY',
      },
    ],
    c4: [
      {
        id: 'call-c4-1',
        title: 'Initial outreach',
        startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        repName: 'John Doe',
        durationSeconds: 600,
        outcomeLabel: 'In progress',
        followUpStatus: 'UNKNOWN',
        status: 'PROCESSING',
      },
    ],
    c5: [
      {
        id: 'call-c5-1',
        title: 'Phased rollout proposal',
        startedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        repName: 'Sarah Wilson',
        durationSeconds: 1920,
        outcomeLabel: 'Next steps agreed',
        followUpStatus: 'SCHEDULED',
        status: 'READY',
      },
    ],
  }
  return base[clientId] ?? []
}

function filterCalls(
  calls: CallRow[],
  params: {
    dateFrom?: string
    dateTo?: string
    outcome?: string
    repId?: string
  },
  isRep: boolean
): CallRow[] {
  let out = [...calls]

  if (params.dateFrom) {
    const from = new Date(params.dateFrom)
    from.setHours(0, 0, 0, 0)
    out = out.filter((c) => new Date(c.startedAt) >= from)
  }
  if (params.dateTo) {
    const to = new Date(params.dateTo)
    to.setHours(23, 59, 59, 999)
    out = out.filter((c) => new Date(c.startedAt) <= to)
  }
  if (params.outcome && params.outcome !== 'all') {
    out = out.filter((c) => c.outcomeLabel === params.outcome)
  }
  if (!isRep && params.repId && params.repId !== 'all') {
    out = out.filter((c) => c.repName === params.repId)
  }

  return out
}

interface RouteParams {
  params: Promise<{ clientId: string }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ClientCallsListApiResponse | { error: unknown }>> {
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
    const client = mockClientHeader(clientId)
    if (!client) {
      return NextResponse.json(
        createApiError('NOT_FOUND', 'Client not found'),
        { status: 404 }
      )
    }

    let calls = mockCallsForClient(clientId, orgId)
    if (isRep) {
      // Rep sees only their calls; mock: filter unchanged. Use session + DB when ready.
    }

    const allCallsForClient = [...calls]
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom') ?? undefined
    const dateTo = searchParams.get('dateTo') ?? undefined
    const outcome = searchParams.get('outcome') ?? 'all'
    const repId = searchParams.get('repId') ?? 'all'

    calls = filterCalls(calls, { dateFrom, dateTo, outcome, repId }, isRep)

    const reps = isRep
      ? []
      : [...new Set(allCallsForClient.map((c) => c.repName).filter(Boolean))].map((name) => ({
          id: name!,
          name: name!,
        }))
    const outcomes = [...new Set(allCallsForClient.map((c) => c.outcomeLabel).filter(Boolean))]

    return NextResponse.json({
      client,
      calls,
      meta: { total: calls.length, role, reps, outcomes },
    })
  } catch (error) {
    console.error('[API] GET /api/clients/[clientId]/calls error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    if (msg.startsWith('Unauthorized') || msg.includes('organization')) {
      return NextResponse.json(createApiError('UNAUTHORIZED', msg), { status: 401 })
    }
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to fetch calls'),
      { status: 500 }
    )
  }
}
