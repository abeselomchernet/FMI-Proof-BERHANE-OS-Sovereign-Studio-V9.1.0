import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { BrainCircuit, ArrowRight, Play, Terminal, Activity, AlertTriangle, ShieldCheck, Globe } from 'lucide-react';
import { runCausalSimulation } from '../services/dataService';
import { SimulationResult, ScenarioPreset } from '../types';

const PRESETS: ScenarioPreset[] = [
    { 
        id: 'capital_reserve_hike', 
        label: 'Policy Shock: NBE Reserve Hike', 
        query_text: 'What-if NBE’s minimum capital reserve is raised from 15% to 20%?' 
    },
    { 
        id: 'lock_duration_hike', 
        label: 'Policy Shock: Liquidity Lock Extension', 
        query_text: 'Predict impact if BTLF lock duration increases from 30 days to 90 days.' 
    },
    { 
        id: 'etb_devaluation', 
        label: 'Market Shock: ETB Devaluation', 
        query_text: 'Impact analysis: Real-time ETB/USD rate drops below 110.00.' 
    },
    {
        id: 'esx_volatility_root_cause',
        label: 'Deep Dive: Volatility Root Cause',
        query_text: 'DIAGNOSTIC: Correlate High ESX Volatility (45.2) with Alpha Gate Failure Rate.'
    },
    {
        id: 'esx_volatility_stabilization',
        label: 'Market Recovery: Low Volatility',
        query_text: 'SCENARIO: Simulate ESX Volatility drop to 35.0 (Below Safety Ceiling). Predict CR-Score Uplift.'
    }
];

