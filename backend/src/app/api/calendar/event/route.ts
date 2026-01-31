import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import UserSettings from '@/lib/models/UserSettings';
import { createCalendarEvent, refreshAccessToken } from '@/lib/google-calendar';

interface CreateEventRequest {
  clientName: string;
  meetingType: 'call' | 'demo' | 'meeting';
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24-hour)
  duration: number; // minutes
  description?: string;
  clientEmail?: string;
}

// POST /api/calendar/event - Create a calendar event
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: CreateEventRequest = await request.json();
    const { clientName, meetingType, date, time, duration, description, clientEmail } = body;

    // Validate required fields
    if (!clientName || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields: clientName, date, time' },
        { status: 400 }
      );
    }

    // Get user's Google Calendar tokens
    await connectDB();
    const userSettings = await UserSettings.findOne({ clerkUserId: userId });

    if (!userSettings?.googleCalendar?.connected) {
      return NextResponse.json(
        { error: 'Google Calendar not connected', needsAuth: true },
        { status: 401 }
      );
    }

    let accessToken = userSettings.googleCalendar.accessToken;
    const refreshToken = userSettings.googleCalendar.refreshToken;

    // Check if token is expired and refresh if needed
    if (userSettings.googleCalendar.tokenExpiresAt && 
        new Date(userSettings.googleCalendar.tokenExpiresAt) < new Date()) {
      if (!refreshToken) {
        return NextResponse.json(
          { error: 'Google Calendar session expired. Please reconnect.', needsAuth: true },
          { status: 401 }
        );
      }

      try {
        const newTokens = await refreshAccessToken(refreshToken);
        accessToken = newTokens.access_token!;

        // Update stored tokens
        await UserSettings.findOneAndUpdate(
          { clerkUserId: userId },
          {
            $set: {
              'googleCalendar.accessToken': newTokens.access_token,
              'googleCalendar.tokenExpiresAt': newTokens.expiry_date 
                ? new Date(newTokens.expiry_date) 
                : new Date(Date.now() + 3600 * 1000),
            },
          }
        );
      } catch (refreshError) {
        console.error('[Calendar] Token refresh failed:', refreshError);
        return NextResponse.json(
          { error: 'Google Calendar session expired. Please reconnect.', needsAuth: true },
          { status: 401 }
        );
      }
    }

    // Build event times
    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + (duration || 60) * 60 * 1000);

    // Create meeting title
    const meetingTypeLabel = meetingType === 'demo' ? 'Demo' : 
                             meetingType === 'call' ? 'Call' : 'Meeting';
    const summary = `${clientName} - ${meetingTypeLabel}`;

    // Create the calendar event
    const event = await createCalendarEvent({
      accessToken: accessToken!,
      refreshToken: refreshToken,
      summary,
      description: description || `${meetingTypeLabel} with ${clientName}`,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      attendeeEmail: clientEmail,
    });

    console.log('[Calendar] Event created:', event.id);

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        summary: event.summary,
        htmlLink: event.htmlLink,
        start: event.start,
        end: event.end,
      },
    });
  } catch (error) {
    console.error('[API] POST /api/calendar/event error:', error);
    
    // Check if it's a Google API error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('invalid_grant') || errorMessage.includes('Token has been expired')) {
      return NextResponse.json(
        { error: 'Google Calendar session expired. Please reconnect.', needsAuth: true },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create calendar event', details: errorMessage },
      { status: 500 }
    );
  }
}
