import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { spotifyTokens } from '@/db/schema'

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI!

const SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
].join(' ')

export function getSpotifyAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
  })
  return `https://accounts.spotify.com/authorize?${params}`
}

export async function exchangeCodeForTokens(code: string) {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`,
    },
    body: new URLSearchParams({
      code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
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
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`,
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
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

async function getSpotifyAccessToken(): Promise<string | null> {
  const tokens = await db!.query.spotifyTokens.findFirst()
  if (!tokens) return null

  const now = new Date()
  const buffer = 60 * 1000
  if (tokens.expiresAt.getTime() - buffer <= now.getTime()) {
    try {
      const refreshed = await refreshAccessToken(tokens.refreshToken)
      const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000)

      await db!
        .update(spotifyTokens)
        .set({
          accessToken: refreshed.access_token,
          expiresAt: newExpiresAt,
          updatedAt: new Date(),
        })
        .where(eq(spotifyTokens.id, tokens.id))

      return refreshed.access_token
    } catch (error) {
      console.error('Failed to refresh Spotify token:', error)
      return null
    }
  }

  return tokens.accessToken
}

export async function spotifyFetch(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const token = await getSpotifyAccessToken()
  if (!token) throw new Error('No Spotify token available')

  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function isSpotifyConnected(): Promise<boolean> {
  const tokens = await db!.query.spotifyTokens.findFirst()
  return !!tokens
}

export async function disconnectSpotify(): Promise<void> {
  const tokens = await db!.query.spotifyTokens.findFirst()
  if (tokens) {
    await db!.delete(spotifyTokens).where(eq(spotifyTokens.id, tokens.id))
  }
}
