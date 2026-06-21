import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// Auto-seed: populate database if empty (no terminal commands needed on Vercel)
async function ensureSeeded() {
  const count = await getDb().stock.count();
  if (count > 0) return;

  console.log('🌱 Database is empty, auto-seeding...');

  const FINTECH_STOCKS = [
    { ticker: "SQ", name: "Block, Inc.", sector: "Payments", subSector: "Point-of-Sale & Digital Payments", marketCap: "$44.5B", price: "$74.78", description: "Block (formerly Square) operates Cash App and Square POS ecosystem. Cash App has 57M+ monthly active users with growing Bitcoin and banking services.", website: "https://block.xyz", revenueGrowth: 62, marketOpportunity: 78, competitiveMoat: 68, profitabilityPath: 72, valuation: 70, executionCapabilities: 72, innovationCulture: 80, fundingStrength: 78, customerStickiness: 70, monetizationModel: 68 },
    { ticker: "UPST", name: "Upstart Holdings, Inc.", sector: "Lending", subSector: "AI-Powered Lending", marketCap: "$2.9B", price: "$32.43", description: "Upstart uses AI/ML to improve credit decisions, claiming 75% more approvals at same default rates. Expanded into auto loans and HELOC.", website: "https://www.upstart.com", revenueGrowth: 75, marketOpportunity: 82, competitiveMoat: 60, profitabilityPath: 55, valuation: 65, executionCapabilities: 65, innovationCulture: 82, fundingStrength: 55, customerStickiness: 50, monetizationModel: 72 },
    { ticker: "NU", name: "Nu Holdings Ltd.", sector: "Digital Banking", subSector: "Latin America Neobank", marketCap: "$62.9B", price: "$12.74", description: "Nubank is the world's largest digital bank with 100M+ customers across Brazil, Mexico, and Colombia. Achieved profitability in 2023.", website: "https://www.nu.com.br", revenueGrowth: 85, marketOpportunity: 88, competitiveMoat: 75, profitabilityPath: 82, valuation: 60, executionCapabilities: 85, innovationCulture: 82, fundingStrength: 80, customerStickiness: 88, monetizationModel: 78 },
    { ticker: "SOFI", name: "SoFi Technologies, Inc.", sector: "Digital Banking", subSector: "Personal Finance & Lending", marketCap: "$18.7B", price: "$17.91", description: "SoFi offers a one-stop financial services platform with 10M+ members. Bank charter enables lower funding costs.", website: "https://www.sofi.com", revenueGrowth: 68, marketOpportunity: 72, competitiveMoat: 58, profitabilityPath: 70, valuation: 62, executionCapabilities: 72, innovationCulture: 68, fundingStrength: 72, customerStickiness: 62, monetizationModel: 75 },
    { ticker: "LMND", name: "Lemonade, Inc.", sector: "Insurtech", subSector: "AI-Powered Insurance", marketCap: "$3.8B", price: "$58.84", description: "Lemonade uses AI for instant insurance quotes and claims processing. Expanded from renters to homeowners, pet, life, and car insurance.", website: "https://www.lemonade.com", revenueGrowth: 55, marketOpportunity: 70, competitiveMoat: 45, profitabilityPath: 35, valuation: 80, executionCapabilities: 55, innovationCulture: 78, fundingStrength: 45, customerStickiness: 52, monetizationModel: 60 },
    { ticker: "AFRM", name: "Affirm Holdings, Inc.", sector: "Lending", subSector: "Buy Now Pay Later", marketCap: "$24.8B", price: "$73.92", description: "Affirm is a leading BNPL platform with transparent, no-late-fee lending. Partners with Amazon, Shopify, Walmart.", website: "https://www.affirm.com", revenueGrowth: 70, marketOpportunity: 68, competitiveMoat: 55, profitabilityPath: 65, valuation: 55, executionCapabilities: 70, innovationCulture: 65, fundingStrength: 68, customerStickiness: 58, monetizationModel: 72 },
    { ticker: "ADYEY", name: "Adyen N.V.", sector: "Payments", subSector: "Global Payment Processing", marketCap: "€52.3B", price: "€875.80", description: "Adyen provides a single global platform for accepting payments worldwide. Serves enterprise clients like Meta, Uber, Spotify.", website: "https://www.adyen.com", revenueGrowth: 58, marketOpportunity: 85, competitiveMoat: 82, profitabilityPath: 90, valuation: 45, executionCapabilities: 88, innovationCulture: 75, fundingStrength: 90, customerStickiness: 85, monetizationModel: 82 },
    { ticker: "SHOP", name: "Shopify Inc.", sector: "Commerce", subSector: "E-Commerce Platform & Payments", marketCap: "$136.2B", price: "$108.84", description: "Shopify powers millions of merchants globally with commerce infrastructure. Shopify Payments, Capital, and Logistics create an ecosystem lock-in.", website: "https://www.shopify.com", revenueGrowth: 60, marketOpportunity: 80, competitiveMoat: 78, profitabilityPath: 85, valuation: 40, executionCapabilities: 82, innovationCulture: 78, fundingStrength: 88, customerStickiness: 82, monetizationModel: 85 },
    { ticker: "COIN", name: "Coinbase Global, Inc.", sector: "Crypto", subSector: "Cryptocurrency Exchange", marketCap: "$40.8B", price: "$163.26", description: "Coinbase is the largest US crypto exchange with 110M+ verified users. Base L2 network growing rapidly.", website: "https://www.coinbase.com", revenueGrowth: 72, marketOpportunity: 75, competitiveMoat: 60, profitabilityPath: 55, valuation: 48, executionCapabilities: 68, innovationCulture: 72, fundingStrength: 78, customerStickiness: 55, monetizationModel: 65 },
    { ticker: "HOOD", name: "Robinhood Markets, Inc.", sector: "Trading", subSector: "Retail Trading Platform", marketCap: "$97.5B", price: "$108.00", description: "Robinhood pioneered commission-free trading with 23M+ funded accounts. Expanding into retirement accounts, credit cards, and futures.", website: "https://robinhood.com", revenueGrowth: 65, marketOpportunity: 62, competitiveMoat: 50, profitabilityPath: 68, valuation: 58, executionCapabilities: 65, innovationCulture: 62, fundingStrength: 72, customerStickiness: 48, monetizationModel: 70 },
    { ticker: "MQ", name: "Marqeta, Inc.", sector: "Payments", subSector: "Card Issuing Platform", marketCap: "$1.6B", price: "$3.87", description: "Marqeta provides modern card issuing infrastructure powering Block's Cash App, Uber, and Instacart.", website: "https://www.marqeta.com", revenueGrowth: 50, marketOpportunity: 72, competitiveMoat: 62, profitabilityPath: 48, valuation: 75, executionCapabilities: 68, innovationCulture: 65, fundingStrength: 55, customerStickiness: 72, monetizationModel: 58 },
    { ticker: "MELI", name: "MercadoLibre, Inc.", sector: "Commerce & Fintech", subSector: "LatAm E-Commerce & Digital Payments", marketCap: "$82.5B", price: "$1,633.00", description: "MercadoLibre dominates Latin American e-commerce and fintech. Mercado Pago processes $140B+ annually with 50M+ active users.", website: "https://www.mercadolibre.com", revenueGrowth: 78, marketOpportunity: 90, competitiveMoat: 85, profitabilityPath: 88, valuation: 35, executionCapabilities: 85, innovationCulture: 78, fundingStrength: 85, customerStickiness: 90, monetizationModel: 88 },
    { ticker: "WISE", name: "Wise plc", sector: "Payments", subSector: "Cross-Border Money Transfer", marketCap: "£10.6B", price: "£8.20", description: "Wise provides low-cost cross-border payments with 12M+ customers. Average cost 0.67% vs 6% industry average.", website: "https://wise.com", revenueGrowth: 58, marketOpportunity: 75, competitiveMoat: 70, profitabilityPath: 80, valuation: 55, executionCapabilities: 78, innovationCulture: 68, fundingStrength: 72, customerStickiness: 75, monetizationModel: 72 },
    { ticker: "PLTR", name: "Palantir Technologies Inc.", sector: "Enterprise AI", subSector: "AI & Data Analytics for Finance", marketCap: "$285.6B", price: "$128.47", description: "Palantir provides AI-powered data analytics platforms used by major financial institutions. AIP driving commercial revenue growth 25%+ YoY.", website: "https://www.palantir.com", revenueGrowth: 65, marketOpportunity: 82, competitiveMoat: 78, profitabilityPath: 85, valuation: 28, executionCapabilities: 82, innovationCulture: 75, fundingStrength: 88, customerStickiness: 80, monetizationModel: 72 },
    { ticker: "PATH", name: "UiPath Inc.", sector: "Automation", subSector: "RPA for Financial Services", marketCap: "$5.8B", price: "$10.72", description: "UiPath leads RPA market with deep penetration in financial services automation. AI-powered document understanding and process mining.", website: "https://www.uipath.com", revenueGrowth: 42, marketOpportunity: 65, competitiveMoat: 62, profitabilityPath: 60, valuation: 68, executionCapabilities: 68, innovationCulture: 58, fundingStrength: 65, customerStickiness: 72, monetizationModel: 62 },
    { ticker: "FLYW", name: "Flywire Corporation", sector: "Payments", subSector: "Vertical-Specific Payments", marketCap: "$1.7B", price: "$14.13", description: "Flywire specializes in complex, high-value vertical payment flows (education, healthcare, travel). Processing $30B+ annually.", website: "https://www.flywire.com", revenueGrowth: 52, marketOpportunity: 60, competitiveMoat: 58, profitabilityPath: 62, valuation: 62, executionCapabilities: 65, innovationCulture: 55, fundingStrength: 52, customerStickiness: 68, monetizationModel: 58 },
    { ticker: "BLSH", name: "Bullish", sector: "Crypto", subSector: "Institutional Crypto Exchange", marketCap: "$4.8B", price: "$24.10", description: "Bullish is a regulated crypto exchange designed for institutional investors, combining deep liquidity with compliance-first architecture.", website: "https://bullish.com", revenueGrowth: 70, marketOpportunity: 72, competitiveMoat: 48, profitabilityPath: 45, valuation: 65, executionCapabilities: 62, innovationCulture: 70, fundingStrength: 75, customerStickiness: 42, monetizationModel: 58 },
    { ticker: "KLAR", name: "Klarna Group plc", sector: "Lending", subSector: "Buy Now Pay Later", marketCap: "$9.5B", price: "$18.84", description: "Klarna is Europe's largest BNPL provider with 85M+ active consumers and 575K+ merchant partners globally.", website: "https://www.klarna.com", revenueGrowth: 65, marketOpportunity: 78, competitiveMoat: 62, profitabilityPath: 55, valuation: 60, executionCapabilities: 72, innovationCulture: 75, fundingStrength: 65, customerStickiness: 68, monetizationModel: 70 },
    { ticker: "CRCL", name: "Circle Internet Group, Inc.", sector: "Crypto", subSector: "Stablecoin Infrastructure", marketCap: "$18.5B", price: "$80.23", description: "Circle is the issuer of USDC, the world's second-largest stablecoin with $60B+ in circulation. Key beneficiary of stablecoin regulation clarity.", website: "https://www.circle.com", revenueGrowth: 82, marketOpportunity: 88, competitiveMoat: 72, profitabilityPath: 70, valuation: 45, executionCapabilities: 78, innovationCulture: 72, fundingStrength: 82, customerStickiness: 75, monetizationModel: 80 },
    { ticker: "PAYP", name: "PayPay Corporation", sector: "Payments", subSector: "Japan Mobile Payments", marketCap: "$3.2B", price: "$21.29", description: "PayPay is Japan's largest mobile payment platform with 65M+ users. Backed by SoftBank and Yahoo Japan.", website: "https://paypay.ne.jp", revenueGrowth: 55, marketOpportunity: 68, competitiveMoat: 65, profitabilityPath: 50, valuation: 62, executionCapabilities: 65, innovationCulture: 55, fundingStrength: 70, customerStickiness: 72, monetizationModel: 55 },
    { ticker: "BILL", name: "BILL Holdings, Inc.", sector: "Payments", subSector: "SMB Financial Automation", marketCap: "$3.5B", price: "$32.47", description: "BILL provides financial automation platform for SMBs, handling accounts payable, receivable, and spend management. Serves 450K+ businesses.", website: "https://www.bill.com", revenueGrowth: 52, marketOpportunity: 65, competitiveMoat: 55, profitabilityPath: 52, valuation: 65, executionCapabilities: 68, innovationCulture: 58, fundingStrength: 58, customerStickiness: 65, monetizationModel: 62 },
    { ticker: "SE", name: "Sea Limited", sector: "Commerce & Fintech", subSector: "Southeast Asia Digital Ecosystem", marketCap: "$55.9B", price: "$91.28", description: "Sea Limited operates Shopee (e-commerce), SeaMoney (fintech/digital lending), and Garena (gaming). SeaMoney provides digital lending, insurance, and e-wallet services across Southeast Asia.", website: "https://www.sea.com", revenueGrowth: 72, marketOpportunity: 85, competitiveMoat: 78, profitabilityPath: 72, valuation: 50, executionCapabilities: 78, innovationCulture: 75, fundingStrength: 80, customerStickiness: 80, monetizationModel: 78 },
    { ticker: "RIOT", name: "Riot Platforms, Inc.", sector: "Digital Infrastructure", subSector: "Bitcoin Mining & Infrastructure", marketCap: "$4.2B", price: "$28.10", description: "Riot Platforms is one of the largest publicly-traded Bitcoin mining companies in North America. Diversifying into AI/HPC data center hosting.", website: "https://www.riotplatforms.com", revenueGrowth: 68, marketOpportunity: 58, competitiveMoat: 40, profitabilityPath: 42, valuation: 55, executionCapabilities: 60, innovationCulture: 55, fundingStrength: 62, customerStickiness: 35, monetizationModel: 48 },
    { ticker: "MARA", name: "MARA Holdings, Inc.", sector: "Digital Infrastructure", subSector: "Bitcoin Mining & Digital Assets", marketCap: "$4.8B", price: "$14.22", description: "MARA (Marathon Digital) is the largest publicly-traded Bitcoin miner by hash rate. Holds 25K+ BTC on balance sheet.", website: "https://www.mara.com", revenueGrowth: 65, marketOpportunity: 55, competitiveMoat: 38, profitabilityPath: 40, valuation: 60, executionCapabilities: 58, innovationCulture: 52, fundingStrength: 60, customerStickiness: 32, monetizationModel: 45 },
    { ticker: "MSTR", name: "Strategy (MicroStrategy)", sector: "Digital Infrastructure", subSector: "Bitcoin Treasury & Analytics", marketCap: "$104.2B", price: "$118.50", description: "Strategy (formerly MicroStrategy) is the largest corporate holder of Bitcoin with 580K+ BTC on balance sheet. Also provides enterprise analytics software.", website: "https://www.strategy.com", revenueGrowth: 45, marketOpportunity: 60, competitiveMoat: 50, profitabilityPath: 35, valuation: 25, executionCapabilities: 72, innovationCulture: 65, fundingStrength: 55, customerStickiness: 58, monetizationModel: 45 },
    { ticker: "IREN", name: "IREN Ltd.", sector: "Digital Infrastructure", subSector: "Bitcoin Mining & AI Compute", marketCap: "$3.2B", price: "$59.96", description: "IREN is a Bitcoin mining company pivoting to AI/HPC data centers. Operates 500MW+ facilities with plans to scale to 2GW.", website: "https://www.iren.com", revenueGrowth: 75, marketOpportunity: 72, competitiveMoat: 42, profitabilityPath: 48, valuation: 58, executionCapabilities: 62, innovationCulture: 68, fundingStrength: 55, customerStickiness: 38, monetizationModel: 52 },
  ];

  const DEFAULT_WEIGHTS = {
    revenueGrowth: 0.15, marketOpportunity: 0.15, competitiveMoat: 0.15, profitabilityPath: 0.10, valuation: 0.10,
    executionCapabilities: 0.10, innovationCulture: 0.08, fundingStrength: 0.07, customerStickiness: 0.05, monetizationModel: 0.05,
  };

  function calculateScore(stock: typeof FINTECH_STOCKS[0], weights: typeof DEFAULT_WEIGHTS): number {
    return Math.round(
      stock.revenueGrowth * weights.revenueGrowth +
      stock.marketOpportunity * weights.marketOpportunity +
      stock.competitiveMoat * weights.competitiveMoat +
      stock.profitabilityPath * weights.profitabilityPath +
      stock.valuation * weights.valuation +
      stock.executionCapabilities * weights.executionCapabilities +
      stock.innovationCulture * weights.innovationCulture +
      stock.fundingStrength * weights.fundingStrength +
      stock.customerStickiness * weights.customerStickiness +
      stock.monetizationModel * weights.monetizationModel
    );
  }

  const stockWithScores = FINTECH_STOCKS.map(stock => ({
    ...stock,
    fiveXScore: calculateScore(stock, DEFAULT_WEIGHTS),
  }));

  for (const stock of stockWithScores) {
    await getDb().stock.upsert({
      where: { ticker: stock.ticker },
      update: stock,
      create: stock,
    });
  }

  const existingWeights = await getDb().factorWeight.findFirst();
  if (!existingWeights) {
    await getDb().factorWeight.create({ data: DEFAULT_WEIGHTS });
  }

  console.log(`✅ Auto-seeded ${stockWithScores.length} stocks`);
}

export async function GET() {
  try {
    await ensureSeeded();

    const stocks = await getDb().stock.findMany({
      orderBy: { fiveXScore: 'desc' },
    });

    const weights = await getDb().factorWeight.findFirst();

    return NextResponse.json({ stocks, weights });
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return NextResponse.json({ error: 'Failed to fetch stocks' }, { status: 500 });
  }
}
