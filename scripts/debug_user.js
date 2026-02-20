const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkUser() {
    try {
        const { rows } = await pool.query('SELECT username, role, "passwordHash" FROM "User" WHERE username = $1', ['dennis']);
        if (rows.length === 0) {
            console.log('User "dennis" NOT FOUND');
        } else {
            console.log('User "dennis" found:', rows[0].username, 'Role:', rows[0].role);
            console.log('Hash exists:', !!rows[0].passwordHash);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkUser();
