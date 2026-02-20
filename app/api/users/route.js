import pool from '../../../lib/db';
import { auth } from '../../../auth';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

async function requireAdmin() {
    const session = await auth();
    if (!session || session.user?.role !== 'admin') {
        return null;
    }
    return session;
}

export async function GET() {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const { rows } = await pool.query(
            'SELECT id, username, name, role, "gradeLevel", "createdAt" FROM "User" ORDER BY "createdAt" DESC'
        );
        return NextResponse.json({ users: rows });
    } catch (error) {
        console.error("Fetch users error:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function POST(req) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const { username, name, password, role, gradeLevel } = await req.json();

        if (!username || !name || !password) {
            return NextResponse.json({ error: 'Username, name, and password are required' }, { status: 400 });
        }

        const { rows: existingRows } = await pool.query(
            'SELECT id FROM "User" WHERE "username" = $1',
            [username]
        );
        if (existingRows.length > 0) {
            return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const finalRole = role || 'student';
        const finalGrade = (finalRole === 'teacher' || finalRole === 'admin') ? 'all' : (gradeLevel || null);

        const { rows } = await pool.query(
            'INSERT INTO "User" (username, name, "passwordHash", role, "gradeLevel", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, username, name, role, "gradeLevel"',
            [username, name, passwordHash, finalRole, finalGrade]
        );

        return NextResponse.json({ user: rows[0] }, { status: 201 });
    } catch (error) {
        console.error("Create user error:", error);
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
}

export async function PATCH(req) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const { id, role, gradeLevel, name } = await req.json();

        if (!id) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

        let query = 'UPDATE "User" SET "updatedAt" = NOW()';
        const params = [];
        let paramIndex = 1;

        if (role) {
            query += `, "role" = $${paramIndex++}`;
            params.push(role);
            if (role === 'teacher' || role === 'admin') {
                query += `, "gradeLevel" = $${paramIndex++}`;
                params.push('all');
            }
        }

        if (gradeLevel !== undefined && (role !== 'teacher' && role !== 'admin')) {
            query += `, "gradeLevel" = $${paramIndex++}`;
            params.push(gradeLevel || null);
        }

        if (name) {
            query += `, "name" = $${paramIndex++}`;
            params.push(name);
        }

        query += ` WHERE "id" = $${paramIndex} RETURNING id, username, name, role, "gradeLevel"`;
        params.push(id);

        const { rows } = await pool.query(query, params);

        if (rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user: rows[0] });
    } catch (error) {
        console.error("Update user error:", error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}

export async function DELETE(req) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const { id } = await req.json();
        if (!id) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

        if (id === session.user.id) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
        }

        const { rowCount } = await pool.query('DELETE FROM "User" WHERE "id" = $1', [id]);

        if (rowCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete user error:", error);
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}
