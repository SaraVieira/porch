import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'
import { BsBookFill, BsPencilFill, BsReddit, BsServer } from 'react-icons/bs'
import { RiBlueskyFill, RiNetflixFill } from 'react-icons/ri'
import {
  SiAliexpress,
  SiAmazon,
  SiBambulab,
  SiEbay,
  SiGithub,
  SiGmail,
  SiGooglecalendar,
  SiGooglemaps,
  SiNintendogamecube,
  SiPrintables,
  SiSteam,
} from 'react-icons/si'
import { TbBrandDisney, TbBrandYoutubeFilled } from 'react-icons/tb'
import { Calendar } from '@/components/widgets/calendar'
import { todos as todosSchema } from '@/db/schema'
import { db } from '@/db'
import { Links } from '@/components/widgets/Links'
import { Todos } from '@/components/widgets/Todos'
import { PgSerial } from 'drizzle-orm/pg-core'

const getTodos = createServerFn({
  method: 'GET',
}).handler(async () => {
  return await db.query.todos.findMany({
    orderBy: [desc(todosSchema.createdAt)],
  })
})

const createTodo = createServerFn({
  method: 'POST',
})
  .inputValidator((data: { title: string }) => data)
  .handler(async ({ data }) => {
    await db.insert(todosSchema).values({ title: data.title, done: false })
    return { success: true }
  })

const toggleDoneTodo = createServerFn({
  method: 'POST',
})
  .inputValidator((data: { done: boolean; id: string }) => data)
  .handler(async ({ data }) => {
    await db
      .update(todosSchema)
      .set({ done: data.done })
      // @ts-expect-error eq issue
      .where(eq(todosSchema.id, data.id))
    return { success: true }
  })

export const Route = createFileRoute('/')({
  component: App,
  loader: async () => await getTodos(),
})

const groups = [
  {
    category: 'General',
    links: [
      {
        title: 'Gmail',
        link: 'https://gmail.com',
        Icon: SiGmail,
      },
      {
        title: 'Github',
        link: 'https://github.com',
        Icon: SiGithub,
      },
      {
        title: 'Calendar',
        link: 'https://calendar.google.com',
        Icon: SiGooglecalendar,
      },
      {
        title: 'Maps',
        link: 'https://maps.google.com',
        Icon: SiGooglemaps,
      },
    ],
    color: 'text-purple-500',
  },
  {
    category: 'Entertainment',
    links: [
      {
        title: 'Youtube',
        link: 'https://youtube.com',
        Icon: TbBrandYoutubeFilled,
      },
      {
        title: 'Disney+',
        link: 'https://disneyplus.com',
        Icon: TbBrandDisney,
      },
      {
        title: 'Netflix',
        link: 'https://netflix.com',
        Icon: RiNetflixFill,
      },
    ],
    color: 'text-yellow-500',
  },

  {
    category: 'Social',
    color: 'text-blue-600',
    links: [
      {
        title: 'BlueSky',
        link: 'https://bsky.app/',
        Icon: RiBlueskyFill,
      },
      {
        title: 'Reddit',
        link: 'https://reddit.com/',
        Icon: BsReddit,
      },
    ],
  },
  {
    category: 'Printing',
    color: 'text-green-600',
    links: [
      {
        title: 'Printables',
        link: 'https://printables.com/',
        Icon: SiPrintables,
      },
      {
        title: 'MakerWorld',
        link: 'https://makerworld.com/',
        Icon: SiBambulab,
      },
    ],
  },
  {
    category: 'Games',
    color: 'text-blue-200',
    links: [
      {
        title: 'Romm',
        link: 'https://roms.iamsaravieira.com/',
        Icon: SiNintendogamecube,
      },
      {
        title: 'Steam',
        link: 'https://steam.com/',
        Icon: SiSteam,
      },
    ],
  },
  {
    category: 'Shopping',
    color: 'text-red-400',
    links: [
      {
        title: 'Amazon',
        link: 'https://amazon.com',
        Icon: SiAmazon,
      },
      {
        title: 'AliExpress',
        link: 'https://ebay.co.uk/',
        Icon: SiAliexpress,
      },
      {
        title: 'Ebay',
        link: 'https://aliexpress.com',
        Icon: SiEbay,
      },
    ],
  },
  {
    category: 'Self Hosting',
    color: 'text-orange-400',
    links: [
      {
        title: 'Dashboard',
        link: 'https://d.iamsaravieira.com',
        Icon: BsServer,
      },
      {
        title: 'Memos',
        link: 'https://memos.iamsaravieira.com',
        Icon: BsPencilFill,
      },
      {
        title: 'The Books',
        link: 'https://books.iamsaravieira.com',
        Icon: BsBookFill,
      },
    ],
  },
]

function App() {
  const todos = Route.useLoaderData()

  return (
    <div className="bg-background text-highlight grid gap-4 grid-cols-2 md:grid-cols-4">
      <div className="col-span-1 min-w-[258px]">
        <Calendar />
      </div>
      <div className="md:col-span-2">
        <Links groups={groups} />
      </div>
      <div className="col-span-1">
        <Todos
          todos={todos}
          createTodo={createTodo}
          toggleDoneTodo={toggleDoneTodo}
        />
      </div>
    </div>
  )
}
