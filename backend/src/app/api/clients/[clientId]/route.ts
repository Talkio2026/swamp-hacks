import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createApiError } from '@/lib/utils'
import type {
  ClientDetail,
  ContextSummary,
  FollowUpInfo,
  ClientDetailApiResponse,
  FollowUpStatusDetail,
} from '@/lib/types/clients'

type Role = 'ADMIN' | 'MANAGER' | 'REP'

function getMockRole(): Role {
  return 'MANAGER'
}

/** In-memory overrides for context summary (per clientId). Mock only; reset on server restart. */
const contextOverrides = new Map<string, string>()

function mockClientDetail(clientId: string): ClientDetail | null {
  const map: Record<string, ClientDetail> = {
    c1: {
      id: 'c1',
      name: 'Acme Corp',
      accountName: 'Acme Corporation — IT Operations',
      primaryRepName: 'Sarah Wilson',
    },
    c2: {
      id: 'c2',
      name: 'TechStart Inc',
      accountName: 'TechStart Inc — Technology',
      primaryRepName: 'Mike Johnson',
    },
    c3: {
      id: 'c3',
      name: 'Enterprise Solutions',
      accountName: 'Enterprise Solutions LLC — Consulting',
      primaryRepName: 'Jane Smith',
    },
    c4: {
      id: 'c4',
      name: 'Anderson & Co',
      accountName: null,
      primaryRepName: 'John Doe',
    },
    c5: {
      id: 'c5',
      name: 'Taylor Industries',
      accountName: 'Taylor Industries — Manufacturing',
      primaryRepName: 'Sarah Wilson',
    },
  }
  return map[clientId] ?? null
}

function mockContext(clientId: string): ContextSummary {
  const override = contextOverrides.get(clientId)
  if (override !== undefined) {
    return {
      summary: override,
      lastUpdatedAt: new Date().toISOString(),
    }
  }
  const defaults: Record<string, string> = {
    c1:
      'Acme Corp has been in discovery for three months. Main stakeholders are IT and procurement. Last call raised pricing concerns; competitor comparison likely. Follow-up scheduled with VP Engineering to walk through security add-ons.',
    c2:
      'TechStart is a new lead. First discovery call completed; technical fit confirmed. Decision-maker is CTO. Next step: demo and pilot proposal.',
    c3:
      'Enterprise Solutions went quiet after initial enthusiasm. Decision-maker changed roles. Recommend re-engagement with new contact and updated use case.',
    c4:
      'Anderson & Co — early stage. Initial call analyzed; context is being generated.',
    c5:
      'Taylor Industries is mid-cycle. Strong interest in workflow automation. Key objection was timeline; we proposed a phased rollout. Follow-up with operations lead next week.',
  }
  return {
    summary: defaults[clientId] ?? 'No context summary yet. Context is generated as calls are analyzed.',
    lastUpdatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  }
}

function mockFollowUp(clientId: string): FollowUpInfo {
  const map: Record<string, FollowUpInfo> = {
    c1: {
      status: 'SCHEDULED',
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      purpose: 'Walk through security add-ons and pricing options with VP Engineering.',
    },
    c2: {
      status: 'SCHEDULED',
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      purpose: 'Demo and pilot proposal.',
    },
    c3: {
      status: 'MISSING',
      scheduledAt: null,
      purpose: null,
    },
    c4: {
      status: 'NONE',
      scheduledAt: null,
      purpose: null,
    },
    c5: {
      status: 'SCHEDULED',
      scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      purpose: 'Phased rollout discussion with operations lead.',
    },
  }
  return (
    map[clientId] ?? {
      status: 'NONE' as FollowUpStatusDetail,
      scheduledAt: null,
      purpose: null,
    }
  )
}

async function getPayload(
  clientId: string,
  _orgId: string
): Promise<ClientDetailApiResponse | null> {
  const client = mockClientDetail(clientId)
  if (!client) return null
  return {
    client,
    context: mockContext(clientId),
    followUp: mockFollowUp(clientId),
  }
}

interface RouteParams {
  params: Promise<{ clientId: string }>
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ClientDetailApiResponse | { error: unknown }>> {
  try {
    const { userId, orgId } = await auth()
    if (!userId || !orgId) {
      return NextResponse.json(
        createApiError('UNAUTHORIZED', 'No user session or organization selected'),
        { status: 401 }
      )
    }

    const { clientId } = await params
    const payload = await getPayload(clientId, orgId)
    if (!payload) {
      return NextResponse.json(
        createApiError('NOT_FOUND', 'Client not found'),
        { status: 404 }
      )
    }
    const role = getMockRole()
    return NextResponse.json({ ...payload, meta: { role } })
  } catch (error) {
    console.error('[API] GET /api/clients/[clientId] error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    if (msg.startsWith('Unauthorized') || msg.includes('organization')) {
      return NextResponse.json(createApiError('UNAUTHORIZED', msg), { status: 401 })
    }
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to fetch client'),
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ClientDetailApiResponse | { error: unknown }>> {
  try {
    const { userId, orgId } = await auth()
    if (!userId || !orgId) {
      return NextResponse.json(
        createApiError('UNAUTHORIZED', 'No user session or organization selected'),
        { status: 401 }
      )
    }

    const { clientId } = await params
    const payload = await getPayload(clientId, orgId)
    if (!payload) {
      return NextResponse.json(
        createApiError('NOT_FOUND', 'Client not found'),
        { status: 404 }
      )
    }

    const body = (await request.json()) as { context?: { summary?: string } }
    const summary = typeof body?.context?.summary === 'string' ? body.context.summary : undefined
    if (summary !== undefined) {
      contextOverrides.set(clientId, summary)
      payload.context = {
        summary,
        lastUpdatedAt: new Date().toISOString(),
      }
    }

    const role = getMockRole()
    return NextResponse.json({ ...payload, meta: { role } })
  } catch (error) {
    console.error('[API] PATCH /api/clients/[clientId] error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    if (msg.startsWith('Unauthorized') || msg.includes('organization')) {
      return NextResponse.json(createApiError('UNAUTHORIZED', msg), { status: 401 })
    }
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to update client'),
      { status: 500 }
    )
  }
}
