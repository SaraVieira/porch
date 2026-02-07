import { Flame, X } from 'lucide-react'
import { Skeleton } from '../ui/skeleton'
import { Checkbox } from '../ui/checkbox'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Item, ItemContent } from '../ui/item'
import { WidgetShell } from '../WidgetShell'
import { useHabits } from '@/hooks/useHabits'

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
  const { habits, isLoading, toggleCompletion, deleteHabit, createHabit } =
    useHabits()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const name = formData.get('name') as string
    if (!name) return
    await createHabit(name)
    ;(e.target as HTMLFormElement).reset()
  }

  return (
    <WidgetShell
      title="Habits"
      link={{ to: '/habits' }}
      loading={isLoading || !habits}
      skeleton={
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <HabitSkeleton key={i} />
          ))}
        </div>
      }
    >
      <ul className="space-y-3 mb-6">
        {habits?.map((habit) => (
          <li
            key={habit.id}
            className="flex w-full max-w-md flex-col gap-6"
          >
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
                      <Badge
                        variant="secondary"
                        className="text-xs gap-1"
                      >
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
        {habits?.length === 0 && (
          <li className="text-center py-8 text-indigo-300/70">
            No habits yet. Create one below!
          </li>
        )}
      </ul>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input type="text" name="name" placeholder="Add a new habit..." />
      </form>
    </WidgetShell>
  )
}
