import { createFileRoute } from '@tanstack/react-router'
import { MemosService } from '@/lib/memos'

const json = (data: any, options?: { status?: number }) => new Response(JSON.stringify(data), {
  status: options?.status || 200,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const Route = createFileRoute('/api/memos')({
  server: {
    handlers: {
      GET: GET,
      POST: POST,
    },
  },
})


export async function GET({ request }: { request: Request }) {
  try {
    const url = new URL(request.url)
    const date = url.searchParams.get('date')
    const mood = url.searchParams.get('mood')

    let memos
    if (date) {
      memos = await MemosService.getMemosByDate(date)
    } else if (mood) {
      memos = await MemosService.getMemosByMood(mood)
    } else {
      memos = await MemosService.getAllMemos()
    }

    return json(memos)
  } catch (error) {
    console.error('Error fetching memos:', error)
    return json({ error: 'Failed to fetch memos' }, { status: 500 })
  }
}

export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json()
    const { title, content, mood, date } = body

    if (!title || !content || !mood || !date) {
      return json({ error: 'Missing required fields' }, { status: 400 })
    }

    const memo = await MemosService.createMemo({
      title,
      content,
      mood,
      date,
    })

    return json(memo, { status: 201 })
  } catch (error) {
    console.error('Error creating memo:', error)
    return json({ error: 'Failed to create memo' }, { status: 500 })
  }
}
