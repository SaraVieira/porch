import { Link, useLocation } from '@tanstack/react-router'
import clsx from 'clsx'

export function NavLink({
  to,
  children,
}: {
  to: string
  children: React.ReactNode
}) {
  const location = useLocation()
  const isActive = location.pathname === to
  return (
    <Link
      to={to}
      className={clsx(
        isActive ? 'border-b-orange-accent' : 'border-b-transparent',
        'border-b-2 h-full block nav-item nav-item-current pb-2',
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Link>
  )
}
