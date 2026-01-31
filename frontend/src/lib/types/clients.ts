/**
 * Client list row – aligns with API response and future Prisma-backed shape.
 */
export type FollowUpStatus = 'SCHEDULED' | 'MISSING' | 'UNKNOWN'
export type ClientStatus = 'READY' | 'PROCESSING'

export interface ClientRow {
  id: string
  name: string
  accountName: string | null
  lastCallAt: Date | string | null
  totalCalls: number
  followUpStatus: FollowUpStatus
  needsAttention: boolean
  needsAttentionReason: string | null
  assignedRepName: string | null
  status: ClientStatus
}

export interface ClientsApiResponse {
  clients: ClientRow[]
  meta: {
    total: number
    role?: 'ADMIN' | 'MANAGER' | 'REP'
    reps?: { id: string; name: string }[]
  }
}

export interface ClientsQueryParams {
  q?: string
  followUp?: 'scheduled' | 'missing' | 'all'
  recent?: '7d' | '30d' | 'all'
  repId?: string | 'all'
  needsAttention?: 'true' | 'false' | 'all'
}

// ---------------------------------------------------------------
// Client Detail (Page 3)
// ---------------------------------------------------------------

export interface ClientDetail {
  id: string
  name: string
  accountName: string | null
  primaryRepName: string | null
}

export interface ContextSummary {
  summary: string
  lastUpdatedAt: string
}

export type FollowUpStatusDetail = 'SCHEDULED' | 'MISSING' | 'NONE'

export interface FollowUpInfo {
  status: FollowUpStatusDetail
  scheduledAt: string | null
  purpose: string | null
}

export interface ClientDetailApiResponse {
  client: ClientDetail
  context: ContextSummary
  followUp: FollowUpInfo
}

export interface CallTimelineRow {
  id: string
  title: string
  startedAt: string
  repName: string | null
  durationSeconds: number
  outcomeLabel: string
  followUpStatus: FollowUpStatus
  status: ClientStatus
}

export interface ClientCallsApiResponse {
  calls: CallTimelineRow[]
  meta: { total: number }
}

// ---------------------------------------------------------------
// Client Calls List (Page 4) – list scoped to client
// ---------------------------------------------------------------

export type CallStatusRow = 'READY' | 'PROCESSING' | 'FAILED'

export interface CallRow {
  id: string
  title: string
  startedAt: string
  repName: string | null
  durationSeconds: number
  outcomeLabel: string
  followUpStatus: FollowUpStatus
  status: CallStatusRow
}

export interface ClientCallsListApiResponse {
  client: { id: string; name: string; accountName: string | null }
  calls: CallRow[]
  meta: {
    total: number
    role?: 'ADMIN' | 'MANAGER' | 'REP'
    reps?: { id: string; name: string }[]
    outcomes?: string[]
  }
}

// ---------------------------------------------------------------
// Call Detail (Page 5)
// ---------------------------------------------------------------

export type CallDetailStatus = 'PROCESSING' | 'READY' | 'FAILED'
export type TranscriptSpeaker = 'REP' | 'CLIENT' | 'UNKNOWN'
export type NextActionFollowUp = 'SCHEDULED' | 'MISSING' | 'NONE'

export interface ScheduledMeeting {
  detected: boolean
  date?: string        // YYYY-MM-DD format
  time?: string        // HH:MM 24-hour format  
  duration?: number    // minutes
  type?: 'call' | 'demo' | 'meeting'
  notes?: string       // What was agreed to be discussed
}

export interface CallDetail {
  id: string
  title: string
  client: { id: string; name: string; accountName: string | null }
  rep: { id: string; name: string | null }
  startedAt: string
  endedAt: string | null
  durationSeconds: number
  status: CallDetailStatus
  outcome: { label: string; explanation: string | null }
  summary: { bullets: string[] }
  keyPoints: Array<{ label: string; timestampSeconds: number }>
  transcript: {
    available: boolean
    segments: Array<{ t: number; speaker: TranscriptSpeaker; text: string }>
  }
  recording: { available: boolean; url: string | null }
  nextAction: {
    followUpStatus: NextActionFollowUp
    scheduledAt: string | null
    purpose: string | null
    missingReason: string | null
  }
  scheduledMeeting?: ScheduledMeeting
}

export interface ContextHistoryItem {
  id: string
  date: string
  title: string
  oneLineSummary: string
}

export interface CallDetailApiResponse {
  call: CallDetail
}

export interface ContextHistoryApiResponse {
  history: ContextHistoryItem[]
}
