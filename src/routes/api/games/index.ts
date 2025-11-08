import { createFileRoute } from '@tanstack/react-router'
import { desc } from 'drizzle-orm'
import { games as gamesSchema } from '@/db/schema'
import { db } from '@/db'

const json = (data: any, options?: { status?: number }) =>
  new Response(JSON.stringify(data), {
    status: options?.status || 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })

export const Route = createFileRoute('/api/games/')({
  server: {
    handlers: {
      GET: GET,
      POST: POST,
    },
  },
})

export async function GET() {
  try {
    const games = await db!.query.games.findMany({
      orderBy: [desc(gamesSchema.date)],
    })

    return json(games)
  } catch (error) {
    console.error('Error fetching games:', error)
    return json({ error: 'Failed to fetch games' }, { status: 500 })
  }
}

export async function POST({ request }: { request: Request }) {
  try {
    const body = (await request.json()) as typeof gamesSchema.$inferSelect

    const game = await db!.insert(gamesSchema).values(body)

    return json(game.rows, { status: 201 })
  } catch (error) {
    console.error('Error creating game:', error)
    return json({ error: 'Failed to create game' }, { status: 500 })
  }
}
