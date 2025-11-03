import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MOODS } from '@/lib/consts'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import MarkdownPreview from '@uiw/react-markdown-preview'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useDeleteMemo } from '@/lib/hooks/useDeleteMemo'

export const Route = createFileRoute('/memos/$memoId')({
  component: RouteComponent,
  ssr: 'data-only',
  loader: async ({ params }) => {
    const { MemosService } = await import('@/lib/memos')
    const memo = await MemosService.getMemoById(parseInt(params.memoId))
    return { memo: memo! }
  },
})

function RouteComponent() {
  const router = useRouter()
  const { memo } = Route.useLoaderData()
  const { handleDeleteMemo } = useDeleteMemo()

  const moodInfo = MOODS.find((mood) => mood.type === memo?.mood) || MOODS[4]
  const MoodIcon = moodInfo.icon

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            router.navigate({ to: '/memos', reloadDocument: true })
          }
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Memos
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{memo?.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Memo Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>
                        {new Date(memo.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      {memo.updatedAt && (
                        <span>
                          • Updated{' '}
                          {new Date(memo.updatedAt).toLocaleTimeString(
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
                    <Badge className={moodInfo.color}>
                      <MoodIcon className="w-3 h-3 mr-1" />
                      {moodInfo.label}
                    </Badge>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteMemo({ id: memo.id })}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Memo Content */}
                <div className="prose prose-sm max-w-none">
                  <MarkdownPreview
                    source={memo?.content}
                    style={{ background: 'transparent' }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
