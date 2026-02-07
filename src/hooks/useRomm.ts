import { useQuery } from '@tanstack/react-query'
import { get } from '@/lib/utils'

export function useRomm() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['romm', 'stats'],
    queryFn: () => get('https://roms.iamsaravieira.com/api/stats'),
  })
  return { stats, isLoading }
}
