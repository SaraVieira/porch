import { useState } from 'react'
import {
  X,
  RefreshCw,
  Plus,
  CalendarIcon,
  Clock,
  AlignLeft,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Item, ItemContent } from '../ui/item'
import { Checkbox } from '../ui/checkbox'
import { Skeleton } from '../ui/skeleton'
import { ScrollArea } from '../ui/scroll-area'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { WidgetShell } from '../WidgetShell'
import { useTodos } from '@/hooks/useTodos'

function formatDueDate(dateStr: string) {
  const hasTime = dateStr.includes('T')
  const dateOnly = hasTime ? dateStr.split('T')[0] : dateStr
  const due = new Date(dateOnly + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )

  let label: string
  if (diff < 0) label = 'Overdue'
  else if (diff === 0) label = 'Today'
  else if (diff === 1) label = 'Tomorrow'
  else
    label = due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  if (hasTime) {
    const time = dateStr.split('T')[1]
    const [h, m] = time.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'pm' : 'am'
    const h12 = hour % 12 || 12
    label += ` at ${h12}:${m}${ampm}`
  }

  return label
}

export function Todos() {
  const { todos, isLoading, syncing, handleSync, handleCreate, handleToggle, handleRemove } =
    useTodos()
  const [formOpen, setFormOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      await handleCreate({
        title: title.trim(),
        ...(dueDate ? { dueDate } : {}),
        ...(dueTime ? { dueTime } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      })
      setTitle('')
      setDueDate('')
      setDueTime('')
      setNotes('')
      setFormOpen(false)
    } catch (error) {
      console.error('Failed to create todo:', error)
    }
  }

  return (
    <WidgetShell
      title="Todos"
      headerActions={
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleSync}
          disabled={syncing}
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`}
          />
        </Button>
      }
      loading={isLoading || !todos}
      skeleton={
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      }
    >
      <ScrollArea className="h-[350px]">
        <ul className="space-y-3 mb-6">
          {todos
            ?.filter((t) => !t.done)
            .map((todo, i) => (
              <li
                className="flex w-full max-w-md flex-col gap-6"
                key={`${todo.title}-${i}`}
              >
                <Item variant="outline" className="p-2">
                  <ItemContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Checkbox
                          onCheckedChange={(state) =>
                            handleToggle({ state, id: todo.id.toString() })
                          }
                          checked={todo.done}
                        />
                        <div className="min-w-0">
                          <div
                            className={
                              todo.done ? 'line-through opacity-50' : ''
                            }
                          >
                            {todo.title}
                          </div>
                          {todo.dueDate && (
                            <div
                              className={`text-xs ${
                                formatDueDate(todo.dueDate).startsWith(
                                  'Overdue',
                                )
                                  ? 'text-red-400'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {formatDueDate(todo.dueDate)}
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-6 w-6"
                        onClick={() => handleRemove(todo.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </ItemContent>
                </Item>
              </li>
            ))}
          {todos?.filter((t) => !t.done).length === 0 && (
            <li className="text-center py-8 text-indigo-300/70">
              No todos yet. Create one below!
            </li>
          )}
        </ul>
      </ScrollArea>

      {formOpen ? (
        <form onSubmit={handleSubmit} className="space-y-3 border-t pt-3">
          <Input
            type="text"
            placeholder="Task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={`flex-1 justify-start text-left font-normal ${!dueDate ? 'text-muted-foreground' : ''}`}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {dueDate
                    ? new Date(dueDate + 'T00:00:00').toLocaleDateString(
                        'en-GB',
                        {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        },
                      )
                    : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    dueDate ? new Date(dueDate + 'T00:00:00') : undefined
                  }
                  onSelect={(date) => {
                    if (date) {
                      const y = date.getFullYear()
                      const m = String(date.getMonth() + 1).padStart(2, '0')
                      const d = String(date.getDate()).padStart(2, '0')
                      setDueDate(`${y}-${m}-${d}`)
                    } else {
                      setDueDate('')
                      setDueTime('')
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
            {dueDate && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8"
                onClick={() => {
                  setDueDate('')
                  setDueTime('')
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
          {dueDate && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="flex-1"
              />
              {dueTime && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-8 w-8"
                  onClick={() => setDueTime('')}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
          <div className="flex items-start gap-2">
            <AlignLeft className="w-4 h-4 text-muted-foreground shrink-0 mt-2.5" />
            <Textarea
              placeholder="Description..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex-1 min-h-[60px]"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setFormOpen(false)
                setTitle('')
                setDueDate('')
                setDueTime('')
                setNotes('')
              }}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!title.trim()}>
              Save
            </Button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full pt-3 border-t"
        >
          <Plus className="w-4 h-4" />
          Add a new todo
        </button>
      )}
    </WidgetShell>
  )
}
