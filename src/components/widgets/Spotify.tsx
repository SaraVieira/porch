import {
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from 'lucide-react'
import clsx from 'clsx'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Skeleton } from '../ui/skeleton'
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer'
import { useSpotifyConnected } from '@/lib/hooks/useAuthStatus'

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000)
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function Spotify() {
  const {
    data: spotifyData,
    isLoading,
    localProgress,
    isPlaying,
    progressPercentage,
    play,
    pause,
    next,
    prev,
    shuffle,
    repeat,
    shuffleState,
    repeatState,
  } = useSpotifyPlayer()
  const { connected, isLoading: isLoadingConnected } = useSpotifyConnected()

  if (!isLoadingConnected && !connected) {
    return null
  }
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

  const handlePlayPause = () => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
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

        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-1" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(localProgress)}</span>
            {spotifyData.duration_ms ? (
              <span>{formatTime(spotifyData.duration_ms)}</span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            disabled={spotifyData.closed}
            variant="ghost"
            size="icon-sm"
            onClick={shuffle}
            className={
              shuffleState ? 'text-green-500' : 'text-muted-foreground'
            }
          >
            <Shuffle className="w-4 h-4" />
          </Button>

          <Button
            disabled={spotifyData.closed}
            variant="ghost"
            size="icon-sm"
            onClick={prev}
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
            onClick={next}
          >
            <SkipForward className="w-4 h-4" />
          </Button>

          <Button
            disabled={spotifyData.closed}
            variant="ghost"
            size="icon-sm"
            onClick={repeat}
            className={
              repeatState !== 'off' ? 'text-green-500' : 'text-muted-foreground'
            }
          >
            {repeatState === 'track' ? (
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
