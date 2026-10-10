import React, { useState } from 'react';
import { 
  TrendingUp, ChevronDown, ChevronRight, Layers, Code2, ShieldCheck, 
  Users, Target, ChevronRight as SlideArrow 
} from 'lucide-react';

interface Slide {
  number: number;
  title: string;
  focus: string;
}

interface Act {
  act: string;
  title: string;
  color: 'purple' | 'blue' | 'emerald' | 'amber' | 'rose';
  icon: React.ComponentType<{ className?: string }>;
  slides: Slide[];
}

const PITCH_DECK_ACTS: Act[] = [
  {
    act: "Act I",
    title: "The Problem",
    color: "purple",
    icon: Layers,
    slides: [
      { number: 1, title: "Title: The Liquidity Moat", focus: "Setting the stakes for the Sovereign Mandate." },
      { number: 2, title: "The Market Failure", focus: "Structural friction & T+3 settlement latency." },
      { number: 3, title: "The Sovereign Gap", focus: "MSME credit crunch vs Foreign Reserves." },
    ],
  },
  {
    act: "Act II",
    title: "The Solution",
    color: "blue",
    icon: Code2,
    slides: [
      { number: 4, title: "E-PSM Innovation Bridge", focus: "PISCES Auction Model and controlled access." },
      { number: 5, title: "Technical Moat", focus: "V9.1.0 AuctionEngine Kernel logic." },
    ],
  },
  {
    act: "Act III",
    title: "The Proof",
    color: "emerald",
    icon: ShieldCheck,
    slides: [
      { number: 6, title: "Code Security (SMT)", focus: "Proofs P1, P3, P4 PROVEN." },
      { number: 7, title: "Regulatory Confidence", focus: "FMI Compliant (T-9, T-11)." },
    ],
  },
  {
    act: "Act IV",
    title: "The Model",
    color: "amber",
    icon: Users,
    slides: [
      { number: 8, title: "Unit Economics", focus: "Transaction Fees & Data Licensing." },
      { number: 9, title: "Team & Roadmap", focus: "18-Month Implementation Plan." },
    ],
  },
  {
    act: "Act V",
    title: "The Ask",
    color: "rose",
    icon: Target,
    slides: [
      { number: 10, title: "Securing the Mandate", focus: "Capital Required ($X Million) & Use of Funds." },
    ],
  },
];

const ActCard: React.FC<Act> = ({ act, title, slides, color, icon: Icon }) => {
  const colorMap = {
    purple: "border-purple-500/30 bg-purple-950/10 text-purple-400",
    blue: "border-blue-500/30 bg-blue-950/10 text-blue-400",
    emerald: "border-emerald-500/30 bg-emerald-950/10 text-emerald-400",
    amber: "border-amber-500/30 bg-amber-950/10 text-amber-400",
    rose: "border-rose-500/30 bg-rose-950/10 text-rose-400",
  };

  const badgeColorMap = {
    purple: "bg-purple-900/30 text-purple-300 border-purple-800",
    blue: "bg-blue-900/30 text-blue-300 border-blue-800",
    emerald: "bg-emerald-900/30 text-emerald-300 border-emerald-800",
    amber: "bg-amber-900/30 text-amber-300 border-amber-800",
    rose: "bg-rose-900/30 text-rose-300 border-rose-800",
  };

  return (
    <div className={`border rounded-xl p-5 flex flex-col justify-between h-full bg-slate-950/40 backdrop-blur-sm ${colorMap[color]}`}>
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${badgeColorMap[color]}`}>
            {act}
          </span>
          <Icon className="w-4 h-4 opacity-70" />
        </div>
        <h4 className="text-base font-bold text-white mb-4">{title}</h4>
        
        <div className="space-y-3">
          {slides.map((slide) => (
            <div key={slide.number} className="bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 mb-1">
                <span className="text-[10px] text-slate-500 font-mono">#{slide.number}</span>
                <span>{slide.title}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug flex items-start gap-1">
                <SlideArrow className="w-3 h-3 text-slate-600 shrink-0 mt-0.5" />
                <span>{slide.focus}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const BlueprintPitchDeck: React.FC = () => {
  const [pitchDeckExpanded, setPitchDeckExpanded] = useState(false);

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      <div 
        className="p-6 bg-slate-950 flex justify-between items-center cursor-pointer hover:bg-slate-900 transition-colors"
        onClick={() => setPitchDeckExpanded(!pitchDeckExpanded)}
      >
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-rose-500" />
          <div>
            <h3 className="text-xl font-bold text-white">19. Strategic Pitch Deck Structure</h3>
            <p className="text-xs text-slate-500">Module 6: Securing the Mandate</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-rose-900/20 border border-rose-900/50 rounded text-rose-400 text-xs font-bold tracking-wider">
            EXECUTION READY
          </div>
          {pitchDeckExpanded ? <ChevronDown className="w-5 h-5 text-slate-500"/> : <ChevronRight className="w-5 h-5 text-slate-500"/>}
        </div>
      </div>

      {pitchDeckExpanded && (
        <div className="p-6 border-t border-slate-800 bg-slate-900/30 animate-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {PITCH_DECK_ACTS.map((act, index) => (
              <ActCard 
                key={index} 
                act={act.act} 
                title={act.title} 
                slides={act.slides} 
                color={act.color}
                icon={act.icon}
              />
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800 flex justify-center">
            <p className="text-sm text-slate-400 italic text-center max-w-2xl">
              "This structure synthesizes the technical and compliance proofs (SMT PROVEN, FMI COMPLIANT) into a compelling, investment-grade narrative required to secure final funding for the E-PSM implementation pilot."
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
