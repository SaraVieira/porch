import { formatDistanceToNow } from 'date-fns'
import { Bookmark } from 'lucide-react'
import type { YouTubeVideo } from '@/lib/types'
import { formatDuration, formatViewCount } from '@/lib/youtube-format'
import { useBookmarks } from '@/hooks/useBookmarks'

type VideoCardProps = {
  video: YouTubeVideo
}

export function VideoCard({ video }: VideoCardProps) {
  const { bookmarks, createBookmark } = useBookmarks()
  const isBookmarked = bookmarks?.some((b) => b.url === video.link)

  return (
    <div
      onClick={() => window.open(video.link, '_blank', 'noopener,noreferrer')}
      className="group cursor-pointer rounded-lg border border-border-accent overflow-hidden hover:shadow-md transition-shadow bg-card"
    >
      <div className="aspect-video relative overflow-hidden">
        <img
          src={video.thumbnail}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          loading="lazy"
        />
        {video.duration && (
          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
            {formatDuration(video.duration)}
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-1">
          <span className="text-sm font-medium line-clamp-2 leading-tight">
            {video.title}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (!isBookmarked) createBookmark(video.link)
            }}
            className="shrink-0 p-1 rounded hover:bg-accent/50 transition-colors"
          >
            <Bookmark
              className={`w-4 h-4 ${isBookmarked ? 'fill-current text-orange-accent' : 'text-muted-foreground'}`}
            />
          </button>
        </div>
        <span className="text-xs text-muted-foreground truncate">
          {video.channelName}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(video.publishedAt), {
            addSuffix: true,
          })}
          {video.viewCount && ` · ${formatViewCount(video.viewCount)} views`}
        </span>
      </div>
    </div>
  )
}
