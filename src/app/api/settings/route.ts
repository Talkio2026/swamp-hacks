import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import connectToDatabase from '@/lib/mongodb'
import UserSettings, { AI_MODELS, AIModelId } from '@/lib/models/UserSettings'

// GET - Fetch user settings
export async function GET() {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    let settings = await UserSettings.findOne({ clerkUserId: user.id })
    
    // Create default settings if not found
    if (!settings) {
      settings = await UserSettings.create({
        clerkUserId: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        aiModel: {
          provider: 'gemini',
          openRouterModel: 'claude-3-sonnet',
        },
      })
    }
    
    return NextResponse.json({
      settings: {
        aiModel: settings.aiModel,
      },
      availableModels: AI_MODELS,
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { aiModelId } = body as { aiModelId: AIModelId }
    
    // Find the model configuration
    const modelConfig = AI_MODELS.find(m => m.id === aiModelId)
    if (!modelConfig) {
      return NextResponse.json(
        { error: 'Invalid model ID' },
        { status: 400 }
      )
    }

    await connectToDatabase()
    
    // Update or create settings
    const settings = await UserSettings.findOneAndUpdate(
      { clerkUserId: user.id },
      {
        $set: {
          email: user.emailAddresses[0]?.emailAddress || '',
          aiModel: {
            provider: modelConfig.provider,
            openRouterModel: modelConfig.provider === 'openrouter' ? modelConfig.id : undefined,
          },
        },
      },
      { upsert: true, new: true }
    )
    
    return NextResponse.json({
      success: true,
      settings: {
        aiModel: settings.aiModel,
      },
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
