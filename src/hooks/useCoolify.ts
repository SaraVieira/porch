import { useQuery } from '@tanstack/react-query'
import type { CoolifyAPI } from '@/lib/types'

const getCoolifyData = async (): Promise<CoolifyAPI> => {
  const data = { services: [], applications: [] }
  try {
    const services = await fetch(
      'https://dashboard.iamsaravieira.com/api/v1/services',
      {
        headers: {
          Authorization:
            'Bearer PdJbg179g75Ub9h0pqOqiXdJfe7xVxTzF0Ktzj0Ua8458203',
        },
      },
    ).then((rsp) => rsp.json())
    data.services = services
    const applications = await fetch(
      'https://dashboard.iamsaravieira.com/api/v1/applications',
      {
        headers: {
          Authorization:
            'Bearer PdJbg179g75Ub9h0pqOqiXdJfe7xVxTzF0Ktzj0Ua8458203',
        },
      },
    ).then((rsp) => rsp.json())
    data.applications = applications
    return data as CoolifyAPI
  } catch (error) {
    console.error('Error fetching Coolify data:', error)
    return data as CoolifyAPI
  }
}

export function useCoolify() {
  const { data, isLoading } = useQuery({
    queryKey: ['coolify'],
    queryFn: getCoolifyData,
  })
  return {
    data: data ?? { services: [], applications: [] },
    isLoading,
  }
}
