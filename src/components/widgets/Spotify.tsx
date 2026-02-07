import { useState, useEffect, useRef } from 'react'
import {
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import clsx from 'clsx'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Skeleton } from '../ui/skeleton'
import { get } from '@/lib/utils'

const getSpotify = createServerFn({
  method: 'GET',
}).handler(() => get('/api/spotify/status'))

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000)
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function Spotify() {
  const queryClient = useQueryClient()
  const [localProgress, setLocalProgress] = useState(0)
  const lastFetchTime = useRef(Date.now())

  const { data: spotifyData, isLoading } = useQuery<any>({
    queryKey: ['spotify-current-song'],
    queryFn: () => getSpotify(),
    refetchInterval: 5000,
  })

  // Interpolate progress between polls
  useEffect(() => {
    if (!spotifyData || spotifyData.closed) return

    lastFetchTime.current = Date.now()
    setLocalProgress(spotifyData.progress_ms || 0)

    const interval = setInterval(() => {
      setLocalProgress((prev) => {
        const next = prev + 1000
        if (next >= (spotifyData.duration_ms || 0)) return spotifyData.duration_ms || 0
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [spotifyData?.progress_ms, spotifyData?.song, spotifyData?.closed, spotifyData?.duration_ms])

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['spotify-current-song'] })

  const nextMutation = useMutation({
    mutationFn: () => fetch('/api/spotify/next', { method: 'POST' }).then((r) => r.json()),
    onSuccess: () => setTimeout(invalidate, 300),
  })
  const prevMutation = useMutation({
    mutationFn: () => fetch('/api/spotify/prev', { method: 'POST' }).then((r) => r.json()),
    onSuccess: () => setTimeout(invalidate, 300),
  })
  const playMutation = useMutation({
    mutationFn: () => fetch('/api/spotify/play', { method: 'PUT' }).then((r) => r.json()),
    onSuccess: invalidate,
  })
  const pauseMutation = useMutation({
    mutationFn: () => fetch('/api/spotify/pause', { method: 'PUT' }).then((r) => r.json()),
    onSuccess: invalidate,
  })
  const shuffleMutation = useMutation({
    mutationFn: (state: boolean) =>
      fetch('/api/spotify/shuffle', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state }),
      }).then((r) => r.json()),
    onSuccess: invalidate,
  })
  const repeatMutation = useMutation({
    mutationFn: (state: string) =>
      fetch('/api/spotify/repeat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state }),
      }).then((r) => r.json()),
    onSuccess: invalidate,
  })

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

  const isPlaying = !spotifyData.closed
  const progressPercentage = spotifyData.duration_ms
    ? (localProgress / spotifyData.duration_ms) * 100
    : 0

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseMutation.mutate()
    } else {
      playMutation.mutate()
    }
  }

  const handleShuffle = () => {
    shuffleMutation.mutate(!spotifyData.shuffle_state)
  }

  const nextRepeatState = () => {
    // Cycle: off → context → track → off
    const cycle: Record<string, string> = {
      off: 'context',
      context: 'track',
      track: 'off',
    }
    return cycle[spotifyData.repeat_state] || 'off'
  }

  const handleRepeat = () => {
    repeatMutation.mutate(nextRepeatState())
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
            <span>{formatTime(localProgress)}</span>
            {spotifyData.duration_ms ? (
              <span>{formatTime(spotifyData.duration_ms)}</span>
            ) : null}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          <Button
            disabled={spotifyData.closed}
            variant="ghost"
            size="icon-sm"
            onClick={handleShuffle}
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
            onClick={() => prevMutation.mutate()}
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
            onClick={() => nextMutation.mutate()}
          >
            <SkipForward className="w-4 h-4" />
          </Button>

          <Button
            disabled={spotifyData.closed}
            variant="ghost"
            size="icon-sm"
            onClick={handleRepeat}
            className={
              spotifyData.repeat_state !== 'off'
                ? 'text-green-500'
                : 'text-muted-foreground'
            }
          >
            {spotifyData.repeat_state === 'track' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
