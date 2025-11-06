import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/card'
import { formatBytes } from '@/lib/utils'

export const Romm = () => {
  const { data: stats } = useQuery({
    queryKey: ['romm', 'stats'],
    queryFn: async () => {
      const res = await fetch('https://roms.iamsaravieira.com/api/stats').then(
        (res) => res.json(),
      )
      return res
    },
  })

  if (!stats) return null

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <h3 className="font-semibold">Romm Stats</h3>
        <a href="https://roms.iamsaravieira.com" target="_blank">
          <ArrowUpRight className="w-4 text-orange-accent" />
        </a>
      </CardHeader>
      <CardContent className="flex flex-row justify-between text-center">
        <div>
          <div className="color-primary text-base">{stats.PLATFORMS}</div>
          <span className="text-muted-foreground text-sm">Platforms</span>
        </div>
        <div>
          <div className="color-highlight size-h3">{stats.ROMS}</div>
          <span className="text-muted-foreground text-sm">Roms</span>
        </div>
        <div>
          <div className="color-highlight size-h3">
            {formatBytes(stats.TOTAL_FILESIZE_BYTES, 0)}
          </div>
          <span className="text-muted-foreground text-sm">Filesize</span>
        </div>
      </CardContent>
    </Card>
  )
}
