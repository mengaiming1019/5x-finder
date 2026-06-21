'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Search, Brain, BarChart3, Target, ShieldCheck,
  DollarSign, Eye, Sparkles, Globe, ChevronUp, ChevronDown,
  Settings2, Loader2, Star, CheckCircle2, Flame, Zap, RefreshCw,
  Rocket, Lightbulb, Wallet, Users, Layers,
} from 'lucide-react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Stock {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  subSector: string;
  marketCap: string;
  price: string;
  description: string;
  website: string | null;
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
  aiAnalysis: string | null;
  lastAnalyzed: string | null;
  latestNews: string | null;
}

interface FactorWeights {
  id: string;
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
}

interface NewsItem { title: string; snippet: string; url: string; date: string; source: string; }

type SortField = keyof Pick<Stock,
  'fiveXScore' | 'revenueGrowth' | 'marketOpportunity' | 'competitiveMoat' |
  'profitabilityPath' | 'valuation' | 'executionCapabilities' | 'innovationCulture' |
  'fundingStrength' | 'customerStickiness' | 'monetizationModel' | 'name' | 'ticker'
>;
type SortDir = 'asc' | 'desc';

// ─── Factor Config ───────────────────────────────────────────────────────────

const QUANT_FACTORS = [
  { key: 'revenueGrowth' as const, label: 'Revenue Growth', icon: TrendingUp, color: '#10b981', desc: 'Revenue growth momentum & trajectory' },
  { key: 'marketOpportunity' as const, label: 'Market Opportunity', icon: Globe, color: '#3b82f6', desc: 'TAM/SAM size & penetration potential' },
  { key: 'competitiveMoat' as const, label: 'Competitive Moat', icon: ShieldCheck, color: '#8b5cf6', desc: 'Durability of competitive advantage' },
  { key: 'profitabilityPath' as const, label: 'Profitability Path', icon: DollarSign, color: '#f59e0b', desc: 'Clarity of path to profitability' },
  { key: 'valuation' as const, label: 'Valuation', icon: Target, color: '#ef4444', desc: 'Entry point attractiveness' },
];

const QUAL_FACTORS = [
  { key: 'executionCapabilities' as const, label: 'Execution Capabilities', icon: Rocket, color: '#e11d48', desc: 'Can the leadership team deliver? Track record, strategic clarity, and operational discipline' },
  { key: 'innovationCulture' as const, label: 'Innovation Culture', icon: Lightbulb, color: '#7c3aed', desc: 'Does the company foster the innovation needed for hypergrowth? R&D velocity, talent density, product iteration speed' },
  { key: 'fundingStrength' as const, label: 'Funding Strength', icon: Wallet, color: '#0ea5e9', desc: 'Financial resources & capital allocation skills. Cash runway, access to capital, and discipline in spending' },
  { key: 'customerStickiness' as const, label: 'Customer Stickiness', icon: Users, color: '#059669', desc: 'Depth of customer relationship. Ecosystem lock-in, switching costs, NPS, and retention metrics' },
  { key: 'monetizationModel' as const, label: 'Monetization Model', icon: Layers, color: '#d97706', desc: 'Scalability & defensibility of business model. Unit economics improvement, pricing power, and revenue diversification' },
];

const ALL_FACTORS = [...QUANT_FACTORS, ...QUAL_FACTORS];

const SECTOR_COLORS: Record<string, string> = {
  'Payments': '#3b82f6', 'Lending': '#10b981', 'Digital Banking': '#8b5cf6',
  'Insurtech': '#f59e0b', 'Commerce': '#ef4444', 'Crypto': '#06b6d4',
  'Trading': '#ec4899', 'Enterprise AI': '#f97316', 'Automation': '#14b8a6',
  'Commerce & Fintech': '#6366f1', 'Fintech SaaS': '#a855f7',
  'Digital Infrastructure': '#78716c',
};

