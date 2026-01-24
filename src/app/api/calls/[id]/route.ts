import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthSession } from '@/lib/auth'
import { getCallById, updateCall, deleteCall } from '@/lib/services/calls'
import { createApiError } from '@/lib/utils'
import { CallStatus, RiskLevel } from '@/generated/prisma'

// Validation schema for updating a call
const UpdateCallSchema = z.object({
  title: z.string().min(1).optional(),
  transcript: z.string().optional(),
  prospect: z.string().optional(),
  company: z.string().optional(),
  phoneNumber: z.string().optional(),
  duration: z.number().int().positive().optional(),
  callDate: z.string().datetime().optional(),
  audioUrl: z.string().url().optional(),
  playbookId: z.string().optional(),
  status: z.nativeEnum(CallStatus).optional(),
  riskLevel: z.nativeEnum(RiskLevel).optional(),
  summary: z.string().optional(),
  nextSteps: z.string().optional(),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/calls/[id] - Get a single call
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession()
    const { id } = await params
    
    const call = await getCallById(session, id)
    
    if (!call) {
      return NextResponse.json(
        createApiError('NOT_FOUND', 'Call not found'),
        { status: 404 }
      )
    }
    
    return NextResponse.json(call)
  } catch (error) {
    console.error('[API] GET /api/calls/[id] error:', error)
    
    if (error instanceof Error && error.message.startsWith('Unauthorized')) {
      return NextResponse.json(
        createApiError('UNAUTHORIZED', error.message),
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to fetch call'),
      { status: 500 }
    )
  }
}

// PATCH /api/calls/[id] - Update a call
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession()
    const { id } = await params
    
    const body = await request.json()
    const validatedData = UpdateCallSchema.parse(body)
    
    const call = await updateCall(session, id, {
      ...validatedData,
      callDate: validatedData.callDate ? new Date(validatedData.callDate) : undefined,
    })
    
    return NextResponse.json(call)
  } catch (error) {
    console.error('[API] PATCH /api/calls/[id] error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', error.issues[0]?.message ?? 'Validation failed'),
        { status: 400 }
      )
    }
    
    if (error instanceof Error) {
      if (error.message.startsWith('Unauthorized')) {
        return NextResponse.json(
          createApiError('UNAUTHORIZED', error.message),
          { status: 401 }
        )
      }
      if (error.message === 'Call not found') {
        return NextResponse.json(
          createApiError('NOT_FOUND', error.message),
          { status: 404 }
        )
      }
    }
    
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to update call'),
      { status: 500 }
    )
  }
}

// DELETE /api/calls/[id] - Delete a call
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession()
    const { id } = await params
    
    await deleteCall(session, id)
    
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[API] DELETE /api/calls/[id] error:', error)
    
    if (error instanceof Error) {
      if (error.message.startsWith('Unauthorized')) {
        return NextResponse.json(
          createApiError('UNAUTHORIZED', error.message),
          { status: 401 }
        )
      }
      if (error.message === 'Call not found') {
        return NextResponse.json(
          createApiError('NOT_FOUND', error.message),
          { status: 404 }
        )
      }
    }
    
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to delete call'),
      { status: 500 }
    )
  }
}
