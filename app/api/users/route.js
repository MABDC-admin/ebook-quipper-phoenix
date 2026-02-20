import prisma from '../../../lib/prisma';
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

    const users = await prisma.user.findMany({
        select: { id: true, username: true, name: true, role: true, gradeLevel: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
}

export async function POST(req) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { username, name, password, role, gradeLevel } = await req.json();

    if (!username || !name || !password) {
        return NextResponse.json({ error: 'Username, name, and password are required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const finalRole = role || 'student';
    // Teachers and admins always get access to all grades
    const finalGrade = (finalRole === 'teacher' || finalRole === 'admin') ? 'all' : (gradeLevel || null);

    const user = await prisma.user.create({
        data: { username, name, passwordHash, role: finalRole, gradeLevel: finalGrade },
    });

    return NextResponse.json({ user: { id: user.id, username: user.username, name: user.name, role: user.role, gradeLevel: user.gradeLevel } }, { status: 201 });
}

export async function PATCH(req) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { id, role, gradeLevel, name } = await req.json();

    if (!id) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

    const data = {};
    if (role) {
        data.role = role;
        // Teachers and admins always get access to all grades
        if (role === 'teacher' || role === 'admin') data.gradeLevel = 'all';
    }
    if (gradeLevel !== undefined && data.gradeLevel === undefined) data.gradeLevel = gradeLevel || null;
    if (name) data.name = name;

    const user = await prisma.user.update({
        where: { id },
        data,
    });

    return NextResponse.json({ user: { id: user.id, username: user.username, name: user.name, role: user.role, gradeLevel: user.gradeLevel } });
}

export async function DELETE(req) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

    // Prevent deleting self
    if (id === session.user.id) {
        return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
}
