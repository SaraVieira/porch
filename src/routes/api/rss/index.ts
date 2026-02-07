import { createFileRoute } from '@tanstack/react-router'
import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import { rssFeeds, rssArticles } from '@/db/schema'
import { discoverFeed, getFaviconUrl, getRssArticles } from '@/lib/rss'
import { json } from '@/lib/api'

export const Route = createFileRoute('/api/rss/')({
  server: {
    handlers: {
      GET: GET,
      POST: POST,
    },
  },
})

export async function GET() {
  try {
    const articles = await getRssArticles()
    return json(articles)
  } catch (error) {
    console.error('Error fetching RSS articles:', error)
    return json({ error: 'Failed to fetch RSS articles' }, { status: 500 })
  }
}

export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json()
    const { url, categoryId } = body

    if (!url) {
      return json({ error: 'URL is required' }, { status: 400 })
    }

    const { title, siteUrl, articles } = await discoverFeed(url)
    const faviconSource = siteUrl || url
    const favicon = getFaviconUrl(faviconSource)

    const [feed] = await db!
      .insert(rssFeeds)
      .values({
        url,
        siteUrl,
        title: title || url,
        favicon,
        categoryId: categoryId || null,
      })
      .returning()

    // Insert initial articles
    for (const article of articles) {
      if (!article.guid || !article.title) continue
      const existing = await db!.query.rssArticles.findFirst({
        where: and(
          eq(rssArticles.feedId, feed.id),
          eq(rssArticles.guid, article.guid),
        ),
      })
      if (!existing) {
        await db!.insert(rssArticles).values({
          feedId: feed.id,
          guid: article.guid,
          title: article.title,
          link: article.link,
          publishedAt: article.publishedAt,
          author: article.author,
        })
      }
    }

    return json(feed, { status: 201 })
  } catch (error) {
    console.error('Error adding RSS feed:', error)
    return json({ error: 'Failed to add RSS feed' }, { status: 500 })
  }
}
