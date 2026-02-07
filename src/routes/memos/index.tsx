import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useCallback } from 'react'
import { Plus } from 'lucide-react'
import type { Memo } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MemoCard } from '@/components/pages/memos/MemoCard'
import { MoodOverview } from '@/components/pages/memos/MoodOverview'
import { useDeleteMemo } from '@/lib/hooks/useDeleteMemo'

const groupMemosByDate = (newMemos: Array<Memo>) => {
  if (!newMemos.length) return {}
  return newMemos.reduce<Record<string, Array<Memo>>>((groups, memo) => {
    const date = memo.date
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(memo)
    return groups
  }, {})
}

export const Route = createFileRoute('/memos/')({
  loader: async () => {
    const { MemosService } = await import('@/lib/memos')
    const memos = await MemosService.getAllMemos()
    return { groupedMemos: groupMemosByDate(memos), memos }
  },
  component: MemosPage,
})

function MemosPage() {
  const router = useRouter()
  const { memos, groupedMemos } = Route.useLoaderData()
  const { handleDeleteMemo } = useDeleteMemo()

  const createNewMemo = useCallback(() => {
    router.navigate({ to: '/memos/create' })
  }, [router])

  const viewMemo = useCallback((memo: Memo) => {
    router.navigate({ to: `/memos/${memo.id}`, reloadDocument: true })
  }, [])

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold mb-2">Memos</h1>

        <Button onClick={createNewMemo}>
          <Plus className="w-4 h-4 mr-2" />
          New Entry
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="col-span-2">
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
                      <h3 className="text-sm font-medium text-muted-foreground mb-4">
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </h3>
                      <div className="flex flex-col gap-5">
                        {dateMemos.map((memo) => (
                          <MemoCard
                            key={memo.id}
                            memo={memo}
                            onView={viewMemo}
                            onDelete={(id) => handleDeleteMemo({ id })}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
        <MoodOverview memos={memos} />
      </div>
    </div>
  )
}
