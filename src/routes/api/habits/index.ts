import { createFileRoute } from '@tanstack/react-router'
import { desc, eq } from 'drizzle-orm'
import { habits as habitsSchema, habitCompletions } from '@/db/schema'
import { db } from '@/db'
import { format, subDays, differenceInCalendarDays, parseISO } from 'date-fns'
import type { HabitWithStats } from '@/lib/types'
import { json } from '@/lib/api'

export const Route = createFileRoute('/api/habits/')({
  server: {
    handlers: {
      GET: GET,
      POST: POST,
    },
  },
})

function computeStreaks(completionDates: Array<string>) {
  if (completionDates.length === 0)
    return { currentStreak: 0, longestStreak: 0 }

  const sorted = [...completionDates].sort().reverse()
  const today = format(new Date(), 'yyyy-MM-dd')

  let currentStreak = 0
  let longestStreak = 0
  let streak = 1

  // Check if the streak starts today or yesterday
  const startDate = sorted[0]
  const daysSinceStart = differenceInCalendarDays(
    parseISO(today),
    parseISO(startDate),
  )
  if (daysSinceStart > 1) {
    // No current streak
    currentStreak = 0
  } else {
    currentStreak = 1
  }

  for (let i = 1; i < sorted.length; i++) {
    const diff = differenceInCalendarDays(
      parseISO(sorted[i - 1]),
      parseISO(sorted[i]),
    )
    if (diff === 1) {
      streak++
    } else {
      if (i === 1 || (currentStreak > 0 && streak > longestStreak)) {
        // nothing
      }
      longestStreak = Math.max(longestStreak, streak)
      streak = 1
    }
  }
  longestStreak = Math.max(longestStreak, streak)

  // Recalculate current streak properly
  if (daysSinceStart <= 1) {
    currentStreak = 1
    for (let i = 1; i < sorted.length; i++) {
      const diff = differenceInCalendarDays(
        parseISO(sorted[i - 1]),
        parseISO(sorted[i]),
      )
      if (diff === 1) {
        currentStreak++
      } else {
        break
      }
    }
  }

  return { currentStreak, longestStreak }
}

export async function GET() {
  try {
    const habits = await db!.query.habits.findMany({
      orderBy: [desc(habitsSchema.createdAt)],
    })

    const allCompletions = await db!.query.habitCompletions.findMany()

    const today = format(new Date(), 'yyyy-MM-dd')
    const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd')

    const habitsWithStats: Array<HabitWithStats> = habits.map((habit) => {
      const completions = allCompletions
        .filter((c) => c.habitId === habit.id)
        .map((c) => c.date)

      const { currentStreak, longestStreak } = computeStreaks(completions)

      const recentCompletions = completions.filter((d) => d >= thirtyDaysAgo)
      const completionRate =
        recentCompletions.length > 0
          ? Math.round((recentCompletions.length / 30) * 100)
          : 0

      return {
        ...habit,
        completions,
        currentStreak,
        longestStreak,
        completionRate,
        completedToday: completions.includes(today),
      }
    })

    return json(habitsWithStats)
  } catch (error) {
    console.error('Error fetching habits:', error)
    return json({ error: 'Failed to fetch habits' }, { status: 500 })
  }
}

export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json()
    const { name, emoji, color } = body

    const habit = await db!.insert(habitsSchema).values({
      name,
      emoji: emoji || '',
      color: color || '#8b5cf6',
    })

    return json(habit.rows, { status: 201 })
  } catch (error) {
    console.error('Error creating habit:', error)
    return json({ error: 'Failed to create habit' }, { status: 500 })
  }
}
