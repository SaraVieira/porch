import { useQuery } from '@tanstack/react-query'
import type { YouTubeVideo } from '@/lib/types'

const fetchVideos = () =>
  fetch('/api/youtube').then((r) => r.json()) as Promise<Array<YouTubeVideo>>

export function useYouTube() {
  const { data: videos, isLoading } = useQuery({
    queryKey: ['youtube', 'widget'],
    queryFn: fetchVideos,
    staleTime: 5 * 60 * 1000,
  })
  return { videos, isLoading }
}
