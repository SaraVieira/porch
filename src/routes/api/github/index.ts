import { createFileRoute } from '@tanstack/react-router'
import { getGitHubContributions } from '@/lib/github'
import { json } from '@/lib/api'

export const Route = createFileRoute('/api/github/')({
  server: {
    handlers: {
      GET: GET,
    },
  },
})

export async function GET() {
  try {
    const data = await getGitHubContributions()
    return json(data)
  } catch (error) {
    console.error('Error fetching GitHub contributions:', error)
    return json(
      { error: 'Failed to fetch GitHub contributions' },
      { status: 500 },
    )
  }
}
