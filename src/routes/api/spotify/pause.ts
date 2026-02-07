import { createFileRoute } from '@tanstack/react-router'
import { spotifyFetch } from '@/lib/spotify'
import { json } from '@/lib/api'

export const Route = createFileRoute('/api/spotify/pause')({
  server: {
    handlers: {
      PUT: PUT,
    },
  },
})

async function PUT() {
  try {
    await spotifyFetch('https://api.spotify.com/v1/me/player/pause', {
      method: 'PUT',
    })
    return json({ success: true })
  } catch (error) {
    console.error('Error pausing Spotify:', error)
    return json({ error: 'Failed to pause' }, { status: 500 })
  }
}
