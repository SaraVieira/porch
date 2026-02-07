import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { googleTokens } from '@/db/schema'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/youtube.readonly',
].join(' ')

export function getGoogleAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export async function exchangeCodeForTokens(code: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Token exchange failed: ${err}`)
  }

  return res.json() as Promise<{
    access_token: string
    refresh_token: string
    expires_in: number
    scope: string
    token_type: string
  }>
}

async function refreshAccessToken(refreshToken: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Token refresh failed: ${err}`)
  }

  return res.json() as Promise<{
    access_token: string
    expires_in: number
    scope: string
    token_type: string
  }>
}

export async function getGoogleAccessToken(): Promise<string | null> {
  const tokens = await db!.query.googleTokens.findFirst()
  if (!tokens) return null

  // Refresh if expired or expiring within 60 seconds
  const now = new Date()
  const buffer = 60 * 1000
  if (tokens.expiresAt.getTime() - buffer <= now.getTime()) {
    try {
      const refreshed = await refreshAccessToken(tokens.refreshToken)
      const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000)

      await db!
        .update(googleTokens)
        .set({
          accessToken: refreshed.access_token,
          expiresAt: newExpiresAt,
          updatedAt: new Date(),
        })
        .where(eq(googleTokens.id, tokens.id))

      return refreshed.access_token
    } catch (error) {
      console.error('Failed to refresh Google token:', error)
      return null
    }
  }

  return tokens.accessToken
}

export async function googleFetch(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const token = await getGoogleAccessToken()
  if (!token) throw new Error('No Google token available')

  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function isGoogleConnected(): Promise<boolean> {
  const tokens = await db!.query.googleTokens.findFirst()
  return !!tokens
}

export async function disconnectGoogle(): Promise<void> {
  const tokens = await db!.query.googleTokens.findFirst()
  if (tokens) {
    // Revoke the token with Google
    try {
      await fetch(
        `https://oauth2.googleapis.com/revoke?token=${tokens.refreshToken}`,
        { method: 'POST' },
      )
    } catch {}
    await db!.delete(googleTokens).where(eq(googleTokens.id, tokens.id))
  }
}
