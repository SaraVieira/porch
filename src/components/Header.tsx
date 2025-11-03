import { useLocation } from '@tanstack/react-router'
import clsx from 'clsx'

export default function Header() {
  const location = useLocation()

  return (
    <div className="bg-widget-background mt-4 pt-4 text-highlight container mx-auto rounded border-widget-content-border">
      <div className="header flex padding-inline-widget widget-content-frame">
        <nav className="overflow-auto min-w-0 gap-8 h-full flex grow hide-scrollbars ml-12">
          <a
            href="/"
            className={clsx(
              location.pathname === '/'
                ? 'border-b-orange-accent'
                : 'border-b-transparent ',
              'border-b-2 h-full block nav-item nav-item-current pb-2',
            )}
            aria-current="page"
          >
            Home
          </a>
          <a
            href="/matches"
            className={clsx(
              location.pathname === '/matches'
                ? 'border-b-orange-accent'
                : 'border-b-transparent ',
              'border-b-2 h-full block nav-item nav-item-current pb-2',
            )}
            aria-current="page"
          >
            Matches
          </a>
          <a
            href="/upload"
            className={clsx(
              location.pathname === '/upload'
                ? 'border-b-orange-accent'
                : 'border-b-transparent ',
              'border-b-2 h-full block nav-item nav-item-current pb-2',
            )}
            aria-current="page"
          >
            Upload
          </a>
          <a
            href="/memos"
            className={clsx(
              location.pathname === '/memos'
                ? 'border-b-orange-accent'
                : 'border-b-transparent ',
              'border-b-2 h-full block nav-item nav-item-current pb-2',
            )}
            aria-current="page"
          >
            Memos
          </a>
        </nav>
      </div>
    </div>
  )
}
