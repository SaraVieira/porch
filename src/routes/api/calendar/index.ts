import { createFileRoute } from '@tanstack/react-router'
import { googleFetch, isGoogleConnected } from '@/lib/google'
import { json } from '@/lib/api'

export const Route = createFileRoute('/api/calendar/')({
  server: {
    handlers: {
      GET: GET,
    },
  },
})

// Simple in-memory cache
let cache: { data: any; expires: number } | null = null
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function GET({ request }: { request: Request }) {
  try {
    const connected = await isGoogleConnected()
    if (!connected) {
      return json({ events: [], connected: false })
    }

    const url = new URL(request.url)
    const monthParam = url.searchParams.get('month')
    const yearParam = url.searchParams.get('year')

    const now = new Date()
    const month = monthParam ? parseInt(monthParam) : now.getMonth()
    const year = yearParam ? parseInt(yearParam) : now.getFullYear()

    // Fetch from start of month to end of month, with a week buffer on each side
    const timeMin = new Date(year, month - 1, -6)
    const timeMax = new Date(year, month + 1, 7)

    const cacheKey = `${timeMin.toISOString()}-${timeMax.toISOString()}`
    if (
      cache &&
      cache.expires > Date.now() &&
      cache.data._cacheKey === cacheKey
    ) {
      return json(cache.data)
    }

    // Fetch from all calendars the user has
    const listRes = await googleFetch(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList',
    )
    if (!listRes.ok) {
      const err = await listRes.text()
      console.error('Failed to fetch calendar list:', err)
      return json({ events: [], connected: true })
    }

    const calendarList = await listRes.json()
    const calendars = calendarList.items || []

    // Fetch the authenticated user's email to identify "me"
    const meRes = await googleFetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary',
    )
    const myEmail = meRes.ok ? (await meRes.json()).id : null

    const allEvents: any[] = []

    for (const cal of calendars) {
      const params = new URLSearchParams({
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '100',
      })

      const eventsRes = await googleFetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal.id)}/events?${params}`,
      )

      if (!eventsRes.ok) continue

      const eventsData = await eventsRes.json()
      for (const event of eventsData.items || []) {
        if (event.status === 'cancelled') continue

        const isAllDay = !!event.start?.date
        const start = event.start?.dateTime || event.start?.date
        const end = event.end?.dateTime || event.end?.date

        if (!start) continue

        // Organizer: show name if it's not the authenticated user
        const organizer = event.organizer
        const isMe =
          organizer?.self || (myEmail && organizer?.email === myEmail)
        const organizerName = isMe
          ? null
          : organizer?.displayName || organizer?.email || null

        allEvents.push({
          summary: event.summary || '(No title)',
          start,
          end: end || start,
          allDay: isAllDay,
          calendar_type: cal.summary || 'Calendar',
          color: cal.backgroundColor || '#4285f4',
          organizer: organizerName,
          confirmed: event.status === 'confirmed',
          startTime: isAllDay ? '' : start,
          endTime: isAllDay ? '' : end || start,
          duration: '',
        })
      }
    }

    // Sort by start time
    allEvents.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    )

    const result = { events: allEvents, connected: true, _cacheKey: cacheKey }
    cache = { data: result, expires: Date.now() + CACHE_TTL }

    return json(result)
  } catch (error) {
    console.error('Error fetching calendar:', error)
    return json({ events: [], connected: false })
  }
}
