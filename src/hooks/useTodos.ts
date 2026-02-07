import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { get, post, put, deleteMethod } from '@/lib/utils'
import type { CheckedState } from '@radix-ui/react-checkbox'

type Todo = {
  id: number
  title: string
  notes: string | null
  dueDate: string | null
  googleTaskId: string | null
  done: boolean
  createdAt: Date | null
  updatedAt: Date | null
  done_by: string | null
}

const getTodos = createServerFn({
  method: 'GET',
}).handler(() => get('/api/todos'))

const createTodoFn = createServerFn({
  method: 'POST',
})
  .inputValidator(
    (data: {
      title: string
      dueDate?: string
      dueTime?: string
      notes?: string
    }) => data,
  )
  .handler(({ data }) => post('/api/todos', data))

const toggleDoneTodoFn = createServerFn({
  method: 'POST',
})
  .inputValidator((data: { done: boolean; id: string }) => data)
  .handler(({ data }) => put(`/api/todos/${data.id}`, data))

const removeTodoFn = createServerFn({
  method: 'POST',
})
  .inputValidator((data: { id: string }) => data)
  .handler(({ data }) => deleteMethod(`/api/todos/${data.id}`))

const syncTodosFn = createServerFn({
  method: 'POST',
}).handler(() => post('/api/todos/sync', {}))

export function useTodos() {
  const queryClient = useQueryClient()
  const [syncing, setSyncing] = useState(false)

  const { data: todos, isLoading } = useQuery<Array<Todo>>({
    queryKey: ['todos'],
    queryFn: () => getTodos(),
  })

  // Sync on mount
  useEffect(() => {
    syncTodosFn()
      .then(() => queryClient.invalidateQueries({ queryKey: ['todos'] }))
      .catch(() => {})
  }, [])

  const handleSync = async () => {
    setSyncing(true)
    try {
      await syncTodosFn()
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    } catch (err) {
      console.error('Sync failed:', err)
    } finally {
      setSyncing(false)
    }
  }

  const handleCreate = async (data: {
    title: string
    dueDate?: string
    dueTime?: string
    notes?: string
  }) => {
    await createTodoFn({ data })
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  }

  const handleToggle = ({ state, id }: { state: CheckedState; id: string }) => {
    toggleDoneTodoFn({ data: { id, done: !!state } })
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  }

  const handleRemove = (id: number) => {
    removeTodoFn({ data: { id: id.toString() } })
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  }

  return {
    todos,
    isLoading,
    syncing,
    handleSync,
    handleCreate,
    handleToggle,
    handleRemove,
  }
}
