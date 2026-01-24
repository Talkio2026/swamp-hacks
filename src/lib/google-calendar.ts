import { google } from 'googleapis';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

// Scopes required for calendar access
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

/**
 * Creates an OAuth2 client for Google APIs
 */
export function createOAuth2Client() {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
}

/**
 * Generates the Google OAuth authorization URL
 */
export function getAuthUrl(state?: string): string {
  const oauth2Client = createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    state: state || '',
  });
}

/**
 * Exchanges authorization code for tokens
 */
export async function getTokensFromCode(code: string) {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/**
 * Creates a calendar event
 */
export interface CalendarEventParams {
  accessToken: string;
  refreshToken?: string;
  summary: string;
  description?: string;
  startDateTime: string; // ISO format
  endDateTime: string; // ISO format
  attendeeEmail?: string;
  timeZone?: string;
}

export async function createCalendarEvent(params: CalendarEventParams) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    access_token: params.accessToken,
    refresh_token: params.refreshToken,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const event = {
    summary: params.summary,
    description: params.description || '',
    start: {
      dateTime: params.startDateTime,
      timeZone: params.timeZone || 'America/New_York',
    },
    end: {
      dateTime: params.endDateTime,
      timeZone: params.timeZone || 'America/New_York',
    },
    attendees: params.attendeeEmail ? [{ email: params.attendeeEmail }] : [],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 30 }, // 30 minutes before
      ],
    },
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
    sendUpdates: params.attendeeEmail ? 'all' : 'none',
  });

  return response.data;
}

/**
 * Refreshes an expired access token
 */
export async function refreshAccessToken(refreshToken: string) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials;
}

/**
 * Checks if Google Calendar is configured
 */
export function isGoogleCalendarConfigured(): boolean {
  return !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
}
