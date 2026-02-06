import { isSameDay } from 'date-fns'
import { formatDateRange } from 'little-date'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { createServerFn } from '@tanstack/react-start'
import { ScrollArea } from '../ui/scroll-area'
import { Calendar as BaseCalendar } from '@/components/ui/calendar'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { get } from '@/lib/utils'

type Event = {
  allDay: boolean
  calendar_type: string
  color: string
  confirmed: boolean
  duration: string
  end: string
  endTime: string
  organizer: string | null
  start: string
  startTime: string
  summary: string
}

const getCalendarEvents = createServerFn({
  method: 'GET',
})
  .inputValidator((data: { month: number; year: number }) => data)
  .handler(({ data }) =>
    get(`/api/calendar?month=${data.month}&year=${data.year}`),
  )

export function Calendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const { data } = useQuery({
    queryKey: ['calendar', date?.getMonth(), date?.getFullYear()],
    queryFn: () =>
      getCalendarEvents({
        data: {
          month: date?.getMonth() ?? new Date().getMonth(),
          year: date?.getFullYear() ?? new Date().getFullYear(),
        },
      }),
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
                    className="bg-muted relative rounded-md p-2 pl-6 text-sm w-full"
                  >
                    <span
                      className="absolute inset-y-2 left-2 w-1 rounded-full"
                      style={{ backgroundColor: event.color || 'var(--primary)' }}
                    />
                    <div className="font-medium">{event.summary}</div>
                    <div className="text-muted-foreground text-xs">
                      {formatDateRange(
                        new Date(event.start),
                        new Date(event.end),
                      )}
                    </div>
                    {event.organizer && (
                      <div className="text-muted-foreground text-xs mt-0.5">
                        {event.organizer}
                      </div>
                    )}
                  </div>
                ))}
          </div>
        </ScrollArea>
      </CardFooter>
    </Card>
  )
}
