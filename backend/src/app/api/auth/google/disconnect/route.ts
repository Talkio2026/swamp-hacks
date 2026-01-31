import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import UserSettings from '@/lib/models/UserSettings';

// POST /api/auth/google/disconnect - Disconnect Google Calendar
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    await UserSettings.findOneAndUpdate(
      { clerkUserId: userId },
      {
        $set: {
          'googleCalendar.connected': false,
          'googleCalendar.accessToken': null,
          'googleCalendar.refreshToken': null,
          'googleCalendar.tokenExpiresAt': null,
        },
      }
    );

    console.log('[Google OAuth] Disconnected Google Calendar for user:', userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] POST /api/auth/google/disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Google Calendar' },
      { status: 500 }
    );
  }
}
