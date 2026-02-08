import { useEffect } from 'react'
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  redirect,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { createServerFn } from '@tanstack/react-start'
import { Provider, useAtomValue } from 'jotai'
import Header from '../components/Header'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'
import type { QueryClient } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { useAppSession } from '@/lib/hooks/useSession'
import { borderAccentAtom, orangeAccentAtom } from '@/lib/atoms'
import { db } from '@/db'
import { user as userSchema } from '@/db/schema'

interface MyRouterContext {
  queryClient: QueryClient
}

const fetchUser = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await useAppSession()

  if (!session.data.id) {
    const users = await db!.select().from(userSchema).limit(1)
    return { id: null, hasUser: users.length > 0 }
  }

  return {
    id: session.data.id,
    hasUser: true,
  }
})

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Porch',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  beforeLoad: async ({ location }) => {
    const user = await fetchUser()
    const isAuthPage =
      location.href === '/login' ||
      location.href === '/signup' ||
      location.href === '/logout'

    if (!user.id && !isAuthPage) {
      throw redirect({
        to: user.hasUser ? '/login' : '/signup',
      })
    }
    return {
      user: user.id ? user : null,
    }
  },
  shellComponent: RootDocument,
  notFoundComponent: () => {
    return <div>404 - Not Found</div>
  },
})

function AccentApplicator() {
  const borderAccent = useAtomValue(borderAccentAtom)
  const orangeAccent = useAtomValue(orangeAccentAtom)

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--color-border-accent',
      borderAccent,
    )
    document.documentElement.style.setProperty(
      '--color-orange-accent',
      orangeAccent,
    )
    document.documentElement.style.setProperty('--orange-accent', orangeAccent)
  }, [borderAccent, orangeAccent])

  return null
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { user } = Route.useRouteContext()
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-highlight dark min-h-screen p-8 md:p-0">
        <Provider>
          <AccentApplicator />
          <Header user={user} />
          <div className="container mx-auto my-8 h-full">{children}</div>
          <Toaster />
        </Provider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
