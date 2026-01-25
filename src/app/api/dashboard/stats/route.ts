import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Transcript from '@/lib/models/Transcript'
import { createApiError } from '@/lib/utils'

// GET /api/dashboard/stats - Get dashboard statistics (MongoDB)
export async function GET() {
  try {
    await connectDB()
    
    // Get all transcripts for stats
    const transcripts = await Transcript.find({})
      .sort({ createdAt: -1 })
      .select({
        callSid: 1,
        clientName: 1,
        companyName: 1,
        contactPhone: 1,
        createdAt: 1,
        status: 1,
        outcome: 1,
        conversation: 1,
        analysis: 1,
      })
      .lean()
    
    // Calculate stats
    const totalCalls = transcripts.length
    const completedCalls = transcripts.filter(t => t.analysis?.summary).length
    const highRiskCalls = transcripts.filter(t => 
      t.analysis?.clientInterestLevel === 'low' || 
      t.analysis?.overallSentiment === 'negative'
    ).length
    const processingCalls = transcripts.filter(t => !t.analysis?.summary).length
    
    // Get recent calls (last 10)
    const recentCalls = transcripts.slice(0, 10).map(t => {
      // Calculate duration from conversation
      const duration = t.conversation?.length > 0 
        ? Math.round(t.conversation[t.conversation.length - 1]?.end || 0)
        : null
      
      return {
        id: t.callSid,
        title: t.clientName ? `Call with ${t.clientName}` : 'Sales Call',
        prospect: t.clientName || null,
        company: t.companyName || null,
        phoneNumber: t.contactPhone || null,
        duration,
        callDate: t.createdAt,
        status: t.analysis?.summary ? 'COMPLETED' : 'PROCESSING',
        summary: t.analysis?.summary || null,
        rep: { firstName: 'Sales', lastName: 'Rep' },
      }
    })
    
    return NextResponse.json({
      totalCalls,
      completedCalls,
      highRiskCalls,
      processingCalls,
      recentCalls,
      objectionStats: [],
    })
  } catch (error) {
    console.error('[API] GET /api/dashboard/stats error:', error)
    
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to fetch dashboard stats'),
      { status: 500 }
    )
  }
}
