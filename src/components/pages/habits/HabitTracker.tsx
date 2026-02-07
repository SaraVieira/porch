import { format, isToday } from 'date-fns'
import { Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { HabitWithStats } from '@/lib/types'

type HabitTrackerProps = {
  habits: Array<HabitWithStats>
  days: Array<Date>
  onToggleCompletion: (habitId: number, date: string) => void
  onDeleteHabit: (habitId: number) => void
  onCreateHabit: (name: string) => void
}

export function HabitTracker({
  habits,
  days,
  onToggleCompletion,
  onDeleteHabit,
  onCreateHabit,
}: HabitTrackerProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const name = formData.get('name') as string
    if (!name) return
    await onCreateHabit(name)
    ;(e.target as HTMLFormElement).reset()
  }

  return (
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
              <div className="flex gap-0">
                <div className="w-40 shrink-0" />
                {days.map((day) => (
                  <Tooltip key={day.toISOString()}>
                    <TooltipTrigger asChild>
                      <div
                        className={`w-10 text-center text-xs ${
                          isToday(day)
                            ? 'text-orange-accent font-bold'
                            : 'text-muted-foreground'
                        }`}
                      >
                        <div>{format(day, 'EEE')}</div>
                        <div>{format(day, 'd')}</div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {format(day, 'MMM d, yyyy')}
                    </TooltipContent>
                  </Tooltip>
                ))}
                <div className="w-10 shrink-0" />
              </div>

              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center gap-0 py-1.5"
                >
                  <div className="w-40 shrink-0 truncate text-sm font-medium pr-2">
                    {habit.emoji} {habit.name}
                  </div>
                  {days.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd')
                    const completed = habit.completions.includes(dateStr)
                    return (
                      <div
                        key={dateStr}
                        className="w-10 flex justify-center"
                      >
                        <Checkbox
                          checked={completed}
                          onCheckedChange={() =>
                            onToggleCompletion(habit.id, dateStr)
                          }
                        />
                      </div>
                    )
                  })}
                  <div className="w-10 shrink-0 flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-auto h-auto p-1"
                      onClick={() => onDeleteHabit(habit.id)}
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
  )
}
