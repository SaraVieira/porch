import { X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { RssFeed } from '@/lib/types'

type FeedListCardProps = {
  feeds: Array<RssFeed>
  onDeleteFeed: (feedId: number) => void
}

export function FeedListCard({ feeds, onDeleteFeed }: FeedListCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Feeds ({feeds.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full ">
          <div className="flex flex-col gap-1">
            {feeds.map((feed) => (
              <div
                key={feed.id}
                className="flex justify-between items-center gap-2 text-sm"
              >
                <div className="items-center flex gap-1 max-w-[250px]">
                  {feed.favicon && (
                    <img
                      src={feed.favicon}
                      alt=""
                      className="w-4 h-4 rounded shrink-0"
                    />
                  )}
                  <span className="truncate min-w-0">{feed.title}</span>
                </div>
                <button
                  className="shrink-0 p-1 hover:text-red-400 transition-colors"
                  onClick={() => onDeleteFeed(feed.id)}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {feeds.length === 0 && (
              <span className="text-xs text-muted-foreground">
                No feeds added yet
              </span>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
