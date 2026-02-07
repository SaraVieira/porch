import { createFileRoute } from '@tanstack/react-router'
import { spotifyFetch } from '@/lib/spotify'
import { json } from '@/lib/api'

export const Route = createFileRoute('/api/spotify/shuffle')({
  server: {
    handlers: {
      PUT: PUT,
    },
  },
})

export async function PUT({ request }: { request: Request }) {
  try {
    const body = await request.json()
    const state = body.state ? 'true' : 'false'
    await spotifyFetch(
      `https://api.spotify.com/v1/me/player/shuffle?state=${state}`,
      { method: 'PUT' },
    )
    return json({ success: true })
  } catch (error) {
    console.error('Error toggling shuffle:', error)
    return json({ error: 'Failed to toggle shuffle' }, { status: 500 })
  }
}
