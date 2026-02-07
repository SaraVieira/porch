import { format } from 'date-fns'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'
import type { GitHubContributionWeek } from '@/lib/types'

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]
const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

function getMonthLabels(weeks: Array<GitHubContributionWeek>) {
  const labels: Array<{ label: string; column: number }> = []
  let lastMonth = -1

  for (let i = 0; i < weeks.length; i++) {
    const firstDay = weeks[i].contributionDays[0]
    if (!firstDay) continue
    const month = new Date(firstDay.date).getMonth()
    if (month !== lastMonth) {
      labels.push({ label: MONTHS[month], column: i })
      lastMonth = month
    }
  }

  return labels
}

export function GitHubHeatmap({
  weeks,
}: {
  weeks: Array<GitHubContributionWeek>
}) {
  const monthLabels = getMonthLabels(weeks)

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-[2px]">
        {/* Day labels */}
        <div className="flex flex-col gap-[2px] pr-1 shrink-0">
          {DAYS.map((day, i) => (
            <div
              key={i}
              className="h-[10px] text-[9px] leading-[10px] text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex flex-col gap-0">
          {/* Month labels row */}
          <div className="flex gap-[2px] mb-[2px]">
            {weeks.map((_, i) => {
              const label = monthLabels.find((m) => m.column === i)
              return (
                <div
                  key={i}
                  className="w-[10px] text-[9px] leading-[10px] text-muted-foreground"
                >
                  {label?.label || ''}
                </div>
              )
            })}
          </div>

          {/* Grid of contribution squares */}
          <div
            className="grid gap-[2px]"
            style={{
              gridTemplateRows: 'repeat(7, 10px)',
              gridTemplateColumns: `repeat(${weeks.length}, 10px)`,
              gridAutoFlow: 'column',
            }}
          >
            {weeks.map((week) =>
              week.contributionDays.map((day) => (
                <Tooltip key={day.date}>
                  <TooltipTrigger asChild>
                    <div
                      className="w-[10px] h-[10px] rounded-[2px]"
                      style={{ backgroundColor: day.color }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    {day.contributionCount} contribution
                    {day.contributionCount !== 1 ? 's' : ''} on{' '}
                    {format(new Date(day.date), 'MMM d, yyyy')}
                  </TooltipContent>
                </Tooltip>
              )),
            )}
          </div>
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
