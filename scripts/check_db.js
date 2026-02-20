const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function check() {
    try {
        const users = await pool.query('SELECT count(*) FROM "User"');
        const resources = await pool.query('SELECT count(*) FROM "Resource"');
        console.log(`Users count: ${users.rows[0].count}`);
        console.log(`Resources count: ${resources.rows[0].count}`);

        if (resources.rows[0].count > 0) {
            const first = await pool.query('SELECT * FROM "Resource" LIMIT 1');
            console.log('First resource:', JSON.stringify(first.rows[0]));
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

check();
