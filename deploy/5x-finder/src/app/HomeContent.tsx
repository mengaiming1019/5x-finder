'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Search, Brain, BarChart3, Target, ShieldCheck,
  DollarSign, Eye, Sparkles, Globe, ChevronUp, ChevronDown,
  Settings2, Loader2, Star, CheckCircle2, Flame, Zap, RefreshCw,
  Rocket, Lightbulb, Wallet, Users, Layers, Languages,
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
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { t as translate, Lang, LANGUAGES } from '@/lib/i18n';

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
  peRatio: number | null;
  pegRatio: number | null;
  evSales: number | null;
  evEbitda: number | null;
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

const QUANT_FACTOR_KEYS = [
  'revenueGrowth', 'marketOpportunity', 'competitiveMoat', 'profitabilityPath', 'valuation',
] as const;
const QUAL_FACTOR_KEYS = [
  'executionCapabilities', 'innovationCulture', 'fundingStrength', 'customerStickiness', 'monetizationModel',
] as const;

const QUANT_FACTORS = [
  { key: 'revenueGrowth' as const, labelKey: 'factor.revenueGrowth', icon: TrendingUp, color: '#10b981', descKey: 'factor.revenueGrowth.desc' },
  { key: 'marketOpportunity' as const, labelKey: 'factor.marketOpportunity', icon: Globe, color: '#3b82f6', descKey: 'factor.marketOpportunity.desc' },
  { key: 'competitiveMoat' as const, labelKey: 'factor.competitiveMoat', icon: ShieldCheck, color: '#8b5cf6', descKey: 'factor.competitiveMoat.desc' },
  { key: 'profitabilityPath' as const, labelKey: 'factor.profitabilityPath', icon: DollarSign, color: '#f59e0b', descKey: 'factor.profitabilityPath.desc' },
  { key: 'valuation' as const, labelKey: 'factor.valuation', icon: Target, color: '#ef4444', descKey: 'factor.valuation.desc' },
];

