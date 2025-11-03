import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Memo, MoodType } from '@/lib/types'
import { MOODS } from '@/lib/consts'

// Client-side API function for deletion
async function deleteMemo(id: number): Promise<void> {
  const response = await fetch(`/api/memos/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete memo')
}

export const Route = createFileRoute('/memos/')({
  ssr: 'data-only', // Load data on server, render component on client
  loader: async () => {
    // Import MemosService on server-side for data loading
    const { MemosService } = await import('@/lib/memos')
    const memos = await MemosService.getAllMemos()
    return { memos }
  },
  component: MemosPage,
})

function MemosPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { memos } = Route.useLoaderData()

  // Delete memo mutation
  const deleteMemoMutation = useMutation({
    mutationFn: deleteMemo,
    onSuccess: () => {
      router.invalidate()
      queryClient.invalidateQueries()
      toast.success('Memo deleted successfully!')
    },
    onError: (error) => {
      toast.error(`Failed to delete memo: ${error.message}`)
    },
  })

  const createNewMemo = useCallback(() => {
    router.navigate({ to: '/memos/create' })
  }, [router])

  const viewMemo = useCallback((memo: Memo) => {
    router.navigate({ to: `/memos/${memo.id}` })
  }, [])

  const handleDeleteMemo = useCallback(
    (memoId: number) => {
      deleteMemoMutation.mutate(memoId)
    },
    [deleteMemoMutation],
  )

  const getMoodInfo = (moodType: MoodType) => {
    return MOODS.find((mood) => mood.type === moodType) || MOODS[4]
  }

  const groupMemosByDate = (memos: Memo[]) => {
    return memos.reduce(
      (groups, memo) => {
        const date = memo.date
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(memo)
        return groups
      },
      {} as Record<string, Memo[]>,
    )
  }

  const groupedMemos = groupMemosByDate(memos)

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold mb-2">Memos</h1>

        <Button onClick={createNewMemo}>
          <Plus className="w-4 h-4 mr-2" />
          New Entry
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Entries</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px] max-w-full">
            {memos.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <p>No entries yet. Create your first diary entry!</p>
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {Object.entries(groupedMemos).map(([date, dateMemos]) => (
                  <div key={date}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                    <div className="space-y-2">
                      {dateMemos.map((memo) => {
                        const moodInfo = getMoodInfo(memo.mood as MoodType)
                        const MoodIcon = moodInfo.icon
                        return (
                          <div
                            key={memo.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${'border-gray-200'}`}
                            onClick={() => viewMemo(memo)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">
                                  {memo.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant="secondary"
                                    className={moodInfo.color}
                                  >
                                    <MoodIcon className="w-3 h-3 mr-1" />
                                    {moodInfo.label}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {memo.updatedAt
                                      ? new Date(
                                          memo.updatedAt,
                                        ).toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })
                                      : ''}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteMemo(memo.id)
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                ×
                              </Button>
                            </div>
                            <div
                              className="text-sm text-muted-foreground mt-2 line-clamp-2"
                              dangerouslySetInnerHTML={{
                                __html:
                                  memo.content
                                    .replace(/<[^>]*>/g, '')
                                    .substring(0, 100) + '...',
                              }}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      {/* Mood Statistics */}
      {memos.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Mood Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {MOODS.map((mood) => {
                const count = memos.filter((m) => m.mood === mood.type).length
                const percentage =
                  memos.length > 0 ? (count / memos.length) * 100 : 0
                const Icon = mood.icon

                if (count === 0) return null

                return (
                  <div
                    key={mood.type}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{mood.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8">
                        {count}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
