import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Calendar,
  Plus,
  Smile,
  Meh,
  Frown,
  Heart,
  Zap,
  Coffee,
  Sun,
  Cloud,
  CloudRain,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

export interface Memo {
  id: number
  title: string
  content: string
  mood: string
  date: string
  createdAt: Date | null
  updatedAt: Date | null
}

// Client-side API function for deletion
async function deleteMemo(id: number): Promise<void> {
  const response = await fetch(`/api/memos/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete memo')
}

export const Route = createFileRoute('/memos')({
  ssr: 'data-only', // Load data on server, render component on client
  loader: async () => {
    // Import MemosService on server-side for data loading
    const { MemosService } = await import('@/lib/memos')
    const memos = await MemosService.getAllMemos()
    return { memos }
  },
  component: MemosPage,
})

type MoodType =
  | 'happy'
  | 'sad'
  | 'neutral'
  | 'excited'
  | 'anxious'
  | 'calm'
  | 'energetic'
  | 'tired'
  | 'grateful'

const MOODS = [
  {
    type: 'happy' as MoodType,
    icon: Smile,
    label: 'Happy',
    color: 'bg-yellow-100 text-yellow-800',
  },
  {
    type: 'excited' as MoodType,
    icon: Zap,
    label: 'Excited',
    color: 'bg-orange-100 text-orange-800',
  },
  {
    type: 'grateful' as MoodType,
    icon: Heart,
    label: 'Grateful',
    color: 'bg-pink-100 text-pink-800',
  },
  {
    type: 'calm' as MoodType,
    icon: Sun,
    label: 'Calm',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    type: 'neutral' as MoodType,
    icon: Meh,
    label: 'Neutral',
    color: 'bg-gray-100 text-gray-800',
  },
  {
    type: 'energetic' as MoodType,
    icon: Coffee,
    label: 'Energetic',
    color: 'bg-green-100 text-green-800',
  },
  {
    type: 'tired' as MoodType,
    icon: Cloud,
    label: 'Tired',
    color: 'bg-slate-100 text-slate-800',
  },
  {
    type: 'anxious' as MoodType,
    icon: CloudRain,
    label: 'Anxious',
    color: 'bg-purple-100 text-purple-800',
  },
  {
    type: 'sad' as MoodType,
    icon: Frown,
    label: 'Sad',
    color: 'bg-indigo-100 text-indigo-800',
  },
]

function MemosPage() {
  const [currentMemo, setCurrentMemo] = useState<Memo | null>(null)
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
      setCurrentMemo(null)
    },
    onError: (error) => {
      toast.error(`Failed to delete memo: ${error.message}`)
    },
  })

  const createNewMemo = useCallback(() => {
    router.navigate({ to: '/create-memo' })
  }, [router])

  const viewMemo = useCallback((memo: Memo) => {
    setCurrentMemo(memo)
  }, [])

  const handleDeleteMemo = useCallback(
    (memoId: number) => {
      if (currentMemo?.id === memoId) {
        setCurrentMemo(null)
      }
      deleteMemoMutation.mutate(memoId)
    },
    [currentMemo, deleteMemoMutation],
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Diary</h1>
        <p className="text-muted-foreground">
          Capture your thoughts, moments, and feelings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {currentMemo
                    ? currentMemo.title
                    : 'Select an entry or create a new one'}
                </CardTitle>
                <Button onClick={createNewMemo}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Entry
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {currentMemo ? (
                <div className="space-y-6">
                  {/* Memo Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2">
                        {currentMemo.title}
                      </h2>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>
                          {new Date(currentMemo.date).toLocaleDateString(
                            'en-US',
                            {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            },
                          )}
                        </span>
                        {currentMemo.updatedAt && (
                          <span>
                            • Updated{' '}
                            {new Date(currentMemo.updatedAt).toLocaleTimeString(
                              'en-US',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              },
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const moodInfo = getMoodInfo(
                          currentMemo.mood as MoodType,
                        )
                        const MoodIcon = moodInfo.icon
                        return (
                          <Badge className={moodInfo.color}>
                            <MoodIcon className="w-3 h-3 mr-1" />
                            {moodInfo.label}
                          </Badge>
                        )
                      })()}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteMemo(currentMemo.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  {/* Memo Content */}
                  <div className="prose prose-sm max-w-none">
                    <div
                      className="min-h-[200px] p-4 border rounded-lg bg-muted/20"
                      dangerouslySetInnerHTML={{ __html: currentMemo.content }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>
                    Select an entry from the sidebar or create a new one to get
                    started
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Your Entries</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
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
                                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                                  currentMemo?.id === memo.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200'
                                }`}
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
                    const count = memos.filter(
                      (m) => m.mood === mood.type,
                    ).length
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
      </div>
    </div>
  )
}
