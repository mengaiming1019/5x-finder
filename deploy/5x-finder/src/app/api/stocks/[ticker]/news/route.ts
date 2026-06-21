import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface NewsItem {
  title: string;
  snippet: string;
  url: string;
  date: string;
  source: string;
}

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

    let newsItems: NewsItem[] | null = null;

    // Try sandbox SDK first
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default;
      const zai = await ZAI.create();
      const results = await zai.functions.invoke('web_search', {
        query: `${stock.name} ${stock.ticker} fintech stock news latest 2025`,
        num: 6,
      });
      newsItems = results.map(
        (item: { name: string; snippet: string; url: string; date: string; host_name: string }) => ({
          title: item.name,
          snippet: item.snippet,
          url: item.url,
          date: item.date,
          source: item.host_name,
        })
      );
    } catch {
      // Sandbox SDK not available, use fallback
    }

    // Fallback for Vercel — link to Google News search
    if (!newsItems) {
      newsItems = [
        {
          title: `${stock.name} News — Configure API for Live Data`,
          snippet: `Live news search requires a search API key on Vercel. To enable real-time news for ${stock.name} (${stock.ticker}), add a SERPAPI_KEY environment variable.`,
          url: `https://www.google.com/search?q=${encodeURIComponent(stock.name + ' ' + stock.ticker + ' fintech stock news')}&tbm=nws`,
          date: new Date().toISOString().split('T')[0],
          source: 'System',
        },
      ];
    }

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
