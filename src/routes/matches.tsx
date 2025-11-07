import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import type { APIMatch } from '@/lib/types'
import { get } from '@/lib/utils'
import { Match } from '@/components/Match'

export const Route = createFileRoute('/matches')({ component: Matches })

function Matches() {
  const { data, isLoading } = useQuery({
    queryKey: ['mtches'],
    queryFn: () =>
      get('https://streamed.pk/api/matches/live').then((rsp) =>
        rsp.filter((match: APIMatch) => match.category === 'football'),
      ) as Promise<Array<APIMatch>>,
  })

  return (
    <div className="bg-background text-highlight grid grid-cols-4 gap-4">
      {isLoading ? null : data?.length ? (
        data.map((match) => <Match key={match.id} match={match} />)
      ) : (
        <h3 className="text-center text-lg col-span-4 block w-full mt-12">
          No games live right now
        </h3>
      )}
    </div>
  )
}
