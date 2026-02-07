import { createFileRoute } from '@tanstack/react-router'
import { spotifyFetch, isSpotifyConnected } from '@/lib/spotify'
import { json } from '@/lib/api'

export const Route = createFileRoute('/api/spotify/status')({
  server: {
    handlers: {
      GET: GET,
    },
  },
})

export async function GET() {
  try {
    const connected = await isSpotifyConnected()
    if (!connected) {
      return json({ closed: true, song: null, artists: null })
    }

    const res = await spotifyFetch('https://api.spotify.com/v1/me/player')

    if (res.status === 204 || !res.ok) {
      return json({ closed: true, song: null, artists: null })
    }

    const data = await res.json()

    return json({
      closed: !data.is_playing,
      song: data.item?.name || null,
      artists: data.item?.artists?.map((a: any) => a.name).join(', ') || null,
      item: data.item,
      progress_ms: data.progress_ms,
      duration_ms: data.item?.duration_ms,
      shuffle_state: data.shuffle_state,
      repeat_state: data.repeat_state,
    })
  } catch (error) {
    console.error('Error fetching Spotify status:', error)
    return json({ closed: true, song: null, artists: null })
  }
}
