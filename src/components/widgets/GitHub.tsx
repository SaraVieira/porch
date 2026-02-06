import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Skeleton } from '../ui/skeleton'
import { GitHubHeatmap } from './GitHubHeatmap'
import type { GitHubContributionsData } from '@/lib/types'

const fetchContributions = () =>
  fetch('/api/github').then((r) => r.json()) as Promise<GitHubContributionsData>

function HeatmapSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-[86px] w-full rounded" />
      <div className="flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-16" />
        ))}
      </div>
    </div>
  )
}

export const GitHub = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['github', 'contributions'],
    queryFn: fetchContributions,
    staleTime: 30 * 60 * 1000,
  })

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <h3 className="font-semibold">GitHub</h3>
        <a
          href="https://github.com/SaraVieira"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ArrowUpRight className="w-4 text-orange-accent" />
        </a>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <HeatmapSkeleton />
        ) : (
          <div className="flex flex-col gap-3">
            <GitHubHeatmap weeks={data.weeks} />
            <div className="flex gap-4 text-center flex-wrap">
              <div>
                <div className="text-base font-medium">
                  {data.totalContributions.toLocaleString()}
                </div>
                <span className="text-muted-foreground text-xs">Year</span>
              </div>
              <div>
                <div className="text-base font-medium">
                  {data.currentStreak}
                </div>
                <span className="text-muted-foreground text-xs">Streak</span>
              </div>
              <div>
                <div className="text-base font-medium">
                  {data.thisWeekCount}
                </div>
                <span className="text-muted-foreground text-xs">Week</span>
              </div>
              <div>
                <div className="text-base font-medium">{data.todayCount}</div>
                <span className="text-muted-foreground text-xs">Today</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
