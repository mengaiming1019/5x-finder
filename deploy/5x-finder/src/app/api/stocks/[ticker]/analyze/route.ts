import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// ─── Built-in AI Analyst (no API key needed!) ──────────────────────────────
// Generates professional Fintech stock analysis from factor scores using
// rule-based intelligence — completely free, no external API required.

interface StockRecord {
  ticker: string;
  name: string;
  sector: string;
  subSector: string;
  marketCap: string;
  price: string;
  description: string;
  revenueGrowth: number;
  marketOpportunity: number;
  competitiveMoat: number;
  profitabilityPath: number;
  valuation: number;
  executionCapabilities: number;
  innovationCulture: number;
  fundingStrength: number;
  customerStickiness: number;
  monetizationModel: number;
  fiveXScore: number;
}

function analyzeStock(stock: StockRecord): string {
  const quant = [stock.revenueGrowth, stock.marketOpportunity, stock.competitiveMoat, stock.profitabilityPath, stock.valuation];
  const qual = [stock.executionCapabilities, stock.innovationCulture, stock.fundingStrength, stock.customerStickiness, stock.monetizationModel];
  const quantAvg = Math.round(quant.reduce((a, b) => a + b, 0) / 5);
  const qualAvg = Math.round(qual.reduce((a, b) => a + b, 0) / 5);

  // Identify strengths and weaknesses
  const allFactors = [
    { name: 'Revenue Growth', score: stock.revenueGrowth, key: 'revenueGrowth' },
    { name: 'Market Opportunity', score: stock.marketOpportunity, key: 'marketOpportunity' },
    { name: 'Competitive Moat', score: stock.competitiveMoat, key: 'competitiveMoat' },
    { name: 'Profitability Path', score: stock.profitabilityPath, key: 'profitabilityPath' },
    { name: 'Valuation', score: stock.valuation, key: 'valuation' },
    { name: 'Execution Capabilities', score: stock.executionCapabilities, key: 'executionCapabilities' },
    { name: 'Innovation Culture', score: stock.innovationCulture, key: 'innovationCulture' },
    { name: 'Funding Strength', score: stock.fundingStrength, key: 'fundingStrength' },
    { name: 'Customer Stickiness', score: stock.customerStickiness, key: 'customerStickiness' },
    { name: 'Monetization Model', score: stock.monetizationModel, key: 'monetizationModel' },
  ];

  const strengths = allFactors.filter(f => f.score >= 75).sort((a, b) => b.score - a.score);
  const weaknesses = allFactors.filter(f => f.score < 50).sort((a, b) => a.score - b.score);
  const midRange = allFactors.filter(f => f.score >= 50 && f.score < 75);

  // Confidence level
  let confidence: string;
  let confidenceEmoji: string;
  if (stock.fiveXScore >= 75) { confidence = 'High'; confidenceEmoji = '🟢'; }
  else if (stock.fiveXScore >= 65) { confidence = 'Medium-High'; confidenceEmoji = '🟡'; }
  else if (stock.fiveXScore >= 55) { confidence = 'Medium'; confidenceEmoji = '🟠'; }
  else { confidence = 'Low-Medium'; confidenceEmoji = '🔴'; }

  // 5X Path assessment
  const growthDrivers = allFactors.filter(f => ['revenueGrowth', 'marketOpportunity', 'innovationCulture'].includes(f.key) && f.score >= 70);
  const moatDrivers = allFactors.filter(f => ['competitiveMoat', 'customerStickiness', 'monetizationModel'].includes(f.key) && f.score >= 70);

  let fiveXPath: string;
  if (stock.fiveXScore >= 75 && growthDrivers.length >= 2 && moatDrivers.length >= 1) {
    fiveXPath = `${stock.name} has a credible path to 5x returns driven by ${growthDrivers.map(d => d.name.toLowerCase()).join(', ')}. The ${moatDrivers.map(d => d.name.toLowerCase()).join(' and ')} provide${moatDrivers.length === 1 ? 's' : ''} a defensible foundation for sustained hypergrowth. With a ${stock.marketCap} market cap, the upside potential from market expansion alone is substantial.`;
  } else if (stock.fiveXScore >= 65) {
    fiveXPath = `${stock.name} shows meaningful 5x potential but requires favorable market conditions and strong execution. The ${growthDrivers.map(d => d.name.toLowerCase()).join(' and ') || 'growth trajectory'} will need to accelerate while building deeper competitive advantages. The path exists but is not without uncertainty.`;
  } else {
    fiveXPath = `${stock.name}'s path to 5x returns is challenging under current conditions. Significant improvements in ${weaknesses.slice(0, 2).map(w => w.name.toLowerCase()).join(' and ')} would be needed to make a 5x thesis compelling. A more realistic target may be 2-3x over the same timeframe.`;
  }

  // Catalysts
  const catalysts: string[] = [];
  if (stock.revenueGrowth >= 70) catalysts.push(`**Revenue acceleration** — ${stock.revenueGrowth}/100 revenue growth score indicates strong top-line momentum that could drive re-rating`);
  if (stock.marketOpportunity >= 75) catalysts.push(`**Market expansion** — ${stock.marketOpportunity}/100 market opportunity score suggests significant TAM headroom in ${stock.subSector}`);
  if (stock.innovationCulture >= 75) catalysts.push(`**Innovation breakthrough** — ${stock.innovationCulture}/100 innovation culture score positions the company to capture emerging trends in ${stock.sector}`);
  if (stock.valuation >= 65) catalysts.push(`**Valuation re-rating** — ${stock.valuation}/100 valuation score suggests the market has not yet priced in full growth potential`);
  if (stock.fundingStrength >= 75) catalysts.push(`**Capital deployment** — ${stock.fundingStrength}/100 funding strength enables strategic M&A or aggressive expansion`);
  if (catalysts.length < 2) {
    if (stock.executionCapabilities >= 70) catalysts.push(`**Execution excellence** — Strong management track record could unlock value through operational improvements`);
    if (stock.monetizationModel >= 65) catalysts.push(`**Monetization improvement** — Business model evolution could drive margin expansion and higher revenue per customer`);
  }

  // Risk factors
  const risks: string[] = [];
  if (stock.profitabilityPath < 50) risks.push(`**Profitability uncertainty** — ${stock.profitabilityPath}/100 score indicates unclear path to sustainable profits; cash burn could accelerate`);
  if (stock.competitiveMoat < 50) risks.push(`**Competitive vulnerability** — ${stock.competitiveMoat}/100 moat score suggests limited barriers to entry; market share at risk from well-funded competitors`);
  if (stock.valuation < 40) risks.push(`**Elevated valuation** — ${stock.valuation}/100 valuation score suggests limited margin of safety; high expectations already priced in`);
  if (stock.customerStickiness < 45) risks.push(`**Customer churn risk** — ${stock.customerStickiness}/100 stickiness score indicates potential for high switching rates and revenue volatility`);
  if (stock.fundingStrength < 50) risks.push(`**Capital constraints** — ${stock.fundingStrength}/100 funding score may limit growth investments or require dilutive capital raises`);
  if (stock.monetizationModel < 50) risks.push(`**Monetization challenges** — ${stock.monetizationModel}/100 score suggests difficulty scaling revenue efficiently`);
  if (risks.length === 0) risks.push(`**General market risk** — Macro-economic downturns, regulatory changes, or sector rotation could impact returns regardless of company fundamentals`);

  // Verdict
  let verdict: string;
  if (stock.fiveXScore >= 75) {
    verdict = `${confidenceEmoji} **${confidence} Conviction** — ${stock.name} scores ${stock.fiveXScore}/100 on the 5X Finder model, placing it in the top tier of Fintech stocks with 5x potential. The combination of ${strengths.slice(0, 3).map(s => s.name.toLowerCase()).join(', ')} creates a compelling investment thesis. Key risk to monitor: ${weaknesses[0]?.name.toLowerCase() || 'market conditions'}.`;
  } else if (stock.fiveXScore >= 65) {
    verdict = `${confidenceEmoji} **${confidence} Conviction** — ${stock.name} scores ${stock.fiveXScore}/100, showing solid but not dominant 5x potential. Strengths in ${strengths.slice(0, 2).map(s => s.name.toLowerCase()).join(' and ')} are encouraging, but ${weaknesses.length > 0 ? weaknesses[0].name.toLowerCase() + ' remains a concern' : 'consistent execution is needed'}. A 3-4x outcome is more probable than a full 5x.`;
  } else if (stock.fiveXScore >= 55) {
    verdict = `${confidenceEmoji} **${confidence} Conviction** — ${stock.name} scores ${stock.fiveXScore}/100, suggesting moderate 5x potential. While ${strengths[0]?.name.toLowerCase() || 'certain factors'} offer promise, significant weaknesses in ${weaknesses.slice(0, 2).map(w => w.name.toLowerCase()).join(' and ')} weigh on the thesis. A 2-3x return is more realistic without major improvements.`;
  } else {
    verdict = `${confidenceEmoji} **${confidence} Conviction** — ${stock.name} scores ${stock.fiveXScore}/100, indicating limited 5x potential under current conditions. Multiple factor weaknesses (${weaknesses.slice(0, 3).map(w => w.name.toLowerCase()).join(', ')}) make a 5x return unlikely without a fundamental business transformation.`;
  }

  // Build the full analysis
  const analysis = `## 🎯 5X Investment Analysis: ${stock.name} (${stock.ticker})

**Sector:** ${stock.sector} → ${stock.subSector} | **Market Cap:** ${stock.marketCap} | **5X Score:** ${stock.fiveXScore}/100

---

### 📈 5X Thesis

${fiveXPath}

**Quantitative Score:** ${quantAvg}/100 | **Qualitative Score:** ${qualAvg}/100

---

### 🔑 Key Catalysts

${catalysts.slice(0, 3).map((c, i) => `${i + 1}. ${c}`).join('\n')}

---

### ⚠️ Risk Factors

${risks.slice(0, 3).map((r, i) => `${i + 1}. ${r}`).join('\n')}

---

### 💪 Strengths Profile

${strengths.length > 0 ? strengths.map(s => `- **${s.name}** (${s.score}/100) ${getFactorInsight(s.key, s.score, stock)}`).join('\n') : '- No dominant strengths identified (all factors below 75)'}

${midRange.length > 0 ? `**Areas with room to improve:**\n${midRange.map(m => `- ${m.name} (${m.score}/100)`).join('\n')}` : ''}

---

### 🏁 Verdict

${verdict}

---
*Analysis generated by 5X Finder's built-in multi-factor intelligence engine. Factor scores are based on fundamental analysis, competitive positioning, and growth trajectory assessment. This is not financial advice.*`;

  return analysis;
}

