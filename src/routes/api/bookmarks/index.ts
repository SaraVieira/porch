import { createFileRoute } from '@tanstack/react-router'
import { desc } from 'drizzle-orm'
import { bookmarks as bookmarksSchema } from '@/db/schema'
import { db } from '@/db'
import { json as jsonResponse } from '@/lib/api'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const json = (data: any, options?: { status?: number }) =>
  jsonResponse(data, { ...options, headers: corsHeaders })

export const Route = createFileRoute('/api/bookmarks/')({
  server: {
    handlers: {
      GET: GET,
      POST: POST,
      OPTIONS: OPTIONS,
    },
  },
})

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}

export async function GET() {
  try {
    const bookmarks = await db!.query.bookmarks.findMany({
      orderBy: [desc(bookmarksSchema.createdAt)],
    })

    return json(bookmarks)
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    return json({ error: 'Failed to fetch bookmarks' }, { status: 500 })
  }
}

function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (
      parsed.hostname === 'www.youtube.com' ||
      parsed.hostname === 'youtube.com'
    ) {
      return parsed.searchParams.get('v')
    }
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1)
    }
  } catch {}
  return null
}

const JUNK_TITLES = [
  'just a moment',
  'attention required',
  'access denied',
  'please wait',
  'loading',
  'redirect',
  'verify',
  'one moment',
  'checking your browser',
]

function isJunkTitle(title: string): boolean {
  const lower = title.toLowerCase()
  return JUNK_TITLES.some((junk) => lower.includes(junk))
}

function extractMeta(html: string, property: string): string | null {
  // Matches both property="og:X" content="Y" and content="Y" property="og:X" orderings
  const pattern = new RegExp(
    `<meta[^>]*(?:property=["']${property}["'][^>]*content=["']([^"']+)["']|content=["']([^"']+)["'][^>]*property=["']${property}["'])`,
    'i',
  )
  const match = html.match(pattern)
  return match?.[1]?.trim() || match?.[2]?.trim() || null
}

type OgData = { title: string | null; image: string | null }

async function fetchOgData(url: string): Promise<OgData> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return { title: null, image: null }
    const html = await res.text()

    // Title: og:title → twitter:title → <title>
    let title =
      extractMeta(html, 'og:title') || extractMeta(html, 'twitter:title')
    if (!title || isJunkTitle(title)) {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      title =
        titleMatch?.[1]?.trim() && !isJunkTitle(titleMatch[1])
          ? titleMatch[1].trim()
          : null
    }

    // Image: og:image → twitter:image
    const image =
      extractMeta(html, 'og:image') || extractMeta(html, 'twitter:image')

    return { title, image }
  } catch {
    return { title: null, image: null }
  }
}

async function fetchYouTubeOgData(videoId: string): Promise<OgData> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { signal: AbortSignal.timeout(5000) },
    )
    if (!res.ok) return { title: null, image: null }
    const data = await res.json()
    return {
      title: data.title || null,
      image:
        data.thumbnail_url ||
        `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    }
  } catch {
    return {
      title: null,
      image: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    }
  }
}

function humanizeSlug(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/^\d+[-_]/, '') // strip leading ID like "673914-"
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

function titleFromUrl(url: string): string {
  try {
    const parsed = new URL(url)
    const parts = parsed.pathname.split('/').filter(Boolean)
    // GitHub: "owner/repo PR #150" etc.
    if (parsed.hostname.includes('github.com') && parts.length >= 2) {
      const owner = parts[0]
      const repo = parts[1]
      if (parts[2] === 'pull' && parts[3])
        return `${owner}/${repo} PR #${parts[3]}`
      if (parts[2] === 'issues' && parts[3])
        return `${owner}/${repo} Issue #${parts[3]}`
      return `${owner}/${repo}`
    }
    // Find the most slug-like path segment (longest with dashes/underscores)
    const slugSegment = [...parts]
      .reverse()
      .find((p) => /[a-z].*[-_].*[a-z]/i.test(p))
    if (slugSegment) {
      return humanizeSlug(slugSegment)
    }
    // Fallback: hostname + last segment
    const lastSegment = parts[parts.length - 1]
    if (lastSegment) {
      return `${parsed.hostname} - ${decodeURIComponent(lastSegment)}`
    }
    return parsed.hostname
  } catch {
    return url
  }
}

export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json()
    const { url } = body

    const videoId = extractYouTubeVideoId(url)
    const type = videoId ? 'video' : 'link'

    const og = videoId
      ? await fetchYouTubeOgData(videoId)
      : await fetchOgData(url)

    const title = og.title || titleFromUrl(url)
    const faviconUrl = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(url)}&size=128`
    const thumbnail = og.image || faviconUrl

    const bookmark = await db!
      .insert(bookmarksSchema)
      .values({ url, title, type, thumbnail })

    return json(bookmark.rows, { status: 201 })
  } catch (error) {
    console.error('Error creating bookmark:', error)
    return json({ error: 'Failed to create bookmark' }, { status: 500 })
  }
}
