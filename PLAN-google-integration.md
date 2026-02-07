# Google Integration Plan: Tasks + Calendar

## Goal

Replace the DeskBuddy middleman for calendar events with direct Google Calendar API access, and sync Todos bidirectionally with Google Tasks — making this a fully usable daily driver.

---

## Current State

| Feature  | Current                                                      | Target                                          |
| -------- | ------------------------------------------------------------ | ----------------------------------------------- |
| Calendar | Fetches from `deskbuddy.deploy.iamsaravieira.com/events/all` | Direct Google Calendar API                      |
| Todos    | Local PostgreSQL only, basic fields                          | Synced with Google Tasks, expanded schema       |
| Auth     | Password-only, session-based                                 | Keep existing + add Google OAuth for API access |
| YouTube  | RSS feed parsing (no API key)                                | No change needed                                |

---

## Phase 1: Google OAuth Foundation

This is the prerequisite for everything else. Single user app, so the flow is simple.

### 1.1 Google Cloud Console Setup (manual)

- Create a project in Google Cloud Console
- Enable **Google Calendar API** and **Google Tasks API**
- Create OAuth 2.0 credentials (Web application)
- Set redirect URI to `http://localhost:3000/api/auth/google/callback` (and production URL)
- Download client ID + client secret

### 1.2 Environment Variables

