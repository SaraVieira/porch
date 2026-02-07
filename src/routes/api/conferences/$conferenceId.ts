import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { conferences as conferencesSchema } from '@/db/schema'
import { db } from '@/db'
import { json } from '@/lib/api'

export const Route = createFileRoute('/api/conferences/$conferenceId')({
  server: {
    handlers: {
      PUT: PUT,
      DELETE: DELETE,
    },
  },
})

async function PUT({
  params,
  request,
}: {
  params: { conferenceId: string }
  request: Request
}) {
  try {
    const body = (await request.json()) as typeof conferencesSchema.$inferSelect

    const memo = await db!
      .update(conferencesSchema)
      .set(body)
      .where(eq(conferencesSchema.id, params.conferenceId))

    return json(memo)
  } catch (error) {
    console.error('Error updating conference:', error)
    return json({ error: 'Failed to update conference' }, { status: 500 })
  }
}

async function DELETE({ params }: { params: { conferenceId: string } }) {
  try {
    await db!
      .delete(conferencesSchema)
      .where(eq(conferencesSchema.id, params.conferenceId))

    return json({ success: true })
  } catch (error) {
    console.error('Error deleting conference:', error)
    return json({ error: 'Failed to delete conference' }, { status: 500 })
  }
}
