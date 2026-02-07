import { createFileRoute } from '@tanstack/react-router'
import { isSpotifyConnected, disconnectSpotify } from '@/lib/spotify'
import { json } from '@/lib/api'

export const Route = createFileRoute('/api/auth/spotify/status')({
  server: {
    handlers: {
      GET: GET,
      DELETE: DELETE,
    },
  },
})

export async function GET() {
  try {
    const connected = await isSpotifyConnected()
    return json({ connected })
  } catch (error) {
    console.error('Error checking Spotify status:', error)
    return json({ connected: false })
  }
}

export async function DELETE() {
  try {
    await disconnectSpotify()
    return json({ success: true })
  } catch (error) {
    console.error('Error disconnecting Spotify:', error)
    return json({ error: 'Failed to disconnect' }, { status: 500 })
  }
}
