import { useQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { get } from '@/lib/utils'

const getPlatforms = createServerFn({ method: 'GET' }).handler(async () => {
  const rommUrl = process.env.VITE_PUBLIC_ROMM_URL
  const username = process.env.ROMM_USERNAME
  const password = process.env.ROMM_PASSWORD
  if (!rommUrl || !username || !password) return []

  const credentials = btoa(`${username}:${password}`)
  const res = await fetch(`${rommUrl}/api/platforms`, {
    headers: { Authorization: `Basic ${credentials}` },
  })
  const platforms = await res.json()
  const baseUrl = `${rommUrl}/assets/platforms`
  const withIcons = await Promise.all(
    platforms.map(async (p: { slug: string }) => {
      const svgRes = await fetch(`${baseUrl}/${p.slug}.svg`, {
        method: 'HEAD',
      })
      const icon = svgRes.ok
        ? `${baseUrl}/${p.slug}.svg`
        : `${baseUrl}/${p.slug}.ico`
      return { ...p, icon }
    }),
  )
  return withIcons
})

export function useRomm() {
  const rommUrl = import.meta.env.VITE_PUBLIC_ROMM_URL
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['romm', 'stats'],
    queryFn: () => get(`${rommUrl}/api/stats`),
    enabled: !!rommUrl,
  })
  const { data: platforms, isLoading: platformsLoading } = useQuery<
    {
      id: number
      slug: string
      display_name: string
      rom_count: number
      icon: string
    }[]
  >({
    queryKey: ['romm', 'platforms'],
    queryFn: () => getPlatforms(),
  })
  return {
    stats,
    platforms: platforms ?? [],
    isLoading: statsLoading || platformsLoading,
  }
}
