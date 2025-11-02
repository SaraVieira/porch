import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/widgets/calendar'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div className="bg-background text-highlight grid grid-cols-4">
      <div className="col-span-1">
        <Button>sup</Button>
        <Calendar />
      </div>
      <div className="col-span-2"> two</div>
      <div className="col-span-1">three</div>
    </div>
  )
}
