import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createApiError } from '@/lib/utils'
import type {
  CallDetail,
  CallDetailApiResponse,
  NextActionFollowUp,
  TranscriptSpeaker,
} from '@/lib/types/clients'

type Role = 'ADMIN' | 'MANAGER' | 'REP'

function getMockRole(): Role {
  return 'MANAGER'
}

/** In-memory overrides for editable fields. Key: `${clientId}:${callId}:${field}`. */
const editOverrides = new Map<string, unknown>()

function getOverride<T>(key: string): T | undefined {
  return editOverrides.get(key) as T | undefined
}

function setOverride(key: string, value: unknown): void {
  editOverrides.set(key, value)
}

function mockCallDetail(
  clientId: string,
  callId: string,
  _orgId: string
): CallDetail | null {
  const clients: Record<string, { id: string; name: string; accountName: string | null }> = {
    c1: { id: 'c1', name: 'Acme Corp', accountName: 'Acme Corporation' },
    c2: { id: 'c2', name: 'TechStart Inc', accountName: 'TechStart Inc' },
    c3: { id: 'c3', name: 'Enterprise Solutions', accountName: 'Enterprise Solutions LLC' },
    c4: { id: 'c4', name: 'Anderson & Co', accountName: null },
    c5: { id: 'c5', name: 'Taylor Industries', accountName: 'Taylor Industries' },
  }
  const client = clients[clientId]
  if (!client) return null

  const base: Record<string, Omit<CallDetail, 'outcome' | 'summary' | 'nextAction'> & { outcome: { label: string; explanation: string | null }; summary: { bullets: string[] }; nextAction: { followUpStatus: NextActionFollowUp; scheduledAt: string | null; purpose: string | null; missingReason: string | null } }> = {
    'call-c1-1': {
      id: 'call-c1-1',
      title: 'Discovery pricing discussion',
      client,
      rep: { id: 'rep-sarah', name: 'Sarah Wilson' },
      startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      endedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 1842 * 1000).toISOString(),
      durationSeconds: 1842,
      status: 'READY',
      outcome: {
        label: 'Needs follow-up',
        explanation: 'Pricing concerns were raised. Competitor comparison likely. VP Engineering to review security add-ons.',
      },
      summary: {
        bullets: [
          'Discussed current infrastructure and pain points.',
          'Client expressed concerns about total cost of ownership.',
          'Agreed to walk through security add-ons in next call.',
          'Decision-maker is VP Engineering; procurement involved later.',
        ],
      },
      keyPoints: [
        { label: 'Pricing objections', timestampSeconds: 420 },
        { label: 'Security add-ons', timestampSeconds: 1020 },
        { label: 'Next steps', timestampSeconds: 1680 },
      ],
      transcript: {
        available: true,
        segments: [
          { t: 0, speaker: 'REP' as TranscriptSpeaker, text: 'Thanks for your time today. Can you walk me through the current setup?' },
          { t: 45, speaker: 'CLIENT' as TranscriptSpeaker, text: 'Sure. We run everything on-prem, about 200 users.' },
          { t: 90, speaker: 'REP' as TranscriptSpeaker, text: 'What’s driving the look at alternatives?' },
          { t: 120, speaker: 'CLIENT' as TranscriptSpeaker, text: 'Mainly cost and maintenance. We’re stretched thin.' },
          { t: 420, speaker: 'CLIENT' as TranscriptSpeaker, text: 'Your pricing is higher than we’ve seen elsewhere. How do you justify it?' },
          { t: 480, speaker: 'REP' as TranscriptSpeaker, text: 'We bundle security and compliance. Let me send a breakdown.' },
          { t: 1020, speaker: 'REP' as TranscriptSpeaker, text: 'We could do a follow-up on the security add-ons with your VP Eng.' },
          { t: 1080, speaker: 'CLIENT' as TranscriptSpeaker, text: 'That works. Let’s schedule it.' },
        ],
      },
      recording: { available: true, url: '/api/placeholder/recording/call-c1-1' },
      nextAction: {
        followUpStatus: 'SCHEDULED' as NextActionFollowUp,
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        purpose: 'Walk through security add-ons and pricing options with VP Engineering.',
        missingReason: null,
      },
    },
    'call-c1-2': {
      id: 'call-c1-2',
      title: 'Intro and requirements',
      client,
      rep: { id: 'rep-sarah', name: 'Sarah Wilson' },
      startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      endedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 2100 * 1000).toISOString(),
      durationSeconds: 2100,
      status: 'READY',
      outcome: { label: 'Positive', explanation: 'Initial discovery went well. Technical fit confirmed.' },
      summary: {
        bullets: [
          'Intro call; stakeholders introduced.',
          'Requirements gathering: scale, security, integrations.',
          'Demo requested for next phase.',
        ],
      },
      keyPoints: [
        { label: 'Requirements', timestampSeconds: 300 },
        { label: 'Demo request', timestampSeconds: 1800 },
      ],
      transcript: {
        available: true,
        segments: [
          { t: 0, speaker: 'REP' as TranscriptSpeaker, text: 'Great to meet you. I’ll keep this to 30 minutes.' },
          { t: 300, speaker: 'CLIENT' as TranscriptSpeaker, text: 'We need SSO, audit logs, and annual compliance reviews.' },
          { t: 1800, speaker: 'CLIENT' as TranscriptSpeaker, text: 'We’d like a demo next week.' },
        ],
      },
      recording: { available: false, url: null },
      nextAction: {
        followUpStatus: 'NONE' as NextActionFollowUp,
        scheduledAt: null,
        purpose: null,
        missingReason: null,
      },
    },
    'call-c2-1': {
      id: 'call-c2-1',
      title: 'First discovery',
      client,
      rep: { id: 'rep-mike', name: 'Mike Johnson' },
      startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      endedAt: new Date(Date.now() - 1 * 60 * 60 * 1000 + 1560 * 1000).toISOString(),
      durationSeconds: 1560,
      status: 'READY',
      outcome: { label: 'Demo requested', explanation: 'CTO confirmed fit. Demo and pilot proposal next.' },
      summary: {
        bullets: [
          'First discovery with TechStart.',
          'CTO is decision-maker.',
          'Demo and pilot proposal agreed for follow-up.',
        ],
      },
      keyPoints: [
        { label: 'Decision-maker', timestampSeconds: 120 },
        { label: 'Demo agreed', timestampSeconds: 1380 },
      ],
      transcript: {
        available: true,
        segments: [
          { t: 0, speaker: 'REP' as TranscriptSpeaker, text: 'Thanks for jumping on. What’s the biggest priority right now?' },
          { t: 120, speaker: 'CLIENT' as TranscriptSpeaker, text: 'I’m the CTO, so I own this. We need to move fast.' },
          { t: 1380, speaker: 'CLIENT' as TranscriptSpeaker, text: 'Let’s do a demo and then a pilot proposal.' },
        ],
      },
      recording: { available: false, url: null },
      nextAction: {
        followUpStatus: 'SCHEDULED' as NextActionFollowUp,
        scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        purpose: 'Demo and pilot proposal.',
        missingReason: null,
      },
    },
    'call-c3-1': {
      id: 'call-c3-1',
      title: 'Stakeholder check-in',
      client,
      rep: { id: 'rep-jane', name: 'Jane Smith' },
      startedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      endedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 900 * 1000).toISOString(),
      durationSeconds: 900,
      status: 'READY',
      outcome: { label: 'Deferred', explanation: 'Timeline pushed. Decision-maker change mentioned.' },
      summary: {
        bullets: [
          'Stakeholder check-in; engagement had dipped.',
          'Timeline deferred. New contact expected.',
          'Re-engagement planned when org settles.',
        ],
      },
      keyPoints: [
        { label: 'Timeline deferred', timestampSeconds: 300 },
        { label: 'New contact', timestampSeconds: 600 },
      ],
      transcript: {
        available: true,
        segments: [
          { t: 0, speaker: 'REP' as TranscriptSpeaker, text: 'Just checking in. Where do things stand?' },
          { t: 300, speaker: 'CLIENT' as TranscriptSpeaker, text: 'We’ve had to push this. Lots of churn internally.' },
          { t: 600, speaker: 'CLIENT' as TranscriptSpeaker, text: 'New person will own this soon. Let’s reconnect then.' },
        ],
      },
      recording: { available: false, url: null },
      nextAction: {
        followUpStatus: 'MISSING' as NextActionFollowUp,
        scheduledAt: null,
        purpose: null,
        missingReason: 'Decision-maker changed; re-engagement pending new contact. No date set.',
      },
    },
    'call-c4-1': {
      id: 'call-c4-1',
      title: 'Initial outreach',
      client,
      rep: { id: 'rep-john', name: 'John Doe' },
      startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      endedAt: null,
      durationSeconds: 600,
      status: 'PROCESSING',
      outcome: { label: 'In progress', explanation: null },
      summary: { bullets: [] },
      keyPoints: [],
      transcript: { available: false, segments: [] },
      recording: { available: false, url: null },
      nextAction: {
        followUpStatus: 'NONE' as NextActionFollowUp,
        scheduledAt: null,
        purpose: null,
        missingReason: null,
      },
    },
    'call-c5-1': {
      id: 'call-c5-1',
      title: 'Phased rollout proposal',
      client,
      rep: { id: 'rep-sarah', name: 'Sarah Wilson' },
      startedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      endedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 1920 * 1000).toISOString(),
      durationSeconds: 1920,
      status: 'READY',
      outcome: { label: 'Next steps agreed', explanation: 'Phased rollout preferred. Ops lead to own rollout.' },
      summary: {
        bullets: [
          'Presented phased rollout to address timeline concerns.',
          'Operations lead will own implementation.',
          'Kick-off and first phase scope agreed.',
        ],
      },
      keyPoints: [
        { label: 'Phased rollout', timestampSeconds: 600 },
        { label: 'Ops ownership', timestampSeconds: 1200 },
      ],
      transcript: {
        available: true,
        segments: [
          { t: 0, speaker: 'REP' as TranscriptSpeaker, text: 'Given your timeline, we suggest a phased approach.' },
          { t: 600, speaker: 'CLIENT' as TranscriptSpeaker, text: 'Phased works. We’ll start with one team.' },
          { t: 1200, speaker: 'CLIENT' as TranscriptSpeaker, text: 'Ops will own this. Let’s get them in the next call.' },
        ],
      },
      recording: { available: false, url: null },
      nextAction: {
        followUpStatus: 'SCHEDULED' as NextActionFollowUp,
        scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        purpose: 'Phased rollout discussion with operations lead.',
        missingReason: null,
      },
    },
  }

  const raw = base[callId]
  if (!raw) return null

  const bulletsKey = `${clientId}:${callId}:summary.bullets`
  const explanationKey = `${clientId}:${callId}:outcome.explanation`
  const purposeKey = `${clientId}:${callId}:nextAction.purpose`
  const missingKey = `${clientId}:${callId}:nextAction.missingReason`

  const summaryOverride = getOverride<{ bullets: string[] }>(bulletsKey)
  const explanationOverride = getOverride<{ explanation: string }>(explanationKey)
  const purposeOverride = getOverride<{ purpose: string }>(purposeKey)
  const missingOverride = getOverride<{ missingReason: string }>(missingKey)

  const summary = summaryOverride ?? raw.summary
  const outcome = {
    label: raw.outcome.label,
    explanation: explanationOverride?.explanation ?? raw.outcome.explanation,
  }
  const nextAction = {
    ...raw.nextAction,
    purpose: purposeOverride?.purpose ?? raw.nextAction.purpose,
    missingReason: missingOverride?.missingReason ?? raw.nextAction.missingReason,
  }

  return {
    ...raw,
    summary,
    outcome,
    nextAction,
  } as CallDetail
}