export const CausalEngine: React.FC = () => {
    const [query, setQuery] = useState('');
    const [isSimulating, setIsSimulating] = useState(false);
    const [result, setResult] = useState<SimulationResult | null>(null);

    const handleRunSimulation = () => {
        setIsSimulating(true);
        setResult(null); // Clear previous result

        // Find which preset matches the query (simple mock matching)
        const preset = PRESETS.find(p => p.query_text === query);
        const scenarioId = preset ? preset.id : 'unknown';

        setTimeout(() => {
            const simResult = runCausalSimulation(scenarioId);
            setResult(simResult);
            setIsSimulating(false);
        }, 2000); // 2 second mock delay for "Calculation"
    };

    const handlePresetSelect = (preset: ScenarioPreset) => {
        setQuery(preset.query_text);
        setResult(null);
    };

    return (
        <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    Causal Mapping Engine (CME) <BrainCircuit className="text-berhane-accent w-6 h-6" />
                </h2>
                <p className="text-slate-400 text-sm">
                    Phase II: Predictive Query Protocol • Natural Language $\rightarrow$ Monte Carlo Simulation
                </p>
            </div>

            {/* Input Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="mb-4">
                    <label className="text-xs font-mono text-slate-500 uppercase font-bold">Policy Shock Query</label>
                    <div className="flex gap-2 mt-2">
                        <div className="flex-1 relative">
                            <Terminal className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                            <textarea 
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-berhane-accent h-12 resize-none pt-3"
                                placeholder="Enter a 'What-if' policy scenario..."
                            />
                        </div>
                        <button 
                            onClick={handleRunSimulation}
                            disabled={!query || isSimulating}
                            className="bg-berhane-accent hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-sky-900/20 transition-all"
                        >
                            {isSimulating ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                            {isSimulating ? 'Simulating...' : 'Run CME'}
                        </button>
                    </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                    <span className="text-xs text-slate-500 py-1">Presets:</span>
                    {PRESETS.map(preset => (
                        <button 
                            key={preset.id}
                            onClick={() => handlePresetSelect(preset)}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded border border-slate-700 transition-colors"
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Simulation Results Area */}
            {isSimulating ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-50">
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-berhane-accent border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-slate-400 font-mono animate-pulse">Running Monte Carlo Simulation (10,000 runs)...</p>
                </div>
            ) : result ? (
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                    
                    {/* Left Col: Causal Parsing (Trace) */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-berhane-gold mb-2">
                            <Terminal className="w-4 h-4" />
                            <h3 className="text-sm font-bold uppercase tracking-wider">Causal Trace</h3>
                        </div>
                        
                        {/* Step 1: Input */}
                        <div className="bg-slate-950 p-3 rounded border border-slate-800">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] text-slate-500 font-mono block">INPUT SOURCE</span>
                                {result.source_moat?.includes('MOAT 5') ? (
                                    <span className="text-[9px] bg-purple-900/30 text-purple-400 px-1.5 rounded font-bold border border-purple-500/20 flex items-center gap-1">
                                        <Globe className="w-2 h-2" /> MOAT 5 (EXTERNAL)
                                    </span>
                                ) : (
                                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 rounded font-bold">MOAT 1 (INTERNAL)</span>
                                )}
                            </div>
                            <p className="text-xs text-slate-300 italic">"{query}"</p>
                        </div>
                        
                        <div className="flex justify-center"><ArrowRight className="w-4 h-4 text-slate-600 rotate-90" /></div>

                        {/* Step 2: Parsed Variables */}
                        <div className="bg-slate-950 p-3 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-500 font-mono block mb-1">MOAT 2: PROGRAMMATIC VARIABLES</span>
                            {result.parsed_variables.map((v, i) => (
                                <div key={i} className="mb-2 last:mb-0">
                                    <div className="text-xs font-bold text-berhane-accent font-mono">{v.name}</div>
                                    <div className="flex items-center gap-2 text-xs mt-1">
                                        <span className="text-slate-500 line-through">{v.original_value}</span>
                                        <ArrowRight className="w-3 h-3 text-slate-600" />
                                        <span className="text-white font-bold bg-berhane-accent/20 px-1 rounded">{v.shock_value}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-1">{v.description}</div>
                                </div>
                            ))}
                        </div>

                         <div className="flex justify-center"><ArrowRight className="w-4 h-4 text-slate-600 rotate-90" /></div>

                        {/* Step 3: CR-Score Impact */}
                        <div className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center">
                             <div>
                                <span className="text-[10px] text-slate-500 font-mono block">PROJECTED CR-SCORE IMPACT</span>
                             </div>
                             <span className={`text-lg font-bold font-mono ${result.cr_score_impact >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                 {result.cr_score_impact > 0 ? '+' : ''}{result.cr_score_impact.toFixed(2)}
                             </span>
                        </div>
                    </div>

                    {/* Middle Col: Chart */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* Chart Card */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Risk-Weighted Forecast (Monte Carlo)</h3>
                                    <p className="text-xs text-slate-400">Distribution of {result.target_metric_name} over 10,000 iterations</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-white font-mono">{result.predicted_mean}</div>
                                    <div className="text-xs text-slate-500">Predicted Mean</div>
                                </div>
                            </div>
                            
                            <div className="flex-1 w-full min-h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={result.distribution_data}>
                                        <defs>
                                            <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={result.cr_score_impact >= 0 ? "#10b981" : "#f43f5e"} stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor={result.cr_score_impact >= 0 ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                                        <XAxis 
                                            dataKey="x" 
                                            stroke="#94a3b8" 
                                            tick={{fontSize: 10}} 
                                            label={{ value: result.target_metric_name, position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }} 
                                        />
                                        <YAxis stroke="#94a3b8" tick={{fontSize: 10}} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', fontSize: '12px' }}
                                            formatter={(value: number) => [value.toFixed(4), 'Probability']}
                                            labelFormatter={(label) => `${result.target_metric_name}: ${label}`}
                                        />
                                        <ReferenceLine x={result.predicted_mean} stroke="#fff" strokeDasharray="3 3" />
                                        <Area 
                                            type="monotone" 
                                            dataKey="y" 
                                            stroke={result.cr_score_impact >= 0 ? "#10b981" : "#f43f5e"} 
                                            fillOpacity={1} 
                                            fill="url(#colorY)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
                                <span>Confidence Interval (95%): <span className="text-white font-mono">{result.confidence_interval_lower} - {result.confidence_interval_upper}</span></span>
                                <span>Moat 4 Output</span>
                            </div>
                        </div>

                        {/* Optimization Advice */}
                        <div className={`border rounded-xl p-4 flex gap-3 ${result.cr_score_impact < 0 ? 'bg-rose-950/20 border-rose-900/50' : 'bg-emerald-950/20 border-emerald-900/50'}`}>
                            {result.cr_score_impact < 0 ? (
                                <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                            ) : (
                                <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                                <h4 className={`text-sm font-bold mb-1 ${result.cr_score_impact < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    Optimization Advice
                                </h4>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    {result.optimization_advice}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-600 opacity-50">
                    <BrainCircuit className="w-20 h-20 mb-4 text-slate-800" />
                    <p className="font-mono text-sm">Waiting for Causal Query...</p>
                </div>
            )}
        </div>
    );
};