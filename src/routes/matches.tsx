import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { APIMatch, Stream } from '@/lib/types'
import { get, getCountryCode } from '@/lib/utils'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { FAKE_MATCH_POSTER } from '@/lib/consts'
import { ScrollArea } from '@/components/ui/scroll-area'

export const Route = createFileRoute('/matches')({ component: Matches })

function Matches() {
  const { data, isLoading } = useQuery({
    queryKey: ['mtches'],
    queryFn: () =>
      get('https://streamed.pk/api/matches/live').then((rsp) =>
        rsp.filter((match: APIMatch) => match.category === 'football'),
      ) as Promise<Array<APIMatch>>,
  })

  const mutation = useMutation({
    mutationFn: ({ source }: { source: APIMatch['sources'][0] }) =>
      get(
        `https://streamed.pk/api/stream/${source.source}/${source.id}`,
      ) as Promise<Array<Stream>>,
  })

  return (
    <div className="bg-background text-highlight grid grid-cols-4 gap-4">
      {isLoading ? null : data?.length ? (
        data.map((match) => (
          <Card
            className="cursor-pointer"
            onClick={() =>
              mutation.mutateAsync({
                source: match.sources[0],
              })
            }
          >
            {mutation.data &&
            mutation.data.some((d) => d.id === match.sources[0].id) ? (
              <CardContent>
                <ScrollArea className="h-52">
                  <div className="flex flex-col gap-2">
                    {mutation.data.map((stream) => (
                      <a
                        key={stream.id}
                        href={stream.embedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2 rounded hover:bg-accent transition"
                      >
                        <img
                          src={`https://flagcdn.com/24x18/${getCountryCode(stream.language)}.png`}
                          alt={stream.language}
                          className="w-6 h-4 rounded shadow"
                        />

                        <span className="font-medium">{stream.language}</span>

                        {stream.hd && (
                          <span className="ml-2 px-2 py-0.5 bg-orange-accent text-white text-xs rounded">
                            HD
                          </span>
                        )}

                        <span className="ml-auto text-muted-foreground">
                          Watch
                        </span>
                      </a>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            ) : (
              <CardContent>
                <CardTitle className="mb-2">{match.title}</CardTitle>

                <div className="h-36 w-full">
                  <img
                    className="h-36"
                    src={
                      match.poster
                        ? `https://streamed.pk${match.poster}`
                        : FAKE_MATCH_POSTER
                    }
                  />
                </div>
                <span className="mt-2 text-muted-foreground block">
                  {new Date(match.date).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </CardContent>
            )}
          </Card>
        ))
      ) : (
        <h3 className="text-center text-lg col-span-4 block w-full mt-12">
          No games live right now
        </h3>
      )}
    </div>
  )
}
