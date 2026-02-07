import { createFileRoute } from '@tanstack/react-router'
import { spotifyFetch } from '@/lib/spotify'
import { json } from '@/lib/api'

export const Route = createFileRoute('/api/spotify/repeat')({
  server: {
    handlers: {
      PUT: PUT,
    },
  },
})

async function PUT({ request }: { request: Request }) {
  try {
    const body = await request.json()
    // state: 'off' | 'context' | 'track'
    const state = body.state || 'off'
    await spotifyFetch(
      `https://api.spotify.com/v1/me/player/repeat?state=${state}`,
      { method: 'PUT' },
    )
    return json({ success: true })
  } catch (error) {
    console.error('Error toggling repeat:', error)
    return json({ error: 'Failed to toggle repeat' }, { status: 500 })
  }
}
