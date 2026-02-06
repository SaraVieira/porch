import { createFileRoute } from '@tanstack/react-router'
import { WidgetGrid } from '@/components/WidgetGrid'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return <WidgetGrid />
}