function getFactorInsight(key: string, score: number, stock: StockRecord): string {
  const insights: Record<string, Record<string, string>> = {
    revenueGrowth: {
      high: `— Exceptional revenue momentum positions ${stock.name} for compounding growth`,
      med: `— Solid growth trajectory but could accelerate further`,
    },
    marketOpportunity: {
      high: `— Massive addressable market in ${stock.subSector} provides long runway`,
      med: `— Meaningful market opportunity but may need expansion beyond core`,
    },
    competitiveMoat: {
      high: `— Strong competitive positioning creates barriers to entry`,
      med: `— Moderate defensiveness; moat needs strengthening`,
    },
    profitabilityPath: {
      high: `— Clear and imminent path to sustainable profitability`,
      med: `— Profitability achievable but timeline uncertain`,
    },
    valuation: {
      high: `— Attractive entry point relative to growth potential`,
      med: `— Fair valuation; limited margin of safety`,
    },
    executionCapabilities: {
      high: `— Management team has demonstrated ability to deliver on promises`,
      med: `— Execution has been adequate but not exceptional`,
    },
    innovationCulture: {
      high: `— Innovation-first culture drives product leadership in ${stock.sector}`,
      med: `— Some innovation capability but not a core differentiator`,
    },
    fundingStrength: {
      high: `— Strong balance sheet provides strategic flexibility`,
      med: `— Adequate funding but limited room for aggressive expansion`,
    },
    customerStickiness: {
      high: `— Deep customer relationships create predictable revenue streams`,
      med: `— Moderate loyalty; at risk from competitive switching`,
    },
    monetizationModel: {
      high: `— Highly scalable business model with strong unit economics`,
      med: `— Business model works but has room for optimization`,
    },
  };
  const level = score >= 80 ? 'high' : 'med';
  return insights[key]?.[level] || '';
}

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

    // Built-in analysis — no API key needed!
    const aiAnalysis = analyzeStock(stock as StockRecord);

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
