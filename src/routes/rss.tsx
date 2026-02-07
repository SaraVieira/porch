import { createFileRoute } from '@tanstack/react-router'
import { RefreshCw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArticleList } from '@/components/pages/rss/ArticleList'
import { AddFeedCard } from '@/components/pages/rss/AddFeedCard'
import { CategoriesCard } from '@/components/pages/rss/CategoriesCard'
import { FeedListCard } from '@/components/pages/rss/FeedListCard'
import { useRssPage, getArticles } from '@/hooks/useRssPage'

export const Route = createFileRoute('/rss')({
  component: RssPage,
  loader: () => getArticles(),
})

function RssPage() {
  const loader = Route.useLoaderData()
  const {
    articles,
    filtered,
    categories,
    feeds,
    bookmarkedUrls,
    search,
    setSearch,
    activeCategory,
    setActiveCategory,
    refreshing,
    handleRefresh,
    handleAddFeed,
    handleDeleteFeed,
    handleAddCategory,
    handleDeleteArticle,
    handleBookmark,
    handleDeleteCategory,
  } = useRssPage(loader)

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">RSS</h1>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search articles or feeds..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge
            variant={activeCategory === null ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setActiveCategory(null)}
          >
            All
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat.id}
              variant={activeCategory === cat.id ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
            </Badge>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_350px] gap-6">
        <ArticleList
          articles={articles}
          filtered={filtered}
          bookmarkedUrls={bookmarkedUrls}
          onDeleteArticle={handleDeleteArticle}
          onBookmark={handleBookmark}
        />

        <div className="flex flex-col gap-4 top-0 relative">
          <AddFeedCard categories={categories} onAddFeed={handleAddFeed} />
          <CategoriesCard
            categories={categories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
          <FeedListCard feeds={feeds} onDeleteFeed={handleDeleteFeed} />
        </div>
      </div>
    </div>
  )
}
