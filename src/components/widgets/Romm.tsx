import { WidgetShell } from '../WidgetShell'
import { useRomm } from '@/hooks/useRomm'
import { formatBytes } from '@/lib/utils'
import { Item, ItemContent, ItemTitle, ItemActions } from '../ui/item'
import { ScrollArea } from '../ui/scroll-area'

export const Romm = () => {
  const { stats, platforms, isLoading } = useRomm()

  return (
    <WidgetShell
      title="Romm Stats"
      link={{ to: import.meta.env.VITE_PUBLIC_ROMM_URL || '#', external: true }}
      hideWhileLoading
      loading={isLoading || !stats}
      contentClassName="flex flex-col gap-4"
    >
      <div className="flex flex-row justify-between text-center">
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
      </div>
      {platforms.length > 0 && (
        <ScrollArea className="h-[400px]">
          <div className="flex flex-col gap-2">
            {platforms
              .filter((p) => p.rom_count > 0)
              .map((platform) => (
                <a
                  key={platform.id}
                  href={`${import.meta.env.VITE_PUBLIC_ROMM_URL}/platform/${platform.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Item variant="outline">
                    <ItemContent className="flex flex-row items-center gap-3">
                      <img
                        src={platform.icon}
                        alt={platform.display_name}
                        className="w-6 h-6 rounded object-contain"
                      />
                      <ItemTitle>{platform.display_name}</ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <span className="text-muted-foreground text-sm">
                        {platform.rom_count} roms
                      </span>
                    </ItemActions>
                  </Item>
                </a>
              ))}
          </div>
        </ScrollArea>
      )}
    </WidgetShell>
  )
}
