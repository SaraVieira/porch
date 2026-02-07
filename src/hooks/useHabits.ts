import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import type { HabitWithStats } from '@/lib/types'

const fetchHabits = () =>
  fetch('/api/habits').then((r) => r.json()) as Promise<Array<HabitWithStats>>

export function useHabits() {
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

  const createHabit = async (name: string) => {
    await fetch('/api/habits', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
    queryClient.invalidateQueries({ queryKey: ['habits'] })
  }

  return { habits, isLoading, toggleCompletion, deleteHabit, createHabit }
}
