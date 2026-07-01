import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, mkdirSync } from 'fs';
import { join, extname } from 'path';

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Upload only available in development' }, { status: 403 });
  }
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  mkdirSync(uploadsDir, { recursive: true });

  const ext = extname(file.name) || '.jpg';
  const filename = `${Date.now()}${ext}`;
  writeFileSync(join(uploadsDir, filename), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ path: `/uploads/${filename}` });
}
