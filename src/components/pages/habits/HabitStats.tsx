import { Flame, Trophy, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { HabitWithStats } from '@/lib/types'

type HabitStatsProps = {
  habits: Array<HabitWithStats>
}

export function HabitStats({ habits }: HabitStatsProps) {
  if (habits.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Add habits to see stats here
        </CardContent>
      </Card>
    )
  }

  return (
    <>
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
                <Badge variant="secondary">
                  {habit.currentStreak} days
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Trophy className="w-4 h-4" />
                  Longest streak
                </div>
                <Badge variant="secondary">
                  {habit.longestStreak} days
                </Badge>
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
    </>
  )
}
