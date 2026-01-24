import { NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { getCallStats } from '@/lib/services/calls'
import { createApiError } from '@/lib/utils'

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET() {
  try {
    const session = await getAuthSession()
    
    const stats = await getCallStats(session)
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('[API] GET /api/dashboard/stats error:', error)
    
    if (error instanceof Error && error.message.startsWith('Unauthorized')) {
      return NextResponse.json(
        createApiError('UNAUTHORIZED', error.message),
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to fetch dashboard stats'),
      { status: 500 }
    )
  }
}
