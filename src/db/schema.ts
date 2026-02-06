import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  done: boolean().default(false).notNull(),
  done_by: date(),
})

export const memos = pgTable('memos', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  mood: text('mood').notNull().default('neutral'),
  date: text('date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const countries = pgTable('countries', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  region: text('region'),
  flag: text('flag'),
  location: jsonb('location').$type<Array<number>>(),
  subregion: text('subregion'),
  currency: text('currency'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const games = pgTable('games', {
  id: text('id').primaryKey(),
  image: text('image'),
  name: text('name').notNull(),
  dev: text('dev'),
  genres: jsonb('genres').$type<Array<string>>(),
  platforms: jsonb('platforms').$type<Array<string>>(),
  summary: text('summary'),
  steam: integer('steam'),
  score: integer('score'),
  release: text('release'),
  time: text('time'),
  notes: text('notes'),
  date: text('date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const conferences = pgTable('conferences', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  notes: text('notes'),
  city: text('city'),
  link: text('link'),
  country_name: text('country_name'),
  country_region: text('country_region'),
  country_flag: text('country_flag'),
  country_lat: text('country_lat'),
  country_lng: text('country_lng'),
  country_subregion: text('country_subregion'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const user = pgTable('user', {
  id: serial('id').primaryKey(),
  password: text('password').notNull(),
})

export const habits = pgTable('habits', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  emoji: text('emoji').default(''),
  color: text('color').default('#8b5cf6'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const habitCompletions = pgTable('habit_completions', {
  id: serial('id').primaryKey(),
  habitId: integer('habit_id').notNull(),
  date: text('date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})
