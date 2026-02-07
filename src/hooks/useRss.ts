import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { get } from '@/lib/utils'
import type { RssArticleWithFeed, RssCategory } from '@/lib/types'

type Bookmark = { id: number; url: string }

const fetchArticles = () =>
  fetch('/api/rss').then((r) => r.json()) as Promise<Array<RssArticleWithFeed>>

export function useRss() {
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

  return {
    articles,
    filtered,
    categories,
    bookmarkedUrls,
    isLoading,
    activeCategory,
    setActiveCategory,
    handleDeleteArticle,
    handleBookmark,
  }
}
