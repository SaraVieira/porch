import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { bookmarks as bookmarksSchema } from '@/db/schema'
import { db } from '@/db'

const json = (data: any, options?: { status?: number }) =>
  new Response(JSON.stringify(data), {
    status: options?.status || 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })

export const Route = createFileRoute('/api/bookmarks/$bookmarkId')({
  server: {
    handlers: {
      DELETE: DELETE,
    },
  },
})

export async function DELETE({
  params,
}: {
  params: { bookmarkId: string }
}) {
  try {
    const id = parseInt(params.bookmarkId)
    if (isNaN(id)) {
      return json({ error: 'Invalid bookmark ID' }, { status: 400 })
    }

    await db!.delete(bookmarksSchema).where(eq(bookmarksSchema.id, id))

    return json({ success: true })
  } catch (error) {
    console.error('Error deleting bookmark:', error)
    return json({ error: 'Failed to delete bookmark' }, { status: 500 })
  }
}
