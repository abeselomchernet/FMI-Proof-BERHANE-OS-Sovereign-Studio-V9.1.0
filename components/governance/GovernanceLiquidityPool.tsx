import React from 'react';
import { Droplet, Wallet, AlertTriangle, RefreshCw, Zap } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import { LiquidityPoolStatus } from '../../types';

interface GovernanceLiquidityPoolProps {
  liquidityStatus: LiquidityPoolStatus | null;
  injectingLiquidity: string | null;
  onInitiateInjection: (uuid: string) => void;
}

export const GovernanceLiquidityPool: React.FC<GovernanceLiquidityPoolProps> = ({
  liquidityStatus,
  injectingLiquidity,
  onInitiateInjection,
}) => {
  const barData = liquidityStatus ? [
    {
      name: 'Liquidity Pool',
      Locked: liquidityStatus.currently_locked / 1000000,
      Available: liquidityStatus.available_reserves / 1000000
    }
  ] : [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden min-h-[300px] lg:col-span-2">
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Droplet className="w-5 h-5 text-sky-400" />
          <h3 className="font-bold text-slate-200">Liquidity Resilience & Settlement Operations (V9.0.0)</h3>
        </div>
        <div className="flex items-center gap-3">
          {liquidityStatus && (
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
              <div className={`w-2 h-2 rounded-full ${liquidityStatus.status === 'HEALTHY' ? 'bg-emerald-500' : liquidityStatus.status === 'STRAINED' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
              <span className="text-[10px] font-bold text-slate-300">{liquidityStatus.status} RESERVE</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Reserve Metrics with Stacked Bar Chart */}
        <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start z-10 mb-2">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase mb-1">Total System Capacity</div>
              <div className="text-xl font-bold text-white font-mono">
                {liquidityStatus ? (liquidityStatus.total_capacity / 1000000).toFixed(1) : '0.0'}M <span className="text-sm text-slate-500">ETB</span>
              </div>
            </div>
          </div>

          {/* Stacked Bar Chart Visualization */}
          <div className="flex-1 min-h-[140px] -ml-4">
            {liquidityStatus && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={barData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }} barSize={30}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" hide />
                  <RechartsTooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', fontSize: '12px' }}
                    formatter={(value: number) => [`${value.toFixed(1)}M ETB`, 'Amount']}
                  />
                  <Bar dataKey="Locked" stackId="a" fill="#f43f5e" radius={[4, 0, 0, 4]} name="Locked" />
                  <Bar dataKey="Available" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} name="Available" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          
          <div className="flex justify-center gap-4 text-[10px] font-mono mt-[-10px]">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-rose-500 rounded-sm"></div> Locked
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-sm"></div> Available
            </div>
          </div>
        </div>

        <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 flex flex-col justify-center">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Available for Settlement</div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-900/20 rounded-full">
              <Wallet className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400 font-mono">
                {liquidityStatus ? (liquidityStatus.available_reserves / 1000000).toFixed(1) : '0.0'}M
              </div>
              <div className="text-[10px] text-slate-500">ETB LIQUIDITY</div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed bg-slate-900 p-2 rounded border border-slate-800/50">
            Funds currently held in the NBE Blocked Account available for immediate settlement finality.
          </p>
        </div>

        {/* Distressed Settlement Actions */}
        <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 flex flex-col">
          <div className="text-xs font-bold text-slate-500 uppercase mb-3 flex justify-between items-center">
            <span>Distressed Settlements</span>
            <span className="bg-rose-900/30 text-rose-400 px-1.5 py-0.5 rounded text-[9px] border border-rose-900/50">DEMO QUEUE</span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar max-h-[140px]">
            <div className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800 group hover:border-slate-700 transition-colors">
              <div>
                <div className="text-xs font-bold text-slate-300">MSME-1092</div>
                <div className="text-[9px] text-rose-400 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3"/> LIQUIDITY CRUNCH
                </div>
              </div>
              <button 
                onClick={() => onInitiateInjection('MSME-1092')}
                disabled={!!injectingLiquidity}
                className="bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-1 disabled:opacity-50 transition-colors shadow-lg shadow-sky-900/20"
              >
                {injectingLiquidity === 'MSME-1092' ? <RefreshCw className="w-3 h-3 animate-spin"/> : <Zap className="w-3 h-3"/>}
                Inject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
