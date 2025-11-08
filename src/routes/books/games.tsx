import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/books/games')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/books/games"!</div>
}
