import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import clsx from 'clsx'
import { NavLink } from './NavLink'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { WidgetList } from './header/widgetList'
import { Connections } from './header/Connections'

export default function Header({ user }: { user: { id: number } | null }) {
  const location = useLocation()
  const navigate = useNavigate()

  if (!user) return null
  return (
    <div className="mt-4 pt-4 text-highlight container mx-auto rounded border-widget-content-border">
      <div className="header sm:flex padding-inline-widget widget-content-frame justify-between">
        <nav className="overflow-auto min-w-0 gap-8 h-full flex grow hide-scrollbars">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/matches">Matches</NavLink>
          <NavLink to="/upload">Upload</NavLink>
          <NavLink to="/habits">Habits</NavLink>
          <NavLink to="/youtube">YouTube</NavLink>
          <NavLink to="/rss">RSS</NavLink>
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
          <WidgetList />
          <Connections />
          <Link to="/logout" className="underline underline-offset-4">
            Logout
          </Link>
        </div>
      </div>
    </div>
  )
}
