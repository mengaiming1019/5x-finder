import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    const stock = await db.stock.findUnique({
      where: { ticker: ticker.toUpperCase() },
    });

    if (!stock) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }

    const zai = await ZAI.create();

    const results = await zai.functions.invoke('web_search', {
      query: `${stock.name} ${stock.ticker} fintech stock news latest 2025`,
      num: 6,
    });

    const newsItems = results.map((item: { name: string; snippet: string; url: string; date: string; host_name: string }) => ({
      title: item.name,
      snippet: item.snippet,
      url: item.url,
      date: item.date,
      source: item.host_name,
    }));

    await db.stock.update({
      where: { ticker: ticker.toUpperCase() },
      data: {
        latestNews: JSON.stringify(newsItems),
      },
    });

    return NextResponse.json({ news: newsItems, ticker: ticker.toUpperCase() });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
