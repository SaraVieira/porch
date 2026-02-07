import { createFileRoute } from '@tanstack/react-router'
import { MemosService } from '@/lib/memos'
import { json } from '@/lib/api'

export const Route = createFileRoute('/api/memos/$memoId')({
  server: {
    handlers: {
      GET: GET,
      PUT: PUT,
      DELETE: DELETE,
    },
  },
})

export async function GET({ params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return json({ error: 'Invalid memo ID' }, { status: 400 })
    }

    const memo = await MemosService.getMemoById(id)
    if (!memo) {
      return json({ error: 'Memo not found' }, { status: 404 })
    }

    return json(memo)
  } catch (error) {
    console.error('Error fetching memo:', error)
    return json({ error: 'Failed to fetch memo' }, { status: 500 })
  }
}

export async function PUT({
  params,
  request,
}: {
  params: { id: string }
  request: Request
}) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return json({ error: 'Invalid memo ID' }, { status: 400 })
    }

    const body = await request.json()
    const { title, content, mood, date } = body

    if (!title || !content || !mood || !date) {
      return json({ error: 'Missing required fields' }, { status: 400 })
    }

    const memo = await MemosService.updateMemo({
      id,
      title,
      content,
      mood,
      date,
    })

    return json(memo)
  } catch (error) {
    console.error('Error updating memo:', error)
    return json({ error: 'Failed to update memo' }, { status: 500 })
  }
}

export async function DELETE({ params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return json({ error: 'Invalid memo ID' }, { status: 400 })
    }

    const success = await MemosService.deleteMemo(id)
    if (!success) {
      return json({ error: 'Memo not found' }, { status: 404 })
    }

    return json({ success: true })
  } catch (error) {
    console.error('Error deleting memo:', error)
    return json({ error: 'Failed to delete memo' }, { status: 500 })
  }
}
