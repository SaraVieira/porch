import { createFileRoute } from '@tanstack/react-router'
import { isGoogleConnected, disconnectGoogle } from '@/lib/google'
import { json } from '@/lib/api'

export const Route = createFileRoute('/api/auth/google/status')({
  server: {
    handlers: {
      GET: GET,
      DELETE: DELETE,
    },
  },
})

async function GET() {
  try {
    const connected = await isGoogleConnected()
    return json({ connected })
  } catch (error) {
    console.error('Error checking Google status:', error)
    return json({ connected: false })
  }
}

async function DELETE() {
  try {
    await disconnectGoogle()
    return json({ success: true })
  } catch (error) {
    console.error('Error disconnecting Google:', error)
    return json({ error: 'Failed to disconnect' }, { status: 500 })
  }
}
