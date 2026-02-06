import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import clsx from 'clsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export default function Header({ user }: { user: { id: number } | null }) {
  const location = useLocation()
  const navigate = useNavigate()

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

        <Link to="/logout" className="underline underline-offset-4">
          Logout
        </Link>
      </div>
    </div>
  )
}