const QUAL_FACTORS = [
  { key: 'executionCapabilities' as const, labelKey: 'factor.executionCapabilities', icon: Rocket, color: '#e11d48', descKey: 'factor.executionCapabilities.desc' },
  { key: 'innovationCulture' as const, labelKey: 'factor.innovationCulture', icon: Lightbulb, color: '#7c3aed', descKey: 'factor.innovationCulture.desc' },
  { key: 'fundingStrength' as const, labelKey: 'factor.fundingStrength', icon: Wallet, color: '#0ea5e9', descKey: 'factor.fundingStrength.desc' },
  { key: 'customerStickiness' as const, labelKey: 'factor.customerStickiness', icon: Users, color: '#059669', descKey: 'factor.customerStickiness.desc' },
  { key: 'monetizationModel' as const, labelKey: 'factor.monetizationModel', icon: Layers, color: '#d97706', descKey: 'factor.monetizationModel.desc' },
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

function getMedian(values: (number | null)[]): number | null {
  const filtered = values.filter((v): v is number => v !== null);
  if (filtered.length === 0) return null;
  filtered.sort((a, b) => a - b);
  const mid = Math.floor(filtered.length / 2);
  return filtered.length % 2 !== 0 ? filtered[mid] : (filtered[mid - 1] + filtered[mid]) / 2;
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function StockPickerPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [weights, setWeights] = useState<FactorWeights | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
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
  const [lang, setLang] = useState<Lang>('en');

  // Translation helper bound to current language
  const t = useCallback((key: string, params?: Record<string, string | number>) => translate(lang, key, params), [lang]);

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    // Try up to 5 times with increasing delay
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise(r => setTimeout(r, 2000 * attempt));
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
        setFetchError(false);
        return; // success
      } catch (err) {
        console.error(`Fetch attempt ${attempt + 1} failed:`, err);
        if (attempt === 4) {
          setLoading(false);
          setFetchError(true);
        }
      }
    }
  }, []);

  useEffect(() => { fetchStocks(); }, [fetchStocks]);

  // Auto-retry every 8 seconds when fetch has failed
  useEffect(() => {
    if (!fetchError) return;
    const interval = setInterval(() => { fetchStocks(); }, 8000);
    return () => clearInterval(interval);
  }, [fetchError, fetchStocks]);

  const handleStockClick = (stock: Stock) => { setSelectedStock(stock); setDetailOpen(true); };

  const handleAnalyze = async (ticker: string) => {
    setAnalyzeLoading(true);
    try {
      const res = await fetch(`/api/stocks/${ticker}/analyze`, { method: 'POST' });
      const data = await res.json();
      if (data.analysis) {
        toast.success(t('toast.analysisComplete', { ticker }));
        await fetchStocks();
        const updated = stocks.find(s => s.ticker === ticker);
        if (updated) setSelectedStock({ ...updated, aiAnalysis: data.analysis, lastAnalyzed: new Date().toISOString() });
      } else { toast.error(data.error || t('toast.analysisFailed')); }
    } catch { toast.error(t('toast.analysisError')); }
    finally { setAnalyzeLoading(false); }
  };

  const handleFetchNews = async (ticker: string) => {
    setNewsLoading(true);
    try {
      const res = await fetch(`/api/stocks/${ticker}/news`, { method: 'POST' });
      const data = await res.json();
      if (data.news) {
        toast.success(t('toast.newsLoaded', { ticker }));
        await fetchStocks();
        const updated = stocks.find(s => s.ticker === ticker);
        if (updated) setSelectedStock({ ...updated, latestNews: JSON.stringify(data.news) });
      } else { toast.error(data.error || t('toast.newsFailed')); }
    } catch { toast.error(t('toast.newsError')); }
    finally { setNewsLoading(false); }
  };

  const handleSaveWeights = async () => {
    const total = Object.values(localWeights).reduce((a, b) => a + b, 0);
    if (Math.abs(total - 100) > 1) { toast.error(t('toast.weightsError', { n: total })); return; }
    try {
      const body: Record<string, number> = {};
      for (const f of ALL_FACTORS) { body[f.key] = localWeights[f.key] / 100; }
      const res = await fetch('/api/weights', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.weights) { toast.success(t('toast.weightsUpdated')); setWeightsOpen(false); await fetchStocks(); }
      else { toast.error(data.error || t('toast.weightsFailed')); }
    } catch { toast.error(t('toast.weightsFailed')); }
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
  const getRadarData = (stock: Stock) => ALL_FACTORS.map(f => ({ factor: t(f.labelKey).length > 14 ? t(f.labelKey).slice(0, 12) + '…' : t(f.labelKey), value: stock[f.key], fullMark: 100 }));
  const quantAvg = QUANT_FACTORS.map(f => ({ factor: t(f.labelKey), value: Math.round(stocks.reduce((s, st) => s + st[f.key], 0) / stocks.length), color: f.color }));
  const qualAvg = QUAL_FACTORS.map(f => ({ factor: t(f.labelKey), value: Math.round(stocks.reduce((s, st) => s + st[f.key], 0) / stocks.length), color: f.color }));
  const top10Data = [...stocks].sort((a, b) => b.fiveXScore - a.fiveXScore).slice(0, 10).map(s => ({ name: s.ticker, score: s.fiveXScore, fill: s.fiveXScore >= 75 ? '#10b981' : s.fiveXScore >= 60 ? '#f59e0b' : '#ef4444' }));
  const getNewsItems = (stock: Stock): NewsItem[] => { if (!stock.latestNews) return []; try { return JSON.parse(stock.latestNews); } catch { return []; } };

  // Compute sector medians for selected stock
  const sectorMedians = useMemo(() => {
    if (!selectedStock) return { peRatio: null, pegRatio: null, evSales: null, evEbitda: null } as Record<string, number | null>;
    const sectorStocks = stocks.filter(s => s.sector === selectedStock.sector);
    return {
      peRatio: getMedian(sectorStocks.map(s => s.peRatio)),
      pegRatio: getMedian(sectorStocks.map(s => s.pegRatio)),
      evSales: getMedian(sectorStocks.map(s => s.evSales)),
      evEbitda: getMedian(sectorStocks.map(s => s.evEbitda)),
    };
  }, [selectedStock, stocks]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="flex items-center gap-3 mb-4"><Flame className="w-8 h-8 text-orange-500 animate-pulse" /><span className="text-2xl font-bold tracking-tight">{t('loading.title')}</span></div>
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span>{t('loading.message')}</span></div>
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
            <div><h1 className="text-lg font-bold tracking-tight leading-tight">{t('app.title')}</h1><p className="text-xs text-muted-foreground leading-tight">{t('app.subtitle')}</p></div>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Languages className="w-4 h-4" />
                  <span className="hidden sm:inline">{LANGUAGES.find(l => l.code === lang)?.flag} {LANGUAGES.find(l => l.code === lang)?.label}</span>
                  <span className="sm:hidden">{LANGUAGES.find(l => l.code === lang)?.flag}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {LANGUAGES.map(l => (
                  <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)} className={lang === l.code ? 'bg-accent' : ''}>
                    <span className="mr-2">{l.flag}</span>{l.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="relative hidden sm:block"><Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" /><input type="text" placeholder={t('search.placeholder')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-8 pr-3 py-1.5 text-sm bg-muted/50 border rounded-md w-52 focus:outline-none focus:ring-1 focus:ring-ring" /></div>
            <Button variant="outline" size="sm" onClick={() => setWeightsOpen(true)}><Settings2 className="w-4 h-4 mr-1.5" />{t('btn.weights')}</Button>
            <Button variant="outline" size="sm" onClick={fetchStocks}><RefreshCw className="w-3.5 h-3.5" /></Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Error state with retry */}
        {fetchError && !loading && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-6 text-center space-y-3">
              <div className="flex justify-center"><Zap className="w-8 h-8 text-destructive" /></div>
              <h3 className="font-semibold text-lg">{t('error.title')}</h3>
              <p className="text-muted-foreground text-sm">{t('error.message')}</p>
              <Button onClick={fetchStocks} variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-2" />{t('error.retry')}</Button>
            </CardContent>
          </Card>
        )}
        {/* Loading state */}
        {loading && !fetchError && (
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              <h3 className="font-semibold text-lg">{t('loading.card.title')}</h3>
              <p className="text-muted-foreground text-sm">{t('loading.card.message')}</p>
            </CardContent>
          </Card>
        )}
        {!loading && !fetchError && stocks.length > 0 && (
        <>
        {/* Mobile search */}
        <div className="sm:hidden"><div className="relative"><Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" /><input type="text" placeholder={t('search.placeholder.mobile')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-8 pr-3 py-2 text-sm bg-muted/50 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-ring" /></div></div>

        {/* Top Picks */}
        <section>
          <div className="flex items-center gap-2 mb-3"><Star className="w-5 h-5 text-amber-500" /><h2 className="text-lg font-semibold">{t('topPicks.title')}</h2></div>
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
                      {QUANT_FACTORS.slice(0, 3).map(f => (<div key={f.key} className="flex items-center gap-2"><span className="text-xs text-muted-foreground w-28 shrink-0">{t(f.labelKey)}</span><Progress value={stock[f.key]} className="h-1.5 flex-1" /><span className="text-xs font-mono w-6 text-right">{stock[f.key]}</span></div>))}
                    </div>
                    <Separator className="my-2" />
                    <div className="space-y-1.5">
                      {QUAL_FACTORS.slice(0, 2).map(f => (<div key={f.key} className="flex items-center gap-2"><span className="text-xs text-muted-foreground w-28 shrink-0">{t(f.labelKey)}</span><Progress value={stock[f.key]} className="h-1.5 flex-1" /><span className="text-xs font-mono w-6 text-right">{stock[f.key]}</span></div>))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Charts Row */}
        <section><div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><BarChart3 className="w-4 h-4 text-muted-foreground" />{t('chart.rankings.title')}</CardTitle></CardHeader>
            <CardContent className="pt-0"><ResponsiveContainer width="100%" height={260}><BarChart data={top10Data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'monospace' }} /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} /><Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} formatter={(v: number) => [`${v}`, t('chart.score')]} /><Bar dataKey="score" radius={[4, 4, 0, 0]}>{top10Data.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar></BarChart></ResponsiveContainer></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Eye className="w-4 h-4 text-muted-foreground" />{t('chart.sector.title')}</CardTitle></CardHeader>
            <CardContent className="pt-0"><div className="flex items-center"><ResponsiveContainer width="60%" height={240}><PieChart><Pie data={sectorData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value">{sectorData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number, n: string) => [t('chart.stocks', { n: v }), n]} /></PieChart></ResponsiveContainer>
              <div className="space-y-2 flex-1">{sectorData.map(s => (<div key={s.name} className="flex items-center gap-2 text-xs"><div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} /><span className="text-muted-foreground truncate">{s.name}</span><span className="font-mono ml-auto">{s.value}</span></div>))}</div></div></CardContent></Card>
        </div></section>

        {/* Average Factor Scores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-500" />{t('chart.quant.title')}</CardTitle><CardDescription className="text-xs">{t('chart.across', { n: stocks.length })}</CardDescription></CardHeader>
            <CardContent className="pt-0"><div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{quantAvg.map(f => { const cfg = QUANT_FACTORS.find(c => c.key === QUANT_FACTORS.find(q => t(q.labelKey) === f.factor)?.key)!; const Icon = cfg?.icon || TrendingUp; return (<div key={f.factor} className="text-center space-y-1"><Icon className="w-5 h-5 mx-auto" style={{ color: f.color }} /><p className="text-[11px] text-muted-foreground">{f.factor}</p><p className={`text-lg font-bold ${getScoreColor(f.value)}`}>{f.value}</p><Progress value={f.value} className="h-1.5" /></div>); })}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Lightbulb className="w-4 h-4 text-violet-500" />{t('chart.qual.title')}</CardTitle><CardDescription className="text-xs">{t('chart.across', { n: stocks.length })}</CardDescription></CardHeader>
            <CardContent className="pt-0"><div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{qualAvg.map(f => { const cfg = QUAL_FACTORS.find(c => c.key === QUAL_FACTORS.find(q => t(q.labelKey) === f.factor)?.key)!; const Icon = cfg?.icon || Lightbulb; return (<div key={f.factor} className="text-center space-y-1"><Icon className="w-5 h-5 mx-auto" style={{ color: f.color }} /><p className="text-[11px] text-muted-foreground">{f.factor}</p><p className={`text-lg font-bold ${getScoreColor(f.value)}`}>{f.value}</p><Progress value={f.value} className="h-1.5" /></div>); })}</div></CardContent></Card>
        </div>

        {/* Sector Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">{t('filter.sector')}</span>
          <button onClick={() => setSectorFilter('all')} className={`px-3 py-1 text-xs rounded-full border transition-colors ${sectorFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 hover:bg-muted'}`}>{t('filter.all')} ({stocks.length})</button>
          {sectors.map(sector => (<button key={sector} onClick={() => setSectorFilter(sector)} className={`px-3 py-1 text-xs rounded-full border transition-colors ${sectorFilter === sector ? 'bg-primary text-primary-foreground' : 'bg-muted/50 hover:bg-muted'}`}>{sector} ({stocks.filter(s => s.sector === sector).length})</button>))}
        </div>

        {/* Stock Rankings Table */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Zap className="w-4 h-4 text-orange-500" />{t('table.title')}</CardTitle><CardDescription className="text-xs mt-1">{t('table.description', { n: filteredStocks.length })}</CardDescription></CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort('ticker')}><div className="flex items-center gap-1">{t('table.ticker')} <SortIcon field="ticker" /></div></th>
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground hidden sm:table-cell" onClick={() => handleSort('name')}><div className="flex items-center gap-1">{t('table.name')} <SortIcon field="name" /></div></th>
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground hidden md:table-cell">{t('table.sector')}</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground hidden lg:table-cell">{t('table.mktCap')}</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground hidden lg:table-cell">{t('table.price')}</th>
                  {QUANT_FACTORS.map(f => (<th key={f.key} className="text-right py-2 px-1 font-medium text-muted-foreground cursor-pointer hover:text-foreground hidden xl:table-cell" onClick={() => handleSort(f.key)}><div className="flex items-center justify-end gap-0.5"><f.icon className="w-3 h-3" style={{ color: f.color }} /><span className="text-[10px]">{t(f.labelKey).split(' ')[0].slice(0, 5)}</span><SortIcon field={f.key} /></div></th>))}
                  {QUAL_FACTORS.map(f => (<th key={f.key} className="text-right py-2 px-1 font-medium text-muted-foreground cursor-pointer hover:text-foreground hidden 2xl:table-cell" onClick={() => handleSort(f.key)}><div className="flex items-center justify-end gap-0.5"><f.icon className="w-3 h-3" style={{ color: f.color }} /><span className="text-[10px]">{t(f.labelKey).split(' ')[0].slice(0, 5)}</span><SortIcon field={f.key} /></div></th>))}
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort('fiveXScore')}><div className="flex items-center justify-end gap-1"><Flame className="w-3.5 h-3.5 text-orange-500" />5X<SortIcon field="fiveXScore" /></div></th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">{t('table.ai')}</th>
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
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Brain className="w-4 h-4 text-muted-foreground" />{t('methodology.title')}</CardTitle></CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground space-y-3">
            <p dangerouslySetInnerHTML={{ __html: t('methodology.intro') }} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><p className="font-semibold text-foreground mb-2">{t('methodology.quant.heading')}</p><div className="space-y-2">{QUANT_FACTORS.map(f => (<div key={f.key} className="flex items-start gap-2"><f.icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: f.color }} /><div><p className="font-medium text-foreground">{t(f.labelKey)}</p><p className="text-[11px]">{t(f.descKey)}</p></div></div>))}</div></div>
              <div><p className="font-semibold text-foreground mb-2">{t('methodology.qual.heading')}</p><div className="space-y-2">{QUAL_FACTORS.map(f => (<div key={f.key} className="flex items-start gap-2"><f.icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: f.color }} /><div><p className="font-medium text-foreground">{t(f.labelKey)}</p><p className="text-[11px]">{t(f.descKey)}</p></div></div>))}</div></div>
            </div>
            <p className="mt-2" dangerouslySetInnerHTML={{ __html: t('methodology.conclusion') }} />
          </CardContent>
        </Card>
        </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-card/50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2"><Flame className="w-4 h-4 text-orange-500" /><span className="font-medium">{t('footer.brand')}</span><span>{t('footer.tagline')}</span></div>
          <span>{t('footer.disclaimer')}</span>
        </div>
      </footer>

      {/* Stock Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          {selectedStock && (<>
            <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
              <DialogDescription className="sr-only">{t('detail.description', { ticker: selectedStock.ticker })}</DialogDescription>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getScoreBg(selectedStock.fiveXScore)}`}><span className={`text-xl font-bold ${getScoreColor(selectedStock.fiveXScore)}`}>{selectedStock.fiveXScore}</span></div>
                  <div><DialogTitle className="flex items-center gap-2"><span className="font-mono">{selectedStock.ticker}</span><Badge variant={getScoreBadge(selectedStock.fiveXScore)}>{selectedStock.fiveXScore >= 75 ? t('detail.highPotential') : selectedStock.fiveXScore >= 60 ? t('detail.moderate') : t('detail.speculative')}</Badge></DialogTitle><p className="text-sm text-muted-foreground">{selectedStock.name}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleFetchNews(selectedStock.ticker)} disabled={newsLoading}>{newsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Globe className="w-3.5 h-3.5 mr-1" />}{t('detail.btn.news')}</Button>
                  <Button size="sm" onClick={() => handleAnalyze(selectedStock.ticker)} disabled={analyzeLoading}>{analyzeLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Sparkles className="w-3.5 h-3.5 mr-1" />}{t('detail.btn.aiAnalyze')}</Button>
                </div>
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6"><div className="space-y-4 pb-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-2 rounded-lg bg-muted/50"><p className="text-[11px] text-muted-foreground">{t('detail.sector')}</p><p className="text-sm font-medium">{selectedStock.sector}</p></div>
                <div className="text-center p-2 rounded-lg bg-muted/50"><p className="text-[11px] text-muted-foreground">{t('detail.marketCap')}</p><p className="text-sm font-mono font-medium">{selectedStock.marketCap}</p></div>
                <div className="text-center p-2 rounded-lg bg-muted/50"><p className="text-[11px] text-muted-foreground">{t('detail.price')}</p><p className="text-sm font-mono font-medium">{selectedStock.price}</p></div>
                <div className="text-center p-2 rounded-lg bg-muted/50"><p className="text-[11px] text-muted-foreground">{t('detail.lastAnalyzed')}</p><p className="text-sm font-medium">{selectedStock.lastAnalyzed ? new Date(selectedStock.lastAnalyzed).toLocaleDateString() : t('detail.never')}</p></div>
              </div>

              {/* Company Profile */}
              <p className="text-sm text-muted-foreground">{selectedStock.description}</p>

              {/* Financial Metrics */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-emerald-500" />{t('metrics.title').toUpperCase()}</p>
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground text-xs">{t('metrics.title')}</th>
                        <th className="text-right py-2 px-3 font-medium text-muted-foreground text-xs">{selectedStock.ticker}</th>
                        <th className="text-right py-2 px-3 font-medium text-muted-foreground text-xs">{t('metrics.sectorMedian')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {([
                        { label: t('metrics.peRatio'), value: selectedStock.peRatio, median: sectorMedians.peRatio },
                        { label: t('metrics.pegRatio'), value: selectedStock.pegRatio, median: sectorMedians.pegRatio },
                        { label: t('metrics.evSales'), value: selectedStock.evSales, median: sectorMedians.evSales },
                        { label: t('metrics.evEbitda'), value: selectedStock.evEbitda, median: sectorMedians.evEbitda },
                      ] as { label: string; value: number | null; median: number | null }[]).map((row) => {
                        const isCheaper = row.value !== null && row.median !== null && row.value < row.median;
                        const isMoreExpensive = row.value !== null && row.median !== null && row.value > row.median;
                        return (
                          <tr key={row.label} className="border-t">
                            <td className="py-2 px-3 text-xs text-muted-foreground">{row.label}</td>
                            <td className={`py-2 px-3 text-right font-mono text-xs ${isCheaper ? 'text-emerald-600' : isMoreExpensive ? 'text-red-600' : ''}`}>
                              {row.value !== null ? row.value.toFixed(1) : t('metrics.na')}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-xs text-muted-foreground">
                              {row.median !== null ? row.median.toFixed(1) : t('metrics.na')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <Tabs defaultValue="factors" className="w-full">
                <TabsList className="w-full justify-start"><TabsTrigger value="factors" className="text-xs">{t('detail.tab.radar')}</TabsTrigger><TabsTrigger value="breakdown" className="text-xs">{t('detail.tab.breakdown')}</TabsTrigger><TabsTrigger value="analysis" className="text-xs">{t('detail.tab.analysis')} {selectedStock.aiAnalysis ? '✓' : ''}</TabsTrigger><TabsTrigger value="news" className="text-xs">{t('detail.tab.news')}</TabsTrigger></TabsList>
                <TabsContent value="factors" className="mt-3"><ResponsiveContainer width="100%" height={350}><RadarChart data={getRadarData(selectedStock)}><PolarGrid stroke="#e2e8f0" /><PolarAngleAxis dataKey="factor" tick={{ fontSize: 10 }} /><PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} /><Radar name={selectedStock.ticker} dataKey="value" stroke="#f97316" fill="#f97316" fillOpacity={0.2} strokeWidth={2} /></RadarChart></ResponsiveContainer></TabsContent>
                <TabsContent value="breakdown" className="mt-3 space-y-4">
                  <div><p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5 text-blue-500" />{t('detail.quant.heading')}</p><div className="space-y-3">{QUANT_FACTORS.map(f => { const val = selectedStock[f.key]; const w = weights ? ((weights as Record<string, number>)[f.key] * 100).toFixed(0) : '—'; const Icon = f.icon; return (<div key={f.key} className="space-y-1"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Icon className="w-4 h-4" style={{ color: f.color }} /><span className="text-sm font-medium">{t(f.labelKey)}</span><span className="text-[11px] text-muted-foreground">({t('detail.weight')}: {w}%)</span></div><span className={`font-mono font-bold ${getScoreColor(val)}`}>{val}/100</span></div><Progress value={val} className="h-2" /><p className="text-[11px] text-muted-foreground">{t(f.descKey)}</p></div>); })}</div></div>
                  <Separator />
                  <div><p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><Lightbulb className="w-3.5 h-3.5 text-violet-500" />{t('detail.qual.heading')}</p><div className="space-y-3">{QUAL_FACTORS.map(f => { const val = selectedStock[f.key]; const w = weights ? ((weights as Record<string, number>)[f.key] * 100).toFixed(0) : '—'; const Icon = f.icon; return (<div key={f.key} className="space-y-1"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Icon className="w-4 h-4" style={{ color: f.color }} /><span className="text-sm font-medium">{t(f.labelKey)}</span><span className="text-[11px] text-muted-foreground">({t('detail.weight')}: {w}%)</span></div><span className={`font-mono font-bold ${getScoreColor(val)}`}>{val}/100</span></div><Progress value={val} className="h-2" /><p className="text-[11px] text-muted-foreground">{t(f.descKey)}</p></div>); })}</div></div>
                  <Separator /><div className="flex items-center justify-between pt-1"><span className="font-semibold">{t('detail.compositeScore')}</span><span className={`text-xl font-bold ${getScoreColor(selectedStock.fiveXScore)}`}>{selectedStock.fiveXScore}</span></div>
                </TabsContent>
                <TabsContent value="analysis" className="mt-3">{selectedStock.aiAnalysis ? (<div className="prose prose-sm max-w-none"><ReactMarkdown>{selectedStock.aiAnalysis}</ReactMarkdown></div>) : (<div className="flex flex-col items-center justify-center py-12 text-center"><Brain className="w-10 h-10 text-muted-foreground mb-3" /><p className="text-sm text-muted-foreground mb-3">{t('detail.noAnalysis')}</p><Button onClick={() => handleAnalyze(selectedStock.ticker)} disabled={analyzeLoading}>{analyzeLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}{t('detail.runAnalysis')}</Button></div>)}</TabsContent>
                <TabsContent value="news" className="mt-3">{getNewsItems(selectedStock).length > 0 ? (<div className="space-y-3">{getNewsItems(selectedStock).map((item, i) => (<div key={i} className="p-3 rounded-lg bg-muted/30 space-y-1"><a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline flex items-center gap-1">{item.title}<Zap className="w-3 h-3 shrink-0" /></a><p className="text-xs text-muted-foreground line-clamp-2">{item.snippet}</p><div className="flex items-center gap-2 text-[11px] text-muted-foreground"><span>{item.source}</span><span>·</span><span>{item.date ? new Date(item.date).toLocaleDateString() : t('metrics.na')}</span></div></div>))}</div>) : (<div className="flex flex-col items-center justify-center py-12 text-center"><Globe className="w-10 h-10 text-muted-foreground mb-3" /><p className="text-sm text-muted-foreground mb-3">{t('detail.noNews', { ticker: selectedStock.ticker })}</p><Button variant="outline" onClick={() => handleFetchNews(selectedStock.ticker)} disabled={newsLoading}>{newsLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />}{t('detail.fetchNews')}</Button></div>)}</TabsContent>
              </Tabs>
            </div></div>
          </>)}
        </DialogContent>
      </Dialog>

      {/* Weights Dialog */}
      <Dialog open={weightsOpen} onOpenChange={setWeightsOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Settings2 className="w-5 h-5" />{t('weights.title')}</DialogTitle><DialogDescription className="sr-only">{t('weights.description')}</DialogDescription></DialogHeader>
          <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-4 pb-2">
            <p className="text-xs text-muted-foreground">{t('weights.description')}</p>
            <div><p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5 text-blue-500" />{t('weights.quant')}</p><div className="space-y-3">{QUANT_FACTORS.map(f => (<div key={f.key} className="space-y-1.5"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><f.icon className="w-4 h-4" style={{ color: f.color }} /><span className="text-sm">{t(f.labelKey)}</span></div><span className="font-mono text-sm font-medium">{localWeights[f.key] ?? 0}%</span></div><Slider value={[localWeights[f.key] ?? 0]} min={0} max={30} step={1} onValueChange={([v]) => setLocalWeights(prev => ({ ...prev, [f.key]: v }))} /></div>))}</div></div>
            <Separator />
            <div><p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><Lightbulb className="w-3.5 h-3.5 text-violet-500" />{t('weights.qual')}</p><div className="space-y-3">{QUAL_FACTORS.map(f => (<div key={f.key} className="space-y-1.5"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><f.icon className="w-4 h-4" style={{ color: f.color }} /><span className="text-sm">{t(f.labelKey)}</span></div><span className="font-mono text-sm font-medium">{localWeights[f.key] ?? 0}%</span></div><Slider value={[localWeights[f.key] ?? 0]} min={0} max={30} step={1} onValueChange={([v]) => setLocalWeights(prev => ({ ...prev, [f.key]: v }))} /></div>))}</div></div>
            <Separator />
            <div className="flex items-center justify-between"><span className="text-sm font-medium">{t('weights.total')}</span><span className={`font-mono text-sm font-bold ${Math.abs(Object.values(localWeights).reduce((a, b) => a + b, 0) - 100) < 2 ? 'text-emerald-600' : 'text-red-600'}`}>{Object.values(localWeights).reduce((a, b) => a + b, 0)}%</span></div>
            <div className="flex items-center gap-2"><Button variant="outline" className="flex-1" onClick={() => setLocalWeights({ ...DEFAULT_WEIGHTS_LOCAL })}>{t('weights.reset')}</Button><Button className="flex-1" onClick={handleSaveWeights}>{t('weights.save')}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
