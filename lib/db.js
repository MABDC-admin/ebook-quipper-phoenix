import { Pool } from 'pg';

const globalForPool = globalThis;

const pool = globalForPool.pgPool || new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

if (process.env.NODE_ENV !== 'production') globalForPool.pgPool = pool;

export default pool;
