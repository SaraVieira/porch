import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MOODS } from '@/lib/consts'
import type { Memo } from '@/lib/types'

type MoodOverviewProps = {
  memos: Array<Memo>
}

export function MoodOverview({ memos }: MoodOverviewProps) {
  if (memos.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {MOODS.map((mood) => {
            const count = memos.filter((m) => m.mood === mood.type).length
            const percentage =
              memos.length > 0 ? (count / memos.length) * 100 : 0
            const Icon = mood.icon

            if (count === 0) return null

            return (
              <div
                key={mood.type}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{mood.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">
                    {count}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
