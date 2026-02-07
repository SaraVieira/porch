import { createFileRoute } from '@tanstack/react-router'
import { desc } from 'drizzle-orm'
import { countries as countriesSchema } from '@/db/schema'
import { db } from '@/db'
import { json } from '@/lib/api'

export const Route = createFileRoute('/api/countries/')({
  server: {
    handlers: {
      GET: GET,
      POST: POST,
    },
  },
})

async function GET() {
  try {
    const countries = await db!.query.countries.findMany({
      orderBy: [desc(countriesSchema.createdAt)],
    })

    return json(countries)
  } catch (error) {
    console.error('Error fetching countries:', error)
    return json({ error: 'Failed to fetch countries' }, { status: 500 })
  }
}

async function POST({ request }: { request: Request }) {
  try {
    const body = (await request.json()) as typeof countriesSchema.$inferSelect

    const country = await db!.insert(countriesSchema).values(body)

    return json(country.rows, { status: 201 })
  } catch (error) {
    console.error('Error creating country:', error)
    return json({ error: 'Failed to create country' }, { status: 500 })
  }
}
