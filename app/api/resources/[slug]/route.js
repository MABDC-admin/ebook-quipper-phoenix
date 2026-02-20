import prisma from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    const { slug } = await params;
    const resource = await prisma.resource.findUnique({
        where: { slug },
    });

    if (!resource) {
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    return NextResponse.json({ resource });
}
