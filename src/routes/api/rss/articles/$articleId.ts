import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { rssArticles } from '@/db/schema'
import { removeArticleFromCache } from '@/lib/rss'
import { json } from '@/lib/api'

export const Route = createFileRoute('/api/rss/articles/$articleId')({
  server: {
    handlers: {
      DELETE: DELETE,
    },
  },
})

export async function DELETE({ params }: { params: { articleId: string } }) {
  try {
    const id = parseInt(params.articleId)
    if (isNaN(id)) {
      return json({ error: 'Invalid article ID' }, { status: 400 })
    }

    await db!.delete(rssArticles).where(eq(rssArticles.id, id))
    removeArticleFromCache(id)

    return json({ success: true })
  } catch (error) {
    console.error('Error deleting RSS article:', error)
    return json({ error: 'Failed to delete article' }, { status: 500 })
  }
}
