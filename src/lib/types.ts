export interface Stream {
  id: string // Unique identifier for the stream
  streamNo: number // Stream number/index
  language: string // Stream language (e.g., "English", "Spanish")
  hd: boolean // Whether the stream is in HD quality
  embedUrl: string // URL that can be used to embed the stream
  source: string // Source identifier (e.g., "alpha", "bravo")
}

export interface APIMatch {
  id: string // Unique identifier for the match
  title: string // Match title (e.g. "Team A vs Team B")
  category: string // Sport category (e.g. "football", "basketball")
  date: number // Unix timestamp in milliseconds
  poster?: string // URL path to match poster image
  popular: boolean // Whether the match is marked as popular
  teams?: {
    home?: {
      name: string // Home team name
      badge: string // URL path to home team badge
    }
    away?: {
      name: string // Away team name
      badge: string // URL path to away team badge
    }
  }
  sources: Array<{
    source: string // Stream source identifier (e.g. "alpha", "bravo")
    id: string // Source-specific match ID
  }>
}


export interface Memo {
  id: number
  title: string
  content: string
  mood: string
  date: string
  createdAt: Date | null
  updatedAt: Date | null
}


export type MoodType =
  | 'happy'
  | 'sad'
  | 'neutral'
  | 'excited'
  | 'anxious'
  | 'calm'
  | 'energetic'
  | 'tired'
  | 'grateful'