```env
# .env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### 1.3 DB Schema: Google Tokens Table

```ts
// src/db/schema.ts
export const googleTokens = pgTable('google_tokens', {
  id: serial('id').primaryKey(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  scope: text('scope').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
```

Single row table (single user app). Store refresh token to get new access tokens without re-auth.

### 1.4 API Routes

**`src/routes/api/auth/google/index.ts`** — GET: Redirect to Google OAuth consent screen

- Scopes: `https://www.googleapis.com/auth/calendar.readonly`, `https://www.googleapis.com/auth/tasks`
- Set `access_type=offline` and `prompt=consent` to get refresh token

**`src/routes/api/auth/google/callback.ts`** — GET: Handle OAuth callback

- Exchange auth code for tokens
- Store in `google_tokens` table
- Redirect back to dashboard

### 1.5 Token Helper

**`src/lib/google.ts`** — Shared helper for all Google API calls:

```ts
export async function getGoogleAccessToken(): Promise<string> {
  // 1. Read token from google_tokens table
  // 2. If expired, refresh using refresh_token
  // 3. Update DB with new access token + expiry
  // 4. Return valid access token
}

export async function googleFetch(url: string, options?: RequestInit) {
  const token = await getGoogleAccessToken()
  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
    },
  })
}
```

### 1.6 Settings UI

Add a "Connect Google" button in the Header settings popover:

- Shows "Connect Google Account" if no token stored
- Shows "Google Connected" with a disconnect option if connected
- Connect button links to `/api/auth/google`

### Files

| File                                     | Action                                |
| ---------------------------------------- | ------------------------------------- |
| `src/db/schema.ts`                       | Add `googleTokens` table              |
| `src/routes/api/auth/google/index.ts`    | Create — OAuth redirect               |
| `src/routes/api/auth/google/callback.ts` | Create — OAuth callback               |
| `src/lib/google.ts`                      | Create — token helper + `googleFetch` |
| `src/components/Header.tsx`              | Modify — add Connect Google button    |
| `.env.example`                           | Add Google env vars                   |

---

## Phase 2: Google Calendar (Replace DeskBuddy)

### 2.1 Calendar API Route

**`src/routes/api/calendar/index.ts`** — GET: Fetch events from Google Calendar

```ts
// Fetch events for a date range (e.g., current month)
const res = await googleFetch(
  `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
    `timeMin=${startOfMonth}&timeMax=${endOfMonth}&singleEvents=true&orderBy=startTime`,
)
```

Returns events mapped to match the existing `Event` type shape so the widget needs minimal changes.

### 2.2 Update Calendar Widget

**`src/components/widgets/calendar.tsx`** — Change the data source:

```diff
- queryFn: () => get('https://deskbuddy.deploy.iamsaravieira.com/events/all'),
+ queryFn: () => getCalendarEvents(),
```

Where `getCalendarEvents` is a `createServerFn` that calls `/api/calendar`. Map Google's event format to the existing `Event` type:

```ts
// Google Calendar event → Widget event
{
  summary: event.summary,
  start: event.start.dateTime || event.start.date,
  end: event.end.dateTime || event.end.date,
  allDay: !!event.start.date,
  // etc.
}
```

### 2.3 Cache Layer (optional)

Cache calendar events for 5 minutes server-side to avoid hitting Google API on every page load. Simple in-memory cache like the YouTube widget uses.

### Files

| File                                  | Action                             |
| ------------------------------------- | ---------------------------------- |
| `src/routes/api/calendar/index.ts`    | Create — Google Calendar API proxy |
| `src/components/widgets/calendar.tsx` | Modify — swap data source          |

---

## Phase 3: Google Tasks Sync

### 3.1 Expand Todos Schema

```ts
export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  notes: text('notes'), // NEW — maps to Google Tasks notes
  dueDate: text('due_date'), // NEW — maps to Google Tasks due
  googleTaskId: text('google_task_id'), // NEW — link to Google Tasks
  googleTaskListId: text('google_task_list_id'), // NEW — which task list
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  done: boolean().default(false).notNull(),
  done_by: date(),
})
```

### 3.2 Sync Strategy: Push + Periodic Pull

**Push (immediate):** When user creates/updates/deletes a todo locally:

1. Perform the local DB operation
2. Fire-and-forget push to Google Tasks API
3. Store the returned `googleTaskId` on the local record

**Pull (periodic):** Background sync every 5 minutes (or on widget mount):

1. Fetch all tasks from Google Tasks API
2. For each Google task:
   - If it has a matching local todo (by `googleTaskId`) → update local if Google version is newer
   - If no local match → create locally
3. For each local todo with a `googleTaskId`:
   - If it's gone from Google → delete locally (or mark deleted)

**Conflict resolution:** Last-write-wins based on `updatedAt` timestamps. Simple and good enough for single-user.

### 3.3 Google Tasks API Routes

**`src/routes/api/todos/sync.ts`** — POST: Trigger a full pull-sync from Google Tasks

```ts
// 1. GET https://tasks.googleapis.com/tasks/v1/users/@me/lists → get task lists
// 2. GET https://tasks.googleapis.com/tasks/v1/lists/{taskListId}/tasks → get tasks
// 3. Upsert into local DB
```

### 3.4 Update Existing Todo API Routes

Modify the existing todo CRUD routes to also push changes to Google Tasks:

**`src/routes/api/todos/index.ts`** — POST (create):

```ts
// After inserting into DB:
const googleTask = await googleFetch(
  `https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`,
  { method: 'POST', body: JSON.stringify({ title, notes, due }) },
)
// Update local record with googleTaskId
```

**`src/routes/api/todos/$todoId.ts`** — PUT (toggle done / update):

```ts
// After updating DB:
if (todo.googleTaskId) {
  await googleFetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks/${todo.googleTaskId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status: done ? 'completed' : 'needsAction' }),
    },
  )
}
```

**`src/routes/api/todos/$todoId.ts`** — DELETE:

```ts
// After deleting from DB:
if (todo.googleTaskId) {
  await googleFetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks/${todo.googleTaskId}`,
    { method: 'DELETE' },
  )
}
```

### 3.5 Update Todos Widget

- Add optional due date picker
- Show due date badge on todos that have one
- Add a "Sync" button (or auto-sync on mount)
- Notes field (expandable, optional)

### Files

| File                               | Action                                  |
| ---------------------------------- | --------------------------------------- |
| `src/db/schema.ts`                 | Modify — expand `todos` table           |
| `src/routes/api/todos/index.ts`    | Modify — push creates to Google         |
| `src/routes/api/todos/$todoId.ts`  | Modify — push updates/deletes to Google |
| `src/routes/api/todos/sync.ts`     | Create — pull sync endpoint             |
| `src/components/widgets/Todos.tsx` | Modify — due dates, sync button         |

---

## Phase 4: Polish

### 4.1 Graceful Degradation

All Google API calls should be wrapped in try/catch. If Google is unreachable or tokens are expired/revoked:

- Local operations still work
- Show a subtle "sync failed" indicator
- Queue failed pushes for retry

### 4.2 Initial Sync Flow

When user first connects Google:

1. Pull all existing Google Tasks → insert locally
2. Push any existing local todos → create in Google Tasks
3. Mark all as linked via `googleTaskId`

### 4.3 Task List Selection

Google Tasks supports multiple lists. Options:

- **Simple:** Use the default `@default` task list for everything
- **Better:** Let user pick which task list to sync (dropdown in settings)

Recommend starting with `@default` and adding list selection later.

---

## Implementation Order

```
Phase 1 (OAuth)     ████████░░  ~2-3 sessions
Phase 2 (Calendar)  ████░░░░░░  ~1 session
Phase 3 (Tasks)     ████████░░  ~2-3 sessions
Phase 4 (Polish)    ████░░░░░░  ~1 session
```

**Recommended sequence:**

1. Phase 1 — OAuth (must be first, everything depends on it)
2. Phase 2 — Calendar (quick win, replaces DeskBuddy immediately)
3. Phase 3 — Tasks sync (biggest piece, do push-only first, then add pull)
4. Phase 4 — Polish

Each phase is independently shippable. After Phase 1+2 you already have a better calendar. After Phase 3 you have the full daily-driver todo system.

---

## Dependencies

No new npm packages strictly required — Google's REST APIs can be called with plain `fetch`. However, consider:

- **`googleapis`** npm package — convenient typed client, but heavy (~50MB). Probably not worth it for just Calendar + Tasks.
- Plain `fetch` with the `googleFetch` helper is lighter and matches the existing codebase patterns.

## Google API Reference

- [Calendar API](https://developers.google.com/calendar/api/v3/reference)
- [Tasks API](https://developers.google.com/tasks/reference/rest)
- [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
