import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Memo, MoodType } from '@/lib/types'
import { MOODS } from '@/lib/consts'

const getMoodInfo = (moodType: MoodType) => {
  return MOODS.find((mood) => mood.type === moodType) || MOODS[4]
}

type MemoCardProps = {
  memo: Memo
  onView: (memo: Memo) => void
  onDelete: (id: number) => void
}

export function MemoCard({ memo, onView, onDelete }: MemoCardProps) {
  const moodInfo = getMoodInfo(memo.mood as MoodType)
  const MoodIcon = moodInfo.icon

  return (
    <div
      className="p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm border-gray-200"
      onClick={() => onView(memo)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{memo.title}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className={moodInfo.color}>
              <MoodIcon className="w-3 h-3 mr-1" />
              {moodInfo.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {memo.updatedAt
                ? new Date(memo.updatedAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : ''}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(memo.id)
          }}
          className="text-red-500 hover:text-red-700"
        >
          ×
        </Button>
      </div>
      <div
        className="text-sm text-muted-foreground mt-2 line-clamp-2"
        dangerouslySetInnerHTML={{
          __html:
            memo.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...',
        }}
      />
    </div>
  )
}
