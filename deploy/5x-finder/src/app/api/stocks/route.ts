import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// Auto-seed: populate database and ensure financial metrics are up-to-date
async function ensureSeeded() {
  const count = await getDb().stock.count();
  if (count === 0) {
    console.log('🌱 Database is empty, auto-seeding...');
  } else {
    console.log('🔄 Updating stock data with latest financial metrics...');
  }

  const FINTECH_STOCKS = [
    // ─── Payments (11) ────────────────────────────────────────────────────
    { ticker: "V", name: "Visa Inc.", sector: "Payments", subSector: "Global Payment Network", marketCap: "$640.0B", price: "$327.24", description: "Visa operates the world's largest electronic payment network, processing 250B+ transactions annually. Dominates global card payments with unmatched network effects and merchant acceptance.", website: "https://www.visa.com", revenueGrowth: 48, marketOpportunity: 92, competitiveMoat: 95, profitabilityPath: 98, valuation: 30, executionCapabilities: 92, innovationCulture: 65, fundingStrength: 95, customerStickiness: 92, monetizationModel: 95, peRatio: 32.0, pegRatio: 1.6, evSales: 18.5, evEbitda: 32.0 },
    { ticker: "MA", name: "Mastercard Incorporated", sector: "Payments", subSector: "Global Payment Network", marketCap: "$455.0B", price: "$489.79", description: "Mastercard is a global payment technology company processing 150B+ transactions. Strong in cross-border payments with growing digital and B2B capabilities.", website: "https://www.mastercard.com", revenueGrowth: 50, marketOpportunity: 90, competitiveMoat: 92, profitabilityPath: 95, valuation: 32, executionCapabilities: 90, innovationCulture: 68, fundingStrength: 92, customerStickiness: 88, monetizationModel: 92, peRatio: 35.0, pegRatio: 1.7, evSales: 17.2, evEbitda: 35.0 },
    { ticker: "PYPL", name: "PayPal Holdings, Inc.", sector: "Payments", subSector: "Digital Wallet & Online Payments", marketCap: "$45.0B", price: "$42.51", description: "PayPal is a global digital payments leader with 430M+ active accounts. Braintree and Venmo provide growth catalysts. Focusing on profitable growth under new leadership.", website: "https://www.paypal.com", revenueGrowth: 45, marketOpportunity: 82, competitiveMoat: 62, profitabilityPath: 85, valuation: 55, executionCapabilities: 72, innovationCulture: 58, fundingStrength: 80, customerStickiness: 60, monetizationModel: 72, peRatio: 17.5, pegRatio: 1.1, evSales: 4.5, evEbitda: 14.0 },
    { ticker: "AXP", name: "American Express Company", sector: "Payments", subSector: "Premium Card & Payment Network", marketCap: "$155.0B", price: "$338.00", description: "American Express is a premium payments and card network with 140M+ cards in force. Unique closed-loop network with strong brand loyalty and high-spending customer base.", website: "https://www.americanexpress.com", revenueGrowth: 52, marketOpportunity: 78, competitiveMoat: 82, profitabilityPath: 90, valuation: 42, executionCapabilities: 85, innovationCulture: 60, fundingStrength: 88, customerStickiness: 85, monetizationModel: 88, peRatio: 20.5, pegRatio: 1.2, evSales: 6.8, evEbitda: 18.0 },
    { ticker: "SQ", name: "Block, Inc.", sector: "Payments", subSector: "Point-of-Sale & Digital Payments", marketCap: "$45.0B", price: "$74.70", description: "Block (formerly Square) operates Cash App and Square POS ecosystem. Cash App has 57M+ monthly active users with growing Bitcoin and banking services.", website: "https://block.xyz", revenueGrowth: 62, marketOpportunity: 78, competitiveMoat: 68, profitabilityPath: 72, valuation: 70, executionCapabilities: 72, innovationCulture: 80, fundingStrength: 78, customerStickiness: 70, monetizationModel: 68, peRatio: 62.5, pegRatio: 1.8, evSales: 5.2, evEbitda: 45.0 },
    { ticker: "ADYEY", name: "Adyen N.V.", sector: "Payments", subSector: "Global Payment Processing", marketCap: "€52.0B", price: "€875.80", description: "Adyen provides a single global platform for accepting payments worldwide. Serves enterprise clients like Meta, Uber, Spotify.", website: "https://www.adyen.com", revenueGrowth: 58, marketOpportunity: 85, competitiveMoat: 82, profitabilityPath: 90, valuation: 45, executionCapabilities: 88, innovationCulture: 75, fundingStrength: 90, customerStickiness: 85, monetizationModel: 82, peRatio: 52.0, pegRatio: 1.6, evSales: 12.5, evEbitda: 28.0 },
    { ticker: "MQ", name: "Marqeta, Inc.", sector: "Payments", subSector: "Card Issuing Platform", marketCap: "$2.2B", price: "$3.88", description: "Marqeta provides modern card issuing infrastructure powering Block's Cash App, Uber, and Instacart.", website: "https://www.marqeta.com", revenueGrowth: 50, marketOpportunity: 72, competitiveMoat: 62, profitabilityPath: 48, valuation: 75, executionCapabilities: 68, innovationCulture: 65, fundingStrength: 55, customerStickiness: 72, monetizationModel: 58, peRatio: null, pegRatio: null, evSales: 3.5, evEbitda: null },
    { ticker: "WISE", name: "Wise plc", sector: "Payments", subSector: "Cross-Border Money Transfer", marketCap: "£12.0B", price: "$10.84", description: "Wise provides low-cost cross-border payments with 12M+ customers. Average cost 0.67% vs 6% industry average.", website: "https://wise.com", revenueGrowth: 58, marketOpportunity: 75, competitiveMoat: 70, profitabilityPath: 80, valuation: 55, executionCapabilities: 78, innovationCulture: 68, fundingStrength: 72, customerStickiness: 75, monetizationModel: 72, peRatio: 28.0, pegRatio: 1.0, evSales: 9.5, evEbitda: 20.0 },
    { ticker: "FLYW", name: "Flywire Corporation", sector: "Payments", subSector: "Vertical-Specific Payments", marketCap: "$1.5B", price: "$15.85", description: "Flywire specializes in complex, high-value vertical payment flows (education, healthcare, travel). Processing $30B+ annually.", website: "https://www.flywire.com", revenueGrowth: 52, marketOpportunity: 60, competitiveMoat: 58, profitabilityPath: 62, valuation: 62, executionCapabilities: 65, innovationCulture: 55, fundingStrength: 52, customerStickiness: 68, monetizationModel: 58, peRatio: 48.0, pegRatio: 1.5, evSales: 4.5, evEbitda: 28.0 },
    { ticker: "PAYP", name: "PayPay Corporation", sector: "Payments", subSector: "Japan Mobile Payments", marketCap: "$3.2B", price: "$12.37", description: "PayPay is Japan's largest mobile payment platform with 65M+ users. Backed by SoftBank and Yahoo Japan.", website: "https://paypay.ne.jp", revenueGrowth: 55, marketOpportunity: 68, competitiveMoat: 65, profitabilityPath: 50, valuation: 62, executionCapabilities: 65, innovationCulture: 55, fundingStrength: 70, customerStickiness: 72, monetizationModel: 55, peRatio: null, pegRatio: null, evSales: 3.0, evEbitda: null },
    { ticker: "BILL", name: "BILL Holdings, Inc.", sector: "Payments", subSector: "SMB Financial Automation", marketCap: "$4.5B", price: "$32.74", description: "BILL provides financial automation platform for SMBs, handling accounts payable, receivable, and spend management. Serves 450K+ businesses.", website: "https://www.bill.com", revenueGrowth: 52, marketOpportunity: 65, competitiveMoat: 55, profitabilityPath: 52, valuation: 65, executionCapabilities: 68, innovationCulture: 58, fundingStrength: 58, customerStickiness: 65, monetizationModel: 62, peRatio: 55.0, pegRatio: 1.8, evSales: 7.5, evEbitda: 32.0 },

    // ─── Lending (4) ──────────────────────────────────────────────────────
    { ticker: "UPST", name: "Upstart Holdings, Inc.", sector: "Lending", subSector: "AI-Powered Lending", marketCap: "$4.5B", price: "$32.24", description: "Upstart uses AI/ML to improve credit decisions, claiming 75% more approvals at same default rates. Expanded into auto loans and HELOC.", website: "https://www.upstart.com", revenueGrowth: 75, marketOpportunity: 82, competitiveMoat: 60, profitabilityPath: 55, valuation: 65, executionCapabilities: 65, innovationCulture: 82, fundingStrength: 55, customerStickiness: 50, monetizationModel: 72, peRatio: null, pegRatio: null, evSales: 4.1, evEbitda: null },
    { ticker: "AFRM", name: "Affirm Holdings, Inc.", sector: "Lending", subSector: "Buy Now Pay Later", marketCap: "$23.0B", price: "$73.92", description: "Affirm is a leading BNPL platform with transparent, no-late-fee lending. Partners with Amazon, Shopify, Walmart.", website: "https://www.affirm.com", revenueGrowth: 70, marketOpportunity: 68, competitiveMoat: 55, profitabilityPath: 65, valuation: 55, executionCapabilities: 70, innovationCulture: 65, fundingStrength: 68, customerStickiness: 58, monetizationModel: 72, peRatio: 45.0, pegRatio: 1.2, evSales: 5.5, evEbitda: 42.0 },
    { ticker: "KLAR", name: "Klarna Group plc", sector: "Lending", subSector: "Buy Now Pay Later", marketCap: "$9.5B", price: "$18.84", description: "Klarna is Europe's largest BNPL provider with 85M+ active consumers and 575K+ merchant partners globally.", website: "https://www.klarna.com", revenueGrowth: 65, marketOpportunity: 78, competitiveMoat: 62, profitabilityPath: 55, valuation: 60, executionCapabilities: 72, innovationCulture: 75, fundingStrength: 65, customerStickiness: 68, monetizationModel: 70, peRatio: null, pegRatio: null, evSales: 3.2, evEbitda: null },
    { ticker: "SOFI", name: "SoFi Technologies, Inc.", sector: "Lending", subSector: "Personal Finance & Digital Lending", marketCap: "$19.5B", price: "$17.91", description: "SoFi offers a one-stop financial services platform with 10M+ members. Bank charter enables lower funding costs. Strong in personal loans and student loan refinancing.", website: "https://www.sofi.com", revenueGrowth: 68, marketOpportunity: 72, competitiveMoat: 58, profitabilityPath: 70, valuation: 62, executionCapabilities: 72, innovationCulture: 68, fundingStrength: 72, customerStickiness: 62, monetizationModel: 75, peRatio: 58.0, pegRatio: 1.5, evSales: 6.8, evEbitda: 35.0 },

    // ─── Digital Banking (3) ──────────────────────────────────────────────
    { ticker: "NU", name: "Nu Holdings Ltd.", sector: "Digital Banking", subSector: "Latin America Neobank", marketCap: "$68.0B", price: "$12.71", description: "Nubank is the world's largest digital bank with 100M+ customers across Brazil, Mexico, and Colombia. Achieved profitability in 2023.", website: "https://www.nu.com.br", revenueGrowth: 85, marketOpportunity: 88, competitiveMoat: 75, profitabilityPath: 82, valuation: 60, executionCapabilities: 85, innovationCulture: 82, fundingStrength: 80, customerStickiness: 88, monetizationModel: 78, peRatio: 38.2, pegRatio: 0.9, evSales: 8.5, evEbitda: 22.0 },
    { ticker: "323410", name: "KakaoBank Corp.", sector: "Digital Banking", subSector: "South Korea Neobank", marketCap: "₩4.5T", price: "₩22,950", description: "KakaoBank is South Korea's leading internet-only bank with 20M+ users. Leverages KakaoTalk ecosystem for customer acquisition. Profitable since 2022 with growing loan and wealth management business.", website: "https://www.kakaobank.com", revenueGrowth: 62, marketOpportunity: 72, competitiveMoat: 68, profitabilityPath: 78, valuation: 45, executionCapabilities: 75, innovationCulture: 72, fundingStrength: 72, customerStickiness: 80, monetizationModel: 68, peRatio: 15.2, pegRatio: 0.6, evSales: 5.8, evEbitda: 10.5 },
    { ticker: "INTR", name: "Inter & Co, Inc.", sector: "Digital Banking", subSector: "Brazil Super App Banking", marketCap: "$3.2B", price: "$5.56", description: "Inter is Brazil's leading digital super app offering banking, investments, insurance, and e-commerce. 35M+ clients with strong growth in credit and investment products.", website: "https://www.bancointer.com.br", revenueGrowth: 72, marketOpportunity: 78, competitiveMoat: 58, profitabilityPath: 65, valuation: 55, executionCapabilities: 70, innovationCulture: 68, fundingStrength: 65, customerStickiness: 72, monetizationModel: 70, peRatio: 22.5, pegRatio: 0.8, evSales: 4.2, evEbitda: 15.0 },

    // ─── Insurtech (4) ────────────────────────────────────────────────────
    { ticker: "LMND", name: "Lemonade, Inc.", sector: "Insurtech", subSector: "AI-Powered Insurance", marketCap: "$4.0B", price: "$58.84", description: "Lemonade uses AI for instant insurance quotes and claims processing. Expanded from renters to homeowners, pet, life, and car insurance.", website: "https://www.lemonade.com", revenueGrowth: 55, marketOpportunity: 70, competitiveMoat: 45, profitabilityPath: 35, valuation: 80, executionCapabilities: 55, innovationCulture: 78, fundingStrength: 45, customerStickiness: 52, monetizationModel: 60, peRatio: null, pegRatio: null, evSales: 3.8, evEbitda: null },
    { ticker: "ROOT", name: "Root, Inc.", sector: "Insurtech", subSector: "Telematics-Based Auto Insurance", marketCap: "$1.2B", price: "$51.99", description: "Root uses smartphone telematics to base auto insurance rates on actual driving behavior rather than demographics. Achieving rapid loss ratio improvement.", website: "https://www.joinroot.com", revenueGrowth: 48, marketOpportunity: 65, competitiveMoat: 42, profitabilityPath: 38, valuation: 78, executionCapabilities: 52, innovationCulture: 72, fundingStrength: 40, customerStickiness: 45, monetizationModel: 55, peRatio: null, pegRatio: null, evSales: 2.8, evEbitda: null },
    { ticker: "HIPPO", name: "Hippo Insurance", sector: "Insurtech", subSector: "Smart Home Insurance", marketCap: "$0.6B", price: "$25.96", description: "Hippo offers modern home insurance with smart home integration and proactive protection. Uses data analytics for faster, more accurate underwriting.", website: "https://www.hippo.com", revenueGrowth: 42, marketOpportunity: 58, competitiveMoat: 38, profitabilityPath: 32, valuation: 75, executionCapabilities: 48, innovationCulture: 68, fundingStrength: 38, customerStickiness: 48, monetizationModel: 52, peRatio: null, pegRatio: null, evSales: 2.2, evEbitda: null },
    { ticker: "OSCR", name: "Oscar Health, Inc.", sector: "Insurtech", subSector: "Technology-Driven Health Insurance", marketCap: "$6.5B", price: "$28.40", description: "Oscar Health is a tech-focused health insurance company serving individual, small group, and Medicare Advantage markets. Uses data science for care management.", website: "https://www.hioscar.com", revenueGrowth: 58, marketOpportunity: 72, competitiveMoat: 40, profitabilityPath: 42, valuation: 72, executionCapabilities: 55, innovationCulture: 70, fundingStrength: 48, customerStickiness: 50, monetizationModel: 58, peRatio: null, pegRatio: null, evSales: 0.9, evEbitda: null },

    // ─── Commerce & Fintech (3) — merged Commerce + Commerce & Fintech ────
    { ticker: "SHOP", name: "Shopify Inc.", sector: "Commerce & Fintech", subSector: "E-Commerce Platform & Payments", marketCap: "$140.0B", price: "$108.85", description: "Shopify powers millions of merchants globally with commerce infrastructure. Shopify Payments, Capital, and Logistics create an ecosystem lock-in.", website: "https://www.shopify.com", revenueGrowth: 60, marketOpportunity: 80, competitiveMoat: 78, profitabilityPath: 85, valuation: 40, executionCapabilities: 82, innovationCulture: 78, fundingStrength: 88, customerStickiness: 82, monetizationModel: 85, peRatio: 68.0, pegRatio: 1.4, evSales: 10.2, evEbitda: 38.0 },
    { ticker: "MELI", name: "MercadoLibre, Inc.", sector: "Commerce & Fintech", subSector: "LatAm E-Commerce & Digital Payments", marketCap: "$95.0B", price: "$1,633.15", description: "MercadoLibre dominates Latin American e-commerce and fintech. Mercado Pago processes $140B+ annually with 50M+ active users.", website: "https://www.mercadolibre.com", revenueGrowth: 78, marketOpportunity: 90, competitiveMoat: 85, profitabilityPath: 88, valuation: 35, executionCapabilities: 85, innovationCulture: 78, fundingStrength: 85, customerStickiness: 90, monetizationModel: 88, peRatio: 55.0, pegRatio: 1.3, evSales: 6.2, evEbitda: 30.0 },
    { ticker: "SE", name: "Sea Limited", sector: "Commerce & Fintech", subSector: "Southeast Asia Digital Ecosystem", marketCap: "$52.0B", price: "$91.28", description: "Sea Limited operates Shopee (e-commerce), SeaMoney (fintech/digital lending), and Garena (gaming). SeaMoney provides digital lending, insurance, and e-wallet services across Southeast Asia.", website: "https://www.sea.com", revenueGrowth: 72, marketOpportunity: 85, competitiveMoat: 78, profitabilityPath: 72, valuation: 50, executionCapabilities: 78, innovationCulture: 75, fundingStrength: 80, customerStickiness: 80, monetizationModel: 78, peRatio: 48.0, pegRatio: 1.2, evSales: 5.0, evEbitda: 25.0 },

    // ─── Crypto (4) — MSTR moved here ────────────────────────────────────
    { ticker: "COIN", name: "Coinbase Global, Inc.", sector: "Crypto", subSector: "Cryptocurrency Exchange", marketCap: "$42.0B", price: "$167.00", description: "Coinbase is the largest US crypto exchange with 110M+ verified users. Base L2 network growing rapidly.", website: "https://www.coinbase.com", revenueGrowth: 72, marketOpportunity: 75, competitiveMoat: 60, profitabilityPath: 55, valuation: 48, executionCapabilities: 68, innovationCulture: 72, fundingStrength: 78, customerStickiness: 55, monetizationModel: 65, peRatio: 35.0, pegRatio: 0.8, evSales: 7.2, evEbitda: 18.0 },
    { ticker: "BLSH", name: "Bullish", sector: "Crypto", subSector: "Institutional Crypto Exchange", marketCap: "$4.8B", price: "$24.10", description: "Bullish is a regulated crypto exchange designed for institutional investors, combining deep liquidity with compliance-first architecture.", website: "https://bullish.com", revenueGrowth: 70, marketOpportunity: 72, competitiveMoat: 48, profitabilityPath: 45, valuation: 65, executionCapabilities: 62, innovationCulture: 70, fundingStrength: 75, customerStickiness: 42, monetizationModel: 58, peRatio: null, pegRatio: null, evSales: 4.8, evEbitda: null },
    { ticker: "CRCL", name: "Circle Internet Group, Inc.", sector: "Crypto", subSector: "Stablecoin Infrastructure", marketCap: "$18.5B", price: "$80.23", description: "Circle is the issuer of USDC, the world's second-largest stablecoin with $60B+ in circulation. Key beneficiary of stablecoin regulation clarity.", website: "https://www.circle.com", revenueGrowth: 82, marketOpportunity: 88, competitiveMoat: 72, profitabilityPath: 70, valuation: 45, executionCapabilities: 78, innovationCulture: 72, fundingStrength: 82, customerStickiness: 75, monetizationModel: 80, peRatio: 32.0, pegRatio: 0.7, evSales: 6.0, evEbitda: 18.0 },
    { ticker: "MSTR", name: "Strategy (MicroStrategy)", sector: "Crypto", subSector: "Bitcoin Treasury Company", marketCap: "$40.0B", price: "$112.53", description: "Strategy (formerly MicroStrategy) is the largest corporate holder of Bitcoin with 580K+ BTC on balance sheet. Operates as a Bitcoin treasury vehicle with software analytics business.", website: "https://www.strategy.com", revenueGrowth: 45, marketOpportunity: 60, competitiveMoat: 50, profitabilityPath: 35, valuation: 25, executionCapabilities: 72, innovationCulture: 65, fundingStrength: 55, customerStickiness: 58, monetizationModel: 45, peRatio: null, pegRatio: null, evSales: 45.0, evEbitda: null },

    // ─── Trading (4) — added Futu, Webull, Tiger ─────────────────────────
    { ticker: "HOOD", name: "Robinhood Markets, Inc.", sector: "Trading", subSector: "Retail Trading Platform", marketCap: "$95.0B", price: "$105.20", description: "Robinhood pioneered commission-free trading with 23M+ funded accounts. Expanding into retirement accounts, credit cards, and futures.", website: "https://robinhood.com", revenueGrowth: 65, marketOpportunity: 62, competitiveMoat: 50, profitabilityPath: 68, valuation: 58, executionCapabilities: 65, innovationCulture: 62, fundingStrength: 72, customerStickiness: 48, monetizationModel: 70, peRatio: 42.0, pegRatio: 1.1, evSales: 8.8, evEbitda: 25.0 },
    { ticker: "FUTU", name: "Futu Holdings Limited", sector: "Trading", subSector: "Digital Brokerage (China/HK)", marketCap: "$13.5B", price: "$96.64", description: "Futu is a leading digital brokerage serving Chinese investors globally. MooMoo platform offers trading across US, HK, and China markets with 4M+ paying users.", website: "https://www.futuhk.com", revenueGrowth: 58, marketOpportunity: 68, competitiveMoat: 55, profitabilityPath: 75, valuation: 52, executionCapabilities: 72, innovationCulture: 62, fundingStrength: 68, customerStickiness: 65, monetizationModel: 72, peRatio: 18.0, pegRatio: 0.8, evSales: 5.5, evEbitda: 12.0 },
    { ticker: "WEBULL", name: "Webull Corporation", sector: "Trading", subSector: "Mobile Trading Platform", marketCap: "$4.2B", price: "$7.08", description: "Webull offers commission-free trading with advanced charting and analytics. Popular among young active traders with 20M+ registered users.", website: "https://www.webull.com", revenueGrowth: 55, marketOpportunity: 58, competitiveMoat: 40, profitabilityPath: 45, valuation: 65, executionCapabilities: 58, innovationCulture: 60, fundingStrength: 50, customerStickiness: 38, monetizationModel: 55, peRatio: null, pegRatio: null, evSales: 3.8, evEbitda: null },
    { ticker: "TIGR", name: "UP Fintech Holding (Tiger Brokers)", sector: "Trading", subSector: "Cross-Border Digital Brokerage", marketCap: "$0.8B", price: "$4.71", description: "Tiger Brokers is a Singapore-based online brokerage providing global market access to Chinese investors. Offers trading in US, HK, and AU markets.", website: "https://www.tigerbrokers.com", revenueGrowth: 50, marketOpportunity: 55, competitiveMoat: 38, profitabilityPath: 50, valuation: 68, executionCapabilities: 55, innovationCulture: 55, fundingStrength: 45, customerStickiness: 42, monetizationModel: 50, peRatio: null, pegRatio: null, evSales: 2.5, evEbitda: null },

    // ─── Enterprise AI & Automation (2) — merged ─────────────────────────
    { ticker: "PLTR", name: "Palantir Technologies Inc.", sector: "Enterprise AI & Automation", subSector: "AI & Data Analytics for Finance", marketCap: "$308.0B", price: "$128.47", description: "Palantir provides AI-powered data analytics platforms used by major financial institutions. AIP driving commercial revenue growth 25%+ YoY.", website: "https://www.palantir.com", revenueGrowth: 65, marketOpportunity: 82, competitiveMoat: 78, profitabilityPath: 85, valuation: 28, executionCapabilities: 82, innovationCulture: 75, fundingStrength: 88, customerStickiness: 80, monetizationModel: 72, peRatio: 185.0, pegRatio: 3.2, evSales: 22.0, evEbitda: 85.0 },
    { ticker: "PATH", name: "UiPath Inc.", sector: "Enterprise AI & Automation", subSector: "RPA for Financial Services", marketCap: "$6.2B", price: "$10.27", description: "UiPath leads RPA market with deep penetration in financial services automation. AI-powered document understanding and process mining.", website: "https://www.uipath.com", revenueGrowth: 42, marketOpportunity: 65, competitiveMoat: 62, profitabilityPath: 60, valuation: 68, executionCapabilities: 68, innovationCulture: 58, fundingStrength: 65, customerStickiness: 72, monetizationModel: 62, peRatio: null, pegRatio: null, evSales: 5.8, evEbitda: null },

    // ─── Digital Infrastructure (3) — MSTR moved out ─────────────────────
    { ticker: "RIOT", name: "Riot Platforms, Inc.", sector: "Digital Infrastructure", subSector: "Bitcoin Mining & Infrastructure", marketCap: "$8.5B", price: "$28.07", description: "Riot Platforms is one of the largest publicly-traded Bitcoin mining companies in North America. Diversifying into AI/HPC data center hosting.", website: "https://www.riotplatforms.com", revenueGrowth: 68, marketOpportunity: 58, competitiveMoat: 40, profitabilityPath: 42, valuation: 55, executionCapabilities: 60, innovationCulture: 55, fundingStrength: 62, customerStickiness: 35, monetizationModel: 48, peRatio: null, pegRatio: null, evSales: 8.2, evEbitda: null },
    { ticker: "MARA", name: "MARA Holdings, Inc.", sector: "Digital Infrastructure", subSector: "Bitcoin Mining & Digital Assets", marketCap: "$5.5B", price: "$14.50", description: "MARA (Marathon Digital) is the largest publicly-traded Bitcoin miner by hash rate. Holds 25K+ BTC on balance sheet.", website: "https://www.mara.com", revenueGrowth: 65, marketOpportunity: 55, competitiveMoat: 38, profitabilityPath: 40, valuation: 60, executionCapabilities: 58, innovationCulture: 52, fundingStrength: 60, customerStickiness: 32, monetizationModel: 45, peRatio: null, pegRatio: null, evSales: 7.0, evEbitda: null },
    { ticker: "IREN", name: "IREN Ltd.", sector: "Digital Infrastructure", subSector: "Bitcoin Mining & AI Compute", marketCap: "$2.5B", price: "$59.96", description: "IREN is a Bitcoin mining company pivoting to AI/HPC data centers. Operates 500MW+ facilities with plans to scale to 2GW.", website: "https://www.iren.com", revenueGrowth: 75, marketOpportunity: 72, competitiveMoat: 42, profitabilityPath: 48, valuation: 58, executionCapabilities: 62, innovationCulture: 68, fundingStrength: 55, customerStickiness: 38, monetizationModel: 52, peRatio: null, pegRatio: null, evSales: 6.5, evEbitda: null },
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

    // Auto-update prices every 24 hours in the background
    // Check if any stock's updatedAt is older than 24 hours
    const stocks = await getDb().stock.findMany({
      orderBy: { fiveXScore: 'desc' },
    });

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const needsUpdate = stocks.some(s => s.updatedAt < oneDayAgo);

    if (needsUpdate) {
      // Fire-and-forget price update in the background
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/stocks/update-prices`, {
        method: 'POST',
      }).catch(() => {
        // Silently ignore — prices will update next time
      });
    }

    const weights = await getDb().factorWeight.findFirst();

    return NextResponse.json({ stocks, weights });
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return NextResponse.json({ error: 'Failed to fetch stocks' }, { status: 500 });
  }
}
