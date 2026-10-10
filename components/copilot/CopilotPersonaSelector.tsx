import React from 'react';
import { Bot, Cpu, Zap } from 'lucide-react';

export interface PersonaConfig {
  id: string;
  name: string;
  badge: string;
  model: 'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite';
  description: string;
  speed: 'General' | 'Deep Reasoning' | 'Ultra Fast';
  icon: React.ComponentType<{ className?: string }>;
  systemInstruction: string;
  starterPrompts: string[];
}

export const COPILOT_PERSONAS: PersonaConfig[] = [
  {
    id: 'risk-officer',
    name: 'Sovereign Risk Officer',
    badge: 'General Tasks',
    model: 'gemini-3.5-flash',
    speed: 'General',
    icon: Bot,
    description: 'Expert in BERHANE OS asset securitization, CR-Scores, and sovereign balance sheet anti-fragility.',
    systemInstruction: 
      'You are the Sovereign Financial Risk Officer of the BERHANE OS Sovereign Studio. You provide expert analysis on credit risk scoring (CR-Scores), asset eligibility for securitization, provisioning cost reductions, and macroeconomic resilience for sovereign markets. Be professional, mathematically grounded, and concise.',
    starterPrompts: [
      'Explain how the AI Alpha Gate elevates loans to meet the 9.0 CR-Score threshold.',
      'How does SFDR Article 9 certification impact foreign exchange reserve generation?',
      'Assess the risk profile of Grade A vs Grade B securitized tranches.',
    ],
  },
  {
    id: 'causal-quant',
    name: 'Causal & Quants Strategist',
    badge: 'Complex Tasks',
    model: 'gemini-3.1-pro-preview',
    speed: 'Deep Reasoning',
    icon: Cpu,
    description: 'High-reasoning specialist for Monte Carlo causal simulations, policy shocks, and E-PSM clearing mechanisms.',
    systemInstruction: 
      'You are the Chief Quantitative Strategist and Causal Systems Architect for the BERHANE OS. You excel at complex counterfactual reasoning, Bayesian causal diagrams, Monte Carlo distribution forecasting, and algorithmic auction clearing (Uniform Clearing Price / E-PSM). Provide rigorous, in-depth breakdowns with theoretical and structural nuance.',
    starterPrompts: [
      'Simulate the counterfactual impact if NBE raises reserve ratios from 15% to 20%.',
      'Explain the deterministic clearing price and settlement hash algorithm in E-PSM.',
      'How does the BTLF protocol prevent cascading bank runs during an ETB currency devaluation shock?',
    ],
  },
  {
    id: 'fast-auditor',
    name: 'Regulatory Fast-Checker',
    badge: 'Fast Tasks',
    model: 'gemini-3.1-flash-lite',
    speed: 'Ultra Fast',
    icon: Zap,
    description: 'Lightning-fast verification of NBE Directives, statutory decision briefs, and compliance covenants.',
    systemInstruction: 
      'You are the High-Throughput Regulatory & Smart Contract Auditor for BERHANE OS. Provide rapid, accurate, pinpoint answers regarding NBE Directives (such as Directive 5.4), legal evidence requirements, smart contract circuit breakers, and compliance requirements. Be direct and concise.',
    starterPrompts: [
      'What are the minimum liquidity coverage ratio (LCR) limits under NBE Directive 5.4?',
      'Check statutory requirements for automated liquidity injections.',
      'List the exact conditions that trigger a BTLF circuit breaker market halt.',
    ],
  },
];

interface CopilotPersonaSelectorProps {
  selectedPersonaId: string;
  onSelectPersona: (personaId: string) => void;
}

export const CopilotPersonaSelector: React.FC<CopilotPersonaSelectorProps> = ({
  selectedPersonaId,
  onSelectPersona,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
      {COPILOT_PERSONAS.map(persona => {
        const isSelected = persona.id === selectedPersonaId;
        const Icon = persona.icon;
        return (
          <button
            key={persona.id}
            onClick={() => onSelectPersona(persona.id)}
            className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
              isSelected
                ? 'bg-gradient-to-br from-slate-900 to-sky-950/40 border-berhane-accent shadow-md shadow-sky-900/10'
                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-berhane-accent text-white' : 'bg-slate-800 text-slate-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">{persona.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{persona.model}</div>
                </div>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                isSelected ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'bg-slate-800 text-slate-500'
              }`}>
                {persona.speed}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">
              {persona.description}
            </p>
          </button>
        );
      })}
    </div>
  );
};
