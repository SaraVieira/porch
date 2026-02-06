import { useState } from 'react'
import {
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
} from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { millisecondsToSeconds } from 'date-fns'
import clsx from 'clsx'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Skeleton } from '../ui/skeleton'
import { get } from '@/lib/utils'

const getSpotify = createServerFn({
  method: 'GET',
}).handler(() =>
  get('https://deskbuddy.deploy.iamsaravieira.com/spotify/status'),
)

export function Spotify() {
  const queryClient = useQueryClient()

  const { data: spotifyData, isLoading } = useQuery<any>({
    queryKey: ['spotify-current-song'],
    staleTime: 1000,
    queryFn: () => getSpotify(),
  })

  const nextMutation = useMutation({
    mutationFn: async () =>
      get('https://deskbuddy.deploy.iamsaravieira.com/spotify/next'),
  })
  const prevMutation = useMutation({
    mutationFn: async () =>
      get('https://deskbuddy.deploy.iamsaravieira.com/spotify/prev'),
  })
  const play = useMutation({
    mutationFn: async () =>
      get('https://deskbuddy.deploy.iamsaravieira.com/spotify/play'),
  })
  const pause = useMutation({
    mutationFn: async () =>
      get('https://deskbuddy.deploy.iamsaravieira.com/spotify/pause'),
  })

  const [isPlaying, setIsPlaying] = useState(false)
  const [repeatMode] = useState(0)

  if (isLoading || !spotifyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spotify</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <Skeleton className="h-1 w-full" />
        </CardContent>
      </Card>
    )
  }

  const currentTime = spotifyData.progress_ms || 0

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercentage = (currentTime / spotifyData.duration_ms) * 100

  const handlePlayPause = async () => {
    if (isPlaying) {
      await pause.mutateAsync()
    } else {
      await play.mutateAsync()
    }
    setIsPlaying(!isPlaying)
    queryClient.invalidateQueries({
      queryKey: ['spotify-current-song'],
    })
  }

  const handlePrevious = async () => {
    setIsPlaying(true)
    await prevMutation.mutateAsync()
    queryClient.invalidateQueries({
      queryKey: ['spotify-current-song'],
    })
  }

  const handleNext = async () => {
    setIsPlaying(true)
    await nextMutation.mutateAsync()
    queryClient.invalidateQueries({
      queryKey: ['spotify-current-song'],
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div
            className={clsx(
              'w-4 h-4 rounded-full',
              spotifyData.closed ? 'bg-red-500' : 'bg-green-500',
            )}
          ></div>
          {spotifyData.closed ? 'Paused' : 'Now Playing'}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Album Cover and Song Info */}
        <div className="flex gap-4">
          <div className="w-16 h-16 bg-linear-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shrink-0">
            {spotifyData?.item?.album?.images ? (
              <img src={spotifyData.item.album.images[0].url} />
            ) : null}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {spotifyData?.song}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {spotifyData?.artists}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {spotifyData.item?.album?.name}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-1" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(millisecondsToSeconds(currentTime))}</span>
            {!spotifyData.closed ? (
              <span>
                {formatTime(millisecondsToSeconds(spotifyData?.duration_ms))}
              </span>
            ) : null}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          <Button
            disabled={spotifyData.closed}
            variant="ghost"
            size="icon-sm"
            className={
              spotifyData.shuffle_state
                ? 'text-green-500'
                : 'text-muted-foreground'
            }
          >
            <Shuffle className="w-4 h-4" />
          </Button>

          <Button
            disabled={spotifyData.closed}
            variant="ghost"
            size="icon-sm"
            onClick={handlePrevious}
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            disabled={spotifyData.closed}
            variant="outline"
            size="icon"
            onClick={handlePlayPause}
            className="bg-white text-white hover:bg-gray-100 border-white"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>

          <Button
            disabled={spotifyData.closed}
            variant="ghost"
            size="icon-sm"
            onClick={handleNext}
          >
            <SkipForward className="w-4 h-4" />
          </Button>

          <Button
            disabled={spotifyData.closed}
            variant="ghost"
            size="icon-sm"
            className={
              spotifyData.repeat_state !== 'off'
                ? 'text-green-500'
                : 'text-muted-foreground'
            }
          >
            <Repeat className="w-4 h-4" />
            {repeatMode === 2 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
