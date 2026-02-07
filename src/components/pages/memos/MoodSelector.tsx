import { MOODS } from '@/lib/consts'
import type { MoodType } from '@/lib/types'

type MoodSelectorProps = {
  selectedMood: MoodType
  onSelectMood: (mood: MoodType) => void
}

export function MoodSelector({ selectedMood, onSelectMood }: MoodSelectorProps) {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">
        How are you feeling?
      </label>
      <div className="grid grid-cols-3 gap-2">
        {MOODS.map((mood) => {
          const IconComponent = mood.icon
          return (
            <button
              key={mood.type}
              onClick={() => onSelectMood(mood.type)}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                selectedMood === mood.type
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span className="text-sm font-medium">{mood.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
