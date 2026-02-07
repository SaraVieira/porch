import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { habits as habitsSchema, habitCompletions } from '@/db/schema'
import { db } from '@/db'
import { json } from '@/lib/api'

export const Route = createFileRoute('/api/habits/$habitId')({
  server: {
    handlers: {
      DELETE: DELETE,
    },
  },
})

async function DELETE({ params }: { params: { habitId: string } }) {
  try {
    const id = parseInt(params.habitId)
    if (isNaN(id)) {
      return json({ error: 'Invalid habit ID' }, { status: 400 })
    }

    // Delete completions first (application-level cascade)
    await db!.delete(habitCompletions).where(eq(habitCompletions.habitId, id))
    await db!.delete(habitsSchema).where(eq(habitsSchema.id, id))

    return json({ success: true })
  } catch (error) {
    console.error('Error deleting habit:', error)
    return json({ error: 'Failed to delete habit' }, { status: 500 })
  }
}
