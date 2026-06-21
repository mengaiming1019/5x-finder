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

    // No search SDK in production — use Google News / Yahoo Finance / Seeking Alpha links
    const newsItems: NewsItem[] = [
      {
        title: `${stock.name} (${stock.ticker}) — Latest News on Google`,
        snippet: `Click to view the latest news and analysis for ${stock.name} (${stock.ticker}). To enable in-app live news, add a SERPAPI_KEY environment variable in Vercel Settings.`,
        url: `https://www.google.com/search?q=${encodeURIComponent(stock.name + ' ' + stock.ticker + ' fintech stock news')}&tbm=nws`,
        date: new Date().toISOString().split('T')[0],
        source: 'Google News',
      },
      {
        title: `${stock.name} Stock — Yahoo Finance`,
        snippet: `View ${stock.name} stock price, news, and financial data on Yahoo Finance.`,
        url: `https://finance.yahoo.com/quote/${stock.ticker}`,
        date: new Date().toISOString().split('T')[0],
        source: 'Yahoo Finance',
      },
      {
        title: `${stock.name} — Seeking Alpha Analysis`,
        snippet: `Read analyst coverage and investment analysis for ${stock.name} on Seeking Alpha.`,
        url: `https://seekingalpha.com/symbol/${stock.ticker}`,
        date: new Date().toISOString().split('T')[0],
        source: 'Seeking Alpha',
      },
    ];

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
