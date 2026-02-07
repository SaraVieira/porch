import { createFileRoute } from '@tanstack/react-router'
import { spotifyFetch } from '@/lib/spotify'
import { json } from '@/lib/api'

export const Route = createFileRoute('/api/spotify/play')({
  server: {
    handlers: {
      PUT: PUT,
    },
  },
})

export async function PUT() {
  try {
    await spotifyFetch('https://api.spotify.com/v1/me/player/play', {
      method: 'PUT',
    })
    return json({ success: true })
  } catch (error) {
    console.error('Error playing Spotify:', error)
    return json({ error: 'Failed to play' }, { status: 500 })
  }
}
