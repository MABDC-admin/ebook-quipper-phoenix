import { NextResponse } from 'next/server';

const FOLDER_ID = '1H3_u1qc7DQ1-zpsrdwxEPqvNy0YpM9uO3QLMgrDiQ43PDyQ6n0R8QWUS1MVWWOyDAb9GBSAr';
const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get('key');

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key required as query parameter: ?key=YOUR_KEY' },
      { status: 400 }
    );
  }

  try {
    const params = new URLSearchParams({
      key: apiKey,
      q: `'${FOLDER_ID}' in parents and trashed = false`,
      fields: 'files(id,name,mimeType,webContentLink)',
      pageSize: '100',
    });

    const listRes = await fetch(`${DRIVE_API_URL}?${params.toString()}`);
    if (!listRes.ok) {
      throw new Error(`Failed to list files: ${listRes.status}`);
    }

    const listData = await listRes.json();
    const files = listData.files || [];

    const downloadedFiles = [];
    for (const file of files) {
      try {
        const downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${apiKey}`;
        const fileRes = await fetch(downloadUrl);
        
        if (fileRes.ok) {
          const arrayBuffer = await fileRes.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          
          downloadedFiles.push({
            name: file.name,
            mimeType: file.mimeType,
            data: base64,
          });
        }
      } catch (err) {
        console.error(`Failed to download ${file.name}:`, err);
      }
    }

    return NextResponse.json({ files: downloadedFiles });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to download files' },
      { status: 500 }
    );
  }
}
