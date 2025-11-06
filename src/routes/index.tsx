import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Calendar } from '@/components/widgets/calendar'
import { Links } from '@/components/widgets/Links'
import { Todos } from '@/components/widgets/Todos'
import { deleteMethod, get, post, put } from '@/lib/utils'
import { Spotify } from '@/components/widgets/spotify'

const getTodos = createServerFn({
  method: 'GET',
}).handler(() => get('/api/todos'))

const getSpotify = createServerFn({
  method: 'GET',
}).handler(() =>
  get('https://deskbuddy.deploy.iamsaravieira.com/spotify/status'),
)
const createTodo = createServerFn({
  method: 'POST',
})
  .inputValidator((data: { title: string }) => data)
  .handler(({ data }) => post('/api/todos', data))

const toggleDoneTodo = createServerFn({
  method: 'POST',
})
  .inputValidator((data: { done: boolean; id: string }) => data)
  .handler(({ data }) => put(`/api/todos/${data.id}`, data))

const removeTodo = createServerFn({
  method: 'POST',
})
  .inputValidator((data: { id: string }) => data)
  .handler(({ data }) => deleteMethod(`/api/todos/${data.id}`))

export const Route = createFileRoute('/')({
  component: App,
  loader: async () => {
    const todos = await getTodos()
    const spotifyData = await getSpotify()

    return {
      todos,
      spotifyData,
    }
  },
})

function App() {
  const loader = Route.useLoaderData()

  const { data: todos } = useSuspenseQuery({
    queryKey: ['todos'],
    queryFn: () => getTodos(),
    initialData: loader.todos,
  })

  const { data: spotifyData } = useSuspenseQuery({
    queryKey: ['spotify-current-song'],
    staleTime: 1000,
    queryFn: () => getSpotify(),
    initialData: loader.spotifyData,
  })

  return (
    <div className="bg-background text-highlight grid gap-4 grid-cols-2 md:grid-cols-4">
      <div className="col-span-1 min-w-[258px] gap-4 flex flex-col">
        <Calendar />
      </div>
      <div className="md:col-span-2 gap-4 flex flex-col">
        <Links />
      </div>
      <div className="col-span-1 gap-4 flex flex-col">
        <Spotify spotifyData={spotifyData} />
        <Todos
          removeTodo={removeTodo}
          todos={todos}
          createTodo={createTodo}
          toggleDoneTodo={toggleDoneTodo}
        />
      </div>
    </div>
  )
}
