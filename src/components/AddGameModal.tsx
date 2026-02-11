import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { load } from 'cheerio/slim'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Calendar } from './ui/calendar'

const fetchGameFromHLTB = createServerFn({ method: 'GET' })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    const result = await fetch(`https://howlongtobeat.com/game/${id}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        origin: 'https://howlongtobeat.com',
        referer: 'https://howlongtobeat.com',
      },
    })
    if (!result.ok) {
      throw new Error(`HLTB returned ${result.status}`)
    }
    const html = await result.text()
    const $ = load(html)
    const nextData = $('#__NEXT_DATA__').text()
    if (!nextData) {
      throw new Error('Could not find game data on HLTB page')
    }
    const data = JSON.parse(nextData).props.pageProps.game.data.game[0]
    if (!data) {
      throw new Error('Game not found on HLTB')
    }
    return {
      image: `https://howlongtobeat.com/games/${data.game_image}`,
      name: data.game_name,
      dev: data.profile_dev,
      genres: data.profile_genre?.split(', ') ?? [],
      platforms: data.profile_platform?.split(', ') ?? [],
      summary: data.profile_summary,
      steam: data.profile_steam,
      score: data.review_score,
      release:
        data.release_world ||
        data.release_eu ||
        data.release_na ||
        data.release_jp,
      time: (data.comp_main / 3600).toFixed(1),
    }
  })

export const AddGameModal = () => {
  const [open, setIsOpen] = useState(false)
  const [hltbId, setHltbId] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [game, setGame] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  const onFetchGame = async () => {
    if (!hltbId) return
    setLoading(true)
    try {
      const data = await fetchGameFromHLTB({ data: hltbId })
      setGame(data)
    } catch (e) {
      console.error('Failed to fetch game:', e)
    }
    setLoading(false)
  }

  const onAddGame = async () => {
    await fetch('/api/games', {
      method: 'POST',
      body: JSON.stringify({
        ...game,
        id: uuidv4(),
        notes,
        date: date?.toISOString(),
      }),
    })
    setGame(null)
    setHltbId('')
    setNotes('')
    setDate(new Date())
    setIsOpen(false)
    queryClient.invalidateQueries({ queryKey: ['games'] })
  }

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add Game</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a game</DialogTitle>
          <div className="pt-4 flex flex-col gap-4">
            <div className="flex gap-2">
              <Input
                value={hltbId}
                onChange={(e) => setHltbId(e.target.value)}
                placeholder="HowLongToBeat Game ID"
              />
              <Button onClick={onFetchGame} disabled={!hltbId || loading}>
                {loading ? 'Loading...' : 'Fetch'}
              </Button>
            </div>
            {game && (
              <div className="flex gap-3 items-center p-2 rounded border border-border">
                <img
                  src={game.image}
                  alt={game.name}
                  className="w-12 h-16 object-cover rounded"
                />
                <div className="text-sm">
                  <div className="font-medium">{game.name}</div>
                  <div className="text-muted-foreground">
                    {game.dev} &middot; {game.time}h &middot; {game.score}/100
                  </div>
                </div>
              </div>
            )}
            <Textarea
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'pl-3 text-left font-normal',
                    !date && 'text-muted-foreground',
                  )}
                >
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d > new Date() || d < new Date('1900-01-01')}
                />
              </PopoverContent>
            </Popover>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button disabled={!game} onClick={onAddGame}>
            Add Game
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
