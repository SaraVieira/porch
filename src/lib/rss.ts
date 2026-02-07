import { XMLParser } from 'fast-xml-parser'
import { eq, desc, and, inArray, notInArray } from 'drizzle-orm'
import { db } from '@/db'
import { rssFeeds, rssArticles, rssCategories } from '@/db/schema'
import type { RssArticleWithFeed } from './types'

const CACHE_TTL = 30 * 60 * 1000 // 30 minutes
const FETCH_TIMEOUT = 10000
const BATCH_SIZE = 10
const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/rss+xml, application/xml, text/xml, */*',
}

let cachedArticles: Array<RssArticleWithFeed> = []
let cacheTimestamp = 0
let fetchInProgress: Promise<Array<RssArticleWithFeed>> | null = null

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
})

interface ParsedArticle {
  guid: string
  title: string
  link: string
  publishedAt: string | null
  author: string | null
}

export function parseFeed(xml: string): Array<ParsedArticle> {
  try {
    const parsed = parser.parse(xml)

    // RSS 2.0
    if (parsed.rss?.channel) {
      const channel = parsed.rss.channel
      const items = channel.item
        ? Array.isArray(channel.item)
          ? channel.item
          : [channel.item]
        : []
      return items.map((item: any) => ({
        guid: item.guid?.['#text'] || item.guid || item.link || '',
        title: item.title || '',
        link: item.link || '',
        publishedAt: item.pubDate || null,
        author: item['dc:creator'] || item.author || null,
      }))
    }

    // Atom
    if (parsed.feed) {
      const entries = parsed.feed.entry
        ? Array.isArray(parsed.feed.entry)
          ? parsed.feed.entry
          : [parsed.feed.entry]
        : []
      return entries.map((entry: any) => {
        const link =
          entry.link?.['@_href'] ||
          (Array.isArray(entry.link)
            ? entry.link.find((l: any) => l['@_rel'] === 'alternate')?.[
                '@_href'
              ] || entry.link[0]?.['@_href']
            : '') ||
          ''
        return {
          guid: entry.id || link || '',
          title:
            typeof entry.title === 'object'
              ? entry.title['#text'] || ''
              : entry.title || '',
          link,
          publishedAt: entry.published || entry.updated || null,
          author:
            entry.author?.name ||
            (typeof entry.author === 'string' ? entry.author : null),
        }
      })
    }

    return []
  } catch {
    return []
  }
}

export async function discoverFeed(url: string): Promise<{
  title: string
  siteUrl: string | null
  articles: Array<ParsedArticle>
}> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
  const response = await fetch(url, {
    signal: controller.signal,
    headers: FETCH_HEADERS,
  })
  clearTimeout(timeout)

  if (!response.ok) throw new Error(`Failed to fetch feed: ${response.status}`)

  const xml = await response.text()
  const parsed = parser.parse(xml)
  const articles = parseFeed(xml)

  let title = ''
  let siteUrl: string | null = null

  if (parsed.rss?.channel) {
    title = parsed.rss.channel.title || ''
    siteUrl = parsed.rss.channel.link || null
  } else if (parsed.feed) {
    title =
      typeof parsed.feed.title === 'object'
        ? parsed.feed.title['#text'] || ''
        : parsed.feed.title || ''
    const feedLink = Array.isArray(parsed.feed.link)
      ? parsed.feed.link.find((l: any) => l['@_rel'] === 'alternate')?.[
          '@_href'
        ] || parsed.feed.link[0]?.['@_href']
      : parsed.feed.link?.['@_href'] || null
    siteUrl = feedLink || null
  }

  return { title, siteUrl, articles }
}

export function getFaviconUrl(url: string): string {
  return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(url)}&size=128`
}

async function fetchAllArticles(): Promise<Array<RssArticleWithFeed>> {
  const feeds = await db!.query.rssFeeds.findMany()
  const categories = await db!.query.rssCategories.findMany()
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]))

  // Clean up orphaned articles (feeds that were deleted)
  const feedIds = feeds.map((f) => f.id)
  if (feedIds.length > 0) {
    await db!.delete(rssArticles).where(notInArray(rssArticles.feedId, feedIds))
  } else {
    // No feeds at all — delete all articles
    await db!.delete(rssArticles)
  }

  // Fetch and upsert articles for each feed
  for (let i = 0; i < feeds.length; i += BATCH_SIZE) {
    const batch = feeds.slice(i, i + BATCH_SIZE)
    await Promise.all(
      batch.map(async (feed) => {
        try {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
          const response = await fetch(feed.url, {
            signal: controller.signal,
            headers: FETCH_HEADERS,
          })
          clearTimeout(timeout)
          if (!response.ok) return

          const xml = await response.text()
          const parsed = parseFeed(xml)

          for (const article of parsed) {
            if (!article.guid || !article.title) continue
            // Check if article already exists
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
        } catch {
          // Skip feeds that fail
        }
      }),
    )
  }

  // Now query all articles with feed info
  const articles = await db!.query.rssArticles.findMany({
    limit: 500,
  })

  const feedMap = new Map(feeds.map((f) => [f.id, f]))

  const result = articles.map((article) => {
    const feed = feedMap.get(article.feedId)
    return {
      ...article,
      feedTitle: feed?.title || 'Unknown',
      feedFavicon: feed?.favicon || null,
      categoryId: feed?.categoryId || null,
      categoryName: feed?.categoryId
        ? categoryMap.get(feed.categoryId) || null
        : null,
    }
  })

  result.sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
    return dateB - dateA
  })

  return result
}

async function refreshCache(): Promise<Array<RssArticleWithFeed>> {
  if (fetchInProgress) return fetchInProgress

  fetchInProgress = fetchAllArticles()
    .then((articles) => {
      cachedArticles = articles
      cacheTimestamp = Date.now()
      fetchInProgress = null
      return articles
    })
    .catch(() => {
      fetchInProgress = null
      return cachedArticles
    })

  return fetchInProgress
}

export async function getRssArticles(
  limit?: number,
): Promise<Array<RssArticleWithFeed>> {
  const now = Date.now()
  const cacheAge = now - cacheTimestamp

  // Cache is fresh
  if (cachedArticles.length > 0 && cacheAge < CACHE_TTL) {
    return limit ? cachedArticles.slice(0, limit) : cachedArticles
  }

  // Cache is stale but exists — return stale and refresh in background
  if (cachedArticles.length > 0 && cacheAge >= CACHE_TTL) {
    refreshCache()
    return limit ? cachedArticles.slice(0, limit) : cachedArticles
  }

  // No cache — must wait for first load
  const articles = await refreshCache()
  return limit ? articles.slice(0, limit) : articles
}

export function clearRssCache() {
  cachedArticles = []
  cacheTimestamp = 0
  fetchInProgress = null
}

export function removeArticleFromCache(articleId: number) {
  cachedArticles = cachedArticles.filter((a) => a.id !== articleId)
}

export function removeFeedFromCache(feedId: number) {
  cachedArticles = cachedArticles.filter((a) => a.feedId !== feedId)
}

export async function forceRefreshRss(): Promise<Array<RssArticleWithFeed>> {
  clearRssCache()
  return refreshCache()
}
