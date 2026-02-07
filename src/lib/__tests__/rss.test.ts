import { describe, it, expect } from 'vitest'
import { parseFeed, getFaviconUrl } from '../rss'

describe('parseFeed', () => {
  it('parses RSS 2.0 feed', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>Test Feed</title>
        <item>
          <title>Article 1</title>
          <link>https://example.com/1</link>
          <guid>guid-1</guid>
          <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>
          <dc:creator>Author 1</dc:creator>
        </item>
        <item>
          <title>Article 2</title>
          <link>https://example.com/2</link>
          <guid>guid-2</guid>
        </item>
      </channel>
    </rss>`

    const result = parseFeed(xml)
    expect(result).toHaveLength(2)
    expect(result[0].title).toBe('Article 1')
    expect(result[0].link).toBe('https://example.com/1')
    expect(result[0].guid).toBe('guid-1')
    expect(result[0].publishedAt).toBe('Mon, 01 Jan 2024 00:00:00 GMT')
    expect(result[0].author).toBe('Author 1')
    expect(result[1].title).toBe('Article 2')
    expect(result[1].author).toBeNull()
  })

  it('parses Atom feed', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <feed xmlns="http://www.w3.org/2005/Atom">
      <title>Atom Feed</title>
      <entry>
        <title>Entry 1</title>
        <link href="https://example.com/entry-1" rel="alternate"/>
        <id>entry-1</id>
        <published>2024-01-01T00:00:00Z</published>
        <author><name>Author A</name></author>
      </entry>
    </feed>`

    const result = parseFeed(xml)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Entry 1')
    expect(result[0].link).toBe('https://example.com/entry-1')
    expect(result[0].guid).toBe('entry-1')
    expect(result[0].publishedAt).toBe('2024-01-01T00:00:00Z')
    expect(result[0].author).toBe('Author A')
  })

  it('returns empty array for malformed XML', () => {
    const result = parseFeed('this is not xml at all <><>')
    expect(result).toEqual([])
  })

  it('returns empty array for empty feed', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>Empty Feed</title>
      </channel>
    </rss>`

    const result = parseFeed(xml)
    expect(result).toEqual([])
  })

  it('handles single item (not array)', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>Single Item Feed</title>
        <item>
          <title>Only Article</title>
          <link>https://example.com/only</link>
          <guid>guid-only</guid>
        </item>
      </channel>
    </rss>`

    const result = parseFeed(xml)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Only Article')
  })
})

describe('getFaviconUrl', () => {
  it('returns Google favicon service URL', () => {
    const result = getFaviconUrl('https://example.com')
    expect(result).toContain('gstatic.com/faviconV2')
    expect(result).toContain(encodeURIComponent('https://example.com'))
    expect(result).toContain('size=128')
  })

  it('encodes special characters in URL', () => {
    const result = getFaviconUrl('https://example.com/path?foo=bar&baz=qux')
    expect(result).toContain(
      encodeURIComponent('https://example.com/path?foo=bar&baz=qux'),
    )
  })
})
