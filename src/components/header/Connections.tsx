import { borderAccentAtom, orangeAccentAtom } from '@/lib/atoms'
import {
  useGoogleConnected,
  useSpotifyConnected,
} from '@/lib/hooks/useAuthStatus'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { deleteMethod } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { useAtom } from 'jotai'
import { Check, Settings } from 'lucide-react'
import { Button } from '../ui/button'

const disconnectGoogleFn = createServerFn({
  method: 'POST',
}).handler(() => deleteMethod('/api/auth/google/status'))

const disconnectSpotifyFn = createServerFn({
  method: 'POST',
}).handler(() => deleteMethod('/api/auth/spotify/status'))

const BORDER_COLORS = [
  { label: 'Green', value: '#4ade80' },
  { label: 'Blue', value: '#60a5fa' },
  { label: 'Purple', value: '#c084fc' },
  { label: 'Pink', value: '#f472b6' },
  { label: 'Orange', value: '#fb923c' },
  { label: 'Red', value: '#f87171' },
  { label: 'Yellow', value: '#facc15' },
  { label: 'Cyan', value: '#22d3ee' },
]

const ACCENT_COLORS = [
  { label: 'Orange', value: 'hsl(24, 97%, 58%)' },
  { label: 'Blue', value: 'hsl(217, 91%, 60%)' },
  { label: 'Purple', value: 'hsl(271, 91%, 65%)' },
  { label: 'Pink', value: 'hsl(330, 81%, 60%)' },
  { label: 'Green', value: 'hsl(142, 71%, 45%)' },
  { label: 'Red', value: 'hsl(0, 84%, 60%)' },
  { label: 'Yellow', value: 'hsl(45, 93%, 47%)' },
  { label: 'Cyan', value: 'hsl(188, 94%, 43%)' },
]

export const Connections = () => {
  const [borderAccent, setBorderAccent] = useAtom(borderAccentAtom)
  const [orangeAccent, setOrangeAccent] = useAtom(orangeAccentAtom)

  const queryClient = useQueryClient()
  const { connected: googleConnected } = useGoogleConnected()
  const { connected: spotifyConnected } = useSpotifyConnected()
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="hover:text-orange-accent transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Border Color</p>
            <div className="flex flex-wrap gap-2">
              {BORDER_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setBorderAccent(color.value)}
                  className="w-7 h-7 rounded-full relative flex items-center justify-center ring-offset-background transition-all"
                  style={{
                    backgroundColor: color.value,
                    boxShadow:
                      borderAccent === color.value
                        ? `0 0 0 2px var(--background), 0 0 0 4px ${color.value}`
                        : 'none',
                  }}
                  title={color.label}
                >
                  {borderAccent === color.value && (
                    <Check className="w-3.5 h-3.5 text-black" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Accent Color</p>
            <div className="flex flex-wrap gap-2">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setOrangeAccent(color.value)}
                  className="w-7 h-7 rounded-full relative flex items-center justify-center ring-offset-background transition-all"
                  style={{
                    backgroundColor: color.value,
                    boxShadow:
                      orangeAccent === color.value
                        ? `0 0 0 2px var(--background), 0 0 0 4px ${color.value}`
                        : 'none',
                  }}
                  title={color.label}
                >
                  {orangeAccent === color.value && (
                    <Check className="w-3.5 h-3.5 text-black" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Google Account</p>
            {googleConnected ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-400">Connected</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await disconnectGoogleFn()
                    queryClient.invalidateQueries({
                      queryKey: ['google-status'],
                    })
                  }}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <a href="/api/auth/google">
                <Button variant="outline" size="sm" className="w-full">
                  Connect Google
                </Button>
              </a>
            )}
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Spotify Account</p>
            {spotifyConnected ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-400">Connected</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await disconnectSpotifyFn()
                    queryClient.invalidateQueries({
                      queryKey: ['spotify-status'],
                    })
                  }}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <a href="/api/auth/spotify">
                <Button variant="outline" size="sm" className="w-full">
                  Connect Spotify
                </Button>
              </a>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
