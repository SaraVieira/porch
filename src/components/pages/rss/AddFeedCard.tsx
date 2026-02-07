import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { RssCategory } from '@/lib/types'

type AddFeedCardProps = {
  categories: Array<RssCategory>
  onAddFeed: (e: React.FormEvent<HTMLFormElement>) => void
}

export function AddFeedCard({ categories, onAddFeed }: AddFeedCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Add Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onAddFeed} className="flex flex-col gap-2">
          <Input
            type="url"
            name="url"
            placeholder="Feed URL..."
            required
          />
          <select
            name="categoryId"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Uncategorized</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <Button type="submit" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Feed
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
