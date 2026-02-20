import pool from '../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    const { slug } = await params;
    try {
        const { rows } = await pool.query(
            'SELECT * FROM "Resource" WHERE "slug" = $1',
            [slug]
        );
        const resource = rows[0];

        if (!resource) {
            return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        }

        return NextResponse.json({ resource });
    } catch (error) {
        console.error("Fetch resource error:", error);
        return NextResponse.json({ error: "Failed to fetch resource" }, { status: 500 });
    }
}
