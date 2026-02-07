import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { rssFeeds, rssArticles } from '@/db/schema'
import { removeFeedFromCache } from '@/lib/rss'
import { json } from '@/lib/api'

export const Route = createFileRoute('/api/rss/$feedId')({
  server: {
    handlers: {
      DELETE: DELETE,
    },
  },
})

async function DELETE({ params }: { params: { feedId: string } }) {
  try {
    const id = parseInt(params.feedId)
    if (isNaN(id)) {
      return json({ error: 'Invalid feed ID' }, { status: 400 })
    }

    // Delete articles first, then the feed
    await db!.delete(rssArticles).where(eq(rssArticles.feedId, id))
    await db!.delete(rssFeeds).where(eq(rssFeeds.id, id))
    removeFeedFromCache(id)

    return json({ success: true })
  } catch (error) {
    console.error('Error deleting RSS feed:', error)
    return json({ error: 'Failed to delete RSS feed' }, { status: 500 })
  }
}
