import { atomWithStorage } from 'jotai/utils'

export const widgetLayoutAtom = atomWithStorage('widget-layout', {
  left: ['calendar'],
  center: ['links', 'youtube', 'github', 'bookmarks', 'rss'],
  right: ['weather', 'spotify', 'todos', 'habits'],
})

export const borderAccentAtom = atomWithStorage('border-accent', '#4ade80')
export const orangeAccentAtom = atomWithStorage(
  'orange-accent',
  'hsl(24, 97%, 58%)',
)
