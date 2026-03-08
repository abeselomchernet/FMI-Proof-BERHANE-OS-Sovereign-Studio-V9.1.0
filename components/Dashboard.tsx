
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { AssetLedgerItem, MarketData } from '../types';
import { TARGET_BERHANE_SCORE } from '../constants';
import { TrendingUp, Shield, AlertTriangle, Layers, Globe, Activity, CheckCircle2 } from 'lucide-react';
import { fetchRealTimeMarketData } from '../services/dataService';

interface DashboardProps {
  ledgerData: AssetLedgerItem[];
}

export const Dashboard: React.FC<DashboardProps> = ({ ledgerData }) => {
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
             <span className="flex items-center gap-1.5 px-3 py-1 bg-berhane-gold/10 text-berhane-gold text-xs font-bold rounded-full border border-berhane-gold/20 shadow-sm">
                 <CheckCircle2 className="w-3.5 h-3.5" />
                 SMT PROVEN / FMI-9
             </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">Real-time metrics from the Certified Data Warehouse</p>
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
          icon={Layers} 
          trend="8 Loans Loaded" 
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
          icon={TrendingUp} 
          trend="V8.0.2 Stable" 
          trendUp={true} 
        />
        <KPICard 
          title="Risk Flagged" 
          value={(totalProcessed - compliantCount).toString()} 
          icon={AlertTriangle} 
          trend="Rejected" 
          trendUp={false} 
          color="text-rose-400"
        />
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
