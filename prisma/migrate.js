const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function migrate() {
    try {
        console.log('Reading schema.sql...');
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

        console.log('Executing schema...');
        await pool.query(schema);
        console.log('Schema migration successful!');

    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();
