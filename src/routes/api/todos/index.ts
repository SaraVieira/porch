import { createFileRoute } from '@tanstack/react-router'
import { desc } from 'drizzle-orm'
import { todos as todosSchema } from '@/db/schema'
import { db } from '@/db'

const json = (data: any, options?: { status?: number }) =>
  new Response(JSON.stringify(data), {
    status: options?.status || 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })

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
      orderBy: [desc(todosSchema.createdAt)],
    })

    return json(todos)
  } catch (error) {
    console.error('Error fetching memos:', error)
    return json({ error: 'Failed to fetch memos' }, { status: 500 })
  }
}

export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json()

    const { title } = body
    const todo = await db!
      .insert(todosSchema)
      .values({ title: title, done: false })

    return json(todo.rows, { status: 201 })
  } catch (error) {
    console.error('Error creating memo:', error)
    return json({ error: 'Failed to create memo' }, { status: 500 })
  }
}
