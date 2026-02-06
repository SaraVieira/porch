# YouTube Subscriptions Feed

## Context
You watch a lot of YouTube and want your subscription feed to show up on the homepage. The CSV from Google Takeout has 655 channels. We'll use YouTube's public RSS feeds (`/feeds/videos.xml?channel_id=X`) — no API key, no OAuth, no quotas.

## Files to create/modify

| File | Action |
|------|--------|
| `package.json` | Add `fast-xml-parser` |
| `src/lib/types.ts` | Add `YouTubeVideo` and `YouTubeChannel` types |
| `src/lib/youtube.ts` | **Create** — core service: CSV parsing, RSS fetching, caching |
| `src/components/widgets/YouTube.tsx` | **Create** — dashboard widget |
| `src/routes/index.tsx` | Add `<YouTube />` widget to the grid |
| `src/routes/youtube.tsx` | **Create** — full page view |
| `src/components/Header.tsx` | Add "YouTube" nav link |

## Implementation

### 1. Install `fast-xml-parser`
Zero-dependency XML parser for parsing YouTube Atom RSS feeds.

### 2. `src/lib/youtube.ts` — Core service
- **CSV parsing**: Import `subscriptions.csv` using Vite's `?raw` import (bundles into the build, no `fs` needed)
- **RSS fetching**: For each channel, fetch `https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID`
- **Concurrency**: Batch 30 parallel requests at a time (655 channels = ~22 batches)
- **Per-channel error handling**: 5-second timeout per fetch, failures return `[]` silently
- **In-memory cache**: 30-minute TTL with stale-while-revalidate — returns stale data immediately while refreshing in the background
- **First load**: Shows loading skeleton, fetches in background (~30-60s for all channels)
- Exports `getYouTubeVideos(limit?)` — returns videos sorted newest-first

### 3. `src/components/widgets/YouTube.tsx` — Dashboard widget
- Uses `useQuery` (NOT `useSuspenseQuery`) so it doesn't block the dashboard
- Shows skeleton loaders while fetching, following the Romm widget pattern
- Displays ~12 latest videos in a scrollable list: thumbnail + title + channel name + relative time
- Links out to YouTube on click
- Header links to the full `/youtube` page

### 4. Dashboard integration (`src/routes/index.tsx`)
- Add `<YouTube />` in the middle column below `<Coolify />`
- No changes to the route loader — the widget fetches independently via React Query

### 5. Full page (`src/routes/youtube.tsx`)
- Grid of video cards (responsive 1-4 columns)
- Search/filter by video title or channel name
- Shows ~200 latest videos
- Uses `createServerFn` + route loader (can wait on first load since it's a dedicated page)

### 6. Navigation (`src/components/Header.tsx`)
- Add "YouTube" link between "Memos" and "The Books"

## Verification
1. Run `pnpm dev` and open `http://localhost:3000/`
2. YouTube widget should appear in the middle column with skeleton loading, then populate with video thumbnails
3. Navigate to `/youtube` for the full page grid with search
4. Check that "YouTube" link appears in the header nav
5. Verify clicking a video opens YouTube in a new tab
