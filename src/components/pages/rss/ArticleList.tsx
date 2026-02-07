import { formatDistanceToNow } from 'date-fns'
import { Bookmark, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { RssArticleWithFeed } from '@/lib/types'

type ArticleListProps = {
  articles: Array<RssArticleWithFeed>
  filtered: Array<RssArticleWithFeed>
  bookmarkedUrls: Set<string>
  onDeleteArticle: (e: React.MouseEvent, articleId: number) => void
  onBookmark: (e: React.MouseEvent, link: string) => void
}

export function ArticleList({
  articles,
  filtered,
  bookmarkedUrls,
  onDeleteArticle,
  onBookmark,
}: ArticleListProps) {
  return (
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
          <div
            className={`flex shrink-0 transition-opacity ${bookmarkedUrls.has(article.link) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) =>
                !bookmarkedUrls.has(article.link) &&
                onBookmark(e, article.link)
              }
              title={
                bookmarkedUrls.has(article.link)
                  ? 'Already bookmarked'
                  : 'Save to bookmarks'
              }
            >
              <Bookmark
                className={`w-4 h-4 ${bookmarkedUrls.has(article.link) ? 'fill-current text-orange-accent' : ''}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => onDeleteArticle(e, article.id)}
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
            : 'No matching articles found'}
        </div>
      )}
    </div>
  )
}
