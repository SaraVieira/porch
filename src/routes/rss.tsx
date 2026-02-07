import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import {
  useSuspenseQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { get } from '@/lib/utils'
import { getRssArticles } from '@/lib/rss'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RefreshCw, Trash2, Plus, X, Bookmark } from 'lucide-react'
import type { RssArticleWithFeed, RssCategory, RssFeed } from '@/lib/types'

type Bookmark = { id: number; url: string }

const getArticles = createServerFn({
  method: 'GET',
}).handler(() => getRssArticles())

export const Route = createFileRoute('/rss')({
  component: RssPage,
  loader: () => getArticles(),
})

function RssPage() {
  const loader = Route.useLoaderData()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const { data: articles } = useSuspenseQuery({
    queryKey: ['rss', 'page'],
    queryFn: () => getArticles(),
    initialData: loader,
    staleTime: 5 * 60 * 1000,
  })

  const { data: categories = [] } = useQuery<Array<RssCategory>>({
    queryKey: ['rss-categories'],
    queryFn: () => get('/api/rss/categories'),
  })

  const { data: feeds = [] } = useQuery<Array<RssFeed>>({
    queryKey: ['rss-feeds'],
    queryFn: () => get('/api/rss/feeds'),
  })

  const { data: bookmarks = [] } = useQuery<Array<Bookmark>>({
    queryKey: ['bookmarks'],
    queryFn: () => get('/api/bookmarks'),
  })

  const bookmarkedUrls = new Set(bookmarks.map((b) => b.url))

  const filtered = articles.filter((a) => {
    const matchesSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.feedTitle.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      activeCategory === null || a.categoryId === activeCategory
    return matchesSearch && matchesCategory
  })

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await fetch('/api/rss/refresh', { method: 'POST' })
      queryClient.invalidateQueries({ queryKey: ['rss'] })
    } finally {
      setRefreshing(false)
    }
  }

  const handleAddFeed = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const url = formData.get('url') as string
    const categoryId = formData.get('categoryId') as string

    if (!url) return

    await fetch('/api/rss', {
      method: 'POST',
      body: JSON.stringify({
        url,
        categoryId: categoryId ? parseInt(categoryId) : null,
      }),
    })
    queryClient.invalidateQueries({ queryKey: ['rss'] })
    queryClient.invalidateQueries({ queryKey: ['rss-feeds'] })
    ;(e.target as HTMLFormElement).reset()
  }

  const handleDeleteFeed = (feedId: number) => {
    // Optimistic update — remove from UI immediately
    queryClient.setQueryData<Array<RssFeed>>(
      ['rss-feeds'],
      (old) => old?.filter((f) => f.id !== feedId) ?? [],
    )
    queryClient.setQueryData<Array<RssArticleWithFeed>>(
      ['rss', 'page'],
      (old) => old?.filter((a) => a.feedId !== feedId) ?? [],
    )

    fetch(`/api/rss/${feedId}`, { method: 'DELETE' }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['rss'] })
      queryClient.invalidateQueries({ queryKey: ['rss-feeds'] })
    })
  }

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const name = formData.get('name') as string
    if (!name) return

    await fetch('/api/rss/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
    queryClient.invalidateQueries({ queryKey: ['rss-categories'] })
    ;(e.target as HTMLFormElement).reset()
  }

  const handleDeleteArticle = (e: React.MouseEvent, articleId: number) => {
    e.preventDefault()
    e.stopPropagation()
    // Optimistic update
    queryClient.setQueryData<Array<RssArticleWithFeed>>(
      ['rss', 'page'],
      (old) => old?.filter((a) => a.id !== articleId) ?? [],
    )

    fetch(`/api/rss/articles/${articleId}`, { method: 'DELETE' }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['rss'] })
    })
  }

  const handleBookmark = (e: React.MouseEvent, link: string) => {
    e.preventDefault()
    e.stopPropagation()
    // Optimistic update
    queryClient.setQueryData<Array<Bookmark>>(['bookmarks'], (old) => [
      { id: -1, url: link },
      ...(old ?? []),
    ])
    fetch('/api/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ url: link }),
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    })
  }

  const handleDeleteCategory = async (id: number) => {
    await fetch('/api/rss/categories', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    })
    queryClient.invalidateQueries({ queryKey: ['rss-categories'] })
    if (activeCategory === id) setActiveCategory(null)
  }

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

      {/* Category filter */}
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
        {/* Article list */}
        <div className="flex flex-col gap-2">
          {filtered.map((article) => (
            <div
              key={article.id}
              className="flex gap-3 p-3 rounded-lg border border-border-accent hover:bg-accent/50 transition-colors group"
            >
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 min-w-0 flex-1"
              >
                {article.feedFavicon && (
                  <img
                    src={article.feedFavicon}
                    alt=""
                    className="w-5 h-5 rounded shrink-0 mt-0.5"
                    loading="lazy"
                  />
                )}
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span className="text-sm font-medium line-clamp-2 leading-tight">
                    {article.title}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{article.feedTitle}</span>
                    {article.categoryName && (
                      <>
                        <span>-</span>
                        <span>{article.categoryName}</span>
                      </>
                    )}
                    {article.publishedAt && (
                      <>
                        <span>-</span>
                        <span>
                          {formatDistanceToNow(new Date(article.publishedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </a>
              <div className={`flex shrink-0 transition-opacity ${bookmarkedUrls.has(article.link) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => !bookmarkedUrls.has(article.link) && handleBookmark(e, article.link)}
                  title={bookmarkedUrls.has(article.link) ? 'Already bookmarked' : 'Save to bookmarks'}
                >
                  <Bookmark className={`w-4 h-4 ${bookmarkedUrls.has(article.link) ? 'fill-current text-orange-accent' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => handleDeleteArticle(e, article.id)}
                  title="Remove article"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              {articles.length === 0
                ? 'No articles yet. Add feeds in the sidebar to get started!'
                : `No articles found matching "${search}"`}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4 top-0 relative">
          {/* Add Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Add Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddFeed} className="flex flex-col gap-2">
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

          {/* Categories */}
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
                      onClick={() => handleDeleteCategory(cat.id)}
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
                <form onSubmit={handleAddCategory} className="flex gap-2 mt-2">
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

          {/* Feed list */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Feeds ({feeds.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] w-full ">
                <div className="flex flex-col gap-1">
                  {feeds.map((feed) => (
                    <div
                      key={feed.id}
                      className="flex justify-between items-center gap-2 text-sm"
                    >
                      <div className="items-center flex gap-1 max-w-[250px]">
                        {feed.favicon && (
                          <img
                            src={feed.favicon}
                            alt=""
                            className="w-4 h-4 rounded shrink-0"
                          />
                        )}
                        <span className="truncate min-w-0">{feed.title}</span>
                      </div>
                      <button
                        className="shrink-0 p-1 hover:text-red-400 transition-colors"
                        onClick={() => handleDeleteFeed(feed.id)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {feeds.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      No feeds added yet
                    </span>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
