const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function main() {
    try {
        const adminHash = await bcrypt.hash('Denskie123', 12);

        // Upsert admin user
        await pool.query(`
            INSERT INTO "User" (username, name, "passwordHash", role, "gradeLevel", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, NOW())
            ON CONFLICT (username) DO NOTHING
        `, ['denskie', 'Denskie (Admin)', adminHash, 'admin', 'all']);

        // Upsert second admin user
        await pool.query(`
            INSERT INTO "User" (username, name, "passwordHash", role, "gradeLevel", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, NOW())
            ON CONFLICT (username) DO NOTHING
        `, ['dennis', 'Dennis (Admin)', adminHash, 'admin', 'all']);

        // Upsert Quipper resource
        await pool.query(`
            INSERT INTO "Resource" (name, slug, description, "driveFolderId", icon, color, "sortOrder", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            ON CONFLICT (slug) DO NOTHING
        `, [
            'Quipper',
            'quipper',
            'Quipper eBook library for K-12 curricula.',
            '1x3X9hRWjqzHnSyPYYMu4b_Suupu3oXspUJCB6gKBq-En3xQjfimf3jcAOpOqnBeTE9m6QskX',
            '📘',
            '#6366f1',
            0
        ]);

        // Upsert Phoenix resource
        await pool.query(`
            INSERT INTO "Resource" (name, slug, description, "driveFolderId", icon, color, "sortOrder", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            ON CONFLICT (slug) DO NOTHING
        `, [
            'Phoenix',
            'phoenix',
            'Phoenix eBook library.',
            'PLACEHOLDER_PHOENIX_FOLDER_ID',
            '🔥',
            '#f59e0b',
            1
        ]);

        console.log('Seed complete: admin user + 2 resources');
    } catch (error) {
        console.error('Seed error:', error);
    } finally {
        await pool.end();
    }
}

main();
