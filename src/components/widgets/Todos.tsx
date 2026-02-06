import { X } from 'lucide-react'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Item, ItemContent } from '../ui/item'
import { Checkbox } from '../ui/checkbox'
import { Skeleton } from '../ui/skeleton'
import { get, post, put, deleteMethod } from '@/lib/utils'
import type { CheckedState } from '@radix-ui/react-checkbox'

type Todo = {
  id: number
  title: string
  done: boolean
  createdAt: Date | null
  updatedAt: Date | null
  done_by: string | null
}

const getTodos = createServerFn({
  method: 'GET',
}).handler(() => get('/api/todos'))

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

export function Todos() {
  const queryClient = useQueryClient()

  const { data: todos, isLoading } = useQuery<Array<Todo>>({
    queryKey: ['todos'],
    queryFn: () => getTodos(),
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const title = formData.get('title') as string

    if (!title) return

    try {
      await createTodo({ data: { title } })
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      console.error('Failed to create todo:', error)
    }
  }

  const onChange = ({ state, id }: { state: CheckedState; id: string }) => {
    toggleDoneTodo({
      data: {
        id,
        done: !!state,
      },
    })
    queryClient.invalidateQueries({
      queryKey: ['todos'],
    })
  }

  if (isLoading || !todos) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Todos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todos</CardTitle>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3 mb-6">
          {todos.map((todo, i) => (
            <li
              className="flex w-full max-w-md flex-col gap-6"
              key={`${todo.title}-${i}`}
            >
              <Item variant="outline" className="p-2">
                <ItemContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        onCheckedChange={(state) =>
                          onChange({ state, id: todo.id.toString() })
                        }
                        checked={todo.done}
                      ></Checkbox>
                      {todo.title}
                    </div>

                    <Button
                      variant={'ghost'}
                      className="w-auto"
                      onClick={() => {
                        removeTodo({ data: { id: todo.id.toString() } })
                        queryClient.invalidateQueries({ queryKey: ['todos'] })
                      }}
                    >
                      <X className="w-4" />
                    </Button>
                  </div>
                </ItemContent>
              </Item>
            </li>
          ))}
          {todos.length === 0 && (
            <li className="text-center py-8 text-indigo-300/70">
              No todos yet. Create one below!
            </li>
          )}
        </ul>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input type="text" name="title" placeholder="Add a new todo..." />
        </form>
      </CardContent>
    </Card>
  )
}
