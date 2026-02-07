import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getYouTubeVideos } from '@/lib/youtube'
import { Input } from '@/components/ui/input'
import { VideoCard } from '@/components/pages/youtube/VideoCard'

const getVideos = createServerFn({
  method: 'GET',
}).handler(() => getYouTubeVideos(200))

export const Route = createFileRoute('/youtube')({
  component: YouTubePage,
  loader: () => getVideos(),
})

function YouTubePage() {
  const loader = Route.useLoaderData()
  const [search, setSearch] = useState('')

  const { data: videos } = useSuspenseQuery({
    queryKey: ['youtube', 'page'],
    queryFn: () => getVideos(),
    initialData: loader,
    staleTime: 5 * 60 * 1000,
  })

  const filtered = search
    ? videos.filter(
        (v) =>
          v.title.toLowerCase().includes(search.toLowerCase()) ||
          v.channelName.toLowerCase().includes(search.toLowerCase()),
      )
    : videos

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">YouTube</h1>
        <Input
          placeholder="Search videos or channels..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          No videos found matching "{search}"
        </div>
      )}
    </div>
  )
}
