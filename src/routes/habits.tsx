import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { HabitTracker } from '@/components/pages/habits/HabitTracker'
import { HabitStats } from '@/components/pages/habits/HabitStats'
import { useHabitsPage, getHabits } from '@/hooks/useHabitsPage'

export const Route = createFileRoute('/habits')({
  component: HabitsPage,
  loader: () => getHabits(),
})

function HabitsPage() {
  const loader = Route.useLoaderData()
  const {
    habits,
    days,
    range,
    setRange,
    toggleCompletion,
    deleteHabit,
    createHabit,
  } = useHabitsPage(loader)

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
        <HabitTracker
          habits={habits}
          days={days}
          onToggleCompletion={toggleCompletion}
          onDeleteHabit={deleteHabit}
          onCreateHabit={createHabit}
        />

        <div className="flex flex-col gap-4">
          <HabitStats habits={habits} />
        </div>
      </div>
    </div>
  )
}
