import { formatDistanceToNow } from 'date-fns'
import type { YouTubeVideo } from '@/lib/types'

type VideoCardProps = {
  video: YouTubeVideo
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <a
      href={video.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-lg border border-border-accent overflow-hidden hover:shadow-md transition-shadow bg-card"
    >
      <div className="aspect-video relative overflow-hidden">
        <img
          src={video.thumbnail}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          loading="lazy"
        />
      </div>
      <div className="p-3 flex flex-col gap-1">
        <span className="text-sm font-medium line-clamp-2 leading-tight">
          {video.title}
        </span>
        <span className="text-xs text-muted-foreground truncate">
          {video.channelName}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(video.publishedAt), {
            addSuffix: true,
          })}
        </span>
      </div>
    </a>
  )
}
