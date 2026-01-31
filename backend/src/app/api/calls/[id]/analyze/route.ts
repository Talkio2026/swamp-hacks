import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { getCallById } from '@/lib/services/calls'
import { analyzeCall } from '@/lib/services/analysis'
import { createApiError } from '@/lib/utils'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/calls/[id]/analyze - Trigger AI analysis for a call
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession()
    const { id } = await params
    
    // Verify the call exists and belongs to this org
    const call = await getCallById(session, id)
    
    if (!call) {
      return NextResponse.json(
        createApiError('NOT_FOUND', 'Call not found'),
        { status: 404 }
      )
    }
    
    if (!call.transcript) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Call has no transcript to analyze'),
        { status: 400 }
      )
    }
    
    if (call.status === 'PROCESSING') {
      return NextResponse.json(
        createApiError('CONFLICT', 'Call is already being analyzed'),
        { status: 409 }
      )
    }
    
    // Start analysis (this will update the call status)
    const analysis = await analyzeCall(id)
    
    return NextResponse.json({
      message: 'Analysis completed',
      analysis,
    })
  } catch (error) {
    console.error('[API] POST /api/calls/[id]/analyze error:', error)
    
    if (error instanceof Error) {
      if (error.message.startsWith('Unauthorized')) {
        return NextResponse.json(
          createApiError('UNAUTHORIZED', error.message),
          { status: 401 }
        )
      }
    }
    
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to analyze call'),
      { status: 500 }
    )
  }
}
