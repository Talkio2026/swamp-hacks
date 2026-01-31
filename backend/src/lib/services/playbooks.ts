import { db } from '@/lib/db'
import { AuthSession } from '@/lib/auth'
import { PlaybookConfigSchema, type PlaybookConfig } from '@/lib/llm'

export interface CreatePlaybookInput {
  name: string
  description?: string
  isDefault?: boolean
  stages: PlaybookConfig['stages']
  questions?: string[]
  objections?: PlaybookConfig['objections']
  doSay?: string[]
  dontSay?: string[]
}

export interface UpdatePlaybookInput {
  name?: string
  description?: string
  isDefault?: boolean
  isActive?: boolean
  stages?: PlaybookConfig['stages']
  questions?: string[]
  objections?: PlaybookConfig['objections']
  doSay?: string[]
  dontSay?: string[]
}

/**
 * Create a new playbook
 */
export async function createPlaybook(
  session: AuthSession,
  input: CreatePlaybookInput
) {
  // Validate the config
  PlaybookConfigSchema.parse({
    stages: input.stages,
    questions: input.questions,
    objections: input.objections,
    doSay: input.doSay,
    dontSay: input.dontSay,
  })

  // If setting as default, unset other defaults first
  if (input.isDefault) {
    await db.playbook.updateMany({
      where: { orgId: session.orgId, isDefault: true },
      data: { isDefault: false },
    })
  }

  return db.playbook.create({
    data: {
      orgId: session.orgId,
      name: input.name,
      description: input.description,
      isDefault: input.isDefault ?? false,
      stages: input.stages,
      questions: input.questions,
      objections: input.objections,
      doSay: input.doSay,
      dontSay: input.dontSay,
    },
  })
}

/**
 * Get a playbook by ID
 */
export async function getPlaybookById(session: AuthSession, playbookId: string) {
  return db.playbook.findFirst({
    where: {
      id: playbookId,
      orgId: session.orgId,
    },
  })
}

/**
 * List all playbooks for an org
 */
export async function listPlaybooks(session: AuthSession) {
  return db.playbook.findMany({
    where: {
      orgId: session.orgId,
    },
    orderBy: [
      { isDefault: 'desc' },
      { name: 'asc' },
    ],
  })
}

/**
 * Update a playbook
 */
export async function updatePlaybook(
  session: AuthSession,
  playbookId: string,
  input: UpdatePlaybookInput
) {
  // Verify ownership
  const existing = await db.playbook.findFirst({
    where: {
      id: playbookId,
      orgId: session.orgId,
    },
  })

  if (!existing) {
    throw new Error('Playbook not found')
  }

  // If setting as default, unset other defaults first
  if (input.isDefault) {
    await db.playbook.updateMany({
      where: { 
        orgId: session.orgId, 
        isDefault: true,
        id: { not: playbookId },
      },
      data: { isDefault: false },
    })
  }

  // Validate config if stages are being updated
  if (input.stages) {
    PlaybookConfigSchema.parse({
      stages: input.stages,
      questions: input.questions ?? existing.questions,
      objections: input.objections ?? existing.objections,
      doSay: input.doSay ?? existing.doSay,
      dontSay: input.dontSay ?? existing.dontSay,
    })
  }

  return db.playbook.update({
    where: { id: playbookId },
    data: {
      name: input.name,
      description: input.description,
      isDefault: input.isDefault,
      isActive: input.isActive,
      stages: input.stages,
      questions: input.questions,
      objections: input.objections,
      doSay: input.doSay,
      dontSay: input.dontSay,
    },
  })
}

/**
 * Delete a playbook
 */
export async function deletePlaybook(session: AuthSession, playbookId: string) {
  // Verify ownership
  const existing = await db.playbook.findFirst({
    where: {
      id: playbookId,
      orgId: session.orgId,
    },
  })

  if (!existing) {
    throw new Error('Playbook not found')
  }

  // Check if any calls are using this playbook
  const callsUsingPlaybook = await db.call.count({
    where: { playbookId },
  })

  if (callsUsingPlaybook > 0) {
    throw new Error('Cannot delete playbook that is in use by calls')
  }

  return db.playbook.delete({
    where: { id: playbookId },
  })
}

/**
 * Get the default playbook for an org
 */
export async function getDefaultPlaybook(orgId: string) {
  return db.playbook.findFirst({
    where: {
      orgId,
      isDefault: true,
      isActive: true,
    },
  })
}

/**
 * Create a default playbook template
 */
export function getDefaultPlaybookTemplate(): CreatePlaybookInput {
  return {
    name: 'Standard Sales Playbook',
    description: 'Default playbook for B2B sales calls',
    isDefault: true,
    stages: [
      {
        name: 'Introduction',
        description: 'Opening the call and building rapport',
        requiredQuestions: [],
        successCriteria: ['Introduced yourself', 'Stated purpose of call', 'Confirmed time availability'],
      },
      {
        name: 'Discovery',
        description: 'Understanding the prospect\'s needs and challenges',
        requiredQuestions: [
          'What challenges are you currently facing?',
          'What solutions have you tried?',
          'What would success look like for you?',
        ],
        successCriteria: ['Identified pain points', 'Understood current situation', 'Discovered decision timeline'],
      },
      {
        name: 'Presentation',
        description: 'Presenting the solution',
        requiredQuestions: [],
        successCriteria: ['Connected solution to their needs', 'Shared relevant examples', 'Addressed concerns'],
      },
      {
        name: 'Close',
        description: 'Wrapping up and securing next steps',
        requiredQuestions: [],
        successCriteria: ['Summarized key points', 'Proposed clear next steps', 'Got commitment'],
      },
    ],
    questions: [
      'What challenges are you currently facing?',
      'How long have you been dealing with this issue?',
      'What have you tried so far?',
      'Who else is involved in this decision?',
      'What\'s your timeline for making a change?',
    ],
    objections: [
      {
        type: 'price',
        description: 'Concerns about cost or budget',
        suggestedResponses: [
          'I understand budget is important. Let me share the ROI other customers have seen...',
          'What would it cost you to NOT solve this problem?',
        ],
      },
      {
        type: 'timing',
        description: 'Not the right time',
        suggestedResponses: [
          'What would make it the right time?',
          'When do you think you\'ll be ready to address this?',
        ],
      },
      {
        type: 'competition',
        description: 'Already using or considering competitor',
        suggestedResponses: [
          'What do you like about your current solution?',
          'What would you change if you could?',
        ],
      },
    ],
    doSay: [
      'Tell me more about that...',
      'How does that impact your team?',
      'What would success look like?',
    ],
    dontSay: [
      'Trust me',
      'To be honest...',
      'Our product is the best',
    ],
  }
}
