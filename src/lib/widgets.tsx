import { Calendar as CalendarComponent } from '@/components/widgets/Calendar'
import { Links } from '@/components/widgets/Links'
import { YouTube } from '@/components/widgets/YouTube'
import { GitHub } from '@/components/widgets/GitHub'
import { Coolify } from '@/components/widgets/Coolify'
import { Weather } from '@/components/widgets/Widget'
import { Spotify } from '@/components/widgets/Spotify'
import { Todos } from '@/components/widgets/Todos'
import { Habits } from '@/components/widgets/Habits'
import { Romm } from '@/components/widgets/Romm'
import { MdGames } from 'react-icons/md'
import { Bookmarks } from '@/components/widgets/Bookmarks'
import { Rss } from '@/components/widgets/Rss'
import { Calendar } from 'lucide-react'
import { RiLinksFill } from 'react-icons/ri'
import { PiBookmarkFill } from 'react-icons/pi'
import { IoLogoRss } from 'react-icons/io'
import { FaListCheck } from 'react-icons/fa6'
import { SiGithub, SiGoogletasks, SiSpotify, SiYoutube } from 'react-icons/si'
import { FiServer } from 'react-icons/fi'
import { TiWeatherPartlySunny } from 'react-icons/ti'

type ColumnId = 'left' | 'center' | 'right'

export const widgetRegistry: Record<
  string,
  {
    Icon?: React.ComponentType
    component: React.ComponentType
    label: string
    defaultColumn: ColumnId
  }
> = {
  calendar: {
    Icon: Calendar,
    component: CalendarComponent,
    label: 'Calendar',
    defaultColumn: 'left',
  },
  links: {
    Icon: RiLinksFill,
    component: Links,
    label: 'Links',
    defaultColumn: 'center',
  },
  youtube: {
    Icon: SiYoutube,
    component: YouTube,
    label: 'YouTube',
    defaultColumn: 'center',
  },
  github: {
    Icon: SiGithub,
    component: GitHub,
    label: 'GitHub',
    defaultColumn: 'center',
  },
  coolify: {
    Icon: FiServer,
    component: Coolify,
    label: 'Coolify',
    defaultColumn: 'center',
  },
  weather: {
    Icon: TiWeatherPartlySunny,
    component: Weather,
    label: 'Weather',
    defaultColumn: 'right',
  },
  spotify: {
    Icon: SiSpotify,
    component: Spotify,
    label: 'Spotify',
    defaultColumn: 'right',
  },
  todos: {
    Icon: SiGoogletasks,
    component: Todos,
    label: 'Todos',
    defaultColumn: 'right',
  },
  habits: {
    Icon: FaListCheck,
    component: Habits,
    label: 'Habits',
    defaultColumn: 'right',
  },
  romm: {
    Icon: MdGames,
    component: Romm,
    label: 'Romm',
    defaultColumn: 'right',
  },
  bookmarks: {
    Icon: PiBookmarkFill,
    component: Bookmarks,
    label: 'Bookmarks',
    defaultColumn: 'center',
  },
  rss: {
    Icon: IoLogoRss,
    component: Rss,
    label: 'RSS',
    defaultColumn: 'center',
  },
}

export const needGoogle = ['calendar', 'youtube', 'todos']
export const needSpotify = ['spotify']

export const allWidgetIds = Object.keys(widgetRegistry)
