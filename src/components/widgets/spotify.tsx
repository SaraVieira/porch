import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Heart,
  Shuffle,
  Repeat,
} from 'lucide-react'

// Fake data for the currently playing song
const fakeCurrentSong = {
  title: 'Bohemian Rhapsody',
  artist: 'Queen',
  album: 'A Night at the Opera',
  duration: 355, // in seconds (5:55)
  currentTime: 127, // in seconds (2:07)
  coverUrl:
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center',
  isLiked: true,
}

export function Spotify() {
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(fakeCurrentSong.currentTime)
  const [isShuffled, setIsShuffled] = useState(false)
  const [repeatMode, setRepeatMode] = useState(0) // 0: off, 1: all, 2: one

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate progress percentage
  const progressPercentage = (currentTime / fakeCurrentSong.duration) * 100

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handlePrevious = () => {
    // In real implementation, this would skip to previous song
    console.log('Previous song')
  }

  const handleNext = () => {
    // In real implementation, this would skip to next song
    console.log('Next song')
  }

  const handleShuffle = () => {
    setIsShuffled(!isShuffled)
  }

  const handleRepeat = () => {
    setRepeatMode((prev) => (prev + 1) % 3)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          Now Playing
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Album Cover and Song Info */}
        <div className="flex gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <div className="text-white text-xs font-bold text-center">
              QUEEN
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {fakeCurrentSong.title}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {fakeCurrentSong.artist}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {fakeCurrentSong.album}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-1" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(fakeCurrentSong.duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleShuffle}
            className={isShuffled ? 'text-green-500' : 'text-muted-foreground'}
          >
            <Shuffle className="w-4 h-4" />
          </Button>

          <Button variant="ghost" size="icon-sm" onClick={handlePrevious}>
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handlePlayPause}
            className="bg-white text-black hover:bg-gray-100 border-white"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>

          <Button variant="ghost" size="icon-sm" onClick={handleNext}>
            <SkipForward className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleRepeat}
            className={
              repeatMode > 0 ? 'text-green-500' : 'text-muted-foreground'
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
