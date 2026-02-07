import { useState, useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { get } from '@/lib/utils'

const getSpotify = createServerFn({
  method: 'GET',
}).handler(() => get('/api/spotify/status'))

export function useSpotifyPlayer() {
  const queryClient = useQueryClient()
  const [localProgress, setLocalProgress] = useState(0)
  const lastFetchTime = useRef(Date.now())

  const { data, isLoading } = useQuery<any>({
    queryKey: ['spotify-current-song'],
    queryFn: () => getSpotify(),
    refetchInterval: 5000,
  })

  // Interpolate progress between polls
  useEffect(() => {
    if (!data || data.closed) return

    lastFetchTime.current = Date.now()
    setLocalProgress(data.progress_ms || 0)

    const interval = setInterval(() => {
      setLocalProgress((prev) => {
        const next = prev + 1000
        if (next >= (data.duration_ms || 0)) return data.duration_ms || 0
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [data?.progress_ms, data?.song, data?.closed, data?.duration_ms])

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['spotify-current-song'] })

  const nextMutation = useMutation({
    mutationFn: () =>
      fetch('/api/spotify/next', { method: 'POST' }).then((r) => r.json()),
    onSuccess: () => setTimeout(invalidate, 300),
  })
  const prevMutation = useMutation({
    mutationFn: () =>
      fetch('/api/spotify/prev', { method: 'POST' }).then((r) => r.json()),
    onSuccess: () => setTimeout(invalidate, 300),
  })
  const playMutation = useMutation({
    mutationFn: () =>
      fetch('/api/spotify/play', { method: 'PUT' }).then((r) => r.json()),
    onSuccess: invalidate,
  })
  const pauseMutation = useMutation({
    mutationFn: () =>
      fetch('/api/spotify/pause', { method: 'PUT' }).then((r) => r.json()),
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

  const isPlaying = data ? !data.closed : false
  const progressPercentage = data?.duration_ms
    ? (localProgress / data.duration_ms) * 100
    : 0

  const play = () => playMutation.mutate()
  const pause = () => pauseMutation.mutate()
  const next = () => nextMutation.mutate()
  const prev = () => prevMutation.mutate()
  const shuffle = () => shuffleMutation.mutate(!data?.shuffle_state)

  const nextRepeatState = () => {
    const cycle: Record<string, string> = {
      off: 'context',
      context: 'track',
      track: 'off',
    }
    return cycle[data?.repeat_state] || 'off'
  }
  const repeat = () => repeatMutation.mutate(nextRepeatState())

  return {
    data,
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
    shuffleState: data?.shuffle_state ?? false,
    repeatState: data?.repeat_state ?? 'off',
  }
}
