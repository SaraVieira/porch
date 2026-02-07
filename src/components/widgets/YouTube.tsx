import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/card'
import { ScrollArea } from '../ui/scroll-area'
import { Skeleton } from '../ui/skeleton'
import type { YouTubeVideo } from '@/lib/types'

const fetchVideos = () =>
  fetch('/api/youtube').then((r) => r.json()) as Promise<Array<YouTubeVideo>>

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
  const { data: videos, isLoading } = useQuery({
    queryKey: ['youtube', 'widget'],
    queryFn: fetchVideos,
    staleTime: 5 * 60 * 1000,
  })

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <h3 className="font-semibold">YouTube</h3>
        <Link to="/youtube">
          <ArrowUpRight className="w-4 text-orange-accent" />
        </Link>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          {isLoading || !videos ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <VideoSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {videos.slice(0, 12).map((video) => (
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
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
