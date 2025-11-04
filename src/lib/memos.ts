import { db } from '@/db'
import { memos } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { MoodType } from './types'
import { MOODS } from './consts'

// Server-side check helper
const ensureServerSide = () => {
  if (typeof window !== 'undefined') {
    throw new Error('MemosService can only be used on the server-side')
  }
  if (!db) {
    throw new Error('Database connection not available')
  }
}

export interface CreateMemoInput {
  title: string
  content: string
  mood: string
  date: string
}

export interface UpdateMemoInput {
  id: number
  title: string
  content: string
  mood: string
  date: string
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

export class MemosService {
  static async getAllMemos(): Promise<Array<Memo>> {
    ensureServerSide()
    try {
      const result = await db!
        .select()
        .from(memos)
        .orderBy(desc(memos.updatedAt))

      return result.map((memo) => ({
        id: memo.id,
        title: memo.title,
        content: memo.content,
        mood: memo.mood,
        date: memo.date,
        createdAt: memo.createdAt,
        updatedAt: memo.updatedAt,
      }))
    } catch (error) {
      console.error('Error fetching memos:', error)
      throw new Error('Failed to fetch memos')
    }
  }

  static async getMemoById(id: number): Promise<Memo | null> {
    ensureServerSide()
    try {
      const result = await db!
        .select()
        .from(memos)
        .where(eq(memos.id, id))
        .limit(1)

      if (result.length === 0) {
        return null
      }

      const memo = result[0]
      return {
        id: memo.id,
        title: memo.title,
        content: memo.content,
        mood: memo.mood,
        date: memo.date,
        createdAt: memo.createdAt,
        updatedAt: memo.updatedAt,
      }
    } catch (error) {
      console.error('Error fetching memo by id:', error)
      throw new Error('Failed to fetch memo')
    }
  }

  static async createMemo(input: CreateMemoInput): Promise<Memo> {
    ensureServerSide()
    try {
      const result = await db!
        .insert(memos)
        .values({
          title: input.title,
          content: input.content,
          mood: input.mood,
          date: input.date,
        })
        .returning()

      const memo = result[0]
      return {
        id: memo.id,
        title: memo.title,
        content: memo.content,
        mood: memo.mood,
        date: memo.date,
        createdAt: memo.createdAt,
        updatedAt: memo.updatedAt,
      }
    } catch (error) {
      console.error('Error creating memo:', error)
      throw new Error('Failed to create memo')
    }
  }

  static async updateMemo(input: UpdateMemoInput): Promise<Memo> {
    ensureServerSide()
    try {
      const result = await db!
        .update(memos)
        .set({
          title: input.title,
          content: input.content,
          mood: input.mood,
          date: input.date,
          updatedAt: new Date(),
        })
        .where(eq(memos.id, input.id))
        .returning()

      if (result.length === 0) {
        throw new Error('Memo not found')
      }

      const memo = result[0]
      return {
        id: memo.id,
        title: memo.title,
        content: memo.content,
        mood: memo.mood,
        date: memo.date,
        createdAt: memo.createdAt,
        updatedAt: memo.updatedAt,
      }
    } catch (error) {
      console.error('Error updating memo:', error)
      throw new Error('Failed to update memo')
    }
  }

  static async deleteMemo(id: number): Promise<boolean> {
    ensureServerSide()
    try {
      const result = await db!.delete(memos).where(eq(memos.id, id)).returning()

      return result.length > 0
    } catch (error) {
      console.error('Error deleting memo:', error)
      throw new Error('Failed to delete memo')
    }
  }

  static async getMemosByDate(date: string): Promise<Memo[]> {
    ensureServerSide()
    try {
      const result = await db!
        .select()
        .from(memos)
        .where(eq(memos.date, date))
        .orderBy(desc(memos.updatedAt))

      return result.map((memo) => ({
        id: memo.id,
        title: memo.title,
        content: memo.content,
        mood: memo.mood,
        date: memo.date,
        createdAt: memo.createdAt,
        updatedAt: memo.updatedAt,
      }))
    } catch (error) {
      console.error('Error fetching memos by date:', error)
      throw new Error('Failed to fetch memos by date')
    }
  }

  static async getMemosByMood(mood: string): Promise<Memo[]> {
    ensureServerSide()
    try {
      const result = await db!
        .select()
        .from(memos)
        .where(eq(memos.mood, mood))
        .orderBy(desc(memos.updatedAt))

      return result.map((memo) => ({
        id: memo.id,
        title: memo.title,
        content: memo.content,
        mood: memo.mood,
        date: memo.date,
        createdAt: memo.createdAt,
        updatedAt: memo.updatedAt,
      }))
    } catch (error) {
      console.error('Error fetching memos by mood:', error)
      throw new Error('Failed to fetch memos by mood')
    }
  }
}
