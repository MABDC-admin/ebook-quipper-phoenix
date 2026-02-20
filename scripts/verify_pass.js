const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function verifyPassword() {
    try {
        const { rows } = await pool.query('SELECT username, "passwordHash" FROM "User" WHERE username = $1', ['denskie']);
        if (rows.length === 0) {
            console.log('User not found');
            return;
        }

        const user = rows[0];
        const match = await bcrypt.compare('Denskie123', user.passwordHash);
        console.log('Password "Denskie123" matches hash for "denskie":', match);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

verifyPassword();
