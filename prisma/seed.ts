import { db } from '../src/lib/db';

const FINTECH_STOCKS = [
  {
    ticker: "SQ",
    name: "Block, Inc.",
    sector: "Payments",
    subSector: "Point-of-Sale & Digital Payments",
    marketCap: "$44.5B",
    price: "$74.78",
    description: "Block (formerly Square) operates Cash App and Square POS ecosystem. Cash App has 57M+ monthly active users with growing Bitcoin and banking services. Square serves millions of SMBs with integrated hardware and software solutions. Rebranded ticker to XYZ in 2025.",
    website: "https://block.xyz",
    revenueGrowth: 62, marketOpportunity: 78, competitiveMoat: 68, profitabilityPath: 72, valuation: 70,
    executionCapabilities: 72, innovationCulture: 80, fundingStrength: 78, customerStickiness: 70, monetizationModel: 68,
    fiveXScore: 0,
  },
  {
    ticker: "UPST",
    name: "Upstart Holdings, Inc.",
    sector: "Lending",
    subSector: "AI-Powered Lending",
    marketCap: "$2.9B",
    price: "$32.43",
    description: "Upstart uses AI/ML to improve credit decisions, claiming 75% more approvals at same default rates. Expanded into auto loans and HELOC. Platform processes $1.5B+ in loans quarterly with growing bank partnerships.",
    website: "https://www.upstart.com",
    revenueGrowth: 75, marketOpportunity: 82, competitiveMoat: 60, profitabilityPath: 55, valuation: 65,
    executionCapabilities: 65, innovationCulture: 82, fundingStrength: 55, customerStickiness: 50, monetizationModel: 72,
    fiveXScore: 0,
  },
  {
    ticker: "NU",
    name: "Nu Holdings Ltd.",
    sector: "Digital Banking",
    subSector: "Latin America Neobank",
    marketCap: "$62.9B",
    price: "$12.74",
    description: "Nubank is the world's largest digital bank with 100M+ customers across Brazil, Mexico, and Colombia. Achieved profitability in 2023. Growing deposit base and expanding credit products in underpenetrated LatAm markets.",
    website: "https://www.nu.com.br",
    revenueGrowth: 85, marketOpportunity: 88, competitiveMoat: 75, profitabilityPath: 82, valuation: 60,
    executionCapabilities: 85, innovationCulture: 82, fundingStrength: 80, customerStickiness: 88, monetizationModel: 78,
    fiveXScore: 0,
  },
  {
    ticker: "SOFI",
    name: "SoFi Technologies, Inc.",
    sector: "Digital Banking",
    subSector: "Personal Finance & Lending",
    marketCap: "$18.7B",
    price: "$17.91",
    description: "SoFi offers a one-stop financial services platform with 10M+ members. Bank charter enables lower funding costs. Growing deposit base and expanding product suite from student loan refinancing to full banking services.",
    website: "https://www.sofi.com",
    revenueGrowth: 68, marketOpportunity: 72, competitiveMoat: 58, profitabilityPath: 70, valuation: 62,
    executionCapabilities: 72, innovationCulture: 68, fundingStrength: 72, customerStickiness: 62, monetizationModel: 75,
    fiveXScore: 0,
  },
  {
    ticker: "LMND",
    name: "Lemonade, Inc.",
    sector: "Insurtech",
    subSector: "AI-Powered Insurance",
    marketCap: "$3.8B",
    price: "$58.84",
    description: "Lemonade uses AI for instant insurance quotes and claims processing. Expanded from renters to homeowners, pet, life, and car insurance. Growing premium in-force with improving loss ratios and European expansion underway.",
    website: "https://www.lemonade.com",
    revenueGrowth: 55, marketOpportunity: 70, competitiveMoat: 45, profitabilityPath: 35, valuation: 80,
    executionCapabilities: 55, innovationCulture: 78, fundingStrength: 45, customerStickiness: 52, monetizationModel: 60,
    fiveXScore: 0,
  },
  {
    ticker: "AFRM",
    name: "Affirm Holdings, Inc.",
    sector: "Lending",
    subSector: "Buy Now Pay Later",
    marketCap: "$24.8B",
    price: "$73.92",
    description: "Affirm is a leading BNPL platform with transparent, no-late-fee lending. Partners with Amazon, Shopify, Walmart. Growing merchant network and expanding debit+ card offering. Approaching GAAP profitability.",
    website: "https://www.affirm.com",
    revenueGrowth: 70, marketOpportunity: 68, competitiveMoat: 55, profitabilityPath: 65, valuation: 55,
    executionCapabilities: 70, innovationCulture: 65, fundingStrength: 68, customerStickiness: 58, monetizationModel: 72,
    fiveXScore: 0,
  },
  {
    ticker: "ADYEY",
    name: "Adyen N.V.",
    sector: "Payments",
    subSector: "Global Payment Processing",
    marketCap: "€52.3B",
    price: "€1,620.00",
    description: "Adyen provides a single global platform for accepting payments worldwide. Serves enterprise clients like Meta, Uber, Spotify. Known for superior technology, high margins (65%+ take-rate margin), and disciplined growth.",
    website: "https://www.adyen.com",
    revenueGrowth: 58, marketOpportunity: 85, competitiveMoat: 82, profitabilityPath: 90, valuation: 45,
    executionCapabilities: 88, innovationCulture: 75, fundingStrength: 90, customerStickiness: 85, monetizationModel: 82,
    fiveXScore: 0,
  },
  {
    ticker: "SHOP",
    name: "Shopify Inc.",
    sector: "Commerce",
    subSector: "E-Commerce Platform & Payments",
    marketCap: "$136.2B",
    price: "$108.84",
    description: "Shopify powers millions of merchants globally with commerce infrastructure. Shopify Payments, Capital, and Logistics create an ecosystem lock-in. Growing off-OMS penetration and B2B wholesale features drive expansion.",
    website: "https://www.shopify.com",
    revenueGrowth: 60, marketOpportunity: 80, competitiveMoat: 78, profitabilityPath: 85, valuation: 40,
    executionCapabilities: 82, innovationCulture: 78, fundingStrength: 88, customerStickiness: 82, monetizationModel: 85,
    fiveXScore: 0,
  },
  {
    ticker: "COIN",
    name: "Coinbase Global, Inc.",
    sector: "Crypto",
    subSector: "Cryptocurrency Exchange",
    marketCap: "$40.8B",
    price: "$163.26",
    description: "Coinbase is the largest US crypto exchange with 110M+ verified users. Base L2 network growing rapidly. Institutional custody business and staking revenue provide diversification beyond trading fees.",
    website: "https://www.coinbase.com",
    revenueGrowth: 72, marketOpportunity: 75, competitiveMoat: 60, profitabilityPath: 55, valuation: 48,
    executionCapabilities: 68, innovationCulture: 72, fundingStrength: 78, customerStickiness: 55, monetizationModel: 65,
    fiveXScore: 0,
  },
  {
    ticker: "HOOD",
    name: "Robinhood Markets, Inc.",
    sector: "Trading",
    subSector: "Retail Trading Platform",
    marketCap: "$97.5B",
    price: "$108.00",
    description: "Robinhood pioneered commission-free trading with 23M+ funded accounts. Expanding into retirement accounts, credit cards, and futures. Gold subscription growing. Crypto and options revenue diversifying income.",
    website: "https://robinhood.com",
    revenueGrowth: 65, marketOpportunity: 62, competitiveMoat: 50, profitabilityPath: 68, valuation: 58,
    executionCapabilities: 65, innovationCulture: 62, fundingStrength: 72, customerStickiness: 48, monetizationModel: 70,
    fiveXScore: 0,
  },
  {
    ticker: "MQ",
    name: "Marqeta, Inc.",
    sector: "Payments",
    subSector: "Card Issuing Platform",
    marketCap: "$1.6B",
    price: "$3.87",
    description: "Marqeta provides modern card issuing infrastructure powering Block's Cash App, Uber, and Instacart. Open API platform enables just-in-time funding and dynamic spend controls. Expanding into credit and international markets.",
    website: "https://www.marqeta.com",
    revenueGrowth: 50, marketOpportunity: 72, competitiveMoat: 62, profitabilityPath: 48, valuation: 75,
    executionCapabilities: 68, innovationCulture: 65, fundingStrength: 55, customerStickiness: 72, monetizationModel: 58,
    fiveXScore: 0,
  },
  {
    ticker: "MELI",
    name: "MercadoLibre, Inc.",
    sector: "Commerce & Fintech",
    subSector: "LatAm E-Commerce & Digital Payments",
    marketCap: "$82.5B",
    price: "$1,633.00",
    description: "MercadoLibre dominates Latin American e-commerce and fintech. Mercado Pago processes $140B+ annually with 50M+ active users. Credit business growing 80%+ YoY. Combines Amazon + PayPal for LatAm.",
    website: "https://www.mercadolibre.com",
    revenueGrowth: 78, marketOpportunity: 90, competitiveMoat: 85, profitabilityPath: 88, valuation: 35,
    executionCapabilities: 85, innovationCulture: 78, fundingStrength: 85, customerStickiness: 90, monetizationModel: 88,
    fiveXScore: 0,
  },
  {
    ticker: "WISE",
    name: "Wise plc",
    sector: "Payments",
    subSector: "Cross-Border Money Transfer",
    marketCap: "£10.6B",
    price: "£8.20",
    description: "Wise provides low-cost cross-border payments with 12M+ customers. Average cost 0.67% vs 6% industry average. Wise Platform embedded in banks globally. Growing business offering and interest income on customer balances.",
    website: "https://wise.com",
    revenueGrowth: 58, marketOpportunity: 75, competitiveMoat: 70, profitabilityPath: 80, valuation: 55,
    executionCapabilities: 78, innovationCulture: 68, fundingStrength: 72, customerStickiness: 75, monetizationModel: 72,
    fiveXScore: 0,
  },
  {
    ticker: "PLTR",
    name: "Palantir Technologies Inc.",
    sector: "Enterprise AI",
    subSector: "AI & Data Analytics for Finance",
    marketCap: "$285.6B",
    price: "$128.47",
    description: "Palantir provides AI-powered data analytics platforms used by major financial institutions. AIP (Artificial Intelligence Platform) driving commercial revenue growth 25%+ YoY. Foundry platform used for anti-fraud, risk, and compliance.",
    website: "https://www.palantir.com",
    revenueGrowth: 65, marketOpportunity: 82, competitiveMoat: 78, profitabilityPath: 85, valuation: 28,
    executionCapabilities: 82, innovationCulture: 75, fundingStrength: 88, customerStickiness: 80, monetizationModel: 72,
    fiveXScore: 0,
  },
  {
    ticker: "PATH",
    name: "UiPath Inc.",
    sector: "Automation",
    subSector: "RPA for Financial Services",
    marketCap: "$5.8B",
    price: "$10.72",
    description: "UiPath leads RPA market with deep penetration in financial services automation. AI-powered document understanding and process mining. Transitioning to cloud subscription model with 10K+ enterprise customers.",
    website: "https://www.uipath.com",
    revenueGrowth: 42, marketOpportunity: 65, competitiveMoat: 62, profitabilityPath: 60, valuation: 68,
    executionCapabilities: 68, innovationCulture: 58, fundingStrength: 65, customerStickiness: 72, monetizationModel: 62,
    fiveXScore: 0,
  },
  {
    ticker: "FLYW",
    name: "Flywire Corporation",
    sector: "Payments",
    subSector: "Vertical-Specific Payments",
    marketCap: "$1.7B",
    price: "$14.13",
    description: "Flywire specializes in complex, high-value vertical payment flows (education, healthcare, travel). Processing $30B+ annually. Proprietary receivables platform with strong network effects in niche verticals.",
    website: "https://www.flywire.com",
    revenueGrowth: 52, marketOpportunity: 60, competitiveMoat: 58, profitabilityPath: 62, valuation: 62,
    executionCapabilities: 65, innovationCulture: 55, fundingStrength: 52, customerStickiness: 68, monetizationModel: 58,
    fiveXScore: 0,
  },
];

