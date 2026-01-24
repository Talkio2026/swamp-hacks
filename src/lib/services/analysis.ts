import { db } from '@/lib/db'
import { CallStatus, RiskLevel, StageStatus } from '@/generated/prisma'
import { callLLM, CallAnalysisSchema, type CallAnalysisResult, type PlaybookConfig } from '@/lib/llm'
import { getAnalysisSystemPrompt, getAnalysisPrompt } from '@/lib/llm/prompts'

/**
 * Analyze a call transcript using AI
 */
export async function analyzeCall(callId: string): Promise<CallAnalysisResult> {
  // Get the call with its transcript and playbook
  const call = await db.call.findUnique({
    where: { id: callId },
    include: {
      playbook: true,
    },
  })

  if (!call) {
    throw new Error('Call not found')
  }

  if (!call.transcript) {
    throw new Error('Call has no transcript to analyze')
  }

  // Mark as processing
  await db.call.update({
    where: { id: callId },
    data: { status: CallStatus.PROCESSING },
  })

  try {
    // Get playbook config if available
    const playbookConfig = call.playbook 
      ? (call.playbook.stages as PlaybookConfig)
      : undefined

    // Call LLM for analysis
    const { data: analysis } = await callLLM(
      {
        prompt: getAnalysisPrompt(call.transcript),
        systemPrompt: getAnalysisSystemPrompt(playbookConfig),
        temperature: 0.3,
      },
      CallAnalysisSchema
    )

    // Save analysis results to database
    await db.$transaction(async (tx) => {
      // Create or update call analysis
      await tx.callAnalysis.upsert({
        where: { callId },
        create: {
          callId,
          orgId: call.orgId,
          overallScore: analysis.scores.overall,
          openingScore: analysis.scores.opening,
          discoveryScore: analysis.scores.discovery,
          presentationScore: analysis.scores.presentation,
          closingScore: analysis.scores.closing,
          strengths: analysis.strengths,
          improvements: analysis.improvements,
          coachingTips: analysis.coachingTips,
          rawResponse: analysis as unknown as object,
        },
        update: {
          overallScore: analysis.scores.overall,
          openingScore: analysis.scores.opening,
          discoveryScore: analysis.scores.discovery,
          presentationScore: analysis.scores.presentation,
          closingScore: analysis.scores.closing,
          strengths: analysis.strengths,
          improvements: analysis.improvements,
          coachingTips: analysis.coachingTips,
          rawResponse: analysis as unknown as object,
        },
      })

      // Delete existing stages and objections
      await tx.callStage.deleteMany({ where: { callId } })
      await tx.objection.deleteMany({ where: { callId } })

      // Insert new stages
      if (analysis.stages.length > 0) {
        await tx.callStage.createMany({
          data: analysis.stages.map((stage) => ({
            callId,
            orgId: call.orgId,
            stageName: stage.name,
            stageOrder: stage.order,
            startTime: stage.startTime,
            endTime: stage.endTime,
            status: stage.status as StageStatus,
            notes: stage.notes,
          })),
        })
      }

      // Insert objections
      if (analysis.objections.length > 0) {
        await tx.objection.createMany({
          data: analysis.objections.map((objection) => ({
            callId,
            orgId: call.orgId,
            type: objection.type,
            quote: objection.quote,
            timestamp: objection.timestamp,
            suggestedResponse: objection.suggestedResponse,
            handledWell: objection.handledWell,
          })),
        })
      }

      // Update call with summary data
      await tx.call.update({
        where: { id: callId },
        data: {
          status: CallStatus.COMPLETED,
          riskLevel: analysis.riskLevel as RiskLevel,
          summary: analysis.summary,
          nextSteps: analysis.nextSteps.join('\n'),
          errorMessage: null,
        },
      })
    })

    return analysis
  } catch (error) {
    // Mark call as failed
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    await db.call.update({
      where: { id: callId },
      data: {
        status: CallStatus.FAILED,
        errorMessage,
      },
    })

    throw error
  }
}

/**
 * Get analysis for a call
 */
export async function getCallAnalysis(callId: string, orgId: string) {
  return db.callAnalysis.findFirst({
    where: {
      callId,
      orgId,
    },
  })
}

/**
 * Retry a failed analysis
 */
export async function retryAnalysis(callId: string): Promise<CallAnalysisResult> {
  const call = await db.call.findUnique({
    where: { id: callId },
  })

  if (!call) {
    throw new Error('Call not found')
  }

  if (call.status !== CallStatus.FAILED) {
    throw new Error('Can only retry failed analyses')
  }

  return analyzeCall(callId)
}
