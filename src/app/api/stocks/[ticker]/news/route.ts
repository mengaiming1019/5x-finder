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

    // Try sandbox SDK first (z-ai-web-dev-sdk)
    let ZAI: any;
    try {
      ZAI = (await import('z-ai-web-dev-sdk')).default;
    } catch {
      ZAI = null;
    }

    if (ZAI) {
      try {
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
      } catch (sdkError) {
        console.warn('z-ai-web-dev-sdk web_search failed, falling back:', sdkError);
      }
    }

    // Fallback for Vercel environment — return placeholder news
    if (!newsItems) {
      newsItems = [
        {
          title: `${stock.name} News — Configure API for Live Data`,
          snippet: `Live news search requires an API key on Vercel. Set SERPAPI_KEY or a similar search API key in your Vercel environment variables to enable real-time news for ${stock.name} (${stock.ticker}).`,
          url: `https://www.google.com/search?q=${encodeURIComponent(stock.name + ' ' + stock.ticker + ' fintech stock news')}`,
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
