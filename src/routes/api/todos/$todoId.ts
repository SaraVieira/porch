import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { todos as todosSchema } from '@/db/schema'
import { db } from '@/db'

const json = (data: any, options?: { status?: number }) =>
  new Response(JSON.stringify(data), {
    status: options?.status || 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })

export const Route = createFileRoute('/api/todos/$todoId')({
  server: {
    handlers: {
      PUT: PUT,
      DELETE: DELETE,
    },
  },
})

export async function PUT({
  params,
  request,
}: {
  params: { todoId: string }
  request: Request
}) {
  try {
    const id = parseInt(params.todoId)
    console.log(params)

    if (isNaN(id)) {
      return json({ error: 'Invalid todo ID' }, { status: 400 })
    }

    const body = await request.json()
    const { done } = body

    const memo = await db!
      .update(todosSchema)
      .set({ done: done })
      .where(eq(todosSchema.id, id))

    return json(memo)
  } catch (error) {
    console.error('Error updating memo:', error)
    return json({ error: 'Failed to update memo' }, { status: 500 })
  }
}

export async function DELETE({ params }: { params: { todoId: string } }) {
  try {
    const id = parseInt(params.todoId)
    if (isNaN(id)) {
      return json({ error: 'Invalid memo ID' }, { status: 400 })
    }

   await db!.delete(todosSchema).where(eq(todosSchema.id, id))

    return json({ success: true })
  } catch (error) {
    console.error('Error deleting memo:', error)
    return json({ error: 'Failed to delete memo' }, { status: 500 })
  }
}
