import { createFileRoute } from '@tanstack/react-router'
import { spotifyFetch } from '@/lib/spotify'
import { json } from '@/lib/api'

export const Route = createFileRoute('/api/spotify/prev')({
  server: {
    handlers: {
      POST: POST,
    },
  },
})

async function POST() {
  try {
    await spotifyFetch('https://api.spotify.com/v1/me/player/previous', {
      method: 'POST',
    })
    return json({ success: true })
  } catch (error) {
    console.error('Error going to previous:', error)
    return json({ error: 'Failed to go back' }, { status: 500 })
  }
}
