import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardHeader } from './ui/card'

type WidgetShellProps = {
  title?: string
  link?: { to: string; external?: boolean }
  headerActions?: React.ReactNode
  loading?: boolean
  skeleton?: React.ReactNode
  hideWhileLoading?: boolean
  children: React.ReactNode
  contentClassName?: string
}

export function WidgetShell({
  title,
  link,
  headerActions,
  loading,
  skeleton,
  hideWhileLoading,
  children,
  contentClassName,
}: WidgetShellProps) {
  if (hideWhileLoading && loading) return null

  const showHeader = title || link || headerActions

  return (
    <Card>
      {showHeader && (
        <CardHeader className="flex justify-between items-center">
          {title && <h3 className="font-semibold">{title}</h3>}
          <div className="flex items-center gap-2">
            {headerActions}
            {link &&
              (link.external ? (
                <a href={link.to} target="_blank" rel="noopener noreferrer">
                  <ArrowUpRight className="w-4 text-orange-accent" />
                </a>
              ) : (
                <Link to={link.to}>
                  <ArrowUpRight className="w-4 text-orange-accent" />
                </Link>
              ))}
          </div>
        </CardHeader>
      )}
      <CardContent className={contentClassName}>
        {loading && skeleton ? skeleton : children}
      </CardContent>
    </Card>
  )
}
