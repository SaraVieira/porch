import { Skeleton } from '../ui/skeleton'
import { WidgetShell } from '../WidgetShell'
import { GitHubHeatmap } from './GitHubHeatmap'
import { useGitHub } from '@/hooks/useGitHub'

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
  const { data, isLoading } = useGitHub()

  return (
    <WidgetShell
      title="GitHub"
      link={{ to: 'https://github.com/SaraVieira', external: true }}
      loading={isLoading || !data}
      skeleton={<HeatmapSkeleton />}
    >
      <div className="flex flex-col gap-3">
        <GitHubHeatmap weeks={data!.weeks} />
        <div className="flex gap-4 text-center flex-wrap">
          <div>
            <div className="text-base font-medium">
              {data!.totalContributions.toLocaleString()}
            </div>
            <span className="text-muted-foreground text-xs">Year</span>
          </div>
          <div>
            <div className="text-base font-medium">{data!.currentStreak}</div>
            <span className="text-muted-foreground text-xs">Streak</span>
          </div>
          <div>
            <div className="text-base font-medium">{data!.thisWeekCount}</div>
            <span className="text-muted-foreground text-xs">Week</span>
          </div>
          <div>
            <div className="text-base font-medium">{data!.todayCount}</div>
            <span className="text-muted-foreground text-xs">Today</span>
          </div>
        </div>
      </div>
    </WidgetShell>
  )
}
