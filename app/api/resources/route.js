import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        console.log("Fetching active resources from DB...");
        const { rows } = await pool.query(
            'SELECT * FROM "Resource" WHERE "active" = true ORDER BY "sortOrder" ASC'
        );
        console.log(`Successfully fetched ${rows.length} resources`);
        return NextResponse.json({ resources: rows });
    } catch (error) {
        console.error("Fetch resources error:", error);
        return NextResponse.json({
            error: "Failed to fetch resources",
            details: error.message
        }, { status: 500 });
    }
}
