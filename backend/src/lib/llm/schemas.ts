import { z } from 'zod'

// ============================================
// CALL ANALYSIS SCHEMAS
// ============================================

export const StageSchema = z.object({
  name: z.string(),
  order: z.number(),
  startTime: z.number().nullable(),
  endTime: z.number().nullable(),
  status: z.enum(['DETECTED', 'SKIPPED', 'INCOMPLETE']),
  notes: z.string().nullable(),
})

export const ObjectionSchema = z.object({
  type: z.string(),
  quote: z.string(),
  timestamp: z.number().nullable(),
  suggestedResponse: z.string().nullable(),
  handledWell: z.boolean().nullable(),
})

export const CallAnalysisSchema = z.object({
  summary: z.string(),
  nextSteps: z.array(z.string()),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  
  // Scores (0-100)
  scores: z.object({
    overall: z.number().min(0).max(100),
    opening: z.number().min(0).max(100),
    discovery: z.number().min(0).max(100),
    presentation: z.number().min(0).max(100),
    closing: z.number().min(0).max(100),
  }),
  
  // Detected stages
  stages: z.array(StageSchema),
  
  // Detected objections
  objections: z.array(ObjectionSchema),
  
  // Coaching insights
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  coachingTips: z.array(z.string()),
})

export type CallAnalysisResult = z.infer<typeof CallAnalysisSchema>

// ============================================
// LIVE COPILOT SCHEMAS
// ============================================

export const LiveSuggestionSchema = z.object({
  currentStage: z.string(),
  suggestedPrompt: z.string(),
  reasoning: z.string().nullable(),
  objectionDetected: z.boolean(),
  objectionType: z.string().nullable(),
})

export type LiveSuggestion = z.infer<typeof LiveSuggestionSchema>

// ============================================
// PLAYBOOK SCHEMAS
// ============================================

export const PlaybookStageSchema = z.object({
  name: z.string(),
  description: z.string(),
  requiredQuestions: z.array(z.string()),
  successCriteria: z.array(z.string()),
})

export const PlaybookObjectionSchema = z.object({
  type: z.string(),
  description: z.string(),
  suggestedResponses: z.array(z.string()),
})

export const PlaybookConfigSchema = z.object({
  stages: z.array(PlaybookStageSchema),
  questions: z.array(z.string()).optional(),
  objections: z.array(PlaybookObjectionSchema).optional(),
  doSay: z.array(z.string()).optional(),
  dontSay: z.array(z.string()).optional(),
})

export type PlaybookConfig = z.infer<typeof PlaybookConfigSchema>
