import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/google-calendar';
import connectDB from '@/lib/mongodb';
import UserSettings from '@/lib/models/UserSettings';

// GET /api/auth/google/callback - Handle Google OAuth callback
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This is the userId
    const error = searchParams.get('error');

    if (error) {
      console.error('[Google OAuth] Error:', error);
      return NextResponse.redirect(new URL('/settings?google_error=access_denied', request.url));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/settings?google_error=invalid_callback', request.url));
    }

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);

    if (!tokens.access_token) {
      return NextResponse.redirect(new URL('/settings?google_error=no_token', request.url));
    }

    // Store tokens in user settings
    await connectDB();
    
    await UserSettings.findOneAndUpdate(
      { clerkUserId: state },
      {
        $set: {
          'googleCalendar.connected': true,
          'googleCalendar.accessToken': tokens.access_token,
          'googleCalendar.refreshToken': tokens.refresh_token,
          'googleCalendar.tokenExpiresAt': tokens.expiry_date 
            ? new Date(tokens.expiry_date) 
            : new Date(Date.now() + 3600 * 1000), // Default 1 hour
        },
      },
      { upsert: false }
    );

    console.log('[Google OAuth] Successfully connected Google Calendar for user:', state);
    
    return NextResponse.redirect(new URL('/settings?google_success=true', request.url));
  } catch (error) {
    console.error('[API] GET /api/auth/google/callback error:', error);
    return NextResponse.redirect(new URL('/settings?google_error=callback_failed', request.url));
  }
}
