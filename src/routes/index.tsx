import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'

import { Calendar } from '@/components/widgets/calendar'
import { todos as todosSchema } from '@/db/schema'
import { db } from '@/db'
import { Links } from '@/components/widgets/Links'
import { Todos } from '@/components/widgets/Todos'

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

function App() {
  const todos = Route.useLoaderData()

  return (
    <div className="bg-background text-highlight grid gap-4 grid-cols-2 md:grid-cols-4">
      <div className="col-span-1 min-w-[258px]">
        <Calendar />
      </div>
      <div className="md:col-span-2">
        <Links />
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
