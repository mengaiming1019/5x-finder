import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    const stock = await getDb().stock.findUnique({
      where: { ticker: ticker.toUpperCase() },
    });

    if (!stock) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }

    const systemPrompt = `You are a world-class Fintech industry analyst with 20+ years of experience. You specialize in identifying high-growth Fintech stocks that can achieve 5x returns within 2 years. Provide specific, actionable insights.`;

    const userPrompt = `Analyze ${stock.name} (${stock.ticker}) as a potential 5x investment opportunity within 2 years.

Company Profile:
- Sector: ${stock.sector} / ${stock.subSector}
- Market Cap: ${stock.marketCap}
- Current Price: ${stock.price}
- Description: ${stock.description}

Quantitative Factor Scores (0-100):
- Revenue Growth: ${stock.revenueGrowth}/100
- Market Opportunity: ${stock.marketOpportunity}/100
- Competitive Moat: ${stock.competitiveMoat}/100
- Profitability Path: ${stock.profitabilityPath}/100
- Valuation: ${stock.valuation}/100

Qualitative Factor Scores (0-100):
- Execution Capabilities: ${stock.executionCapabilities}/100
- Innovation Culture: ${stock.innovationCulture}/100
- Funding Strength: ${stock.fundingStrength}/100
- Customer Base Stickiness: ${stock.customerStickiness}/100
- Business & Monetization Model: ${stock.monetizationModel}/100

Composite 5X Score: ${stock.fiveXScore}/100

Please provide a structured analysis covering:
1. **5X Thesis**: What is the specific path to a 5x return?
2. **Key Catalysts**: 2-3 most important catalysts for 5x growth?
3. **Risk Factors**: Key risks that could prevent 5x returns?
4. **Execution Assessment**: Can management deliver?
5. **Innovation & Culture**: Innovation for hypergrowth?
6. **Funding & Capital Strategy**: Financial resources to fund growth?
7. **Customer Moat & Stickiness**: Depth of customer relationship?
8. **Business Model Quality**: Scalability and defensibility?
9. **Industry Context**: Fit in the Fintech landscape?
10. **Verdict**: Overall assessment with confidence level

Keep concise but insightful. Focus on actionable intelligence.`;

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json(
        { error: 'AI analysis unavailable: GEMINI_API_KEY not configured. Get a free key at aistudio.google.com and add it in Vercel → Settings → Environment Variables.' },
        { status: 503 }
      );
    }

    // Use Google Gemini API (free tier: 15 requests/min, no credit card needed)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Gemini API error:', response.status, errBody);
      return NextResponse.json(
        { error: `Gemini API error (${response.status}): ${errBody.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const aiAnalysis = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Analysis unavailable';

    await getDb().stock.update({
      where: { ticker: ticker.toUpperCase() },
      data: { aiAnalysis, lastAnalyzed: new Date() },
    });

    return NextResponse.json({ analysis: aiAnalysis, ticker: ticker.toUpperCase() });
  } catch (error) {
    console.error('Error analyzing stock:', error);
    return NextResponse.json({ error: 'Failed to analyze stock' }, { status: 500 });
  }
}
