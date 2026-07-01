import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const MARKERS_PATH = join(process.cwd(), 'data', 'markers.json');

export async function GET() {
  try {
    return NextResponse.json(JSON.parse(readFileSync(MARKERS_PATH, 'utf-8')));
  } catch {
    return NextResponse.json({ 'phnom-penh': [], melbourne: [] });
  }
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Editor only available in development' }, { status: 403 });
  }
  const body = await req.json();
  writeFileSync(MARKERS_PATH, JSON.stringify(body, null, 2));
  return NextResponse.json({ ok: true });
}
