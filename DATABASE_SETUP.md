# Database Setup Guide (PostgreSQL)

This project has been migrated from Prisma to raw PostgreSQL for enhanced performance and control.

## Environment Variables

Ensure your `.env` file contains the correct `DATABASE_URL`:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
```

> [!IMPORTANT]
> The `DATABASE_URL` must use the standard PostgreSQL connection string format (starting with `postgresql://`).

## Database Initialization

To set up the database schema and initialize it with seed data, run the following commands:

```bash
# 1. Install dependencies
npm install

# 2. Run schema migration
node prisma/migrate.js

# 3. Run seed data script
node prisma/seed.js
```

## Project Structure

- `lib/db.js`: PostgreSQL connection pool using `pg`.
- `prisma/schema.sql`: Raw SQL for creating the database tables.
- `prisma/migrate.js`: Runner for the SQL schema.
- `prisma/seed.js`: Script to populate the database with initial users and resources.

## Development

All database queries are now handled using raw SQL via the `pool.query()` method from `lib/db.js`.

```javascript
import pool from './lib/db';

const { rows } = await pool.query('SELECT * FROM "User"');
```
