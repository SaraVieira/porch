# Porch

A personal, self-hosted dashboard built with TanStack Start. It's a single-user app designed to be your browser's start page — a central place for weather, calendars, todos, music, bookmarks, RSS feeds, and more.

This is **not** a multi-user platform. It's designed for one person to self-host for themselves.

## Widgets

| Widget    | Service needed   | Required env vars                                                    |
| --------- | ---------------- | -------------------------------------------------------------------- |
| Calendar  | Google Calendar  | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`    |
| YouTube   | Google/YouTube   | Same as Calendar (shared Google OAuth)                               |
| Todos     | Google Tasks     | Same as Calendar (shared Google OAuth)                               |
| Spotify   | Spotify          | `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REDIRECT_URI` |
| GitHub    | GitHub API       | `GITHUB_TOKEN`, `GITHUB_USERNAME`                                    |
| Weather   | Open-Meteo       | None (defaults to London; set `VITE_WEATHER_*` to change)            |
| Coolify   | Coolify instance | `COOLIFY_TOKEN`, `COOLIFY_URL`                                       |
| Romm      | Romm instance    | `ROMM_USERNAME`, `ROMM_PASSWORD`, `VITE_PUBLIC_ROMM_URL`             |
| Bookmarks | —                | None                                                                 |
| Habits    | —                | None                                                                 |
| Links     | —                | None                                                                 |
| RSS       | —                | None                                                                 |

Widgets are draggable into a 3-column grid. Layout is saved to localStorage. You can toggle which widgets are visible in the settings popover.

## Prerequisites

- Node.js 20+
- PostgreSQL
- pnpm

## Setup

```bash
# Install dependencies
pnpm install

# Copy env file and fill in your values
cp .env.example .env

# Push the database schema
pnpm db:push

# Start the dev server
pnpm dev
```

The app runs at `http://localhost:3000`. On first visit you'll be redirected to sign up and create a password.

## Setting up OAuth

### Google (Calendar, YouTube, Todos)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID (Web application)
3. Add `http://localhost:3000/api/auth/google/callback` as an authorized redirect URI
4. Enable the Google Calendar API, YouTube Data API v3, and Google Tasks API
5. Copy the client ID and secret into your `.env`

### Spotify

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add `http://localhost:3000/api/auth/spotify/callback` as a redirect URI
4. Copy the client ID and secret into your `.env`

### Weather location

The weather widget defaults to London. To change it, set these in your `.env`:

```bash
VITE_WEATHER_LATITUDE=40.7128
VITE_WEATHER_LONGITUDE=-74.0060
VITE_WEATHER_TIMEZONE=America/New_York
VITE_WEATHER_LOCATION=New York, United States
```

Find your coordinates at [latlong.net](https://www.latlong.net). Timezone values use the [IANA format](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

## Commands

```bash
pnpm dev          # Dev server (port 3000)
pnpm build        # Production build
pnpm start        # Run production build
pnpm test         # Run tests
pnpm typecheck    # Type check
pnpm lint         # Lint
pnpm check        # Format + lint with --fix
```

### Database

```bash
pnpm db:push      # Push schema to DB (quickest for dev)
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Drizzle Studio
```

## Tech stack

- [TanStack Start](https://tanstack.com/start) (React 19 + SSR)
- [TanStack Router](https://tanstack.com/router) (file-based routing)
- [TanStack React Query](https://tanstack.com/query) (data fetching)
- [Drizzle ORM](https://orm.drizzle.team/) + PostgreSQL
- [Tailwind CSS 4](https://tailwindcss.com/)
- [jotai](https://jotai.org/) (client state)
- [dnd-kit](https://dndkit.com/) (drag and drop)
- [shadcn/ui](https://ui.shadcn.com/) (UI components)

## License

[MIT](LICENSE)
