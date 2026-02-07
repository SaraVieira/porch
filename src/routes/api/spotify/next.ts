import { createFileRoute } from '@tanstack/react-router'
import { spotifyFetch } from '@/lib/spotify'
import { json } from '@/lib/api'

export const Route = createFileRoute('/api/spotify/next')({
  server: {
    handlers: {
      POST: POST,
    },
  },
})

async function POST() {
  try {
    await spotifyFetch('https://api.spotify.com/v1/me/player/next', {
      method: 'POST',
    })
    return json({ success: true })
  } catch (error) {
    console.error('Error skipping to next:', error)
    return json({ error: 'Failed to skip' }, { status: 500 })
  }
}
