# Contributing

## Dev setup

```bash
pnpm install
cp .env.example .env   # fill in at least DATABASE_URL and SESSION_PASSWORD
pnpm db:push
pnpm dev
```

## Adding a new widget

Widgets are self-contained components that fetch their own data. Here's how to add one:

### 1. Create the component

Add a file in `src/components/widgets/`. Use `WidgetShell` for the standard card layout with title, link, and loading skeleton:

```tsx
import { WidgetShell } from '../WidgetShell'
import { useMyData } from '@/hooks/useMyData'

export function MyWidget() {
  const { data, isLoading } = useMyData()

  return (
    <WidgetShell
      title="My Widget"
      loading={isLoading}
      skeleton={<div>Loading...</div>}
    >
      {/* widget content */}
    </WidgetShell>
  )
}
```

### 2. Create a data hook (if needed)

Widgets that need server data follow this pattern — a `createServerFn` for the server call wrapped in a `useQuery` hook:

```tsx
// src/hooks/useMyData.ts
import { useQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

const getMyData = createServerFn({ method: 'GET' }).handler(async () => {
  // fetch from an API, database, etc.
})

export function useMyData() {
  return useQuery({
    queryKey: ['my-data'],
    queryFn: () => getMyData(),
    staleTime: 300000, // 5 minutes
  })
}
```

### 3. Register the widget

Add an entry in `src/lib/widgets.tsx`:

```tsx
import { MyWidget } from '@/components/widgets/MyWidget'
import { SomeIcon } from 'lucide-react'

// In the widgetRegistry object:
myWidget: {
  Icon: SomeIcon,
  component: MyWidget,
  label: 'My Widget',
  defaultColumn: 'center', // 'left' | 'center' | 'right'
},
```

That's it. The widget will appear in the settings popover and can be toggled on/dragged into the grid.

If the widget requires an OAuth connection, add its ID to the `needGoogle` or `needSpotify` arrays in the same file.

## Code style

- No semicolons, single quotes, trailing commas (Prettier handles this)
- Run `pnpm check` to auto-fix formatting and lint issues
- Run `pnpm test` before submitting

## Architecture notes

This is a **single-user, self-hosted** dashboard. There's no multi-tenancy — the `user` table has one row. Keep this in mind when contributing: features don't need user-scoping or access control beyond the single password-based session.
