import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { todos as todosSchema } from '@/db/schema'
import { db } from '@/db'
import { googleFetch, isGoogleConnected } from '@/lib/google'
import { json } from '@/lib/api'

export const Route = createFileRoute('/api/todos/sync')({
  server: {
    handlers: {
      POST: POST,
    },
  },
})

async function POST() {
  try {
    const connected = await isGoogleConnected()
    if (!connected) {
      return json({ synced: false, reason: 'not_connected' })
    }

    // Fetch all task lists
    const listsRes = await googleFetch(
      'https://tasks.googleapis.com/tasks/v1/users/@me/lists',
    )

    if (!listsRes.ok) {
      const err = await listsRes.text()
      console.error('Failed to fetch Google Task Lists:', err)
      return json({ synced: false, reason: 'api_error' }, { status: 500 })
    }

    const listsData = await listsRes.json()
    const taskLists = listsData.items || []

    // Get all local todos
    const localTodos = await db!.query.todos.findMany()
    const localByGoogleId = new Map(
      localTodos.filter((t) => t.googleTaskId).map((t) => [t.googleTaskId, t]),
    )

    let created = 0
    let updated = 0

    for (const list of taskLists) {
      const listId = list.id
      const listName = list.title

      // Fetch all tasks from this list (including completed)
      const params = new URLSearchParams({
        maxResults: '100',
        showCompleted: 'true',
        showHidden: 'true',
      })

      const res = await googleFetch(
        `https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks?${params}`,
      )

      if (!res.ok) {
        console.error(`Failed to fetch tasks from list "${listName}":`, await res.text())
        continue
      }

      const data = await res.json()
      const googleTasks = data.items || []

      for (const gt of googleTasks) {
        if (gt.deleted) continue

        const isDone = gt.status === 'completed'
        const title = gt.title || '(No title)'
        const googleDateOnly = gt.due ? gt.due.split('T')[0] : null

        // Extract time from Google notes (we store it as "⏰ HH:MM")
        let googleNotes = gt.notes || null
        let timeFromNotes: string | null = null
        if (googleNotes) {
          const timeMatch = googleNotes.match(/⏰\s*(\d{2}:\d{2})/)
          if (timeMatch) {
            timeFromNotes = timeMatch[1]
            // Strip the time line from notes to get the real notes
            googleNotes =
              googleNotes.replace(/\n?⏰\s*\d{2}:\d{2}/, '').trim() || null
          }
        }

        // Reconstruct dueDate with time if available
        let dueDate = googleDateOnly
        if (googleDateOnly && timeFromNotes) {
          dueDate = `${googleDateOnly}T${timeFromNotes}`
        }

        const existing = localByGoogleId.get(gt.id)

        if (existing) {
          // Update local if Google version is different
          const googleUpdated = new Date(gt.updated).getTime()
          const localUpdated = existing.updatedAt
            ? existing.updatedAt.getTime()
            : 0

          if (googleUpdated > localUpdated) {
            // Preserve local time if Google doesn't have one and local does
            let syncDueDate = dueDate
            if (
              existing.dueDate?.includes('T') &&
              googleDateOnly &&
              !timeFromNotes
            ) {
              const localDatePart = existing.dueDate.split('T')[0]
              if (localDatePart === googleDateOnly) {
                // Same date, keep local time
                syncDueDate = existing.dueDate
              }
            }

            await db!
              .update(todosSchema)
              .set({
                title,
                notes: googleNotes,
                dueDate: syncDueDate,
                done: isDone,
                googleListId: listId,
                googleListName: listName,
                updatedAt: new Date(gt.updated),
              })
              .where(eq(todosSchema.id, existing.id))
            updated++
          }
        } else {
          // Create locally
          await db!.insert(todosSchema).values({
            title,
            notes: googleNotes,
            dueDate,
            done: isDone,
            googleTaskId: gt.id,
            googleListId: listId,
            googleListName: listName,
            updatedAt: gt.updated ? new Date(gt.updated) : new Date(),
          })
          created++
        }
      }
    }

    // Push local todos that don't have a googleTaskId yet (push to default list)
    const unlinked = localTodos.filter((t) => !t.googleTaskId)
    let pushed = 0

    for (const todo of unlinked) {
      try {
        const body: any = {
          title: todo.title,
          status: todo.done ? 'completed' : 'needsAction',
        }

        // Build notes: user notes + time info
        const parts: string[] = []
        if (todo.notes) parts.push(todo.notes)

        if (todo.dueDate) {
          const dateOnly = todo.dueDate.includes('T')
            ? todo.dueDate.split('T')[0]
            : todo.dueDate
          body.due = `${dateOnly}T00:00:00.000Z`

          if (todo.dueDate.includes('T')) {
            const time = todo.dueDate.split('T')[1]
            parts.push(`⏰ ${time}`)
          }
        }

        if (parts.length > 0) body.notes = parts.join('\n')

        // Find the default list ID
        const defaultList = taskLists.find(
          (l: any) => l.title === 'My Tasks' || l.id === todo.googleListId,
        )
        const pushListId = defaultList?.id || taskLists[0]?.id

        if (!pushListId) continue

        const createRes = await googleFetch(
          `https://tasks.googleapis.com/tasks/v1/lists/${pushListId}/tasks`,
          { method: 'POST', body: JSON.stringify(body) },
        )

        if (createRes.ok) {
          const newTask = await createRes.json()
          await db!
            .update(todosSchema)
            .set({
              googleTaskId: newTask.id,
              googleListId: pushListId,
              googleListName: defaultList?.title || taskLists[0]?.title,
              updatedAt: new Date(),
            })
            .where(eq(todosSchema.id, todo.id))
          pushed++
        }
      } catch (err) {
        console.error(`Failed to push todo ${todo.id} to Google:`, err)
      }
    }

    return json({ synced: true, created, updated, pushed })
  } catch (error) {
    console.error('Error syncing todos:', error)
    return json({ synced: false, reason: 'error' }, { status: 500 })
  }
}
