import { useState } from 'react'
import {
  useSuspenseQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { get } from '@/lib/utils'
import { getRssArticles } from '@/lib/rss'
import type { RssArticleWithFeed, RssCategory, RssFeed } from '@/lib/types'

type Bookmark = { id: number; url: string }

export const getArticles = createServerFn({
  method: 'GET',
}).handler(() => getRssArticles())

export function useRssPage(loader: Array<RssArticleWithFeed>) {
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

  return {
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
  }
}
