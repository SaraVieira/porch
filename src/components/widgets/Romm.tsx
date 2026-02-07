import { WidgetShell } from '../WidgetShell'
import { useRomm } from '@/hooks/useRomm'
import { formatBytes } from '@/lib/utils'

export const Romm = () => {
  const { stats, isLoading } = useRomm()

  return (
    <WidgetShell
      title="Romm Stats"
      link={{ to: 'https://roms.iamsaravieira.com', external: true }}
      hideWhileLoading
      loading={isLoading || !stats}
      contentClassName="flex flex-row justify-between text-center"
    >
      <div>
        <div className="color-primary text-base">{stats?.PLATFORMS}</div>
        <span className="text-muted-foreground text-sm">Platforms</span>
      </div>
      <div>
        <div className="color-highlight size-h3">{stats?.ROMS}</div>
        <span className="text-muted-foreground text-sm">Roms</span>
      </div>
      <div>
        <div className="color-highlight size-h3">
          {stats && formatBytes(stats.TOTAL_FILESIZE_BYTES, 0)}
        </div>
        <span className="text-muted-foreground text-sm">Filesize</span>
      </div>
    </WidgetShell>
  )
}
