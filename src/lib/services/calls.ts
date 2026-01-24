import { db } from '@/lib/db'
import { CallStatus, RiskLevel, Prisma } from '@/generated/prisma'
import { AuthSession } from '@/lib/auth'

export interface CreateCallInput {
  title: string
  transcript?: string
  prospect?: string
  company?: string
  phoneNumber?: string
  duration?: number
  callDate?: Date
  audioUrl?: string
  playbookId?: string
}

export interface UpdateCallInput {
  title?: string
  transcript?: string
  prospect?: string
  company?: string
  phoneNumber?: string
  duration?: number
  callDate?: Date
  audioUrl?: string
  playbookId?: string
  status?: CallStatus
  riskLevel?: RiskLevel
  summary?: string
  nextSteps?: string
  errorMessage?: string
}

export interface CallFilters {
  status?: CallStatus
  riskLevel?: RiskLevel
  repId?: string
  startDate?: Date
  endDate?: Date
  search?: string
}

/**
 * Create a new call
 */
export async function createCall(
  session: AuthSession,
  input: CreateCallInput
) {
  return db.call.create({
    data: {
      orgId: session.orgId,
      repId: session.userId,
      title: input.title,
      transcript: input.transcript,
      prospect: input.prospect,
      company: input.company,
      phoneNumber: input.phoneNumber,
      duration: input.duration,
      callDate: input.callDate ?? new Date(),
      audioUrl: input.audioUrl,
      playbookId: input.playbookId,
      status: input.transcript ? CallStatus.PENDING : CallStatus.PENDING,
    },
    include: {
      rep: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      playbook: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })
}

/**
 * Get a single call by ID (with org isolation)
 */
export async function getCallById(session: AuthSession, callId: string) {
  return db.call.findFirst({
    where: {
      id: callId,
      orgId: session.orgId,
    },
    include: {
      rep: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          imageUrl: true,
        },
      },
      playbook: {
        select: {
          id: true,
          name: true,
        },
      },
      analysis: true,
      stages: {
        orderBy: { stageOrder: 'asc' },
      },
      objections: true,
    },
  })
}

/**
 * List calls with filters (org-isolated)
 */
export async function listCalls(
  session: AuthSession,
  filters: CallFilters = {},
  page = 1,
  pageSize = 20
) {
  const where: Prisma.CallWhereInput = {
    orgId: session.orgId,
  }

  // Reps can only see their own calls
  if (session.role === 'REP') {
    where.repId = session.userId
  } else if (filters.repId) {
    where.repId = filters.repId
  }

  if (filters.status) {
    where.status = filters.status
  }

  if (filters.riskLevel) {
    where.riskLevel = filters.riskLevel
  }

  if (filters.startDate || filters.endDate) {
    where.callDate = {}
    if (filters.startDate) {
      where.callDate.gte = filters.startDate
    }
    if (filters.endDate) {
      where.callDate.lte = filters.endDate
    }
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { prospect: { contains: filters.search, mode: 'insensitive' } },
      { company: { contains: filters.search, mode: 'insensitive' } },
    ]
  }

  const [calls, total] = await Promise.all([
    db.call.findMany({
      where,
      include: {
        rep: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { callDate: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.call.count({ where }),
  ])

  return {
    calls,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}

/**
 * Update a call
 */
export async function updateCall(
  session: AuthSession,
  callId: string,
  input: UpdateCallInput
) {
  // Verify ownership
  const existing = await db.call.findFirst({
    where: {
      id: callId,
      orgId: session.orgId,
    },
  })

  if (!existing) {
    throw new Error('Call not found')
  }

  return db.call.update({
    where: { id: callId },
    data: input,
    include: {
      rep: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  })
}

/**
 * Delete a call
 */
export async function deleteCall(session: AuthSession, callId: string) {
  // Verify ownership
  const existing = await db.call.findFirst({
    where: {
      id: callId,
      orgId: session.orgId,
    },
  })

  if (!existing) {
    throw new Error('Call not found')
  }

  return db.call.delete({
    where: { id: callId },
  })
}

/**
 * Get call statistics for dashboard
 */
export async function getCallStats(session: AuthSession) {
  const baseWhere = { orgId: session.orgId }
  
  // For reps, only show their own stats
  const where = session.role === 'REP' 
    ? { ...baseWhere, repId: session.userId }
    : baseWhere

  const [
    totalCalls,
    completedCalls,
    highRiskCalls,
    processingCalls,
    recentCalls,
  ] = await Promise.all([
    db.call.count({ where }),
    db.call.count({ where: { ...where, status: CallStatus.COMPLETED } }),
    db.call.count({ where: { ...where, riskLevel: RiskLevel.HIGH } }),
    db.call.count({ where: { ...where, status: CallStatus.PROCESSING } }),
    db.call.findMany({
      where: { ...where, status: CallStatus.COMPLETED },
      orderBy: { callDate: 'desc' },
      take: 5,
      include: {
        rep: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
  ])

  // Get objection distribution
  const objectionStats = await db.objection.groupBy({
    by: ['type'],
    where: { orgId: session.orgId },
    _count: true,
  })

  return {
    totalCalls,
    completedCalls,
    highRiskCalls,
    processingCalls,
    recentCalls,
    objectionStats: objectionStats.map(stat => ({
      type: stat.type,
      count: stat._count,
    })),
  }
}
