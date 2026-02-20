import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';

const streamPipeline = promisify(pipeline);
const STORAGE_DIR = path.join(process.cwd(), 'storage', 'pdfs');
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

export async function GET(request, { params }) {
    const { id } = await params;
    const filePath = path.join(STORAGE_DIR, `${id}.pdf`);

    // Ensure storage directory exists
    if (!fs.existsSync(STORAGE_DIR)) {
        fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }

    // 1. Check if cached locally
    if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${id}.pdf"`,
            },
        });
    }

    // 2. Download from Google Drive if not cached
    try {
        const driveUrl = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${API_KEY}`;
        const response = await fetch(driveUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch from Drive: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Save to local storage for persistence
        fs.writeFileSync(filePath, buffer);

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${id}.pdf"`,
            },
        });
    } catch (error) {
        console.error('PDF Proxy Error:', error);
        return NextResponse.json({ error: 'Failed to retrieve PDF' }, { status: 500 });
    }
}
