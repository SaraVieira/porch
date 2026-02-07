import { Calendar } from '@/components/widgets/calendar'
import { Links } from '@/components/widgets/Links'
import { YouTube } from '@/components/widgets/YouTube'
import { GitHub } from '@/components/widgets/GitHub'
import { Coolify } from '@/components/widgets/Coolify'
import { Weather } from '@/components/widgets/Widget'
import { Spotify } from '@/components/widgets/spotify'
import { Todos } from '@/components/widgets/Todos'
import { Habits } from '@/components/widgets/Habits'
import { Romm } from '@/components/widgets/romm'
import { Bookmarks } from '@/components/widgets/Bookmarks'
import { Rss } from '@/components/widgets/Rss'

type ColumnId = 'left' | 'center' | 'right'

export const widgetRegistry: Record<
  string,
  { component: React.ComponentType; label: string; defaultColumn: ColumnId }
> = {
  calendar: { component: Calendar, label: 'Calendar', defaultColumn: 'left' },
  links: { component: Links, label: 'Links', defaultColumn: 'center' },
  youtube: { component: YouTube, label: 'YouTube', defaultColumn: 'center' },
  github: { component: GitHub, label: 'GitHub', defaultColumn: 'center' },
  coolify: { component: Coolify, label: 'Coolify', defaultColumn: 'center' },
  weather: { component: Weather, label: 'Weather', defaultColumn: 'right' },
  spotify: { component: Spotify, label: 'Spotify', defaultColumn: 'right' },
  todos: { component: Todos, label: 'Todos', defaultColumn: 'right' },
  habits: { component: Habits, label: 'Habits', defaultColumn: 'right' },
  romm: { component: Romm, label: 'Romm', defaultColumn: 'right' },
  bookmarks: { component: Bookmarks, label: 'Bookmarks', defaultColumn: 'center' },
  rss: { component: Rss, label: 'RSS', defaultColumn: 'center' },
}

export const allWidgetIds = Object.keys(widgetRegistry)
