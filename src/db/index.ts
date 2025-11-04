import { config } from 'dotenv'

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema.ts'

// Only initialize database connection on server-side
if (typeof window === 'undefined') {
  config()
}

let pool: Pool | undefined
let db: ReturnType<typeof drizzle>

if (typeof window === 'undefined') {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  })
  db = drizzle(pool, { schema })
}

export { db }
