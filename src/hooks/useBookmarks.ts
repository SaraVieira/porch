import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { get, post, deleteMethod } from '@/lib/utils'

export type Bookmark = {
  id: number
  url: string
  title: string
  type: string
  thumbnail: string | null
  createdAt: Date | null
}

const getBookmarks = createServerFn({
  method: 'GET',
}).handler(() => get('/api/bookmarks'))

const createBookmarkFn = createServerFn({
  method: 'POST',
})
  .inputValidator((data: { url: string }) => data)
  .handler(({ data }) => post('/api/bookmarks', data))

const removeBookmarkFn = createServerFn({
  method: 'POST',
})
  .inputValidator((data: { id: string }) => data)
  .handler(({ data }) => deleteMethod(`/api/bookmarks/${data.id}`))

export function useBookmarks() {
  const queryClient = useQueryClient()

  const { data: bookmarks, isLoading } = useQuery<Array<Bookmark>>({
    queryKey: ['bookmarks'],
    queryFn: () => getBookmarks(),
  })

  const createBookmark = async (url: string) => {
    await createBookmarkFn({ data: { url } })
    queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
  }

  const removeBookmark = async (id: number) => {
    await removeBookmarkFn({ data: { id: id.toString() } })
    queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
  }

  return { bookmarks, isLoading, createBookmark, removeBookmark }
}
