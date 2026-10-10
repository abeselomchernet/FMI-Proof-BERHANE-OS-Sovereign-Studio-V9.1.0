import React from 'react';
import { FileBadge, Gavel, Scale } from 'lucide-react';
import { DecisionBrief } from '../../types';

interface BriefCardProps {
  brief: DecisionBrief;
  isPrecedent?: boolean;
}

export const BriefCard: React.FC<BriefCardProps> = ({ brief, isPrecedent = false }) => (
  <div className={`bg-slate-950 border rounded-xl p-5 flex flex-col md:flex-row gap-5 hover:border-berhane-gold/30 transition-colors group animate-in fade-in slide-in-from-top-2 ${isPrecedent ? 'border-berhane-gold/40 shadow-lg shadow-berhane-gold/5 bg-berhane-gold/5' : 'border-slate-800'}`}>
    {/* Brief Header */}
    <div className="md:w-1/4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FileBadge className={`w-4 h-4 ${isPrecedent ? 'text-berhane-gold' : 'text-slate-500'}`} />
          <span className={`text-xs font-bold ${isPrecedent ? 'text-berhane-gold' : 'text-slate-300'}`}>{brief.id}</span>
        </div>
        {isPrecedent && (
          <div className="mb-2">
            <span className="px-1.5 py-0.5 rounded bg-berhane-gold/20 text-berhane-gold text-[9px] border border-berhane-gold/30 font-bold uppercase tracking-wider">
              Authoritative Precedent
            </span>
          </div>
        )}
        <div className="text-[10px] text-slate-500 font-mono mb-1">REF: {brief.asset_ref}</div>
        <div className="text-[10px] text-slate-500 font-mono">TS: {new Date(brief.timestamp).toLocaleString()}</div>
      </div>
      <div className="mt-4">
        <div className={`text-[9px] font-bold px-2 py-1 rounded inline-block border ${
          brief.decision_type === 'LIQUIDITY_INJECTION' 
          ? 'bg-rose-900/20 text-rose-400 border-rose-900/50' 
          : 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50'
        }`}>
          {brief.decision_type.replace('_', ' ')}
        </div>
      </div>
    </div>

    {/* Brief Content */}
    <div className="flex-1">
      <h4 className="text-sm font-bold text-white mb-2 flex items-center justify-between">
        <span>Decision Narrative</span>
        {isPrecedent && <Gavel className="w-4 h-4 text-berhane-gold opacity-50"/>}
      </h4>
      <p className="text-xs text-slate-300 leading-relaxed mb-4 bg-slate-900/50 p-3 rounded border border-slate-800 font-serif italic">
        "{brief.narrative}"
      </p>
      <div className="flex flex-col md:flex-row justify-between items-end gap-2">
        <div>
          <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Statutory Citation</div>
          <div className="text-xs text-sky-400 font-mono flex items-center gap-1">
            <Scale className="w-3 h-3" />
            {brief.statutory_citation}
          </div>
        </div>
        <div className="bg-slate-900 px-2 py-1 rounded border border-slate-800 flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] text-slate-500 font-mono">SIG: {brief.digital_signature}</span>
        </div>
      </div>
    </div>
  </div>
);
