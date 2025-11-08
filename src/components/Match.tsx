import { useState } from 'react'
import { Card, CardContent, CardTitle } from './ui/card'
import { ScrollArea } from './ui/scroll-area'
import type { APIMatch, Stream } from '@/lib/types'
import { get, getCountryCode } from '@/lib/utils'
import { FAKE_MATCH_POSTER } from '@/lib/consts'

export const Match = ({ match }: { match: APIMatch }) => {
  const [gameLinks, setGameLinks] = useState<{ [id: string]: Array<Stream> }>(
    {},
  )

  const onClick = async () => {
    const data = (
      await Promise.all(
        match.sources.map(async (source) => {
          const streams = (await get(
            `https://streamed.pk/api/stream/${source.source}/${source.id}`,
          )) as Array<Stream>
          return streams
        }),
      )
    ).flat()
    setGameLinks((prev) => ({ ...prev, [match.id]: data }))
    if (data.length === 1) {
      window.open(data[0].embedUrl, '_blank')
    }
  }

  return (
    <Card key={match.id} className="cursor-pointer" onClick={onClick}>
      {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
      {gameLinks[match.id] ? (
        <Links links={gameLinks[match.id]} />
      ) : (
        <CardContent>
          <CardTitle className="mb-2">{match.title}</CardTitle>

          <img
            className="w-full my-4 block"
            src={
              match.poster
                ? `https://streamed.pk${match.poster}`
                : FAKE_MATCH_POSTER
            }
          />

          <span className="mt-2 text-muted-foreground block w-full text-center">
            {new Date(match.date).toLocaleDateString('en-GB', {
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
  )
}

const Links = ({ links }: { links: Array<Stream> }) => {
  return (
    <CardContent>
      <ScrollArea className="h-52">
        <div className="flex flex-col gap-2">
          {links.map((stream) => (
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

              <span className="font-medium">
                {stream.language || 'Unknown'}
              </span>

              {stream.hd && (
                <span className="ml-2 px-2 py-0.5 bg-orange-accent text-white text-xs rounded">
                  HD
                </span>
              )}

              <span className="ml-auto text-muted-foreground">Watch</span>
            </a>
          ))}
        </div>
      </ScrollArea>
    </CardContent>
  )
}
