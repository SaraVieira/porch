import { createFileRoute } from '@tanstack/react-router'
import { exchangeCodeForTokens } from '@/lib/spotify'
import { spotifyTokens } from '@/db/schema'
import { db } from '@/db'

export const Route = createFileRoute('/api/auth/spotify/callback')({
  server: {
    handlers: {
      GET: GET,
    },
  },
})

export async function GET({ request }: { request: Request }) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  if (error || !code) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/?spotify=error' },
    })
  }

  try {
    const tokens = await exchangeCodeForTokens(code)
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

    // Delete any existing tokens (single user app)
    await db!.delete(spotifyTokens)

    // Store new tokens
    await db!.insert(spotifyTokens).values({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
      scope: tokens.scope,
    })

    return new Response(null, {
      status: 302,
      headers: { Location: '/?spotify=connected' },
    })
  } catch (err) {
    console.error('Spotify OAuth callback error:', err)
    return new Response(null, {
      status: 302,
      headers: { Location: '/?spotify=error' },
    })
  }
}
