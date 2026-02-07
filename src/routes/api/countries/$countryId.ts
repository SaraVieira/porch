import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { countries as countriesSchema } from '@/db/schema'
import { db } from '@/db'
import { json } from '@/lib/api'

export const Route = createFileRoute('/api/countries/$countryId')({
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
  params: { countryId: string }
  request: Request
}) {
  try {
    const body = (await request.json()) as typeof countriesSchema.$inferSelect

    const countriesList = await db!
      .update(countriesSchema)
      .set(body)
      .where(eq(countriesSchema.id, params.countryId))

    return json(countriesList)
  } catch (error) {
    console.error('Error updating country:', error)
    return json({ error: 'Failed to update country' }, { status: 500 })
  }
}

export async function DELETE({ params }: { params: { countryId: string } }) {
  try {
    await db!
      .delete(countriesSchema)
      .where(eq(countriesSchema.id, params.countryId))

    return json({ success: true })
  } catch (error) {
    console.error('Error deleting country:', error)
    return json({ error: 'Failed to delete country' }, { status: 500 })
  }
}
