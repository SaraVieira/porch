import { useRouter } from '@tanstack/react-router'
import { X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Item, ItemContent } from '../ui/item'
import { Checkbox } from '../ui/checkbox'
import type { RequiredFetcher } from '@tanstack/react-start'
import { CheckedState } from '@radix-ui/react-checkbox'

type Todo = {
  id: number
  title: string
  done: boolean
  createdAt: Date | null
  updatedAt: Date | null
  done_by: string | null
}

export function Todos({
  todos,
  createTodo,
  toggleDoneTodo,
}: {
  todos: Array<Todo>
  toggleDoneTodo: RequiredFetcher<
    undefined,
    (data: { done: boolean; id: string }) => {
      done: boolean
      id: string
    },
    Promise<{
      success: boolean
    }>
  >
  createTodo: RequiredFetcher<
    undefined,
    (data: { title: string }) => {
      title: string
    },
    Promise<{
      success: boolean
    }>
  >
}) {
  const router = useRouter()
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const title = formData.get('title') as string

    if (!title) return

    try {
      await createTodo({ data: { title } })
      router.invalidate()
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      console.error('Failed to create todo:', error)
    }
  }

  const onChange = ({ state, id }: { state: CheckedState; id: string }) =>
    toggleDoneTodo({
      data: {
        id,
        done: !!state,
      },
    })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todos</CardTitle>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3 mb-6">
          {todos.map((todo) => (
            <li className="flex w-full max-w-md flex-col gap-6">
              <Item variant="outline" className="p-2">
                <ItemContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        onCheckedChange={(state) =>
                          onChange({ state, id: todo.id })
                        }
                        checked={todo.done}
                      ></Checkbox>
                      {todo.title}
                    </div>

                    <Button variant={'ghost'} className="w-auto">
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
          <Button type="submit">Add Todo</Button>
        </form>
      </CardContent>
    </Card>
  )
}
