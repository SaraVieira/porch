import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { games as gamesSchema } from '@/db/schema'
import { db } from '@/db'

const json = (data: any, options?: { status?: number }) =>
  new Response(JSON.stringify(data), {
    status: options?.status || 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })

export const Route = createFileRoute('/api/games/$gameId')({
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
  params: { gameId: string }
  request: Request
}) {
  try {
    const body = (await request.json()) as typeof gamesSchema.$inferSelect

    const memo = await db!
      .update(gamesSchema)
      .set(body)
      .where(eq(gamesSchema.id, params.gameId))

    return json(memo)
  } catch (error) {
    console.error('Error updating game:', error)
    return json({ error: 'Failed to update game' }, { status: 500 })
  }
}

export async function DELETE({ params }: { params: { gameId: string } }) {
  try {
    await db!.delete(gamesSchema).where(eq(gamesSchema.id, params.gameId))

    return json({ success: true })
  } catch (error) {
    console.error('Error deleting game:', error)
    return json({ error: 'Failed to delete game' }, { status: 500 })
  }
}
