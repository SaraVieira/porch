import { useState } from 'react'
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { eachDayOfInterval, subDays } from 'date-fns'
import { get } from '@/lib/utils'
import type { HabitWithStats } from '@/lib/types'

export const getHabits = createServerFn({
  method: 'GET',
}).handler(() => get('/api/habits') as Promise<Array<HabitWithStats>>)

export function useHabitsPage(loader: Array<HabitWithStats>) {
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

  const createHabit = async (name: string) => {
    await fetch('/api/habits', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
    queryClient.invalidateQueries({ queryKey: ['habits'] })
  }

  return {
    habits,
    days,
    range,
    setRange,
    toggleCompletion,
    deleteHabit,
    createHabit,
  }
}
