import clsx from 'clsx'
import { ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import type { IconType } from 'react-icons/lib'

type Link = {
  category: string
  color: string
  links: Array<{
    title: string
    link: string
    Icon: IconType
  }>
}
export const Links = ({ groups }: { groups: Array<Link> }) => {
  return (
    <Card>
      <CardContent className="md:grid grid-cols-3 gap-3">
        {groups.map((group, i) => (
          <div className={clsx(i > 0 && 'mt-8 md:mt-0')}>
            <h3 className={clsx('mb-2', group.color)}>{group.category}</h3>
            <ul>
              {group.links.map((link) => (
                <li className="flex gap-2 mb-1 items-center">
                  <div className="text-muted-foreground">{link.Icon({})}</div>
                  <div className="flex items-start gap-1">
                    <a href={link.link} target="_blank">
                      {link.title}
                    </a>
                    <ArrowUpRight className={clsx('w-3', group.color)} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
