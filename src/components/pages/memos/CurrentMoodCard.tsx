import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MOODS } from '@/lib/consts'
import type { MoodType } from '@/lib/types'

type CurrentMoodCardProps = {
  selectedMood: MoodType
}

export function CurrentMoodCard({ selectedMood }: CurrentMoodCardProps) {
  const currentMood = MOODS.find((m) => m.type === selectedMood)
  if (!currentMood) return null
  const IconComponent = currentMood.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Current Mood</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-primary/10">
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <p className="font-medium">{currentMood.label}</p>
            <Badge className={currentMood.color}>
              {currentMood.label}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
