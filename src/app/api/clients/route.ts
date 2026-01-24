import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createApiError } from '@/lib/utils'
import type { ClientRow, FollowUpStatus } from '@/lib/types/clients'

/** Role type – use Prisma Role when @/generated/prisma is available (after npx prisma generate). */
type Role = 'ADMIN' | 'MANAGER' | 'REP'

function getMockRole(): Role {
  return 'MANAGER'
}

/** Mock clients – replace with Prisma queries when schema is ready. */
function getMockClients(_orgId: string): ClientRow[] {
  const base: ClientRow[] = [
    {
      id: 'c1',
      name: 'Acme Corp',
      accountName: 'Acme Corporation',
      lastCallAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      totalCalls: 12,
      followUpStatus: 'MISSING',
      needsAttention: true,
      needsAttentionReason: 'No follow-up scheduled; last call raised pricing concerns.',
      assignedRepName: 'Sarah Wilson',
      status: 'READY',
    },
    {
      id: 'c2',
      name: 'TechStart Inc',
      accountName: 'TechStart Inc',
      lastCallAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      totalCalls: 5,
      followUpStatus: 'SCHEDULED',
      needsAttention: false,
      needsAttentionReason: null,
      assignedRepName: 'Mike Johnson',
      status: 'READY',
    },
    {
      id: 'c3',
      name: 'Enterprise Solutions',
      accountName: 'Enterprise Solutions LLC',
      lastCallAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      totalCalls: 8,
      followUpStatus: 'MISSING',
      needsAttention: true,
      needsAttentionReason: 'Decision-maker went cold; recommend re-engagement.',
      assignedRepName: 'Jane Smith',
      status: 'READY',
    },
    {
      id: 'c4',
      name: 'Anderson & Co',
      accountName: null,
      lastCallAt: null,
      totalCalls: 3,
      followUpStatus: 'UNKNOWN',
      needsAttention: false,
      needsAttentionReason: null,
      assignedRepName: 'John Doe',
      status: 'PROCESSING',
    },
    {
      id: 'c5',
      name: 'Taylor Industries',
      accountName: 'Taylor Industries',
      lastCallAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      totalCalls: 6,
      followUpStatus: 'SCHEDULED',
      needsAttention: false,
      needsAttentionReason: null,
      assignedRepName: 'Sarah Wilson',
      status: 'READY',
    },
  ]
  return base.map((c) => ({ ...c }))
}

function filterClients(
  clients: ClientRow[],
  params: {
    q?: string
    followUp?: 'scheduled' | 'missing' | 'all'
    recent?: '7d' | '30d' | 'all'
    repId?: string
    needsAttention?: 'true' | 'false' | 'all'
  },
  isRep: boolean,
  repName: string | null
): ClientRow[] {
  let out = [...clients]

  if (isRep && repName) {
    out = out.filter((c) => c.assignedRepName === repName)
  }

  if (params.q?.trim()) {
    const q = params.q.toLowerCase().trim()
    out = out.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.accountName?.toLowerCase().includes(q) ?? false)
    )
  }

  if (params.followUp && params.followUp !== 'all') {
    const status: FollowUpStatus =
      params.followUp === 'scheduled' ? 'SCHEDULED' : 'MISSING'
    out = out.filter((c) => c.followUpStatus === status)
  }

  if (params.recent && params.recent !== 'all') {
    const days = params.recent === '7d' ? 7 : 30
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    out = out.filter((c) => {
      if (!c.lastCallAt) return false
      return new Date(c.lastCallAt) >= cutoff
    })
  }

  if (!isRep && params.repId && params.repId !== 'all') {
    const rep = clients.find((c) => c.assignedRepName === params.repId)
    const name = rep?.assignedRepName ?? params.repId
    out = out.filter((c) => c.assignedRepName === name)
  }

  if (params.needsAttention && params.needsAttention !== 'all') {
    const need = params.needsAttention === 'true'
    out = out.filter((c) => c.needsAttention === need)
  }

  return out
}

export async function GET(request: NextRequest) {
  try {
    const { userId, orgId } = await auth()
    if (!userId || !orgId) {
      return NextResponse.json(
        createApiError('UNAUTHORIZED', 'No user session or organization selected'),
        { status: 401 }
      )
    }

    /** Use MANAGER until Prisma + getAuthSession are available; then use session.role. */
    const role = getMockRole()
    const isRep = role === 'REP'
    const repName: string | null = null

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') ?? undefined
    const followUp = (searchParams.get('followUp') ?? 'all') as
      | 'scheduled'
      | 'missing'
      | 'all'
    const recent = (searchParams.get('recent') ?? 'all') as '7d' | '30d' | 'all'
    const repId = searchParams.get('repId') ?? 'all'
    const needsAttention = (searchParams.get('needsAttention') ?? 'all') as
      | 'true'
      | 'false'
      | 'all'

    const all = getMockClients(orgId)
    const filtered = filterClients(
      all,
      { q, followUp, recent, repId, needsAttention },
      isRep,
      repName
    )

    const reps = isRep
      ? []
      : [...new Set(all.map((c) => c.assignedRepName).filter(Boolean))].map(
          (name) => ({ id: name!, name: name! })
        ) as { id: string; name: string }[]

    return NextResponse.json({
      clients: filtered,
      meta: {
        total: filtered.length,
        role,
        reps,
      },
    })
  } catch (error) {
    console.error('[API] GET /api/clients error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    if (msg.startsWith('Unauthorized') || msg.includes('organization')) {
      return NextResponse.json(
        createApiError('UNAUTHORIZED', msg),
        { status: 401 }
      )
    }
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to fetch clients'),
      { status: 500 }
    )
  }
}
