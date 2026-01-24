import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAuthUrl, isGoogleCalendarConfigured } from '@/lib/google-calendar';

// GET /api/auth/google - Initiate Google OAuth flow
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!isGoogleCalendarConfigured()) {
      return NextResponse.json(
        { error: 'Google Calendar is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your environment.' },
        { status: 500 }
      );
    }

    // Pass userId in state so we can associate tokens with the user
    const authUrl = getAuthUrl(userId);
    
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('[API] GET /api/auth/google error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google OAuth' },
      { status: 500 }
    );
  }
}
