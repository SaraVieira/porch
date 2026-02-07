import { X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { RssCategory } from '@/lib/types'

type CategoriesCardProps = {
  categories: Array<RssCategory>
  onAddCategory: (e: React.FormEvent<HTMLFormElement>) => void
  onDeleteCategory: (id: number) => void
}

export function CategoriesCard({
  categories,
  onAddCategory,
  onDeleteCategory,
}: CategoriesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between text-sm"
            >
              <span>{cat.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onDeleteCategory(cat.id)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
          {categories.length === 0 && (
            <span className="text-xs text-muted-foreground">
              No categories yet
            </span>
          )}
          <form onSubmit={onAddCategory} className="flex gap-2 mt-2">
            <Input
              type="text"
              name="name"
              placeholder="New category..."
              className="text-sm"
            />
            <Button type="submit" size="sm" variant="outline">
              Add
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
