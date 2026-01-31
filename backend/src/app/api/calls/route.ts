import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthSession } from '@/lib/auth'
import { createCall, listCalls, type CallFilters } from '@/lib/services/calls'
import { createApiError } from '@/lib/utils'
import { CallStatus, RiskLevel } from '@prisma/client'

// Validation schema for creating a call
const CreateCallSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  transcript: z.string().optional(),
  prospect: z.string().optional(),
  company: z.string().optional(),
  phoneNumber: z.string().optional(),
  duration: z.number().int().positive().optional(),
  callDate: z.string().datetime().optional(),
  audioUrl: z.string().url().optional(),
  playbookId: z.string().optional(),
})

// GET /api/calls - List calls
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    
    const { searchParams } = new URL(request.url)
    const filters: CallFilters = {}
    
    const status = searchParams.get('status')
    if (status && Object.values(CallStatus).includes(status as CallStatus)) {
      filters.status = status as CallStatus
    }
    
    const risk = searchParams.get('risk')
    if (risk && Object.values(RiskLevel).includes(risk as RiskLevel)) {
      filters.riskLevel = risk as RiskLevel
    }
    
    const repId = searchParams.get('repId')
    if (repId) {
      filters.repId = repId
    }
    
    const search = searchParams.get('search')
    if (search) {
      filters.search = search
    }
    
    const page = parseInt(searchParams.get('page') ?? '1')
    const pageSize = parseInt(searchParams.get('pageSize') ?? '20')
    
    const result = await listCalls(session, filters, page, pageSize)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('[API] GET /api/calls error:', error)
    
    if (error instanceof Error && error.message.startsWith('Unauthorized')) {
      return NextResponse.json(
        createApiError('UNAUTHORIZED', error.message),
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to fetch calls'),
      { status: 500 }
    )
  }
}

// POST /api/calls - Create a new call
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    
    const body = await request.json()
    const validatedData = CreateCallSchema.parse(body)
    
    const call = await createCall(session, {
      ...validatedData,
      callDate: validatedData.callDate ? new Date(validatedData.callDate) : undefined,
    })
    
    return NextResponse.json(call, { status: 201 })
  } catch (error) {
    console.error('[API] POST /api/calls error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', error.issues[0]?.message ?? 'Validation failed'),
        { status: 400 }
      )
    }
    
    if (error instanceof Error && error.message.startsWith('Unauthorized')) {
      return NextResponse.json(
        createApiError('UNAUTHORIZED', error.message),
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to create call'),
      { status: 500 }
    )
  }
}
