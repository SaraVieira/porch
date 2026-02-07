import { createFileRoute } from '@tanstack/react-router'
import { eq, desc } from 'drizzle-orm'
import { db } from '@/db'
import { rssCategories } from '@/db/schema'

const json = (data: any, options?: { status?: number }) =>
  new Response(JSON.stringify(data), {
    status: options?.status || 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })

export const Route = createFileRoute('/api/rss/categories')({
  server: {
    handlers: {
      GET: GET,
      POST: POST,
      DELETE: DELETE,
    },
  },
})

export async function GET() {
  try {
    const categories = await db!.query.rssCategories.findMany({
      orderBy: [desc(rssCategories.createdAt)],
    })
    return json(categories)
  } catch (error) {
    console.error('Error fetching RSS categories:', error)
    return json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name) {
      return json({ error: 'Name is required' }, { status: 400 })
    }

    const [category] = await db!
      .insert(rssCategories)
      .values({ name })
      .returning()

    return json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating RSS category:', error)
    return json({ error: 'Failed to create category' }, { status: 500 })
  }
}

export async function DELETE({ request }: { request: Request }) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return json({ error: 'ID is required' }, { status: 400 })
    }

    await db!.delete(rssCategories).where(eq(rssCategories.id, id))

    return json({ success: true })
  } catch (error) {
    console.error('Error deleting RSS category:', error)
    return json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
