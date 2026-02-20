import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM "Resource" WHERE "active" = true ORDER BY "sortOrder" ASC'
        );
        return NextResponse.json({ resources: rows });
    } catch (error) {
        console.error("Fetch resources error:", error);
        return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
    }
}
