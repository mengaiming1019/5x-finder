import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// Yahoo Finance tickers mapping — handles special cases
const YAHOO_TICKERS: Record<string, string> = {
  V: 'V',
  MA: 'MA',
  PYPL: 'PYPL',
  AXP: 'AXP',
  SQ: 'SQ',
  ADYEY: 'ADYEN.AS',
  MQ: 'MQ',
  WISE: 'WISE.L',
  FLYW: 'FLYW',
  BILL: 'BILL',
  UPST: 'UPST',
  AFRM: 'AFRM',
  SOFI: 'SOFI',
  NU: 'NU',
  '323410': '323410.KS',
  INTR: 'INTR',
  LMND: 'LMND',
  ROOT: 'ROOT',
  HIPPO: 'HIPPO',
  OSCR: 'OSCR',
  SHOP: 'SHOP',
  MELI: 'MELI',
  SE: 'SE',
  COIN: 'COIN',
  CRCL: 'CRCL',
  MSTR: 'MSTR',
  HOOD: 'HOOD',
  FUTU: 'FUTU',
  WEBULL: 'WEB',
  TIGR: 'TIGR',
  PLTR: 'PLTR',
  PATH: 'PATH',
  RIOT: 'RIOT',
  MARA: 'MARA',
  IREN: 'IREN',
};

export async function POST() {
  try {
    const stocks = await getDb().stock.findMany();
    let updated = 0;
    let failed = 0;

    // Process in batches of 5 to avoid rate limiting
    for (let i = 0; i < stocks.length; i += 5) {
      const batch = stocks.slice(i, i + 5);
      const results = await Promise.allSettled(
        batch.map(async (stock) => {
          const yahooTicker = YAHOO_TICKERS[stock.ticker];
          if (!yahooTicker) return null;

          try {
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooTicker)}?interval=1d&range=1d`;
            const response = await fetch(url, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; 5X-Finder/1.0)',
              },
              signal: AbortSignal.timeout(8000),
            });

            if (!response.ok) return null;

            const data = await response.json();
            const result = data?.chart?.result?.[0];
            if (!result) return null;

            const meta = result.meta;
            const regularMarketPrice = meta?.regularMarketPrice;
            const currency = meta?.currency || 'USD';

            if (!regularMarketPrice || regularMarketPrice <= 0) return null;

            // Format price with appropriate currency symbol
            let priceStr: string;
            if (currency === 'KRW') {
              priceStr = `₩${Math.round(regularMarketPrice).toLocaleString()}`;
            } else if (currency === 'EUR') {
              priceStr = `€${regularMarketPrice.toFixed(2)}`;
            } else if (currency === 'GBP') {
              priceStr = `£${regularMarketPrice.toFixed(2)}`;
            } else {
              priceStr = `$${regularMarketPrice.toFixed(2)}`;
            }

            return { ticker: stock.ticker, price: priceStr };
          } catch {
            return null;
          }
        })
      );

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          const { ticker, price } = result.value;
          await getDb().stock.update({
            where: { ticker },
            data: { price },
          });
          updated++;
        } else {
          failed++;
        }
      }

      // Small delay between batches
      if (i + 5 < stocks.length) {
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    return NextResponse.json({
      success: true,
      updated,
      failed,
      total: stocks.length,
      message: `Updated ${updated}/${stocks.length} stock prices`,
    });
  } catch (error) {
    console.error('Error updating prices:', error);
    return NextResponse.json({ error: 'Failed to update prices' }, { status: 500 });
  }
}
