import { formatDistanceToNow } from 'date-fns'
import { ScrollArea } from '../ui/scroll-area'
import { Skeleton } from '../ui/skeleton'
import { WidgetShell } from '../WidgetShell'
import { useYouTube } from '@/hooks/useYouTube'

function VideoSkeleton() {
  return (
    <div className="flex gap-3 p-2">
      <Skeleton className="w-30 h-17 rounded shrink-0" />
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}

export const YouTube = () => {
  const { videos, isLoading } = useYouTube()

  return (
    <WidgetShell
      title="YouTube"
      link={{ to: '/youtube' }}
      loading={isLoading || !videos}
      skeleton={
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <VideoSkeleton key={i} />
          ))}
        </div>
      }
    >
      <ScrollArea className="h-[500px]">
        <div className="flex flex-col gap-2">
          {videos?.slice(0, 12).map((video) => (
            <a
              key={video.id}
              href={video.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 p-2 rounded hover:bg-accent/50 transition-colors"
            >
              <img
                src={video.thumbnail}
                alt=""
                className="w-30 h-17 rounded object-cover shrink-0"
                loading="lazy"
              />
              <div className="flex flex-col gap-0.5 min-w-0">
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
          ))}
        </div>
      </ScrollArea>
    </WidgetShell>
  )
}
