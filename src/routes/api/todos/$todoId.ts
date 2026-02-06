import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
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
    if (isNaN(id)) {
      return json({ error: 'Invalid todo ID' }, { status: 400 })
    }

    const body = await request.json()
    const { done } = body

    await db!
      .update(todosSchema)
      .set({ done, updatedAt: new Date() })
      .where(eq(todosSchema.id, id))

    // Push to Google Tasks
    const todo = await db!.query.todos.findFirst({
      where: eq(todosSchema.id, id),
    })

    if (todo?.googleTaskId) {
      syncToggleToGoogle(todo.googleTaskId, done).catch((err) =>
        console.error('Failed to sync toggle to Google:', err),
      )
    }

    return json({ success: true })
  } catch (error) {
    console.error('Error updating todo:', error)
    return json({ error: 'Failed to update todo' }, { status: 500 })
  }
}

export async function DELETE({ params }: { params: { todoId: string } }) {
  try {
    const id = parseInt(params.todoId)
    if (isNaN(id)) {
      return json({ error: 'Invalid todo ID' }, { status: 400 })
    }

    // Get the todo first for Google Task ID
    const todo = await db!.query.todos.findFirst({
      where: eq(todosSchema.id, id),
    })

    await db!.delete(todosSchema).where(eq(todosSchema.id, id))

    // Delete from Google Tasks
    if (todo?.googleTaskId) {
      deleteFromGoogle(todo.googleTaskId).catch((err) =>
        console.error('Failed to delete from Google:', err),
      )
    }

    return json({ success: true })
  } catch (error) {
    console.error('Error deleting todo:', error)
    return json({ error: 'Failed to delete todo' }, { status: 500 })
  }
}

async function syncToggleToGoogle(googleTaskId: string, done: boolean) {
  const connected = await isGoogleConnected()
  if (!connected) return

  await googleFetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${TASK_LIST_ID}/tasks/${googleTaskId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        status: done ? 'completed' : 'needsAction',
        completed: done ? new Date().toISOString() : null,
      }),
    },
  )
}

async function deleteFromGoogle(googleTaskId: string) {
  const connected = await isGoogleConnected()
  if (!connected) return

  await googleFetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${TASK_LIST_ID}/tasks/${googleTaskId}`,
    { method: 'DELETE' },
  )
}