const DEFAULT_WEIGHTS_LOCAL: Record<string, number> = {
  revenueGrowth: 15, marketOpportunity: 15, competitiveMoat: 15, profitabilityPath: 10, valuation: 10,
  executionCapabilities: 10, innovationCulture: 8, fundingStrength: 7, customerStickiness: 5, monetizationModel: 5,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getScoreColor(s: number) { return s >= 75 ? 'text-emerald-600' : s >= 60 ? 'text-amber-600' : s >= 45 ? 'text-orange-600' : 'text-red-600'; }
function getScoreBg(s: number) { return s >= 75 ? 'bg-emerald-50 border-emerald-200' : s >= 60 ? 'bg-amber-50 border-amber-200' : s >= 45 ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'; }
function getScoreBadge(s: number): 'default' | 'secondary' | 'destructive' | 'outline' { return s >= 75 ? 'default' : s >= 60 ? 'secondary' : 'destructive'; }

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function StockPickerPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [weights, setWeights] = useState<FactorWeights | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [newsLoading, setNewsLoading] = useState(false);
  const [weightsOpen, setWeightsOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('fiveXScore');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [localWeights, setLocalWeights] = useState<Record<string, number>>({ ...DEFAULT_WEIGHTS_LOCAL });

  const fetchStocks = useCallback(async () => {
    // Try up to 3 times with increasing delay
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise(r => setTimeout(r, 1500 * attempt));
        }
        const res = await fetch('/api/stocks');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setStocks(data.stocks || []);
        if (data.weights) {
          setWeights(data.weights);
          const lw: Record<string, number> = {};
          for (const f of ALL_FACTORS) { lw[f.key] = Math.round((data.weights as Record<string, number>)[f.key] * 100); }
          setLocalWeights(lw);
        }
        setLoading(false);
        return; // success
      } catch (err) {
        console.error(`Fetch attempt ${attempt + 1} failed:`, err);
        if (attempt === 2) {
          setLoading(false);
          toast.error('Failed to load stock data. Please refresh.');
        }
      }
    }
  }, []);

  useEffect(() => { fetchStocks(); }, [fetchStocks]);

  const handleStockClick = (stock: Stock) => { setSelectedStock(stock); setDetailOpen(true); };

  const handleAnalyze = async (ticker: string) => {
    setAnalyzeLoading(true);
    try {
      const res = await fetch(`/api/stocks/${ticker}/analyze`, { method: 'POST' });
      const data = await res.json();
      if (data.analysis) {
        toast.success(`AI analysis complete for ${ticker}`);
        await fetchStocks();
        const updated = stocks.find(s => s.ticker === ticker);
        if (updated) setSelectedStock({ ...updated, aiAnalysis: data.analysis, lastAnalyzed: new Date().toISOString() });
      } else { toast.error(data.error || 'Analysis failed'); }
    } catch { toast.error('Failed to run AI analysis'); }
    finally { setAnalyzeLoading(false); }
  };

  const handleFetchNews = async (ticker: string) => {
    setNewsLoading(true);
    try {
      const res = await fetch(`/api/stocks/${ticker}/news`, { method: 'POST' });
      const data = await res.json();
      if (data.news) {
        toast.success(`Latest news loaded for ${ticker}`);
        await fetchStocks();
        const updated = stocks.find(s => s.ticker === ticker);
        if (updated) setSelectedStock({ ...updated, latestNews: JSON.stringify(data.news) });
      } else { toast.error(data.error || 'News fetch failed'); }
    } catch { toast.error('Failed to fetch news'); }
    finally { setNewsLoading(false); }
  };

  const handleSaveWeights = async () => {
    const total = Object.values(localWeights).reduce((a, b) => a + b, 0);
    if (Math.abs(total - 100) > 1) { toast.error(`Weights must sum to 100%. Currently: ${total}%`); return; }
    try {
      const body: Record<string, number> = {};
      for (const f of ALL_FACTORS) { body[f.key] = localWeights[f.key] / 100; }
      const res = await fetch('/api/weights', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.weights) { toast.success('Factor weights updated! Scores recalculated.'); setWeightsOpen(false); await fetchStocks(); }
      else { toast.error(data.error || 'Failed to update weights'); }
    } catch { toast.error('Failed to update weights'); }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(p => p === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };
  const SortIcon = ({ field }: { field: SortField }) => sortField !== field ? null : sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;

  const filteredStocks = stocks
    .filter(s => {
      const q = searchQuery.toLowerCase();
      const ms = !q || s.name.toLowerCase().includes(q) || s.ticker.toLowerCase().includes(q) || s.subSector.toLowerCase().includes(q);
      return ms && (sectorFilter === 'all' || s.sector === sectorFilter);
    })
    .sort((a, b) => {
      const aV = a[sortField], bV = b[sortField];
      if (typeof aV === 'string' && typeof bV === 'string') return sortDir === 'asc' ? aV.localeCompare(bV) : bV.localeCompare(aV);
      return sortDir === 'asc' ? (aV as number) - (bV as number) : (bV as number) - (aV as number);
    });

  const topPicks = [...stocks].sort((a, b) => b.fiveXScore - a.fiveXScore).slice(0, 3);
  const sectors = [...new Set(stocks.map(s => s.sector))];
  const sectorData = sectors.map(sector => ({ name: sector, value: stocks.filter(s => s.sector === sector).length, color: SECTOR_COLORS[sector] || '#94a3b8' }));
  const getRadarData = (stock: Stock) => ALL_FACTORS.map(f => ({ factor: f.label.length > 14 ? f.label.slice(0, 12) + '…' : f.label, value: stock[f.key], fullMark: 100 }));
  const quantAvg = QUANT_FACTORS.map(f => ({ factor: f.label, value: Math.round(stocks.reduce((s, st) => s + st[f.key], 0) / stocks.length), color: f.color }));
  const qualAvg = QUAL_FACTORS.map(f => ({ factor: f.label, value: Math.round(stocks.reduce((s, st) => s + st[f.key], 0) / stocks.length), color: f.color }));
  const top10Data = [...stocks].sort((a, b) => b.fiveXScore - a.fiveXScore).slice(0, 10).map(s => ({ name: s.ticker, score: s.fiveXScore, fill: s.fiveXScore >= 75 ? '#10b981' : s.fiveXScore >= 60 ? '#f59e0b' : '#ef4444' }));
  const getNewsItems = (stock: Stock): NewsItem[] => { if (!stock.latestNews) return []; try { return JSON.parse(stock.latestNews); } catch { return []; } };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="flex items-center gap-3 mb-4"><Flame className="w-8 h-8 text-orange-500 animate-pulse" /><span className="text-2xl font-bold tracking-tight">5X Finder</span></div>
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span>Loading Fintech stock universe…</span></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center"><Flame className="w-5 h-5 text-white" /></div>
            <div><h1 className="text-lg font-bold tracking-tight leading-tight">5X Finder</h1><p className="text-xs text-muted-foreground leading-tight">AI-Powered Fintech Stock Picking · 10-Factor Model</p></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block"><Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" /><input type="text" placeholder="Search stocks…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-8 pr-3 py-1.5 text-sm bg-muted/50 border rounded-md w-52 focus:outline-none focus:ring-1 focus:ring-ring" /></div>
            <Button variant="outline" size="sm" onClick={() => setWeightsOpen(true)}><Settings2 className="w-4 h-4 mr-1.5" />Weights</Button>
            <Button variant="outline" size="sm" onClick={fetchStocks}><RefreshCw className="w-3.5 h-3.5" /></Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Mobile search */}
        <div className="sm:hidden"><div className="relative"><Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" /><input type="text" placeholder="Search stocks, sectors…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-8 pr-3 py-2 text-sm bg-muted/50 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-ring" /></div></div>

        {/* Top Picks */}
        <section>
          <div className="flex items-center gap-2 mb-3"><Star className="w-5 h-5 text-amber-500" /><h2 className="text-lg font-semibold">Top 5X Candidates</h2></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topPicks.map((stock, i) => (
              <motion.div key={stock.ticker} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className={`cursor-pointer hover:shadow-md transition-shadow border ${getScoreBg(stock.fiveXScore)}`} onClick={() => handleStockClick(stock)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div><div className="flex items-center gap-2"><Badge variant="outline" className="font-mono text-xs">#{i + 1}</Badge><span className="font-mono font-bold text-sm">{stock.ticker}</span></div><p className="text-sm font-medium mt-1">{stock.name}</p></div>
                      <div className={`text-2xl font-bold ${getScoreColor(stock.fiveXScore)}`}>{stock.fiveXScore}</div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3"><span>{stock.sector}</span><span>·</span><span>{stock.marketCap}</span><span>·</span><span className="font-mono">{stock.price}</span></div>
                    <div className="space-y-1.5">
                      {QUANT_FACTORS.slice(0, 3).map(f => (<div key={f.key} className="flex items-center gap-2"><span className="text-xs text-muted-foreground w-28 shrink-0">{f.label}</span><Progress value={stock[f.key]} className="h-1.5 flex-1" /><span className="text-xs font-mono w-6 text-right">{stock[f.key]}</span></div>))}
                    </div>
                    <Separator className="my-2" />
                    <div className="space-y-1.5">
                      {QUAL_FACTORS.slice(0, 2).map(f => (<div key={f.key} className="flex items-center gap-2"><span className="text-xs text-muted-foreground w-28 shrink-0">{f.label}</span><Progress value={stock[f.key]} className="h-1.5 flex-1" /><span className="text-xs font-mono w-6 text-right">{stock[f.key]}</span></div>))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Charts Row */}
        <section><div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><BarChart3 className="w-4 h-4 text-muted-foreground" />5X Score Rankings (Top 10)</CardTitle></CardHeader>
            <CardContent className="pt-0"><ResponsiveContainer width="100%" height={260}><BarChart data={top10Data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'monospace' }} /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} /><Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} formatter={(v: number) => [`${v}`, '5X Score']} /><Bar dataKey="score" radius={[4, 4, 0, 0]}>{top10Data.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar></BarChart></ResponsiveContainer></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Eye className="w-4 h-4 text-muted-foreground" />Sector Distribution</CardTitle></CardHeader>
            <CardContent className="pt-0"><div className="flex items-center"><ResponsiveContainer width="60%" height={240}><PieChart><Pie data={sectorData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value">{sectorData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number, n: string) => [`${v} stocks`, n]} /></PieChart></ResponsiveContainer>
              <div className="space-y-2 flex-1">{sectorData.map(s => (<div key={s.name} className="flex items-center gap-2 text-xs"><div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} /><span className="text-muted-foreground truncate">{s.name}</span><span className="font-mono ml-auto">{s.value}</span></div>))}</div></div></CardContent></Card>
        </div></section>

        {/* Average Factor Scores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-500" />Quantitative Factors — Universe Avg</CardTitle><CardDescription className="text-xs">Across {stocks.length} Fintech stocks</CardDescription></CardHeader>
            <CardContent className="pt-0"><div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{quantAvg.map(f => { const cfg = QUANT_FACTORS.find(c => c.label === f.factor)!; const Icon = cfg.icon; return (<div key={f.factor} className="text-center space-y-1"><Icon className="w-5 h-5 mx-auto" style={{ color: f.color }} /><p className="text-[11px] text-muted-foreground">{f.factor}</p><p className={`text-lg font-bold ${getScoreColor(f.value)}`}>{f.value}</p><Progress value={f.value} className="h-1.5" /></div>); })}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Lightbulb className="w-4 h-4 text-violet-500" />Qualitative Factors — Universe Avg</CardTitle><CardDescription className="text-xs">Across {stocks.length} Fintech stocks</CardDescription></CardHeader>
            <CardContent className="pt-0"><div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{qualAvg.map(f => { const cfg = QUAL_FACTORS.find(c => c.label === f.factor)!; const Icon = cfg.icon; return (<div key={f.factor} className="text-center space-y-1"><Icon className="w-5 h-5 mx-auto" style={{ color: f.color }} /><p className="text-[11px] text-muted-foreground">{f.factor}</p><p className={`text-lg font-bold ${getScoreColor(f.value)}`}>{f.value}</p><Progress value={f.value} className="h-1.5" /></div>); })}</div></CardContent></Card>
        </div>

        {/* Sector Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">Sector:</span>
          <button onClick={() => setSectorFilter('all')} className={`px-3 py-1 text-xs rounded-full border transition-colors ${sectorFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 hover:bg-muted'}`}>All ({stocks.length})</button>
          {sectors.map(sector => (<button key={sector} onClick={() => setSectorFilter(sector)} className={`px-3 py-1 text-xs rounded-full border transition-colors ${sectorFilter === sector ? 'bg-primary text-primary-foreground' : 'bg-muted/50 hover:bg-muted'}`}>{sector} ({stocks.filter(s => s.sector === sector).length})</button>))}
        </div>

        {/* Stock Rankings Table */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Zap className="w-4 h-4 text-orange-500" />Stock Rankings</CardTitle><CardDescription className="text-xs mt-1">{filteredStocks.length} stocks · Click any row for detailed analysis</CardDescription></CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort('ticker')}><div className="flex items-center gap-1">Ticker <SortIcon field="ticker" /></div></th>
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground hidden sm:table-cell" onClick={() => handleSort('name')}><div className="flex items-center gap-1">Name <SortIcon field="name" /></div></th>
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground hidden md:table-cell">Sector</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground hidden lg:table-cell">Mkt Cap</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground hidden lg:table-cell">Price</th>
                  {QUANT_FACTORS.map(f => (<th key={f.key} className="text-right py-2 px-1 font-medium text-muted-foreground cursor-pointer hover:text-foreground hidden xl:table-cell" onClick={() => handleSort(f.key)}><div className="flex items-center justify-end gap-0.5"><f.icon className="w-3 h-3" style={{ color: f.color }} /><span className="text-[10px]">{f.label.split(' ')[0].slice(0, 5)}</span><SortIcon field={f.key} /></div></th>))}
                  {QUAL_FACTORS.map(f => (<th key={f.key} className="text-right py-2 px-1 font-medium text-muted-foreground cursor-pointer hover:text-foreground hidden 2xl:table-cell" onClick={() => handleSort(f.key)}><div className="flex items-center justify-end gap-0.5"><f.icon className="w-3 h-3" style={{ color: f.color }} /><span className="text-[10px]">{f.label.split(' ')[0].slice(0, 5)}</span><SortIcon field={f.key} /></div></th>))}
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort('fiveXScore')}><div className="flex items-center justify-end gap-1"><Flame className="w-3.5 h-3.5 text-orange-500" />5X<SortIcon field="fiveXScore" /></div></th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">AI</th>
                </tr></thead>
                <tbody>{filteredStocks.map((stock, i) => (
                  <motion.tr key={stock.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => handleStockClick(stock)}>
                    <td className="py-2.5 px-2"><span className="font-mono font-semibold text-xs">{stock.ticker}</span></td>
                    <td className="py-2.5 px-2 hidden sm:table-cell"><span className="text-xs">{stock.name}</span></td>
                    <td className="py-2.5 px-2 hidden md:table-cell"><Badge variant="outline" className="text-[10px] px-1.5 py-0">{stock.sector}</Badge></td>
                    <td className="py-2.5 px-2 text-right text-xs font-mono hidden lg:table-cell">{stock.marketCap}</td>
                    <td className="py-2.5 px-2 text-right text-xs font-mono hidden lg:table-cell">{stock.price}</td>
                    {QUANT_FACTORS.map(f => (<td key={f.key} className="py-2.5 px-1 text-right hidden xl:table-cell"><span className={`text-[11px] font-mono ${getScoreColor(stock[f.key])}`}>{stock[f.key]}</span></td>))}
                    {QUAL_FACTORS.map(f => (<td key={f.key} className="py-2.5 px-1 text-right hidden 2xl:table-cell"><span className={`text-[11px] font-mono ${getScoreColor(stock[f.key])}`}>{stock[f.key]}</span></td>))}
                    <td className="py-2.5 px-2 text-right"><span className={`font-bold text-sm ${getScoreColor(stock.fiveXScore)}`}>{stock.fiveXScore}</span></td>
                    <td className="py-2.5 px-2 text-center">{stock.aiAnalysis ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 inline" /> : <span className="text-xs text-muted-foreground">—</span>}</td>
                  </motion.tr>
                ))}</tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Methodology */}
        <Card className="border-dashed">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Brain className="w-4 h-4 text-muted-foreground" />About the 5X Finder Model — 10-Factor Framework</CardTitle></CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground space-y-3">
            <p><strong>5X Finder</strong> identifies Fintech stocks with the highest probability of achieving a <strong>5x return within 2 years</strong> using 5 quantitative + 5 qualitative factors, powered by AI analysis.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><p className="font-semibold text-foreground mb-2">📊 Quantitative Factors</p><div className="space-y-2">{QUANT_FACTORS.map(f => (<div key={f.key} className="flex items-start gap-2"><f.icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: f.color }} /><div><p className="font-medium text-foreground">{f.label}</p><p className="text-[11px]">{f.desc}</p></div></div>))}</div></div>
              <div><p className="font-semibold text-foreground mb-2">🧠 Qualitative Factors</p><div className="space-y-2">{QUAL_FACTORS.map(f => (<div key={f.key} className="flex items-start gap-2"><f.icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: f.color }} /><div><p className="font-medium text-foreground">{f.label}</p><p className="text-[11px]">{f.desc}</p></div></div>))}</div></div>
            </div>
            <p className="mt-2">The qualitative factors capture <strong>execution risk, innovation velocity, capital efficiency, customer loyalty, and business model quality</strong> that pure quantitative models miss. Stock prices sourced via live web search.</p>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-card/50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2"><Flame className="w-4 h-4 text-orange-500" /><span className="font-medium">5X Finder</span><span>· 10-Factor AI-Powered Fintech Stock Picking</span></div>
          <span>For informational purposes only. Not financial advice.</span>
        </div>
      </footer>

      {/* Stock Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          {selectedStock && (<>
            <DialogHeader className="px-6 pt-6 pb-2">
              <DialogDescription className="sr-only">{selectedStock.name} detailed analysis and factor scores</DialogDescription>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getScoreBg(selectedStock.fiveXScore)}`}><span className={`text-xl font-bold ${getScoreColor(selectedStock.fiveXScore)}`}>{selectedStock.fiveXScore}</span></div>
                  <div><DialogTitle className="flex items-center gap-2"><span className="font-mono">{selectedStock.ticker}</span><Badge variant={getScoreBadge(selectedStock.fiveXScore)}>{selectedStock.fiveXScore >= 75 ? 'High Potential' : selectedStock.fiveXScore >= 60 ? 'Moderate' : 'Speculative'}</Badge></DialogTitle><p className="text-sm text-muted-foreground">{selectedStock.name}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleFetchNews(selectedStock.ticker)} disabled={newsLoading}>{newsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Globe className="w-3.5 h-3.5 mr-1" />}News</Button>
                  <Button size="sm" onClick={() => handleAnalyze(selectedStock.ticker)} disabled={analyzeLoading}>{analyzeLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Sparkles className="w-3.5 h-3.5 mr-1" />}AI Analyze</Button>
                </div>
              </div>
            </DialogHeader>
            <ScrollArea className="flex-1 px-6"><div className="space-y-4 pb-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-2 rounded-lg bg-muted/50"><p className="text-[11px] text-muted-foreground">Sector</p><p className="text-sm font-medium">{selectedStock.sector}</p></div>
                <div className="text-center p-2 rounded-lg bg-muted/50"><p className="text-[11px] text-muted-foreground">Market Cap</p><p className="text-sm font-mono font-medium">{selectedStock.marketCap}</p></div>
                <div className="text-center p-2 rounded-lg bg-muted/50"><p className="text-[11px] text-muted-foreground">Price</p><p className="text-sm font-mono font-medium">{selectedStock.price}</p></div>
                <div className="text-center p-2 rounded-lg bg-muted/50"><p className="text-[11px] text-muted-foreground">Last Analyzed</p><p className="text-sm font-medium">{selectedStock.lastAnalyzed ? new Date(selectedStock.lastAnalyzed).toLocaleDateString() : 'Never'}</p></div>
              </div>
              <p className="text-sm text-muted-foreground">{selectedStock.description}</p>
              <Tabs defaultValue="factors" className="w-full">
                <TabsList className="w-full justify-start"><TabsTrigger value="factors" className="text-xs">Radar</TabsTrigger><TabsTrigger value="breakdown" className="text-xs">Breakdown</TabsTrigger><TabsTrigger value="analysis" className="text-xs">AI Analysis {selectedStock.aiAnalysis ? '✓' : ''}</TabsTrigger><TabsTrigger value="news" className="text-xs">News</TabsTrigger></TabsList>
                <TabsContent value="factors" className="mt-3"><ResponsiveContainer width="100%" height={350}><RadarChart data={getRadarData(selectedStock)}><PolarGrid stroke="#e2e8f0" /><PolarAngleAxis dataKey="factor" tick={{ fontSize: 10 }} /><PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} /><Radar name={selectedStock.ticker} dataKey="value" stroke="#f97316" fill="#f97316" fillOpacity={0.2} strokeWidth={2} /></RadarChart></ResponsiveContainer></TabsContent>
                <TabsContent value="breakdown" className="mt-3 space-y-4">
                  <div><p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5 text-blue-500" />QUANTITATIVE FACTORS</p><div className="space-y-3">{QUANT_FACTORS.map(f => { const val = selectedStock[f.key]; const w = weights ? ((weights as Record<string, number>)[f.key] * 100).toFixed(0) : '—'; const Icon = f.icon; return (<div key={f.key} className="space-y-1"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Icon className="w-4 h-4" style={{ color: f.color }} /><span className="text-sm font-medium">{f.label}</span><span className="text-[11px] text-muted-foreground">(W: {w}%)</span></div><span className={`font-mono font-bold ${getScoreColor(val)}`}>{val}/100</span></div><Progress value={val} className="h-2" /><p className="text-[11px] text-muted-foreground">{f.desc}</p></div>); })}</div></div>
                  <Separator />
                  <div><p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><Lightbulb className="w-3.5 h-3.5 text-violet-500" />QUALITATIVE FACTORS</p><div className="space-y-3">{QUAL_FACTORS.map(f => { const val = selectedStock[f.key]; const w = weights ? ((weights as Record<string, number>)[f.key] * 100).toFixed(0) : '—'; const Icon = f.icon; return (<div key={f.key} className="space-y-1"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Icon className="w-4 h-4" style={{ color: f.color }} /><span className="text-sm font-medium">{f.label}</span><span className="text-[11px] text-muted-foreground">(W: {w}%)</span></div><span className={`font-mono font-bold ${getScoreColor(val)}`}>{val}/100</span></div><Progress value={val} className="h-2" /><p className="text-[11px] text-muted-foreground">{f.desc}</p></div>); })}</div></div>
                  <Separator /><div className="flex items-center justify-between pt-1"><span className="font-semibold">Composite 5X Score</span><span className={`text-xl font-bold ${getScoreColor(selectedStock.fiveXScore)}`}>{selectedStock.fiveXScore}</span></div>
                </TabsContent>
                <TabsContent value="analysis" className="mt-3">{selectedStock.aiAnalysis ? (<div className="prose prose-sm max-w-none"><ReactMarkdown>{selectedStock.aiAnalysis}</ReactMarkdown></div>) : (<div className="flex flex-col items-center justify-center py-12 text-center"><Brain className="w-10 h-10 text-muted-foreground mb-3" /><p className="text-sm text-muted-foreground mb-3">No AI analysis yet. Run the analysis to get a detailed 5X thesis.</p><Button onClick={() => handleAnalyze(selectedStock.ticker)} disabled={analyzeLoading}>{analyzeLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}Run AI Analysis</Button></div>)}</TabsContent>
                <TabsContent value="news" className="mt-3">{getNewsItems(selectedStock).length > 0 ? (<div className="space-y-3">{getNewsItems(selectedStock).map((item, i) => (<div key={i} className="p-3 rounded-lg bg-muted/30 space-y-1"><a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline flex items-center gap-1">{item.title}<Zap className="w-3 h-3 shrink-0" /></a><p className="text-xs text-muted-foreground line-clamp-2">{item.snippet}</p><div className="flex items-center gap-2 text-[11px] text-muted-foreground"><span>{item.source}</span><span>·</span><span>{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</span></div></div>))}</div>) : (<div className="flex flex-col items-center justify-center py-12 text-center"><Globe className="w-10 h-10 text-muted-foreground mb-3" /><p className="text-sm text-muted-foreground mb-3">No news yet for {selectedStock.ticker}.</p><Button variant="outline" onClick={() => handleFetchNews(selectedStock.ticker)} disabled={newsLoading}>{newsLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />}Fetch News</Button></div>)}</TabsContent>
              </Tabs>
            </div></ScrollArea>
          </>)}
        </DialogContent>
      </Dialog>

      {/* Weights Dialog */}
      <Dialog open={weightsOpen} onOpenChange={setWeightsOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Settings2 className="w-5 h-5" />Adjust Factor Weights</DialogTitle><DialogDescription className="sr-only">Customize factor weights</DialogDescription></DialogHeader>
          <ScrollArea className="flex-1 -mx-6 px-6"><div className="space-y-4 pb-2">
            <p className="text-xs text-muted-foreground">Customize the weight of each factor. Must sum to 100%.</p>
            <div><p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5 text-blue-500" />QUANTITATIVE</p><div className="space-y-3">{QUANT_FACTORS.map(f => (<div key={f.key} className="space-y-1.5"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><f.icon className="w-4 h-4" style={{ color: f.color }} /><span className="text-sm">{f.label}</span></div><span className="font-mono text-sm font-medium">{localWeights[f.key] ?? 0}%</span></div><Slider value={[localWeights[f.key] ?? 0]} min={0} max={30} step={1} onValueChange={([v]) => setLocalWeights(prev => ({ ...prev, [f.key]: v }))} /></div>))}</div></div>
            <Separator />
            <div><p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><Lightbulb className="w-3.5 h-3.5 text-violet-500" />QUALITATIVE</p><div className="space-y-3">{QUAL_FACTORS.map(f => (<div key={f.key} className="space-y-1.5"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><f.icon className="w-4 h-4" style={{ color: f.color }} /><span className="text-sm">{f.label}</span></div><span className="font-mono text-sm font-medium">{localWeights[f.key] ?? 0}%</span></div><Slider value={[localWeights[f.key] ?? 0]} min={0} max={30} step={1} onValueChange={([v]) => setLocalWeights(prev => ({ ...prev, [f.key]: v }))} /></div>))}</div></div>
            <Separator />
            <div className="flex items-center justify-between"><span className="text-sm font-medium">Total</span><span className={`font-mono text-sm font-bold ${Math.abs(Object.values(localWeights).reduce((a, b) => a + b, 0) - 100) < 2 ? 'text-emerald-600' : 'text-red-600'}`}>{Object.values(localWeights).reduce((a, b) => a + b, 0)}%</span></div>
            <div className="flex items-center gap-2"><Button variant="outline" className="flex-1" onClick={() => setLocalWeights({ ...DEFAULT_WEIGHTS_LOCAL })}>Reset Default</Button><Button className="flex-1" onClick={handleSaveWeights}>Save & Recalculate</Button></div>
          </div></ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
