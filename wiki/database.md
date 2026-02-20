# Database Architecture

The project uses a **PostgreSQL** database for persistent storage. It was recently migrated from Prisma to raw SQL for better performance and control.

## Connection Management

Database connections are managed via a connection pool in [lib/db.js](../lib/db.js).

```javascript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default pool;
```

## Schema Persistence

The schema is defined in [prisma/schema.sql](../prisma/schema.sql).

### Tables

#### `User`
- `id`: TEXT (Primary Key, UUID)
- `username`: TEXT (Unique)
- `name`: TEXT
- `passwordHash`: TEXT
- `role`: TEXT (default: 'student')
- `gradeLevel`: TEXT (NULL for students, 'all' for teachers/admins)
- `createdAt`: TIMESTAMP
- `updatedAt`: TIMESTAMP

#### `Resource`
- `id`: TEXT (Primary Key, UUID)
- `name`: TEXT (Unique)
- `slug`: TEXT (Unique)
- `description`: TEXT
- `driveFolderId`: TEXT
- `icon`: TEXT (default: '📚')
- `color`: TEXT
- `sortOrder`: INTEGER
- `active`: BOOLEAN

## Migrations & Seeding

- **`prisma/migrate.js`**: Runs the SQL schema script against the database.
- **`prisma/seed.js`**: Populates the database with default resources (Quipper, Phoenix) and the admin user.

Run both with:
```bash
node prisma/migrate.js && node prisma/seed.js
```
