import { createFileRoute } from '@tanstack/react-router'
import { forceRefreshRss } from '@/lib/rss'

const json = (data: any, options?: { status?: number }) =>
  new Response(JSON.stringify(data), {
    status: options?.status || 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })

export const Route = createFileRoute('/api/rss/refresh')({
  server: {
    handlers: {
      POST: POST,
    },
  },
})

export async function POST() {
  try {
    const articles = await forceRefreshRss()
    return json(articles)
  } catch (error) {
    console.error('Error refreshing RSS:', error)
    return json({ error: 'Failed to refresh RSS' }, { status: 500 })
  }
}
