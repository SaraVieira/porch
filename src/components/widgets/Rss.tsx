import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ArrowUpRight, Bookmark, X } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/card'
import { ScrollArea } from '../ui/scroll-area'
import { Skeleton } from '../ui/skeleton'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { get } from '@/lib/utils'
import type { RssArticleWithFeed, RssCategory } from '@/lib/types'

type Bookmark = { id: number; url: string }

const fetchArticles = () =>
  fetch('/api/rss').then((r) => r.json()) as Promise<Array<RssArticleWithFeed>>

function ArticleSkeleton() {
  return (
    <div className="flex gap-3 p-2">
      <Skeleton className="w-5 h-5 rounded shrink-0" />
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}

export const Rss = () => {
  const queryClient = useQueryClient()
  const [activeCategory, setActiveCategory] = useState<number | null>(null)

  const { data: articles, isLoading } = useQuery({
    queryKey: ['rss', 'widget'],
    queryFn: fetchArticles,
    staleTime: 5 * 60 * 1000,
  })

  const { data: categories = [] } = useQuery<Array<RssCategory>>({
    queryKey: ['rss-categories'],
    queryFn: () => get('/api/rss/categories'),
  })

  const { data: bookmarks = [] } = useQuery<Array<Bookmark>>({
    queryKey: ['bookmarks'],
    queryFn: () => get('/api/bookmarks'),
  })

  const bookmarkedUrls = new Set(bookmarks.map((b) => b.url))

  const filtered = articles
    ? articles.filter(
        (a) => activeCategory === null || a.categoryId === activeCategory,
      )
    : []

  const handleDeleteArticle = async (
    e: React.MouseEvent,
    articleId: number,
  ) => {
    e.preventDefault()
    e.stopPropagation()
    await fetch(`/api/rss/articles/${articleId}`, { method: 'DELETE' })
    queryClient.invalidateQueries({ queryKey: ['rss'] })
  }

  const handleBookmark = (e: React.MouseEvent, article: RssArticleWithFeed) => {
    e.preventDefault()
    e.stopPropagation()
    // Optimistic update
    queryClient.setQueryData<Array<Bookmark>>(['bookmarks'], (old) => [
      { id: -1, url: article.link },
      ...(old ?? []),
    ])
    fetch('/api/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ url: article.link }),
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    })
  }

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <h3 className="font-semibold">RSS</h3>
        <Link to="/rss">
          <ArrowUpRight className="w-4 text-orange-accent" />
        </Link>
      </CardHeader>
      <CardContent>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            <Badge
              variant={activeCategory === null ? 'default' : 'outline'}
              className="cursor-pointer text-[11px] px-1.5 py-0"
              onClick={() => setActiveCategory(null)}
            >
              All
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                className="cursor-pointer text-[11px] px-1.5 py-0"
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.name}
              </Badge>
            ))}
          </div>
        )}
        <ScrollArea className="h-[500px]">
          {isLoading || !articles ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <ArticleSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {filtered.slice(0, 20).map((article) => (
                <div
                  key={article.id}
                  className="flex gap-3 p-2 rounded hover:bg-accent/50 transition-colors group"
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
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-medium line-clamp-2 leading-tight">
                        {article.title}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {article.feedTitle}
                      </span>
                      {article.publishedAt && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(article.publishedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                    </div>
                  </a>
                  <div
                    className={`flex shrink-0 transition-opacity ${bookmarkedUrls.has(article.link) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) =>
                        !bookmarkedUrls.has(article.link) &&
                        handleBookmark(e, article)
                      }
                      title={
                        bookmarkedUrls.has(article.link)
                          ? 'Already bookmarked'
                          : 'Save to bookmarks'
                      }
                    >
                      <Bookmark
                        className={`w-3.5 h-3.5 ${bookmarkedUrls.has(article.link) ? 'fill-current text-orange-accent' : ''}`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => handleDeleteArticle(e, article.id)}
                      title="Remove article"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {articles.length === 0
                    ? 'No articles yet. Add feeds on the RSS page.'
                    : 'No articles in this category.'}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
