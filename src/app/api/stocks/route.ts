import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const stocks = await db.stock.findMany({
      orderBy: { fiveXScore: 'desc' },
    });

    const weights = await db.factorWeight.findFirst();

    return NextResponse.json({ stocks, weights });
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return NextResponse.json({ error: 'Failed to fetch stocks' }, { status: 500 });
  }
}
