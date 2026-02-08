import { useQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import type { CoolifyAPI } from '@/lib/types'

const empty: CoolifyAPI = { services: [], applications: [] }

const getCoolifyData = createServerFn({ method: 'GET' }).handler(
  async (): Promise<CoolifyAPI> => {
    const baseUrl = process.env.COOLIFY_URL
    const token = process.env.COOLIFY_TOKEN
    if (!baseUrl || !token) return empty

    try {
      const headers = { Authorization: `Bearer ${token}` }
      const [services, applications] = await Promise.all([
        fetch(`${baseUrl}/api/v1/services`, { headers }).then((rsp) =>
          rsp.json(),
        ),
        fetch(`${baseUrl}/api/v1/applications`, { headers }).then((rsp) =>
          rsp.json(),
        ),
      ])
      return { services, applications } as CoolifyAPI
    } catch (error) {
      console.error('Error fetching Coolify data:', error)
      return empty
    }
  },
)

export function useCoolify() {
  const { data, isLoading } = useQuery({
    queryKey: ['coolify'],
    queryFn: () => getCoolifyData(),
  })
  return {
    data: data ?? { services: [], applications: [] },
    isLoading,
  }
}
