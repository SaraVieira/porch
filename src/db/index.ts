import { config } from 'dotenv'

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema.ts'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'

// Only load dotenv on server-side
if (typeof window === 'undefined') {
  config()
}

// Server-side database initialization
let dbInstance: NodePgDatabase<typeof schema> | null = null
let pool: Pool | null = null

function createDatabase(): NodePgDatabase<typeof schema> {
  if (typeof window !== 'undefined') {
    throw new Error('Database can only be created on the server-side')
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  }

  return drizzle(pool, { schema })
}

function getDb(): NodePgDatabase<typeof schema> {
  if (typeof window !== 'undefined') {
    throw new Error('Database can only be accessed on the server-side')
  }

  if (!dbInstance) {
    dbInstance = createDatabase()
  }

  return dbInstance
}

// Export a default instance for convenience
export const db = typeof window === 'undefined' ? getDb() : null
