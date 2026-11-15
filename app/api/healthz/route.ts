import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();
  try {
    await dbConnect();
    const state = mongoose.connection.readyState;
    const db = state === 1 ? 'connected' : 'disconnected';
    return NextResponse.json(
      {
        ok: state === 1,
        db,
        latencyMs: Date.now() - start,
        at: new Date().toISOString(),
      },
      { status: state === 1 ? 200 : 503 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        db: 'error',
        error: (err as Error).message ?? 'unknown',
        at: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