/** Call belongs to client (by our mock convention). */
function callBelongsToClient(callId: string, clientId: string): boolean {
  return callId.startsWith(`call-${clientId}-`)
}

interface RouteParams {
  params: Promise<{ clientId: string; callId: string }>
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<CallDetailApiResponse | { error: unknown }>> {
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

    const { clientId, callId } = await params
    if (!callBelongsToClient(callId, clientId)) {
      return NextResponse.json(
        createApiError('NOT_FOUND', 'Call not found'),
        { status: 404 }
      )
    }

    const call = mockCallDetail(clientId, callId, orgId)
    if (!call) {
      return NextResponse.json(
        createApiError('NOT_FOUND', 'Call not found'),
        { status: 404 }
      )
    }

    if (isRep) {
      // Rep can only view own calls. Mock: we'd match current user to call.rep.
      // For now we allow all; replace with session lookup when using DB.
    }

    return NextResponse.json({ call })
  } catch (error) {
    console.error('[API] GET /api/clients/[clientId]/calls/[callId] error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    if (msg.startsWith('Unauthorized') || msg.includes('organization')) {
      return NextResponse.json(createApiError('UNAUTHORIZED', msg), { status: 401 })
    }
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to fetch call'),
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<CallDetailApiResponse | { error: unknown }>> {
  try {
    const { userId, orgId } = await auth()
    if (!userId || !orgId) {
      return NextResponse.json(
        createApiError('UNAUTHORIZED', 'No user session or organization selected'),
        { status: 401 }
      )
    }

    const { clientId, callId } = await params
    const call = mockCallDetail(clientId, callId, orgId)
    if (!call) {
      return NextResponse.json(
        createApiError('NOT_FOUND', 'Call not found'),
        { status: 404 }
      )
    }

    if (call.status === 'PROCESSING' || call.status === 'FAILED') {
      return NextResponse.json(
        createApiError('FORBIDDEN', 'Cannot edit call while processing or failed'),
        { status: 403 }
      )
    }

    const body = (await request.json()) as Record<string, unknown>
    const baseKey = `${clientId}:${callId}`

    if (Array.isArray(body.summary?.bullets)) {
      setOverride(`${baseKey}:summary.bullets`, { bullets: body.summary.bullets as string[] })
    }
    if (body.outcome && 'explanation' in body.outcome) {
      const v = (body.outcome as { explanation: unknown }).explanation
      if (typeof v === 'string') setOverride(`${baseKey}:outcome.explanation`, { explanation: v })
      else editOverrides.delete(`${baseKey}:outcome.explanation`)
    }
    if (body.nextAction && 'purpose' in body.nextAction) {
      const v = (body.nextAction as { purpose?: unknown }).purpose
      if (typeof v === 'string') setOverride(`${baseKey}:nextAction.purpose`, { purpose: v })
      else editOverrides.delete(`${baseKey}:nextAction.purpose`)
    }
    if (body.nextAction && 'missingReason' in body.nextAction) {
      const v = (body.nextAction as { missingReason?: unknown }).missingReason
      if (typeof v === 'string') setOverride(`${baseKey}:nextAction.missingReason`, { missingReason: v })
      else editOverrides.delete(`${baseKey}:nextAction.missingReason`)
    }

    const updated = mockCallDetail(clientId, callId, orgId)
    if (!updated) {
      return NextResponse.json(createApiError('NOT_FOUND', 'Call not found'), { status: 404 })
    }
    return NextResponse.json({ call: updated })
  } catch (error) {
    console.error('[API] PATCH /api/clients/[clientId]/calls/[callId] error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    if (msg.startsWith('Unauthorized') || msg.includes('organization')) {
      return NextResponse.json(createApiError('UNAUTHORIZED', msg), { status: 401 })
    }
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to update call'),
      { status: 500 }
    )
  }
}
