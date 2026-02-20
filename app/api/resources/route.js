import prisma from '../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    const resources = await prisma.resource.findMany({
        where: { active: true },
        orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ resources });
}
