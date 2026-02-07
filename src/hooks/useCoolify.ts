import { useQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import type { CoolifyAPI } from '@/lib/types'

const getCoolifyData = createServerFn({ method: 'GET' }).handler(
  async (): Promise<CoolifyAPI> => {
    const data = { services: [], applications: [] }
    try {
      const headers = {
        Authorization: `Bearer ${process.env.COOLIFY_TOKEN}`,
      }
      const [services, applications] = await Promise.all([
        fetch('https://dashboard.iamsaravieira.com/api/v1/services', {
          headers,
        }).then((rsp) => rsp.json()),
        fetch('https://dashboard.iamsaravieira.com/api/v1/applications', {
          headers,
        }).then((rsp) => rsp.json()),
      ])
      data.services = services
      data.applications = applications
      return data as CoolifyAPI
    } catch (error) {
      console.error('Error fetching Coolify data:', error)
      return data as CoolifyAPI
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
