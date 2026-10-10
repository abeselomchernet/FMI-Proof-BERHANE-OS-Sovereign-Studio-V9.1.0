import React from 'react';
import { ScrollText, Globe, Gavel, Activity } from 'lucide-react';
import { DecisionBrief, MarketData } from '../../types';
import { BriefCard } from './BriefCard';

interface GovernanceStatutoryBriefsProps {
  briefs: DecisionBrief[];
  marketTicker: MarketData | null;
}

export const GovernanceStatutoryBriefs: React.FC<GovernanceStatutoryBriefsProps> = ({
  briefs,
  marketTicker,
}) => {
  const precedentBrief = briefs.find(b => b.id === 'DB-MSME-1004');
  const operationalBriefs = briefs.filter(b => b.id !== 'DB-MSME-1004');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden min-h-[300px] lg:col-span-2">
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-berhane-gold" />
          <div>
            <h3 className="font-bold text-slate-200">Statutory Proof & Legal Evidence Vault</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded border border-slate-700">NBE CONSUMER PROTECTION 5.3</span>
            </div>
          </div>
        </div>
        
        {/* Real-Time Market Ticker for Causal Context */}
        {marketTicker && (
          <div className="flex items-center gap-4 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800">
            <div className="text-right border-r border-slate-700 pr-3">
              <div className="text-[9px] text-slate-500 font-mono uppercase tracking-wider mb-0.5">Causal Context</div>
              <div className="flex items-center gap-1 text-[10px] text-berhane-accent font-bold">
                <Globe className="w-3 h-3" /> Live Feed
              </div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500 font-mono">ETB/USD</div>
              <div className="text-xs text-white font-mono font-bold">{marketTicker.rate.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500 font-mono">ESX VOL</div>
              <div className="text-xs text-amber-400 font-mono font-bold">{marketTicker.volatility_index.toFixed(1)}</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 p-6 grid grid-cols-1 gap-6">
        {/* Section 1: Precedent */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1 flex items-center gap-2">
            <Gavel className="w-3 h-3" /> Regulatory Standard
          </h4>
          {precedentBrief && <BriefCard brief={precedentBrief} isPrecedent={true} />}
        </div>

        {/* Section 2: Live Ledger */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1 flex items-center gap-2">
            <Activity className="w-3 h-3" /> Live Operational Ledger
          </h4>
          {operationalBriefs.length === 0 ? (
            <div className="text-center text-slate-600 italic py-4 bg-slate-950/30 rounded border border-slate-800 border-dashed">
              No operational interventions recorded yet.
            </div>
          ) : (
            <div className="space-y-4">
              {operationalBriefs.map(brief => (
                <BriefCard key={brief.id} brief={brief} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
