import { createFileRoute } from '@tanstack/react-router'
import { getGoogleAuthUrl } from '@/lib/google'

export const Route = createFileRoute('/api/auth/google/')({
  server: {
    handlers: {
      GET: GET,
    },
  },
})

export async function GET() {
  const url = getGoogleAuthUrl()
  return new Response(null, {
    status: 302,
    headers: { Location: url },
  })
}
