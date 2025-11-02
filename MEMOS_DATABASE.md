# Memos Database Integration with TanStack Start Server Routes

This document outlines the complete database integration for the memos diary feature, using TanStack Start's server-side rendering with PostgreSQL persistence via Drizzle ORM.

## Overview

The memos feature now uses a PostgreSQL database for persistent storage, providing:
- **Reliable data persistence** across sessions and devices
- **Structured data storage** with proper typing
- **Query capabilities** for filtering and searching
- **Scalability** for large numbers of entries
- **Data integrity** with proper constraints

## Database Schema

### Memos Table

```sql
CREATE TABLE memos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood TEXT DEFAULT 'neutral' NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Field Descriptions

- **id**: Auto-incrementing primary key
- **title**: Entry title (required)
- **content**: Rich text content (required)
- **mood**: User's emotional state (default: 'neutral')
- **date**: Date string for grouping entries
- **created_at**: Timestamp when entry was created
- **updated_at**: Timestamp when entry was last modified

## Technical Implementation

### Database Configuration

The database connection is configured through environment variables:

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

### Drizzle ORM Setup

Located in `src/db/`:
- `schema.ts` - Database schema definitions
- `index.ts` - Database connection and Drizzle setup

### Service Layer

`src/lib/memos.ts` contains the `MemosService` class with methods:

```typescript
class MemosService {
  static async getAllMemos(): Promise<Memo[]>
  static async getMemoById(id: number): Promise<Memo | null>
  static async createMemo(input: CreateMemoInput): Promise<Memo>
  static async updateMemo(input: UpdateMemoInput): Promise<Memo>
  static async deleteMemo(id: number): Promise<boolean>
  static async getMemosByDate(date: string): Promise<Memo[]>
  static async getMemosByMood(mood: string): Promise<Memo[]>
}
```

### Frontend Integration

The implementation uses a hybrid approach:
- **Server-side data fetching** with TanStack Start loaders
- **Client-side mutations** with TanStack Query for write operations
- **Server route APIs** for mutation endpoints
- **Router invalidation** for data refresh

```typescript
// Server-side loader for initial data
export const Route = createFileRoute('/memos')({
  loader: async () => {
    const memos = await MemosService.getAllMemos()
    return { memos }
  },
  component: MemosPage,
})

// Client-side mutations
const createMemoMutation = useMutation({
  mutationFn: (memo) => fetch('/api/memos', { 
    method: 'POST', 
    body: JSON.stringify(memo) 
  }),
  onSuccess: () => router.invalidate()
})
```

## Migration from localStorage

### Automatic Migration

When users first load the updated application:
1. Check if localStorage data exists
2. If found, migrate data to database
3. Clear localStorage after successful migration
4. Show migration success message

### Data Transformation

localStorage format → Database format:
- String IDs → Numeric IDs
- ISO timestamps → Database timestamps
- Direct mood strings → Validated mood types

## Server Routes Architecture

### API Route Structure

```
src/routes/api/
├── memos.ts          # GET /api/memos, POST /api/memos
└── memos.$id.ts      # GET/PUT/DELETE /api/memos/:id
```

### Server Route Implementation

```typescript
// src/routes/api/memos.ts
export async function GET({ request }: { request: Request }) {
  const url = new URL(request.url)
  const date = url.searchParams.get('date')
  const mood = url.searchParams.get('mood')
  
  let memos
  if (date) {
    memos = await MemosService.getMemosByDate(date)
  } else if (mood) {
    memos = await MemosService.getMemosByMood(mood)
  } else {
    memos = await MemosService.getAllMemos()
  }
  
  return json(memos)
}

export async function POST({ request }: { request: Request }) {
  const body = await request.json()
  const memo = await MemosService.createMemo(body)
  return json(memo, { status: 201 })
}
```

### Client-Side Usage

```typescript
// Server-side loader for initial data
const { memos } = Route.useLoaderData()

