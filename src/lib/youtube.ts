import { XMLParser } from 'fast-xml-parser'
import { googleFetch } from './google'
import type { YouTubeChannel, YouTubeVideo } from './types'

const BATCH_SIZE = 30
const SHORTS_CHECK_BATCH = 50
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes
const SUBS_CACHE_TTL = 60 * 60 * 1000 // 1 hour
const FETCH_TIMEOUT = 5000 // 5 seconds
const SHORTS_TIMEOUT = 3000 // 3 seconds

const FILTERED_CHANNELS = ['DW News', 'Premier League', 'freeCodeCamp.org']

let cachedVideos: Array<YouTubeVideo> = []
let cacheTimestamp = 0
let fetchInProgress: Promise<Array<YouTubeVideo>> | null = null

let cachedSubscriptions: Array<YouTubeChannel> = []
let subsCacheTimestamp = 0

async function fetchSubscriptions(): Promise<Array<YouTubeChannel>> {
  const now = Date.now()
  if (cachedSubscriptions.length > 0 && now - subsCacheTimestamp < SUBS_CACHE_TTL) {
    return cachedSubscriptions
  }

  const channels: Array<YouTubeChannel> = []
  let pageToken: string | undefined

  do {
    const params = new URLSearchParams({
      part: 'snippet',
      mine: 'true',
      maxResults: '50',
    })
    if (pageToken) params.set('pageToken', pageToken)

    const res = await googleFetch(
      `https://www.googleapis.com/youtube/v3/subscriptions?${params}`,
    )

    if (!res.ok) {
      console.error('Failed to fetch subscriptions:', await res.text())
      return cachedSubscriptions.length > 0 ? cachedSubscriptions : []
    }

    const data = await res.json()

    for (const item of data.items ?? []) {
      channels.push({
        id: item.snippet.resourceId.channelId,
        title: item.snippet.title,
        url: `https://www.youtube.com/channel/${item.snippet.resourceId.channelId}`,
      })
    }

    pageToken = data.nextPageToken
  } while (pageToken)

  cachedSubscriptions = channels
  subsCacheTimestamp = Date.now()
  return channels
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
})

function parseVideosFromFeed(
  xml: string,
  channel: YouTubeChannel,
): Array<YouTubeVideo> {
  try {
    const parsed = parser.parse(xml)
    const feed = parsed.feed
    if (!feed || !feed.entry) return []

    const entries = Array.isArray(feed.entry) ? feed.entry : [feed.entry]
    return entries.map((entry: any) => ({
      id: entry['yt:videoId'],
      title: entry.title,
      channelName: channel.title,
      channelId: channel.id,
      publishedAt: entry.published,
      thumbnail: `https://i.ytimg.com/vi/${entry['yt:videoId']}/mqdefault.jpg`,
      link:
        entry.link?.['@_href'] ||
        `https://www.youtube.com/watch?v=${entry['yt:videoId']}`,
    }))
  } catch {
    return []
  }
}

async function fetchChannelVideos(
  channel: YouTubeChannel,
): Promise<Array<YouTubeVideo>> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
    const response = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`,
      { signal: controller.signal },
    )
    clearTimeout(timeout)
    if (!response.ok) return []
    const xml = await response.text()
    return parseVideosFromFeed(xml, channel)
  } catch {
    return []
  }
}

async function checkIfShort(videoId: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), SHORTS_TIMEOUT)
    const resp = await fetch(`https://www.youtube.com/shorts/${videoId}`, {
      signal: controller.signal,
      redirect: 'follow',
    })
    clearTimeout(timeout)
    const isShort = resp.url.includes('/shorts/')
    resp.body?.cancel()
    return isShort
  } catch {
    return false
  }
}

async function filterOutShorts(
  videos: Array<YouTubeVideo>,
): Promise<Array<YouTubeVideo>> {
  const results: Array<YouTubeVideo> = []

  for (let i = 0; i < videos.length; i += SHORTS_CHECK_BATCH) {
    const batch = videos.slice(i, i + SHORTS_CHECK_BATCH)
    const checks = await Promise.all(
      batch.map(async (video) => ({
        video,
        isShort: await checkIfShort(video.id),
      })),
    )
    for (const { video, isShort } of checks) {
      if (!isShort) results.push(video)
    }
  }

  return results
}

async function fetchAllVideos(): Promise<Array<YouTubeVideo>> {
  const channels = await fetchSubscriptions()
  const allVideos: Array<YouTubeVideo> = []

  for (let i = 0; i < channels.length; i += BATCH_SIZE) {
    const batch = channels.slice(i, i + BATCH_SIZE)
    const results = await Promise.all(batch.map(fetchChannelVideos))
    for (const videos of results) {
      allVideos.push(...videos)
    }
  }

  allVideos.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )

  // Filter out channels we don't want and Shorts
  const filtered = allVideos.filter(
    (v) => !FILTERED_CHANNELS.includes(v.channelName),
  )

  return filterOutShorts(filtered.slice(0, 500))
}

async function refreshCache(): Promise<Array<YouTubeVideo>> {
  if (fetchInProgress) return fetchInProgress

  fetchInProgress = fetchAllVideos()
    .then((videos) => {
      cachedVideos = videos
      cacheTimestamp = Date.now()
      fetchInProgress = null
      return videos
    })
    .catch(() => {
      fetchInProgress = null
      return cachedVideos
    })

  return fetchInProgress
}

export async function getYouTubeVideos(
  limit?: number,
): Promise<Array<YouTubeVideo>> {
  const now = Date.now()
  const cacheAge = now - cacheTimestamp

  // Cache is fresh
  if (cachedVideos.length > 0 && cacheAge < CACHE_TTL) {
    return limit ? cachedVideos.slice(0, limit) : cachedVideos
  }

  // Cache is stale but exists — return stale and refresh in background
  if (cachedVideos.length > 0 && cacheAge >= CACHE_TTL) {
    refreshCache()
    return limit ? cachedVideos.slice(0, limit) : cachedVideos
  }

  // No cache — must wait for first load
  const videos = await refreshCache()
  return limit ? videos.slice(0, limit) : videos
}
