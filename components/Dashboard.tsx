
import React, { useEffect, useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';
import { AssetLedgerItem, MarketData, RawLoan } from '../types';
import { TARGET_BERHANE_SCORE } from '../constants';
import { 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  Layers, 
  Globe, 
  Activity, 
  CheckCircle2, 
  Coins, 
  ArrowRight, 
  Wallet, 
  Check, 
  Droplet, 
  FileSpreadsheet,
  Calendar,
  Clock
} from 'lucide-react';
import { fetchRealTimeMarketData } from '../services/dataService';

interface DashboardProps {
  ledgerData: AssetLedgerItem[];
  rawData?: RawLoan[];
  onNavigate?: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ ledgerData, rawData = [], onNavigate }) => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);

  useEffect(() => {
    // Initial fetch of Moat 5 data
    setMarketData(fetchRealTimeMarketData());
    // Simulate live ticker updates
    const interval = setInterval(() => {
        setMarketData(fetchRealTimeMarketData());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalProcessed = ledgerData.length;
  const compliantAssets = ledgerData.filter(d => d.is_alpha_compliant);
  const compliantCount = compliantAssets.length;
  const complianceRate = totalProcessed > 0 ? (compliantCount / totalProcessed) * 100 : 0;
  
  const avgScore = totalProcessed > 0 
    ? ledgerData.reduce((acc, curr) => acc + curr.berhane_score, 0) / totalProcessed 
    : 0;

  // Volume & Financial Metrics Calculation from LedgerView Assets
  const assetVolumeMap = new Map((rawData || []).map(r => [r.loan_id, r.value_etb]));

  const processedWithVolume = ledgerData.map(item => {
    // If loan is present in rawData, use real value_etb; otherwise generate consistent mock volume
    const vol = assetVolumeMap.get(item.loan_id) ?? 2450000;
    return {
      ...item,
      volume: vol
    };
  });

  const totalVolume = processedWithVolume.reduce((acc, curr) => acc + curr.volume, 0);

  const securitizationPool = processedWithVolume.filter(d => d.is_alpha_compliant && d.dlt_mint_status === 'MINTED');
  const securitizationPoolCount = securitizationPool.length;
  const securitizationPoolVolume = securitizationPool.reduce((acc, curr) => acc + curr.volume, 0);

  const settledAssets = processedWithVolume.filter(d => d.settlement_status === 'SETTLED');
  const settledCount = settledAssets.length;
  const settledVolume = settledAssets.reduce((acc, curr) => acc + curr.volume, 0);

  const injectedAssets = processedWithVolume.filter(d => d.settlement_status === 'INJECTED_SETTLEMENT');
  const injectedCount = injectedAssets.length;
  const injectedVolume = injectedAssets.reduce((acc, curr) => acc + curr.volume, 0);

  const crunchCount = ledgerData.filter(d => d.settlement_status === 'LIQUIDITY_CRUNCH').length;
  const sfdrCount = ledgerData.filter(d => d.is_sfdr_article9_ready).length;
  const avgAssetVolume = totalProcessed > 0 ? totalVolume / totalProcessed : 0;

  // Regulatory Capital Adequacy Savings (35% provisioning discount applied to 8% capital ratio requirement)
  const capitalReliefETB = totalVolume * 0.35 * 0.08;

  const [volumeTimeframe, setVolumeTimeframe] = useState<'daily' | 'cumulative'>('daily');

  const formatETB = (amount: number): string => {
    if (amount >= 1_000_000_000) {
      return `ETB ${(amount / 1_000_000_000).toFixed(2)}B`;
    }
    if (amount >= 1_000_000) {
      return `ETB ${(amount / 1_000_000).toFixed(2)}M`;
    }
    if (amount >= 1_000) {
      return `ETB ${(amount / 1_000).toFixed(1)}k`;
    }
    return `ETB ${amount.toLocaleString()}`;
  };

  const formatYAxisTick = (val: number): string => {
    if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B`;
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
    return val.toString();
  };

  // Historical Processing Volume Time-Series for Synthetic Assets
  // Combines continuous audit batch timeline with live data from ledgerData in real time
  const historicalVolumeData = useMemo(() => {
    const basePeriods = [
      { period: 'Oct 04', label: 'Oct 04 • Batch #89', volume: 4800000, compliantVolume: 3600000, assetCount: 6 },
      { period: 'Oct 05', label: 'Oct 05 • Batch #90', volume: 7200000, compliantVolume: 5800000, assetCount: 9 },
      { period: 'Oct 06', label: 'Oct 06 • Batch #91', volume: 5100000, compliantVolume: 3900000, assetCount: 7 },
      { period: 'Oct 07', label: 'Oct 07 • Batch #92', volume: 9400000, compliantVolume: 7900000, assetCount: 12 },
      { period: 'Oct 08', label: 'Oct 08 • Batch #93', volume: 6300000, compliantVolume: 4700000, assetCount: 8 },
      { period: 'Oct 09', label: 'Oct 09 • Batch #94', volume: 8100000, compliantVolume: 6400000, assetCount: 10 },
      { 
        period: 'Oct 10 (Live)', 
        label: 'Oct 10 • Current Active Session', 
        volume: totalVolume > 0 ? totalVolume : 5200000, 
        compliantVolume: securitizationPoolVolume > 0 ? securitizationPoolVolume : 4100000, 
        assetCount: totalProcessed > 0 ? totalProcessed : 5 
      },
    ];

    let runningCumulative = 0;
    let runningCompliant = 0;

    return basePeriods.map(item => {
      runningCumulative += item.volume;
      runningCompliant += item.compliantVolume;
      return {
        ...item,
        cumulativeVolume: runningCumulative,
        cumulativeCompliantVolume: runningCompliant,
      };
    });
  }, [totalVolume, securitizationPoolVolume, totalProcessed]);

  const totalHistoricalVolume = useMemo(() => {
    return historicalVolumeData.reduce((acc, curr) => acc + curr.volume, 0);
  }, [historicalVolumeData]);

  const peakHistoricalVolume = useMemo(() => {
    return Math.max(...historicalVolumeData.map(d => d.volume));
  }, [historicalVolumeData]);

  const CustomVolumeTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isCumulative = volumeTimeframe === 'cumulative';
      const currentVol = isCumulative ? data.cumulativeVolume : data.volume;
      const compliantVol = isCumulative ? data.cumulativeCompliantVolume : data.compliantVolume;
      const ratio = currentVol > 0 ? ((compliantVol / currentVol) * 100).toFixed(1) : '0';

      return (
        <div className="bg-slate-900/95 border border-slate-700/80 p-3.5 rounded-xl shadow-2xl backdrop-blur text-xs font-mono space-y-2 min-w-[220px]">
          <div className="text-slate-200 font-semibold border-b border-slate-800 pb-1.5 flex justify-between items-center">
            <span>{data.label}</span>
            <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
              {data.assetCount} assets
            </span>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sky-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                {isCumulative ? 'Cumulative Volume:' : 'Period Volume:'}
              </span>
              <span className="font-bold">{formatETB(currentVol)}</span>
            </div>

            <div className="flex items-center justify-between text-emerald-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Compliant Pool:
              </span>
              <span className="font-bold">{formatETB(compliantVol)}</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-800/80 flex justify-between text-[11px] text-slate-400">
            <span>Compliance Ratio:</span>
            <span className="text-emerald-400 font-semibold">{ratio}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Chart Data Preparation
  const scoreDistribution = [
    { name: '< 7.0', count: ledgerData.filter(d => d.berhane_score < 7).length },
    { name: '7.0 - 8.9', count: ledgerData.filter(d => d.berhane_score >= 7 && d.berhane_score < 9).length },
    { name: '9.0 - 10.5', count: ledgerData.filter(d => d.berhane_score >= 9 && d.berhane_score < 10.5).length },
    { name: '10.5+', count: ledgerData.filter(d => d.berhane_score >= 10.5).length },
  ];

  const statusData = [
    { name: 'Compliant (Article 9)', value: compliantCount, color: '#10b981' },
    { name: 'Rejected (Risk)', value: totalProcessed - compliantCount, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3">
             <h2 className="text-2xl font-bold text-white">Sovereign Studio Overview</h2>
             <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-300 text-xs font-bold rounded-full border border-amber-500/25 shadow-sm">
                 <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                 DEMO SIMULATION (MOCK DATA)
             </span>
             <span className="flex items-center gap-1.5 px-3 py-1 bg-berhane-gold/10 text-berhane-gold text-xs font-bold rounded-full border border-berhane-gold/20 shadow-sm">
                 <CheckCircle2 className="w-3.5 h-3.5" />
                 SMT PROVEN / FMI-9
             </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">Simulated metrics from the Certified Data Warehouse • Not real market data</p>
        </div>
        
        {/* Moat 5 Market Ticker */}
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-lg p-2 px-4 shadow-lg">
           <div className="text-right border-r border-slate-700 pr-4">
             <div className="flex items-center gap-1 justify-end text-xs text-slate-500 font-mono">
               <Globe className="w-3 h-3 text-berhane-accent" /> MOAT 5 (FEED)
             </div>
             <div className="text-xs text-slate-600 font-mono">TRUST: {marketData?.trust_level}</div>
           </div>
           
           <div>
              <div className="text-xs text-slate-500 font-mono">ETB/USD</div>
              <div className="text-sm font-bold text-white flex items-center gap-1">
                 {marketData?.rate.toFixed(2)}
                 <span className="text-rose-400 text-[10px] bg-rose-900/20 px-1 rounded">{marketData?.change_24h}%</span>
              </div>
           </div>

           <div>
              <div className="text-xs text-slate-500 font-mono">ESX VOL</div>
              <div className="text-sm font-bold text-white flex items-center gap-1">
                 {marketData?.volatility_index.toFixed(1)}
                 <Activity className="w-3 h-3 text-amber-500" />
              </div>
           </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Assets Processed" 
          value={totalProcessed.toString()} 
          subValue={`Volume: ${formatETB(totalVolume)}`}
          icon={Layers} 
          trend={`${totalProcessed} in Ledger`} 
          trendUp={true} 
        />
        <KPICard 
          title="Avg CR-Score" 
          value={avgScore.toFixed(2)} 
          subValue={`Target: ${TARGET_BERHANE_SCORE.toFixed(1)}`}
          icon={Shield} 
          trend={avgScore >= TARGET_BERHANE_SCORE ? "Optimal" : "Sub-optimal"} 
          trendUp={avgScore >= TARGET_BERHANE_SCORE} 
          color={avgScore >= TARGET_BERHANE_SCORE ? "text-emerald-400" : "text-amber-400"}
        />
        <KPICard 
          title="Compliance Rate" 
          value={`${complianceRate.toFixed(1)}%`} 
          subValue={`${compliantCount} Eligible`}
          icon={TrendingUp} 
          trend="V8.0.2 Stable" 
          trendUp={true} 
        />
        <KPICard 
          title="Risk Flagged" 
          value={(totalProcessed - compliantCount).toString()} 
          subValue={crunchCount > 0 ? `${crunchCount} Liquidity Crunch` : 'Zero Crunch'}
          icon={AlertTriangle} 
          trend="Rejected" 
          trendUp={false} 
          color="text-rose-400"
        />
      </div>

      {/* Summary Stats Widget: LedgerView Count & Volume Tracker */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden backdrop-blur">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-berhane-accent/10 border border-berhane-accent/25 rounded-xl text-berhane-accent shadow-inner">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">LedgerView Asset & Volume Tracker</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  BERHANE_DATA_WAREHOUSE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Aggregated nominal volume and portfolio count for assets actively held in the securitization ledger.
              </p>
            </div>
          </div>

          {onNavigate && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('warehouse')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors shadow-sm"
              >
                <span>Asset Ledger ({totalProcessed})</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('securitization')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-berhane-gold/15 hover:bg-berhane-gold/25 text-berhane-gold border border-berhane-gold/30 transition-colors shadow-sm"
              >
                <span>Securitization Mart ({securitizationPoolCount})</span>
                <ArrowRight className="w-3.5 h-3.5 text-berhane-gold" />
              </button>
            </div>
          )}
        </div>

        {/* 4-Column Volume & Asset Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {/* Card 1: Total Ledger Assets & Volume */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
              <span>Total Ledger Volume</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {totalProcessed} Loans
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-white tracking-tight">
              {formatETB(totalVolume)}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900 text-[11px] text-slate-400">
              <span>Avg per asset:</span>
              <span className="font-mono text-slate-300">{formatETB(avgAssetVolume)}</span>
            </div>
          </div>

          {/* Card 2: Securitization Mart Ready */}
          <div className="bg-slate-950/70 border border-emerald-900/30 rounded-xl p-4 hover:border-emerald-800/50 transition-all">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-medium mb-1">
              <span>Securitization Ready Pool</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-900/40">
                {securitizationPoolCount} Minted
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-300 tracking-tight">
              {formatETB(securitizationPoolVolume)}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900 text-[11px] text-slate-400">
              <span>Pool ratio:</span>
              <span className="font-mono text-emerald-400">
                {totalVolume > 0 ? ((securitizationPoolVolume / totalVolume) * 100).toFixed(1) : 0}% of volume
              </span>
            </div>
          </div>

          {/* Card 3: DLT Settled & Finalized */}
          <div className="bg-slate-950/70 border border-sky-900/30 rounded-xl p-4 hover:border-sky-800/50 transition-all">
            <div className="flex items-center justify-between text-xs text-sky-400 font-medium mb-1">
              <span>Settled Volume (T+1)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-900/40">
                {settledCount} Settled
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-sky-300 tracking-tight">
              {formatETB(settledVolume)}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900 text-[11px] text-slate-400">
              <span>Forced injections:</span>
              <span className="font-mono text-amber-400">{injectedCount} ({formatETB(injectedVolume)})</span>
            </div>
          </div>

          {/* Card 4: Provisioning Capital Savings */}
          <div className="bg-slate-950/70 border border-berhane-gold/25 rounded-xl p-4 hover:border-berhane-gold/40 transition-all">
            <div className="flex items-center justify-between text-xs text-berhane-gold font-medium mb-1">
              <span>Capital Adequacy Relief</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-900/40">
                -35% Buffer
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-berhane-gold tracking-tight">
              {formatETB(capitalReliefETB)}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900 text-[11px] text-slate-400">
              <span>NBE optimization:</span>
              <span className="font-mono text-slate-300">8% Basel CAR</span>
            </div>
          </div>
        </div>

        {/* Volume Distribution Stacked Progress Bar & Legend */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
            <span className="font-medium">Ledger Pool Capital Allocation</span>
            <span className="font-mono text-slate-500">
              {totalProcessed} Active Records • {sfdrCount} SFDR Article 9 Certified
            </span>
          </div>

          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
            {totalVolume > 0 ? (
              <>
                <div 
                  style={{ width: `${(securitizationPoolVolume / totalVolume) * 100}%` }}
                  className="bg-emerald-500 transition-all duration-500" 
                  title={`Securitization Mart: ${formatETB(securitizationPoolVolume)} (${((securitizationPoolVolume / totalVolume) * 100).toFixed(1)}%)`}
                />
                <div 
                  style={{ width: `${((settledVolume - Math.min(settledVolume, securitizationPoolVolume)) / totalVolume) * 100}%` }}
                  className="bg-sky-500 transition-all duration-500" 
                  title={`Settled: ${formatETB(settledVolume)}`}
                />
                <div 
                  style={{ width: `${Math.max(0, 100 - (securitizationPoolVolume / totalVolume) * 100)}%` }}
                  className="bg-slate-700 transition-all duration-500" 
                  title={`Unminted / Pre-Securitization Pool: ${formatETB(Math.max(0, totalVolume - securitizationPoolVolume))}`}
                />
              </>
            ) : (
              <div className="w-full bg-slate-800" />
            )}
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px]">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Securitization Mart: <strong>{formatETB(securitizationPoolVolume)}</strong> ({securitizationPoolCount} assets)</span>
            </div>
            <div className="flex items-center gap-1.5 text-sky-400">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              <span>Settled On-Chain: <strong>{formatETB(settledVolume)}</strong> ({settledCount} assets)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
              <span>Risk Review / Pre-Mint: <strong>{formatETB(Math.max(0, totalVolume - securitizationPoolVolume))}</strong> ({totalProcessed - securitizationPoolCount} assets)</span>
            </div>
            {crunchCount > 0 && (
              <div className="flex items-center gap-1 text-rose-400 ml-auto">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>{crunchCount} Liquidity Crunch flag</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historical Synthetic Asset Processing Volume Over Time (Recharts Line Chart) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">
                Historical Synthetic Asset Processing Volume Over Time
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-900/40">
                RECHARTS_TIME_SERIES
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Origination volume trajectory of synthetic credit assets across continuous batch runs and Alpha Gate securitization gates.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setVolumeTimeframe('daily')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  volumeTimeframe === 'daily'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Periodic Batches
              </button>
              <button
                type="button"
                onClick={() => setVolumeTimeframe('cumulative')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  volumeTimeframe === 'cumulative'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Cumulative Growth
              </button>
            </div>
          </div>
        </div>

        {/* Highlight Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs">
          <div>
            <div className="text-slate-400 text-[11px]">Historical Total Volume</div>
            <div className="text-sm font-bold font-mono text-white mt-0.5">
              {formatETB(historicalVolumeData[historicalVolumeData.length - 1]?.cumulativeVolume || totalHistoricalVolume)}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Peak Batch Throughput</div>
            <div className="text-sm font-bold font-mono text-sky-400 mt-0.5">
              {formatETB(peakHistoricalVolume)}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Active Session (Live)</div>
            <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
              {formatETB(totalVolume)}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Tracking Window</div>
            <div className="text-sm font-bold font-mono text-slate-300 mt-0.5">
              7 Production Cycles
            </div>
          </div>
        </div>

        {/* Recharts LineChart */}
        <div className="w-full h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={historicalVolumeData}
              margin={{ top: 15, right: 25, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
              <XAxis 
                dataKey="period" 
                stroke="#94a3b8" 
                tick={{ fontSize: 11, fill: '#94a3b8' }} 
                tickLine={{ stroke: '#475569' }}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis 
                stroke="#94a3b8" 
                tick={{ fontSize: 11, fill: '#94a3b8' }} 
                tickFormatter={formatYAxisTick}
                tickLine={{ stroke: '#475569' }}
                axisLine={{ stroke: '#334155' }}
              />
              <Tooltip content={<CustomVolumeTooltip />} />
              <Legend 
                verticalAlign="top" 
                align="right" 
                height={36}
                wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
              />
              <Line 
                type="monotone" 
                dataKey={volumeTimeframe === 'cumulative' ? 'cumulativeVolume' : 'volume'} 
                name="Gross Processed Volume (ETB)" 
                stroke="#0ea5e9" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#0ea5e9', stroke: '#0284c7', strokeWidth: 1.5 }}
                activeDot={{ r: 7, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey={volumeTimeframe === 'cumulative' ? 'cumulativeCompliantVolume' : 'compliantVolume'} 
                name="Alpha Compliant Securitization Volume (ETB)" 
                stroke="#10b981" 
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ r: 4, fill: '#10b981', stroke: '#059669', strokeWidth: 1.5 }}
                activeDot={{ r: 7, fill: '#34d399', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[11px] text-slate-500 pt-3 border-t border-slate-800/80 mt-2">
          <span>Continuous time series aggregated by financial settlement windows and Alpha Gate transformation runs.</span>
          <span className="text-emerald-400 font-mono mt-1 sm:mt-0 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Real-time feed synced with LedgerView
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
        {/* Score Distribution Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4">CR-Score Distribution</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
                <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index >= 2 ? '#10b981' : '#64748b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-slate-500 mt-2 text-center">
            Green bars indicate scores meeting the ≥ 9.0 Alpha Gate threshold.
          </div>
        </div>

        {/* Status Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4">Securitization Pool Ratio</h3>
          <div className="flex-1 w-full min-h-0 flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                />
              </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {statusData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-slate-300">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, subValue, icon: Icon, trend, trendUp, color }: any) => (
  <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-800 rounded-lg">
        <Icon className={`w-5 h-5 ${color || 'text-berhane-accent'}`} />
      </div>
      {trend && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {trend}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
      <div className="text-2xl font-bold text-white mt-1">{value}</div>
      {subValue && <div className="text-xs text-slate-500 mt-1">{subValue}</div>}
    </div>
  </div>
);
