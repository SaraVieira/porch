import { createFileRoute } from '@tanstack/react-router'
import MDEditor from '@uiw/react-md-editor'

export const Route = createFileRoute('/memos/$memoId')({
  component: RouteComponent,
  loader: async ({ params }) => {
    // Import MemosService on server-side for data loading
    const { MemosService } = await import('@/lib/memos')
    const memo = await MemosService.getMemoById(parseInt(params.memoId))
    return { memo }
  },
})

function RouteComponent() {
  const { memo } = Route.useLoaderData()
  console.log(memo)
  return (
    <div>
      {' '}
      <MDEditor preview="preview" height={200} value={memo?.content} />
    </div>
  )
}
