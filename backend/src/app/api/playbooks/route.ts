import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthSession, requireRole } from '@/lib/auth'
import { createPlaybook, listPlaybooks } from '@/lib/services/playbooks'
import { createApiError } from '@/lib/utils'
import { PlaybookConfigSchema } from '@/lib/llm/schemas'
import { Role } from '@prisma/client'

// Validation schema for creating a playbook
const CreatePlaybookSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
  stages: PlaybookConfigSchema.shape.stages,
  questions: z.array(z.string()).optional(),
  objections: PlaybookConfigSchema.shape.objections.optional(),
  doSay: z.array(z.string()).optional(),
  dontSay: z.array(z.string()).optional(),
})

// GET /api/playbooks - List all playbooks
export async function GET() {
  try {
    const session = await getAuthSession()
    
    const playbooks = await listPlaybooks(session)
    
    return NextResponse.json(playbooks)
  } catch (error) {
    console.error('[API] GET /api/playbooks error:', error)
    
    if (error instanceof Error && error.message.startsWith('Unauthorized')) {
      return NextResponse.json(
        createApiError('UNAUTHORIZED', error.message),
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to fetch playbooks'),
      { status: 500 }
    )
  }
}

// POST /api/playbooks - Create a new playbook (Admin/Manager only)
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    
    // Only Admin and Manager can create playbooks
    requireRole(session, Role.MANAGER)
    
    const body = await request.json()
    const validatedData = CreatePlaybookSchema.parse(body)
    
    const playbook = await createPlaybook(session, validatedData)
    
    return NextResponse.json(playbook, { status: 201 })
  } catch (error) {
    console.error('[API] POST /api/playbooks error:', error)
    
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
      if (error.message.startsWith('Forbidden')) {
        return NextResponse.json(
          createApiError('FORBIDDEN', error.message),
          { status: 403 }
        )
      }
    }
    
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to create playbook'),
      { status: 500 }
    )
  }
}