const DEFAULT_WEIGHTS = {
  revenueGrowth: 0.15,
  marketOpportunity: 0.15,
  competitiveMoat: 0.15,
  profitabilityPath: 0.10,
  valuation: 0.10,
  executionCapabilities: 0.10,
  innovationCulture: 0.08,
  fundingStrength: 0.07,
  customerStickiness: 0.05,
  monetizationModel: 0.05,
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

async function seed() {
  console.log("🌱 Seeding database...");

  const stockWithScores = FINTECH_STOCKS.map(stock => ({
    ...stock,
    fiveXScore: calculateScore(stock, DEFAULT_WEIGHTS),
  }));

  for (const stock of stockWithScores) {
    await db.stock.upsert({
      where: { ticker: stock.ticker },
      update: stock,
      create: stock,
    });
  }
  console.log(`✅ Seeded ${FINTECH_STOCKS.length} fintech stocks`);

  const existingWeights = await db.factorWeight.findFirst();
  if (!existingWeights) {
    await db.factorWeight.create({ data: DEFAULT_WEIGHTS });
    console.log("✅ Seeded default factor weights");
  }

  const ranked = stockWithScores.sort((a, b) => b.fiveXScore - a.fiveXScore);
  console.log("\n🏆 5X Score Rankings:");
  ranked.forEach((s, i) => {
    console.log(`  ${i + 1}. ${s.ticker} — ${s.name}: ${s.fiveXScore} (${s.price})`);
  });

  console.log("\n🎉 Seeding complete!");
}

seed()
  .catch((e) => { console.error("Seed error:", e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