// Client-side mutations via API routes
const createMemoMutation = useMutation({
  mutationFn: async (memo) => {
    const response = await fetch('/api/memos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memo),
    })
    return response.json()
  },
  onSuccess: () => router.invalidate()
})
```

## Performance Optimizations

### Query Optimizations

- **Indexed queries** on frequently used fields
- **Pagination** for large datasets
- **Selective loading** of content
- **Caching strategies** with TanStack Query

### Database Optimizations

```sql
-- Add indexes for common queries
CREATE INDEX idx_memos_date ON memos(date);
CREATE INDEX idx_memos_mood ON memos(mood);
CREATE INDEX idx_memos_created_at ON memos(created_at DESC);
```

## Error Handling

### Database Errors

- Connection failures
- Query timeouts
- Constraint violations
- Transaction rollbacks

### Frontend Error Handling

```typescript
// Server-side error handling in loaders
export const Route = createFileRoute('/memos')({
  loader: async () => {
    try {
      const memos = await MemosService.getAllMemos()
      return { memos }
    } catch (error) {
      throw new Error('Failed to load memos')
    }
  }
})

// Client-side error handling for mutations
const createMemoMutation = useMutation({
  mutationFn: createMemo,
  onError: (error) => {
    toast.error(`Failed to create memo: ${error.message}`)
  }
})
```

## Security Considerations

### Data Protection

- **Input validation** on all user inputs
- **SQL injection prevention** through Drizzle ORM
- **XSS protection** for rich text content
- **Access control** (future: user authentication)

### Environment Security

- Database credentials in environment variables
- No sensitive data in client-side code
- Secure connection strings
- Regular backup procedures

## Backup and Recovery

### Automated Backups

```bash
# Daily backup script
pg_dump $DATABASE_URL > backups/memos_$(date +%Y%m%d).sql
```

### Recovery Procedures

```bash
# Restore from backup
psql $DATABASE_URL < backups/memos_20241102.sql
```

## Development Workflow

### Running Migrations

```bash
# Generate migration files
pnpm run db:generate

# Apply migrations
pnpm run db:migrate

# Push schema changes (development)
pnpm run db:push
```

### Database Management

```bash
# Open database studio
pnpm run db:studio

# Pull schema from database
pnpm run db:pull
```

## Testing

### Unit Tests

- Service layer methods
- Data validation
- Error scenarios
- Edge cases

### Integration Tests

- Database operations
- Query performance
- Migration scripts
- Backup/restore procedures

## Monitoring

### Performance Metrics

- Query execution times
- Database connection pool usage
- Memory usage patterns
- Cache hit rates

### Health Checks

- Database connectivity
- Query response times
- Error rates
- Data integrity checks

## Future Enhancements

### Planned Features

- **Full-text search** across memo content
- **Advanced filtering** by date ranges and multiple moods
- **Export functionality** to various formats
- **Real-time sync** for multi-device access
- **User authentication** and multi-user support
- **Server-side pagination** for large datasets
- **Streaming responses** for better performance

### Scalability Improvements

- **Server-side caching** with TanStack Start
- **Read replicas** for improved performance
- **Horizontal sharding** for large datasets
- **CDN integration** for image assets
- **Edge computing** for global performance
- **Streaming SSR** for faster page loads

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Check DATABASE_URL format
   - Verify database server is running
   - Check network connectivity

2. **Migration Failures**
   - Review migration files
   - Check for data conflicts
   - Verify database permissions

3. **Performance Issues**
   - Analyze slow queries
   - Check index usage
   - Monitor resource usage

### Debug Tools

```bash
# Check database connection
psql $DATABASE_URL -c "SELECT 1"

# View active connections
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity"

# Analyze query performance
EXPLAIN ANALYZE SELECT * FROM memos WHERE date = 'today'
```

## Contributing

When working with the database:

1. **Always create migrations** for schema changes
2. **Test migrations** in development first
3. **Follow naming conventions** for tables and fields
4. **Document complex queries** with comments
5. **Consider backward compatibility** for schema changes

## Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TanStack Query Guide](https://tanstack.com/query/latest)
- [Database Design Best Practices](https://www.postgresql.org/docs/current/ddl-best-practices.html)