import { X } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Item, ItemContent } from '../ui/item'
import { Skeleton } from '../ui/skeleton'
import { ScrollArea } from '../ui/scroll-area'
import { WidgetShell } from '../WidgetShell'
import { useBookmarks } from '@/hooks/useBookmarks'
import type { Bookmark } from '@/hooks/useBookmarks'

function displayTitle(bookmark: Bookmark) {
  return bookmark.title || bookmark.url
}

export function Bookmarks() {
  const { bookmarks, isLoading, createBookmark, removeBookmark } =
    useBookmarks()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const url = formData.get('url') as string
    if (!url) return

    try {
      await createBookmark(url)
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      console.error('Failed to create bookmark:', error)
    }
  }

  return (
    <WidgetShell
      title="Bookmarks"
      loading={isLoading || !bookmarks}
      skeleton={
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      }
    >
      <ScrollArea className="max-h-[400px]">
        <ul className="space-y-3 mb-6">
          {bookmarks?.map((bookmark) => (
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
                      onClick={() => removeBookmark(bookmark.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </ItemContent>
              </Item>
            </li>
          ))}
          {bookmarks?.length === 0 && (
            <li className="text-center py-8 text-indigo-300/70">
              No bookmarks yet. Add a URL below!
            </li>
          )}
        </ul>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input type="url" name="url" placeholder="Paste a URL..." />
      </form>
    </WidgetShell>
  )
}
