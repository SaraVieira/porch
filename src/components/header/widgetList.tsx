import { LayoutGrid } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import {
  allWidgetIds,
  needGoogle,
  needSpotify,
  widgetRegistry,
} from '@/lib/widgets'
import { Checkbox } from '../ui/checkbox'
import { widgetLayoutAtom } from '@/lib/atoms'
import { useAtom } from 'jotai'
import {
  useGoogleConnected,
  useSpotifyConnected,
} from '@/lib/hooks/useAuthStatus'

export const WidgetList = () => {
  const [layout, setLayout] = useAtom(widgetLayoutAtom)
  const visibleWidgets = new Set([
    ...layout.left,
    ...layout.center,
    ...layout.right,
  ])
  const { connected: googleConnected } = useGoogleConnected()
  const { connected: spotifyConnected } = useSpotifyConnected()

  const toggleWidget = (widgetId: string) => {
    if (visibleWidgets.has(widgetId)) {
      setLayout((prev) => ({
        left: prev.left.filter((id) => id !== widgetId),
        center: prev.center.filter((id) => id !== widgetId),
        right: prev.right.filter((id) => id !== widgetId),
      }))
    } else {
      const defaultCol = widgetRegistry[widgetId].defaultColumn
      setLayout((prev) => ({
        ...prev,
        [defaultCol]: [...prev[defaultCol], widgetId],
      }))
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="hover:text-orange-accent transition-colors">
          <LayoutGrid className="w-5 h-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-52" align="end">
        <p className="text-sm font-medium mb-3">Widgets</p>
        <div className="space-y-2">
          {allWidgetIds.map((id) => {
            const Icon = widgetRegistry[id].Icon as
              | React.ComponentType<{ className?: string }>
              | undefined
            return (
              <label
                key={id}
                className="flex items-center gap-2 cursor-pointer text-sm"
              >
                <Checkbox
                  disabled={
                    (needGoogle.includes(id) && !googleConnected) ||
                    (needSpotify.includes(id) && !spotifyConnected)
                  }
                  checked={visibleWidgets.has(id)}
                  onCheckedChange={() => toggleWidget(id)}
                />
                {Icon && <Icon className="w-4 h-4" />}
                {widgetRegistry[id].label}
              </label>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
