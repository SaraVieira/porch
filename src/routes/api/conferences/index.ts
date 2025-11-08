import { createFileRoute } from '@tanstack/react-router'
import { desc } from 'drizzle-orm'
import { conferences as conferencesSchema } from '@/db/schema'
import { db } from '@/db'

const json = (data: any, options?: { status?: number }) =>
  new Response(JSON.stringify(data), {
    status: options?.status || 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })

export const Route = createFileRoute('/api/conferences/')({
  server: {
    handlers: {
      GET: GET,
      POST: POST,
    },
  },
})

export async function GET() {
  try {
    const conferences = await db!.query.conferences.findMany({
      orderBy: [desc(conferencesSchema.createdAt)],
    })

    return json(conferences)
  } catch (error) {
    console.error('Error fetching conferences:', error)
    return json({ error: 'Failed to fetch conferences' }, { status: 500 })
  }
}

export async function POST({ request }: { request: Request }) {
  try {
    const body = (await request.json()) as typeof conferencesSchema.$inferSelect

    const conference = await db!.insert(conferencesSchema).values(body)

    return json(conference.rows, { status: 201 })
  } catch (error) {
    console.error('Error creating conference:', error)
    return json({ error: 'Failed to create conference' }, { status: 500 })
  }
}
