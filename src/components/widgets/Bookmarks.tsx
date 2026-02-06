import { X } from 'lucide-react'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Item, ItemContent } from '../ui/item'
import { Skeleton } from '../ui/skeleton'
import { ScrollArea } from '../ui/scroll-area'
import { get, post, deleteMethod } from '@/lib/utils'

type Bookmark = {
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

const createBookmark = createServerFn({
  method: 'POST',
})
  .inputValidator((data: { url: string }) => data)
  .handler(({ data }) => post('/api/bookmarks', data))

const removeBookmark = createServerFn({
  method: 'POST',
})
  .inputValidator((data: { id: string }) => data)
  .handler(({ data }) => deleteMethod(`/api/bookmarks/${data.id}`))

function displayTitle(bookmark: Bookmark) {
  return bookmark.title || bookmark.url
}

export function Bookmarks() {
  const queryClient = useQueryClient()

  const { data: bookmarks, isLoading } = useQuery<Array<Bookmark>>({
    queryKey: ['bookmarks'],
    queryFn: () => getBookmarks(),
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const url = formData.get('url') as string

    if (!url) return

    try {
      await createBookmark({ data: { url } })
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      console.error('Failed to create bookmark:', error)
    }
  }

  if (isLoading || !bookmarks) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bookmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookmarks</CardTitle>
      </CardHeader>

      <CardContent>
        <ScrollArea className="max-h-[400px]">
          <ul className="space-y-3 mb-6">
            {bookmarks.map((bookmark) => (
              <li key={bookmark.id}>
                <Item variant="outline" className="p-2">
                  <ItemContent className="min-w-0">
                    <div className="flex items-start gap-2">
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 min-w-0 flex-1"
                      >
                        {bookmark.thumbnail && (
                          <img
                            src={bookmark.thumbnail}
                            alt=""
                            className="w-5 h-5 shrink-0 rounded object-cover"
                          />
                        )}
                        <span className="text-sm line-clamp-2 break-all">
                          {displayTitle(bookmark)}
                        </span>
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-6 w-6"
                        onClick={() => {
                          removeBookmark({
                            data: { id: bookmark.id.toString() },
                          })
                          queryClient.invalidateQueries({
                            queryKey: ['bookmarks'],
                          })
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </ItemContent>
                </Item>
              </li>
            ))}
            {bookmarks.length === 0 && (
              <li className="text-center py-8 text-indigo-300/70">
                No bookmarks yet. Add a URL below!
              </li>
            )}
          </ul>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input type="url" name="url" placeholder="Paste a URL..." />
        </form>
      </CardContent>
    </Card>
  )
}
