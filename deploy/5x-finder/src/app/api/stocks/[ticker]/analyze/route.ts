import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

    const systemPrompt = `You are a world-class Fintech industry analyst with 20+ years of experience. You specialize in identifying high-growth Fintech stocks that can achieve 5x returns within 2 years. Your analysis combines deep industry knowledge, competitive analysis, financial modeling, and qualitative assessment of execution, culture, and business model strength. Provide specific, actionable insights.`;

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
1. **5X Thesis**: What is the specific path to a 5x return? What needs to go right?
2. **Key Catalysts**: What are the 2-3 most important catalysts that could drive 5x growth?
3. **Risk Factors**: What are the key risks that could prevent 5x returns?
4. **Execution Assessment**: Can this management team deliver? Evaluate their track record, strategic clarity, and operational discipline.
5. **Innovation & Culture**: Does the company foster the innovation needed to sustain hypergrowth? Are they building for the future or resting on past success?
6. **Funding & Capital Strategy**: Does the company have the financial resources and capital allocation skills to fund growth through to profitability?
7. **Customer Moat & Stickiness**: How deep is the customer relationship? Is this a transactional or ecosystem play? What's the switching cost?
8. **Business Model Quality**: How scalable and defensible is the monetization model? Are unit economics improving?
9. **Industry Context**: How does this company fit into the broader Fintech landscape?
10. **Verdict**: Your overall assessment with a confidence level (High/Medium/Low)

Keep the analysis concise but insightful. Focus on actionable intelligence.`;

    let aiAnalysis: string | null = null;

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
        const completion = await zai.chat.completions.create({
          messages: [
            { role: 'assistant', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          thinking: { type: 'disabled' },
        });
        aiAnalysis = completion.choices[0]?.message?.content || null;
      } catch (sdkError) {
        console.warn('z-ai-web-dev-sdk failed, falling back to OpenAI:', sdkError);
      }
    }

    // Fallback to OpenAI API (Vercel environment)
    if (!aiAnalysis) {
      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) {
        return NextResponse.json(
          { error: 'AI analysis unavailable: OPENAI_API_KEY not configured' },
          { status: 503 }
        );
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.error('OpenAI API error:', response.status, errBody);
        return NextResponse.json(
          { error: 'Failed to get AI analysis from OpenAI' },
          { status: 502 }
        );
      }

      const data = await response.json();
      aiAnalysis = data.choices?.[0]?.message?.content || 'Analysis unavailable';
    }

    await db.stock.update({
      where: { ticker: ticker.toUpperCase() },
      data: { aiAnalysis, lastAnalyzed: new Date() },
    });

    return NextResponse.json({ analysis: aiAnalysis, ticker: ticker.toUpperCase() });
  } catch (error) {
    console.error('Error analyzing stock:', error);
    return NextResponse.json({ error: 'Failed to analyze stock' }, { status: 500 });
  }
}
