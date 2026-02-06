import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Flame, X } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Skeleton } from '../ui/skeleton'
import { Checkbox } from '../ui/checkbox'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Item, ItemContent } from '../ui/item'
import type { HabitWithStats } from '@/lib/types'

const fetchHabits = () =>
  fetch('/api/habits').then((r) => r.json()) as Promise<Array<HabitWithStats>>

function HabitSkeleton() {
  return (
    <div className="flex items-center gap-2 p-2">
      <Skeleton className="w-4 h-4 rounded" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-5 w-8 rounded" />
    </div>
  )
}

export const Habits = () => {
  const queryClient = useQueryClient()
  const { data: habits, isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: fetchHabits,
    staleTime: 30 * 1000,
  })

  const today = format(new Date(), 'yyyy-MM-dd')

  const toggleCompletion = async (habitId: number) => {
    await fetch('/api/habits/completions', {
      method: 'POST',
      body: JSON.stringify({ habitId, date: today }),
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
    <Card>
      <CardHeader className="flex justify-between items-center">
        <h3 className="font-semibold">Habits</h3>
        <Link to="/habits">
          <ArrowUpRight className="w-4 text-orange-accent" />
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading || !habits ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <HabitSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <ul className="space-y-3 mb-6">
              {habits.map((habit) => (
                <li key={habit.id} className="flex w-full max-w-md flex-col gap-6">
                  <Item variant="outline" className="p-2">
                    <ItemContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={habit.completedToday}
                            onCheckedChange={() => toggleCompletion(habit.id)}
                          />
                          <span>
                            {habit.emoji} {habit.name}
                          </span>
                          {habit.currentStreak > 0 && (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <Flame className="w-3 h-3" />
                              {habit.currentStreak}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          className="w-auto"
                          onClick={() => deleteHabit(habit.id)}
                        >
                          <X className="w-4" />
                        </Button>
                      </div>
                    </ItemContent>
                  </Item>
                </li>
              ))}
              {habits.length === 0 && (
                <li className="text-center py-8 text-indigo-300/70">
                  No habits yet. Create one below!
                </li>
              )}
            </ul>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input type="text" name="name" placeholder="Add a new habit..." />
            </form>
          </>
        )}
      </CardContent>
    </Card>
  )
}
