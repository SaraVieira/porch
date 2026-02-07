import { createFileRoute } from '@tanstack/react-router'
import { forceRefreshRss } from '@/lib/rss'
import { json } from '@/lib/api'

export const Route = createFileRoute('/api/rss/refresh')({
  server: {
    handlers: {
      POST: POST,
    },
  },
})

async function POST() {
  try {
    const articles = await forceRefreshRss()
    return json(articles)
  } catch (error) {
    console.error('Error refreshing RSS:', error)
    return json({ error: 'Failed to refresh RSS' }, { status: 500 })
  }
}
