import { createFileRoute } from '@tanstack/react-router'
import { desc, eq } from 'drizzle-orm'
import { todos as todosSchema } from '@/db/schema'
import { db } from '@/db'
import { googleFetch, isGoogleConnected } from '@/lib/google'

const json = (data: any, options?: { status?: number }) =>
  new Response(JSON.stringify(data), {
    status: options?.status || 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })

const TASK_LIST_ID = '@default'

export const Route = createFileRoute('/api/todos/')({
  server: {
    handlers: {
      GET: GET,
      POST: POST,
    },
  },
})

export async function GET() {
  try {
    const todos = await db!.query.todos.findMany({
      where: eq(todosSchema.done, false),
      orderBy: [desc(todosSchema.createdAt)],
    })

    return json(todos)
  } catch (error) {
    console.error('Error fetching todos:', error)
    return json({ error: 'Failed to fetch todos' }, { status: 500 })
  }
}

export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json()
    const { title, dueDate, dueTime, notes } = body

    let due: string | null = null
    if (dueDate && dueTime) {
      due = `${dueDate}T${dueTime}`
    } else if (dueDate) {
      due = dueDate
    }

    const result = await db!
      .insert(todosSchema)
      .values({ title, done: false, dueDate: due, notes: notes || null })
      .returning()

    const todo = result[0]

    // Push to Google Tasks (fire-and-forget)
    if (todo) {
      pushToGoogle(todo).catch((err) =>
        console.error('Failed to push todo to Google:', err),
      )
    }

    return json(todo, { status: 201 })
  } catch (error) {
    console.error('Error creating todo:', error)
    return json({ error: 'Failed to create todo' }, { status: 500 })
  }
}

async function pushToGoogle(todo: { id: number; title: string; dueDate: string | null; notes: string | null }) {
  const connected = await isGoogleConnected()
  if (!connected) return

  const body: any = {
    title: todo.title,
    status: 'needsAction',
  }

  // Build notes: user notes + time info (Google Tasks API doesn't support times)
  const noteParts: string[] = []
  if (todo.notes) noteParts.push(todo.notes)

  if (todo.dueDate) {
    const dateOnly = todo.dueDate.includes('T')
      ? todo.dueDate.split('T')[0]
      : todo.dueDate
    body.due = `${dateOnly}T00:00:00.000Z`

    // Append time to notes since Google Tasks only supports dates
    if (todo.dueDate.includes('T')) {
      const time = todo.dueDate.split('T')[1]
      noteParts.push(`⏰ ${time}`)
    }
  }

  if (noteParts.length > 0) body.notes = noteParts.join('\n')

  const res = await googleFetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${TASK_LIST_ID}/tasks`,
    { method: 'POST', body: JSON.stringify(body) },
  )

  if (res.ok) {
    const googleTask = await res.json()
    await db!
      .update(todosSchema)
      .set({ googleTaskId: googleTask.id })
      .where(eq(todosSchema.id, todo.id))
  }
}
