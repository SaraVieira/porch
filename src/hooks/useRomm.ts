import { useQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { get } from '@/lib/utils'

const getPlatforms = createServerFn({ method: 'GET' }).handler(async () => {
  const credentials = btoa(
    `${process.env.ROMM_USERNAME}:${process.env.ROMM_PASSWORD}`,
  )
  const res = await fetch(`${process.env.VITE_PUBLIC_ROMM_URL}/api/platforms`, {
    headers: { Authorization: `Basic ${credentials}` },
  })
  const platforms = await res.json()
  const baseUrl = `${process.env.VITE_PUBLIC_ROMM_URL}/assets/platforms`
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
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['romm', 'stats'],
    queryFn: () => get(`${import.meta.env.VITE_PUBLIC_ROMM_URL}/api/stats`),
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
