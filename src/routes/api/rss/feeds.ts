import { createFileRoute } from '@tanstack/react-router'
import { desc } from 'drizzle-orm'
import { db } from '@/db'
import { rssFeeds } from '@/db/schema'

const json = (data: any, options?: { status?: number }) =>
  new Response(JSON.stringify(data), {
    status: options?.status || 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })

export const Route = createFileRoute('/api/rss/feeds')({
  server: {
    handlers: {
      GET: GET,
    },
  },
})

export async function GET() {
  try {
    const feeds = await db!.query.rssFeeds.findMany({
      orderBy: [desc(rssFeeds.createdAt)],
    })
    return json(feeds)
  } catch (error) {
    console.error('Error fetching RSS feeds:', error)
    return json({ error: 'Failed to fetch RSS feeds' }, { status: 500 })
  }
}
