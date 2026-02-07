import { createFileRoute } from '@tanstack/react-router'
import { getSpotifyAuthUrl } from '@/lib/spotify'

export const Route = createFileRoute('/api/auth/spotify/')({
  server: {
    handlers: {
      GET: GET,
    },
  },
})

export async function GET() {
  const url = getSpotifyAuthUrl()
  return new Response(null, {
    status: 302,
    headers: { Location: url },
  })
}
