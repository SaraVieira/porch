import { isSameDay } from 'date-fns'
import { formatDateRange } from 'little-date'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ScrollArea } from '../ui/scroll-area'
import { Calendar as BaseCalendar } from '@/components/ui/calendar'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { get } from '@/lib/utils'

type Event = {
  allDay: boolean
  calendar_type: string
  confirmed: boolean
  duration: string
  end: string
  endTime: string
  start: string
  startTime: string
  summary: string
}

export function Calendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const { data } = useQuery({
    queryKey: ['calendar'],
    queryFn: () => get('https://deskbuddy.deploy.iamsaravieira.com/events/all'),
  })

  return (
    <Card className="w-full py-4">
      <CardContent className="px-1 w-full">
        <BaseCalendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="bg-transparent p-0"
          disabled={{ before: new Date() }}
        />
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 border-t px-4 !pt-4">
        <div className="flex w-full items-center justify-between px-1">
          <div className="text-sm font-medium">
            {date?.toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
        </div>
        <ScrollArea className="h-60 w-full">
          <div className="flex w-full flex-col gap-2 min-h-56">
            {data?.events &&
              data?.events
                ?.filter((event: Event) =>
                  isSameDay(date!, new Date(event.start)),
                )
                .map((event: Event) => (
                  <div
                    key={
                      event.summary +
                      event.start.toString() +
                      event.end.toString()
                    }
                    className="bg-muted after:bg-primary/70 relative rounded-md p-2 pl-6 text-sm after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full w-full"
                  >
                    <div className="font-medium">{event.summary}</div>
                    <div className="text-muted-foreground text-xs">
                      {formatDateRange(
                        new Date(event.start),
                        new Date(event.end),
                      )}
                    </div>
                  </div>
                ))}
          </div>
        </ScrollArea>
      </CardFooter>
    </Card>
  )
}
