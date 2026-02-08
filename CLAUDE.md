# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Dev server on port 3000
pnpm build            # Production build (outputs to .output/)
pnpm start            # Run production build
pnpm test             # Run Vitest tests
pnpm typecheck        # TypeScript type checking
pnpm lint             # ESLint
pnpm format           # Prettier check
pnpm check            # Format + lint with --fix
pnpm knip             # Detect unused files/dependencies

# Database (Drizzle Kit)
pnpm db:generate      # Generate migrations from schema
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema directly (skip migrations)
pnpm db:studio        # Open Drizzle Studio
```

## Architecture

**Stack:** TanStack Start (React 19 + SSR) on Vite 7, Tailwind CSS 4, Drizzle ORM + PostgreSQL, jotai for client state.

**Widget system:** The app is a personal dashboard built around independent, draggable widgets. Each widget is self-contained — it fetches its own data via `createServerFn` + `useQuery` and renders inside a `<Card>`. Widget registry lives in `src/lib/widgets.tsx` mapping IDs to components/icons/labels/default columns.

**Data flow:** Widget → custom hook (e.g. `useTodos`) → `createServerFn` (server function) → API route → Drizzle DB query. React Query handles caching (typically 5-minute staleTime).

**Drag-and-drop:** `@dnd-kit/core` v6 + `@dnd-kit/sortable` v10 powers a 3-column grid (`src/components/WidgetGrid.tsx`). Layout persists to localStorage via jotai's `widgetLayoutAtom`.

**Theming:** Accent colors stored in jotai atoms, applied as CSS custom properties (`--color-border-accent`, `--color-orange-accent`). The `AccentApplicator` in `__root.tsx` syncs atoms to CSS vars.

**Auth:** Single-user app. Session via TanStack Start's `useSession`. Google and Spotify OAuth tokens stored in DB. Root route guards pages via `beforeLoad` redirect to `/login`.

**Routing:** File-based via TanStack Router. Route tree auto-generated at `src/routeTree.gen.ts`. API routes live under `src/routes/api/`.

## Key Files

- `src/lib/atoms.ts` — jotai atoms (layout, border/accent colors)
- `src/lib/widgets.tsx` — widget registry (ID → component mapping)
- `src/components/WidgetGrid.tsx` — DnD grid with 3 sortable columns
- `src/routes/__root.tsx` — jotai Provider + AccentApplicator + auth guard
- `src/components/Header.tsx` — settings popover with color pickers + OAuth connections
- `src/db/schema.ts` — full database schema

## Gotchas

- `pnpm build` produces node:crypto externalization warnings — pre-existing and expected
- Database code guards against client-side access with `typeof window === 'undefined'`
- Password hashing uses a random per-user salt stored in the `user` table (`salt` column). Old users without a salt fall back to `'salt'` for backwards compat.
- Prettier config: no semicolons, single quotes, trailing commas
- shadcn/ui components (New York style) in `src/components/ui/` — knip ignores these
- External services: Open-Meteo (weather), GitHub API, Google APIs (Calendar/YouTube/Tasks), Spotify API, Coolify, Zipline (image hosting), Romm (retro gaming)
