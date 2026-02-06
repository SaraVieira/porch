import { createFileRoute } from '@tanstack/react-router'
import { getYouTubeVideos } from '@/lib/youtube'

const json = (data: any, options?: { status?: number }) =>
  new Response(JSON.stringify(data), {
    status: options?.status || 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })

export const Route = createFileRoute('/api/youtube/')({
  server: {
    handlers: {
      GET: GET,
    },
  },
})

export async function GET() {
  try {
    const videos = await getYouTubeVideos(200)
    return json(videos)
  } catch (error) {
    console.error('Error fetching YouTube videos:', error)
    return json({ error: 'Failed to fetch YouTube videos' }, { status: 500 })
  }
}
