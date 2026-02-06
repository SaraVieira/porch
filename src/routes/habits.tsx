import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  eachDayOfInterval,
  subDays,
  format,
  isToday,
} from 'date-fns'
import { get } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Flame, Trash2, Trophy, TrendingUp } from 'lucide-react'
import type { HabitWithStats } from '@/lib/types'

const getHabits = createServerFn({
  method: 'GET',
}).handler(() => get('/api/habits') as Promise<Array<HabitWithStats>>)

export const Route = createFileRoute('/habits')({
  component: HabitsPage,
  loader: () => getHabits(),
})

function HabitsPage() {
  const loader = Route.useLoaderData()
  const queryClient = useQueryClient()
  const [range, setRange] = useState<7 | 30>(7)

  const { data: habits } = useSuspenseQuery({
    queryKey: ['habits', 'page'],
    queryFn: () => getHabits(),
    initialData: loader,
    staleTime: 30 * 1000,
  })

  const days = eachDayOfInterval({
    start: subDays(new Date(), range - 1),
    end: new Date(),
  })

  const toggleCompletion = async (habitId: number, date: string) => {
    await fetch('/api/habits/completions', {
      method: 'POST',
      body: JSON.stringify({ habitId, date }),
    })
    queryClient.invalidateQueries({ queryKey: ['habits'] })
  }

  const deleteHabit = async (habitId: number) => {
    await fetch(`/api/habits/${habitId}`, { method: 'DELETE' })
    queryClient.invalidateQueries({ queryKey: ['habits'] })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const name = formData.get('name') as string
    if (!name) return

    await fetch('/api/habits', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
    queryClient.invalidateQueries({ queryKey: ['habits'] })
    ;(e.target as HTMLFormElement).reset()
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Habits</h1>
        <div className="flex gap-2">
          <Button
            variant={range === 7 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRange(7)}
          >
            Week
          </Button>
          <Button
            variant={range === 30 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRange(30)}
          >
            Month
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6">
        {/* Grid view */}
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            {habits.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No habits yet. Add one below to get started!
              </div>
            ) : (
              <ScrollArea className="w-full">
                <div className="min-w-max">
                  {/* Header row with day columns */}
                  <div className="flex gap-0">
                    <div className="w-40 shrink-0" />
                    {days.map((day) => (
                      <Tooltip key={day.toISOString()}>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-10 text-center text-xs ${
                              isToday(day) ? 'text-orange-accent font-bold' : 'text-muted-foreground'
                            }`}
                          >
                            <div>{format(day, 'EEE')}</div>
                            <div>{format(day, 'd')}</div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{format(day, 'MMM d, yyyy')}</TooltipContent>
                      </Tooltip>
                    ))}
                    <div className="w-10 shrink-0" />
                  </div>

                  {/* Habit rows */}
                  {habits.map((habit) => (
                    <div key={habit.id} className="flex items-center gap-0 py-1.5">
                      <div className="w-40 shrink-0 truncate text-sm font-medium pr-2">
                        {habit.emoji} {habit.name}
                      </div>
                      {days.map((day) => {
                        const dateStr = format(day, 'yyyy-MM-dd')
                        const completed = habit.completions.includes(dateStr)
                        return (
                          <div key={dateStr} className="w-10 flex justify-center">
                            <Checkbox
                              checked={completed}
                              onCheckedChange={() => toggleCompletion(habit.id, dateStr)}
                            />
                          </div>
                        )
                      })}
                      <div className="w-10 shrink-0 flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-auto h-auto p-1"
                          onClick={() => deleteHabit(habit.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
              <Input type="text" name="name" placeholder="Add a new habit..." />
              <Button type="submit" size="sm">
                Add
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Stats sidebar */}
        <div className="flex flex-col gap-4">
          {habits.map((habit) => (
            <Card key={habit.id}>
              <CardHeader>
                <CardTitle className="text-sm">
                  {habit.emoji} {habit.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Flame className="w-4 h-4" />
                      Current streak
                    </div>
                    <Badge variant="secondary">{habit.currentStreak} days</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Trophy className="w-4 h-4" />
                      Longest streak
                    </div>
                    <Badge variant="secondary">{habit.longestStreak} days</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <TrendingUp className="w-4 h-4" />
                      Completion rate
                    </div>
                    <Badge variant="secondary">{habit.completionRate}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {habits.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Add habits to see stats here
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
