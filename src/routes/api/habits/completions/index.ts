import { createFileRoute } from '@tanstack/react-router'
import { and, eq } from 'drizzle-orm'
import { habitCompletions } from '@/db/schema'
import { db } from '@/db'
import { json } from '@/lib/api'

export const Route = createFileRoute('/api/habits/completions/')({
  server: {
    handlers: {
      POST: POST,
    },
  },
})

export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json()
    const { habitId, date } = body

    // Check if completion already exists
    const existing = await db!.query.habitCompletions.findFirst({
      where: and(
        eq(habitCompletions.habitId, habitId),
        eq(habitCompletions.date, date),
      ),
    })

    if (existing) {
      // Uncheck — delete the completion
      await db!.delete(habitCompletions).where(eq(habitCompletions.id, existing.id))
      return json({ completed: false })
    }

    // Check — insert a new completion
    await db!.insert(habitCompletions).values({ habitId, date })
    return json({ completed: true })
  } catch (error) {
    console.error('Error toggling habit completion:', error)
    return json({ error: 'Failed to toggle completion' }, { status: 500 })
  }
}
