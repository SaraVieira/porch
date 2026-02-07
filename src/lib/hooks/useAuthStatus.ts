import { useQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { get } from '@/lib/utils'

const getGoogleStatus = createServerFn({
  method: 'GET',
}).handler(() => get('/api/auth/google/status'))

const getSpotifyStatus = createServerFn({
  method: 'GET',
}).handler(() => get('/api/auth/spotify/status'))

export function useGoogleConnected() {
  const { data, isLoading } = useQuery<{ connected: boolean }>({
    queryKey: ['google-status'],
    queryFn: () => getGoogleStatus(),
  })
  return { connected: data?.connected ?? false, isLoading }
}

export function useSpotifyConnected() {
  const { data, isLoading } = useQuery<{ connected: boolean }>({
    queryKey: ['spotify-status'],
    queryFn: () => getSpotifyStatus(),
  })
  return { connected: data?.connected ?? false, isLoading }
}
