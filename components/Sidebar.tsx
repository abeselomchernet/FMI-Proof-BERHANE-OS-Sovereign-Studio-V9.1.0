
import React from 'react';
import { LayoutDashboard, Database, Activity, ShieldCheck, Box, BrainCircuit, AlertOctagon, Layers, Award, Sparkles } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Studio Overview', icon: LayoutDashboard },
    { id: 'copilot', label: 'Gemini Copilot (AI)', icon: Sparkles },
    { id: 'blueprint', label: 'System Blueprint', icon: Layers },
    { id: 'ingestion', label: 'Ingestion & Knowledge (I)', icon: Database },
    { id: 'causal_engine', label: 'Causal Engine (II)', icon: BrainCircuit },
    { id: 'alphagate', label: 'AI Alpha Gate (III)', icon: Activity },
    { id: 'warehouse', label: 'Asset Ledger (IV)', icon: Box },
    { id: 'securitization', label: 'Securitization Mart', icon: ShieldCheck },
    { id: 'governance', label: 'Governance & Ops (V)', icon: AlertOctagon },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full sticky top-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tighter text-white">
          BERHANE <span className="text-berhane-accent">OS</span>
        </h1>
        <p className="text-xs text-emerald-400 mt-1 font-mono">Sovereign Studio V9.1.0-beta</p>
        <div className="mt-2.5 px-2.5 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/25 flex items-start gap-1.5">
          <span className="text-[10px] text-amber-300 font-mono leading-tight">
            ⚠️ <strong>DEMO APP</strong>: Synthetic mock data only. Not real financial data.
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-berhane-accent/10 text-berhane-accent border border-berhane-accent/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-berhane-accent' : 'text-slate-500 group-hover:text-white'}`} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-berhane-gold/10 rounded p-3 border border-berhane-gold/20 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-berhane-gold animate-pulse"></div>
            <span className="text-xs text-berhane-gold font-mono font-bold tracking-tight">FMI LEVEL 9 CERTIFIED</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center gap-1">
            <Award className="w-3 h-3 text-berhane-gold" />
            <span>Audit Ready (P1-P7)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
