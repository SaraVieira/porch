import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  redirect,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { createServerFn } from '@tanstack/react-start'
import Header from '../components/Header'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'
import type { QueryClient } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { useAppSession } from '@/lib/hooks/useSession'

interface MyRouterContext {
  queryClient: QueryClient
}

const fetchUser = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await useAppSession()

  if (!session.data.id) {
    return null
  }

  return {
    id: session.data.id,
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
        title: 'Homepage',
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
    if (
      !user &&
      location.href !== '/login' &&
      location.href !== '/signup' &&
      location.href !== '/logout'
    ) {
      throw redirect({
        to: '/login',
      })
    }
    return {
      user,
    }
  },
  shellComponent: RootDocument,
  notFoundComponent: () => {
    return <div>404 - Not Found</div>
  },
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { user } = Route.useRouteContext()
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-highlight dark min-h-screen">
        <Header user={user} />
        <div className="container mx-auto my-8 h-full">{children}</div>
        <Toaster />
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
