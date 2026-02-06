import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import clsx from 'clsx'
import { Settings, Check, LayoutGrid } from 'lucide-react'
import { useAtom } from 'jotai'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover'
import { Checkbox } from './ui/checkbox'
import { borderAccentAtom, orangeAccentAtom, widgetLayoutAtom } from '@/lib/atoms'
import { widgetRegistry, allWidgetIds } from '@/lib/widgets'

const BORDER_COLORS = [
  { label: 'Green', value: '#4ade80' },
  { label: 'Blue', value: '#60a5fa' },
  { label: 'Purple', value: '#c084fc' },
  { label: 'Pink', value: '#f472b6' },
  { label: 'Orange', value: '#fb923c' },
  { label: 'Red', value: '#f87171' },
  { label: 'Yellow', value: '#facc15' },
  { label: 'Cyan', value: '#22d3ee' },
]

const ACCENT_COLORS = [
  { label: 'Orange', value: 'hsl(24, 97%, 58%)' },
  { label: 'Blue', value: 'hsl(217, 91%, 60%)' },
  { label: 'Purple', value: 'hsl(271, 91%, 65%)' },
  { label: 'Pink', value: 'hsl(330, 81%, 60%)' },
  { label: 'Green', value: 'hsl(142, 71%, 45%)' },
  { label: 'Red', value: 'hsl(0, 84%, 60%)' },
  { label: 'Yellow', value: 'hsl(45, 93%, 47%)' },
  { label: 'Cyan', value: 'hsl(188, 94%, 43%)' },
]

export default function Header({ user }: { user: { id: number } | null }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [borderAccent, setBorderAccent] = useAtom(borderAccentAtom)
  const [orangeAccent, setOrangeAccent] = useAtom(orangeAccentAtom)
  const [layout, setLayout] = useAtom(widgetLayoutAtom)

  const visibleWidgets = new Set([
    ...layout.left,
    ...layout.center,
    ...layout.right,
  ])

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

  if (!user) return null
  return (
    <div className="mt-4 pt-4 text-highlight container mx-auto rounded border-widget-content-border">
      <div className="header flex padding-inline-widget widget-content-frame justify-between">
        <nav className="overflow-auto min-w-0 gap-8 h-full flex grow hide-scrollbars">
          <Link
            to="/"
            className={clsx(
              location.pathname === '/'
                ? 'border-b-orange-accent'
                : 'border-b-transparent ',
              'border-b-2 h-full block nav-item nav-item-current pb-2',
            )}
            aria-current="page"
          >
            Home
          </Link>
          <Link
            to="/matches"
            className={clsx(
              location.pathname === '/matches'
                ? 'border-b-orange-accent'
                : 'border-b-transparent ',
              'border-b-2 h-full block nav-item nav-item-current pb-2',
            )}
            aria-current="page"
          >
            Matches
          </Link>
          <Link
            to="/upload"
            className={clsx(
              location.pathname === '/upload'
                ? 'border-b-orange-accent'
                : 'border-b-transparent ',
              'border-b-2 h-full block nav-item nav-item-current pb-2',
            )}
            aria-current="page"
          >
            Upload
          </Link>
          <Link
            to="/memos"
            className={clsx(
              location.pathname === '/memos'
                ? 'border-b-orange-accent'
                : 'border-b-transparent ',
              'border-b-2 h-full block nav-item nav-item-current pb-2',
            )}
            aria-current="page"
          >
            Memos
          </Link>
          <Link
            to="/habits"
            className={clsx(
              location.pathname === '/habits'
                ? 'border-b-orange-accent'
                : 'border-b-transparent ',
              'border-b-2 h-full block nav-item nav-item-current pb-2',
            )}
            aria-current="page"
          >
            Habits
          </Link>
          <Link
            to="/youtube"
            className={clsx(
              location.pathname === '/youtube'
                ? 'border-b-orange-accent'
                : 'border-b-transparent ',
              'border-b-2 h-full block nav-item nav-item-current pb-2',
            )}
            aria-current="page"
          >
            YouTube
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className={clsx(
                  location.pathname.includes('books')
                    ? 'border-b-orange-accent'
                    : 'border-b-transparent ',
                  'cursor-pointer',
                )}
                aria-current="page"
              >
                The Books
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuItem
                onClick={() =>
                  navigate({
                    to: '/books/games',
                  })
                }
              >
                Games
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  navigate({
                    to: '/books/conferences',
                  })
                }
              >
                Conferences
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  navigate({
                    to: '/books/countries',
                  })
                }
              >
                Countries
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <button className="hover:text-orange-accent transition-colors">
                <LayoutGrid className="w-5 h-5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-52" align="end">
              <p className="text-sm font-medium mb-3">Widgets</p>
              <div className="space-y-2">
                {allWidgetIds.map((id) => (
                  <label
                    key={id}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <Checkbox
                      checked={visibleWidgets.has(id)}
                      onCheckedChange={() => toggleWidget(id)}
                    />
                    {widgetRegistry[id].label}
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <button className="hover:text-orange-accent transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Border Color</p>
                  <div className="flex flex-wrap gap-2">
                    {BORDER_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setBorderAccent(color.value)}
                        className="w-7 h-7 rounded-full relative flex items-center justify-center ring-offset-background transition-all"
                        style={{
                          backgroundColor: color.value,
                          boxShadow:
                            borderAccent === color.value
                              ? `0 0 0 2px var(--background), 0 0 0 4px ${color.value}`
                              : 'none',
                        }}
                        title={color.label}
                      >
                        {borderAccent === color.value && (
                          <Check className="w-3.5 h-3.5 text-black" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Accent Color</p>
                  <div className="flex flex-wrap gap-2">
                    {ACCENT_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setOrangeAccent(color.value)}
                        className="w-7 h-7 rounded-full relative flex items-center justify-center ring-offset-background transition-all"
                        style={{
                          backgroundColor: color.value,
                          boxShadow:
                            orangeAccent === color.value
                              ? `0 0 0 2px var(--background), 0 0 0 4px ${color.value}`
                              : 'none',
                        }}
                        title={color.label}
                      >
                        {orangeAccent === color.value && (
                          <Check className="w-3.5 h-3.5 text-black" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Link to="/logout" className="underline underline-offset-4">
            Logout
          </Link>
        </div>
      </div>
    </div>
  )
}
