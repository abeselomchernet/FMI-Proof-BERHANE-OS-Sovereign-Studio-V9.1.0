
import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, AlertOctagon, RefreshCw, CheckCircle2, XCircle, Search, Server, Play, Activity, ArrowRight, Zap, Code2, Scale, Microscope, ShieldAlert, AlertTriangle, Save, X, Droplet, Wallet, FileBadge, Gavel, ScrollText, PenLine, PartyPopper, Settings, Globe, History, ChevronRight, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { runConflictScan, verifyAssetOnChain, runSystemIntegrityAudit, simulateBTLFTransaction, getSystemicConstraints, toggleMarketPause, runAutonomousCodeAudit, calculateLiveKPIs, deployV801Patch, clearEmergencyHalt, getGovernanceParameters, updateGovernanceParameter, getLiquidityPoolStatus, injectLiquidity, getLegalBriefs, fetchRealTimeMarketData, getGovernanceHistory } from '../services/dataService';
import { ConflictAlert, VerificationResult, SmartContractState, SystemicConstraint, CodeAuditState, GovernanceParameter, LiquidityPoolStatus, DecisionBrief, MarketData, GovernanceHistoryEvent } from '../types';

const BriefCard: React.FC<{ brief: DecisionBrief, isPrecedent?: boolean }> = ({ brief, isPrecedent = false }) => (
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

export const GovernanceConsole: React.FC = () => {
  // Conflict Monitor State
  const [scanning, setScanning] = useState(false);
  const [conflicts, setConflicts] = useState<ConflictAlert[]>([]);
  const [lastScan, setLastScan] = useState<string | null>(null);

  // Verification Oracle State
  const [assetIdInput, setAssetIdInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  // BTLF Bridge State
  const [bridgeAssetId, setBridgeAssetId] = useState('');
  const [simulatingTrade, setSimulatingTrade] = useState(false);
  const [tradeResult, setTradeResult] = useState<SmartContractState | null>(null);
  const [marketPaused, setMarketPaused] = useState(false); // V4.3.0 Circuit Breaker
  const [kpiData, setKpiData] = useState<{ lcr: number, distribution: Record<string, number> } | null>(null);

  // Systemic Coherency State (V4.3.0)
  const [constraints, setConstraints] = useState<SystemicConstraint[]>([]);

  // Code Audit State (V6.0.0)
  const [auditState, setAuditState] = useState<CodeAuditState | null>(null);
  const [auditScanning, setAuditScanning] = useState(false);
  const [auditResolved, setAuditResolved] = useState(false);

  // Emergency Patch State
  const [patchDeploying, setPatchDeploying] = useState(false);
  const [patchDeployed, setPatchDeployed] = useState(false);
  const [clearingHalt, setClearingHalt] = useState(false);

  // SIPA Audit State
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [auditRunning, setAuditRunning] = useState(false);
  const auditLogEndRef = useRef<HTMLDivElement>(null);
  
  // V9.0.0 Parameter Registry State
  const [parameters, setParameters] = useState<GovernanceParameter[]>([]);
  const [editingParam, setEditingParam] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [updatingParam, setUpdatingParam] = useState(false);
  const [paramHistory, setParamHistory] = useState<GovernanceHistoryEvent[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // V9.0.0 Liquidity State
  const [liquidityStatus, setLiquidityStatus] = useState<LiquidityPoolStatus | null>(null);
  const [injectingLiquidity, setInjectingLiquidity] = useState<string | null>(null);
  const [pendingInjection, setPendingInjection] = useState<string | null>(null); // State for confirmation dialog

  // V9.0.0 Statutory Proof State
  const [briefs, setBriefs] = useState<DecisionBrief[]>([]);
  const [marketTicker, setMarketTicker] = useState<MarketData | null>(null);

  useEffect(() => {
    // Auto-scroll to bottom of logs
    if (auditLogEndRef.current) {
        auditLogEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [auditLogs]);

  useEffect(() => {
    // Load initial data
    getSystemicConstraints().then(setConstraints);
    calculateLiveKPIs().then(setKpiData);
    getGovernanceParameters().then(setParameters);
    getLiquidityPoolStatus().then(setLiquidityStatus);
    getLegalBriefs().then(setBriefs);
    getGovernanceHistory().then(setParamHistory);
    setMarketTicker(fetchRealTimeMarketData());

    const interval = setInterval(() => {
        calculateLiveKPIs().then(setKpiData);
        getLiquidityPoolStatus().then(setLiquidityStatus);
        setMarketTicker(fetchRealTimeMarketData());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRunScan = async () => {
    setScanning(true);
    setConflicts([]);
    // Artificial delay to simulate background daemon work
    const results = await runConflictScan();
    setConflicts(results);
    setLastScan(new Date().toLocaleTimeString());
    setScanning(false);
  };

  const handleVerify = async () => {
    if(!assetIdInput) return;
    setVerifying(true);
    setVerificationResult(null);
    const result = await verifyAssetOnChain(assetIdInput);
    setVerificationResult(result);
    setVerifying(false);
  };

  const handleRunSIPA = async () => {
      setAuditRunning(true);
      setAuditLogs([]); // Clear logs
      await runSystemIntegrityAudit((line) => {
          setAuditLogs(prev => [...prev, line]);
      });
      setAuditRunning(false);
  };

  const handleSimulateTrade = async () => {
    if(!bridgeAssetId) {
        setBridgeAssetId('0x' + Math.random().toString(16).substr(2, 8)); // Auto-gen if empty
    }
    const targetId = bridgeAssetId || '0x' + Math.random().toString(16).substr(2, 8);
    setBridgeAssetId(targetId);
    setSimulatingTrade(true);
    setTradeResult(null);

    const result = await simulateBTLFTransaction(targetId);
    setTradeResult(result);
    setSimulatingTrade(false);
  };

  const handleTogglePause = () => {
      // Only allow manual toggle if NOT enforced by Audit Engine
      if (auditState?.btlf_enforcement_active && !patchDeployed) {
          return; 
      }
      const newState = !marketPaused;
      setMarketPaused(newState);
      toggleMarketPause(newState);
  };

  const handleRunCodeAudit = async () => {
      setAuditScanning(true);
      setAuditState(null);
      setAuditResolved(false);
      const result = await runAutonomousCodeAudit();
      setAuditState(result);
      setAuditScanning(false);
      
      if(result.btlf_enforcement_active) {
          // Sync UI state with the automated halt
          setMarketPaused(true);
          toggleMarketPause(true);
      }
  };

  const handleDeployPatch = async () => {
      setPatchDeploying(true);
      await deployV801Patch();
      setPatchDeployed(true);
      setPatchDeploying(false);
  };

  const handleClearHalt = async () => {
      setClearingHalt(true);
      const success = await clearEmergencyHalt();
      if(success) {
          setMarketPaused(false);
          setAuditState(null); // Clear the warning UI
          setPatchDeployed(false); // Reset patch state for next simulation
          setAuditResolved(true); // Trigger success state
          setTimeout(() => setAuditResolved(false), 8000); // Clear success message after 8s
      }
      setClearingHalt(false);
  };

  const handleStartEdit = (param: GovernanceParameter) => {
      setEditingParam(param.key);
      setEditValue(param.value.toString());
  };

  const handleCancelEdit = () => {
      setEditingParam(null);
      setEditValue('');
  };

  const handleSaveParam = async (key: string) => {
      setUpdatingParam(true);
      const val = parseFloat(editValue);
      await updateGovernanceParameter(key, val);
      const updatedParams = await getGovernanceParameters();
      const updatedHistory = await getGovernanceHistory();
      setParameters(updatedParams);
      setParamHistory(updatedHistory);
      setUpdatingParam(false);
      setEditingParam(null);
  };

  const initiateInjection = (uuid: string) => {
      setPendingInjection(uuid);
  };

  const cancelInjection = () => {
      setPendingInjection(null);
  };

  const confirmInjection = async () => {
      if (pendingInjection) {
          const uuid = pendingInjection;
          setInjectingLiquidity(uuid);
          setPendingInjection(null); // Close modal
          
          await injectLiquidity(uuid);
          
          // Refresh pool status
          const status = await getLiquidityPoolStatus();
          setLiquidityStatus(status);
          
          // NEW: Refresh briefs to show the generated evidence (V9.0.0 Finalization)
          const updatedBriefs = await getLegalBriefs();
          setBriefs(updatedBriefs);
          
          setInjectingLiquidity(null);
      }
  };

  // Segregate briefs for UI
  const precedentBrief = briefs.find(b => b.id === 'DB-MSME-1004');
  const operationalBriefs = briefs.filter(b => b.id !== 'DB-MSME-1004');

  // Stacked Bar Data for Liquidity
  const barData = liquidityStatus ? [
      {
          name: 'Liquidity Pool',
          Locked: liquidityStatus.currently_locked / 1000000,
          Available: liquidityStatus.available_reserves / 1000000
      }
  ] : [];

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* CONFIRMATION DIALOG */}
      {pendingInjection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-rose-500/50 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="bg-rose-950/30 p-4 border-b border-rose-900/50 flex items-center gap-3">
                      <div className="p-2 bg-rose-500/20 rounded-full">
                          <AlertTriangle className="w-6 h-6 text-rose-500" />
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-white">Confirm Liquidity Injection</h3>
                          <p className="text-xs text-rose-300">Irreversible Governance Action</p>
                      </div>
                  </div>
                  <div className="p-6">
                      <p className="text-sm text-slate-300 mb-4">
                          You are about to execute a <strong>Forced Settlement Injection</strong> for asset <span className="font-mono font-bold text-white bg-slate-800 px-1 rounded">{pendingInjection}</span>.
                      </p>
                      <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs text-slate-400 space-y-2 mb-6">
                          <p>This action will:</p>
                          <ul className="list-disc pl-4 space-y-1">
                              <li>Draw funds from the NBE Blocked Account Reserve.</li>
                              <li>Change asset status to <code>INJECTED_SETTLEMENT</code>.</li>
                              <li><strong>Generate a permanent Legal Decision Brief</strong> in the Statutory Proof Ledger.</li>
                          </ul>
                      </div>
                      <div className="flex gap-3 justify-end">
                          <button 
                              onClick={cancelInjection}
                              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
                          >
                              Cancel
                          </button>
                          <button 
                              onClick={confirmInjection}
                              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20 text-sm font-bold flex items-center gap-2"
                          >
                              <Zap className="w-4 h-4" /> Confirm & Execute
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          Governance & Operations (Phase V) <ShieldCheck className="text-berhane-accent w-6 h-6" />
        </h2>
        <p className="text-slate-400 text-sm">
          Active Conflict Monitoring, Circuit Breakers & Autonomous Code Audit (V6.0.0)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0 overflow-y-auto pr-2 pb-2">
        
        {/* PANEL I: LIQUIDITY RESILIENCE (V9.0.0) */}
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
                                        cursor={{fill: 'transparent'}}
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
                         {/* Mock Distressed Items for UI Demo if no real ones exist in state yet */}
                         <div className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800 group hover:border-slate-700 transition-colors">
                             <div>
                                 <div className="text-xs font-bold text-slate-300">MSME-1092</div>
                                 <div className="text-[9px] text-rose-400 font-bold flex items-center gap-1">
                                     <AlertTriangle className="w-3 h-3"/> LIQUIDITY CRUNCH
                                 </div>
                             </div>
                             <button 
                                onClick={() => initiateInjection('MSME-1092')}
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

        {/* PANEL J: STATUTORY PROOF (V9.0.0) */}
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

        {/* PANEL H: PARAMETER GOVERNANCE REGISTRY (V9.0.0) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden min-h-[300px] lg:col-span-2">
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-berhane-gold" />
                    <h3 className="font-bold text-slate-200">Parameter Governance Registry ("Living Law")</h3>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowHistory(!showHistory)}
                        className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${showHistory ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <History className="w-3 h-3" />
                        {showHistory ? 'Hide Audit Log' : 'Audit Log'}
                    </button>
                    <div className="px-2 py-0.5 bg-berhane-gold/10 text-berhane-gold text-[10px] font-bold rounded border border-berhane-gold/20 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3" /> V9.0.0 ACTIVE
                    </div>
                </div>
            </div>
            
            <div className="flex-1 p-0 grid grid-cols-1 lg:grid-cols-3">
                {/* Main Registry Table */}
                <div className={`lg:col-span-2 p-4 bg-slate-900/50 overflow-x-auto ${showHistory ? 'border-r border-slate-800' : 'lg:col-span-3'}`}>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[10px] uppercase text-slate-500 border-b border-slate-800">
                                <th className="py-2 pl-2">Parameter Key</th>
                                <th className="py-2">Value</th>
                                <th className="py-2">Description</th>
                                <th className="py-2 text-right pr-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {parameters.map((param) => (
                                <tr key={param.key} className="group hover:bg-slate-800/30 transition-colors">
                                    <td className="py-4 pl-2">
                                        <div className="text-xs font-bold text-berhane-gold font-mono">{param.key}</div>
                                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">type: {param.solidity_type}</div>
                                    </td>
                                    <td className="py-4">
                                        {editingParam === param.key ? (
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="number" 
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="bg-slate-950 border border-slate-600 rounded px-2 py-1 text-xs text-white w-20 font-mono focus:border-berhane-gold focus:outline-none"
                                                />
                                                <span className="text-xs text-slate-500 font-mono">{param.unit}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-white font-mono">{param.value}</span>
                                                <span className="text-xs text-slate-500 font-mono">{param.unit}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-4">
                                        <div className="text-xs text-slate-400">{param.description}</div>
                                        <div className="text-[9px] text-slate-600 mt-1">Updated: {new Date(param.last_updated).toLocaleString()}</div>
                                    </td>
                                    <td className="py-4 text-right pr-2">
                                        {editingParam === param.key ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleSaveParam(param.key)}
                                                    disabled={updatingParam}
                                                    className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors"
                                                    title="Execute Governance TX"
                                                >
                                                    {updatingParam ? <RefreshCw className="w-3 h-3 animate-spin"/> : <Save className="w-3 h-3"/>}
                                                </button>
                                                <button 
                                                    onClick={handleCancelEdit}
                                                    disabled={updatingParam}
                                                    className="p-1.5 bg-slate-800 text-slate-400 rounded hover:bg-slate-700 border border-slate-600 transition-colors"
                                                    title="Cancel"
                                                >
                                                    <X className="w-3 h-3"/>
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => handleStartEdit(param)}
                                                className="p-1.5 bg-slate-800 text-slate-400 rounded hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Propose Change"
                                            >
                                                <PenLine className="w-3 h-3"/>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-4 p-3 bg-berhane-gold/5 rounded border border-berhane-gold/10 flex items-start gap-2">
                        <Activity className="w-4 h-4 text-berhane-gold mt-0.5" />
                        <div>
                            <h4 className="text-xs font-bold text-berhane-gold">Hot-Swappable Logic Active</h4>
                            <p className="text-[10px] text-slate-400 mt-1">
                                Changes committed here are immediately reflected in the <code>BTLF_Protocol.sol</code> and Alpha Gate logic. This decouples risk parameters from core contract logic, enabling rapid response to Moat 5 inputs.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Audit Log Sidebar */}
                {showHistory && (
                    <div className="lg:col-span-1 bg-slate-950 p-4 border-l border-slate-800 overflow-y-auto max-h-[350px] animate-in slide-in-from-right-4">
                        <div className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                            <History className="w-3 h-3" /> Recent Updates
                        </div>
                        {paramHistory.length === 0 ? (
                            <div className="text-center text-[10px] text-slate-600 italic">No history available.</div>
                        ) : (
                            <div className="space-y-3 relative">
                                <div className="absolute top-2 bottom-2 left-1.5 w-px bg-slate-800"></div>
                                {paramHistory.map((event) => (
                                    <div key={event.id} className="relative pl-5">
                                        <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-slate-900 border border-slate-600 z-10"></div>
                                        <div className="text-[10px] text-slate-500 font-mono mb-0.5">{new Date(event.timestamp).toLocaleString()}</div>
                                        <div className="bg-slate-900 border border-slate-800 p-2 rounded hover:border-slate-700 transition-colors">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-xs font-bold text-white font-mono">{event.key}</span>
                                                <span className="text-[9px] text-slate-500 font-mono">{event.user}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-mono">
                                                <span className="text-slate-500 line-through">{event.oldValue}</span>
                                                <ArrowRight className="w-3 h-3 text-slate-600" />
                                                <span className="text-berhane-gold font-bold">{event.newValue}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* PANEL A: CONFLICT MONITORING DAEMON */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden min-h-[300px]">
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-500" />
              <h3 className="font-bold text-slate-200">Conflict Monitoring Daemon</h3>
            </div>
            <div className="flex items-center gap-3">
               {lastScan && <span className="text-xs text-slate-500 font-mono">Last Run: {lastScan}</span>}
               <button 
                onClick={handleRunScan}
                disabled={scanning}
                className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded border border-slate-700 transition-colors flex items-center gap-2"
               >
                 <RefreshCw className={`w-3 h-3 ${scanning ? 'animate-spin' : ''}`} />
                 {scanning ? 'Scanning...' : 'Run Cycle'}
               </button>
            </div>
          </div>
          
          <div className="flex-1 p-4 bg-slate-900/50 overflow-y-auto">
             {scanning ? (
               <div className="h-full flex flex-col items-center justify-center space-y-4">
                 <div className="w-full max-w-xs bg-slate-800 h-1 rounded overflow-hidden">
                    <div className="h-full bg-berhane-accent animate-[progress_1s_ease-in-out_infinite]"></div>
                 </div>
                 <p className="text-xs text-slate-500 font-mono">Scanning Regulatory Index vs Smart Contracts...</p>
               </div>
             ) : conflicts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600">
                    <CheckCircle2 className="w-12 h-12 mb-3 text-emerald-500/20" />
                    <p className="text-sm">No Active Conflicts Detected</p>
                </div>
             ) : (
                <div className="space-y-3">
                    {conflicts.map(conflict => (
                        <div key={conflict.id} className="bg-rose-950/20 border border-rose-900/50 rounded-lg p-3 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-rose-900/50 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{conflict.severity}</span>
                                <span className="text-[10px] text-slate-500 font-mono">{new Date(conflict.detected_at).toLocaleTimeString()}</span>
                            </div>
                            <h4 className="text-sm font-bold text-white mb-1">{conflict.description}</h4>
                            <div className="flex items-center gap-2 text-xs text-rose-300 font-mono mt-2">
                                <span>{conflict.source_directive}</span>
                                <ArrowRight className="w-3 h-3" />
                                <span>{conflict.conflicting_contract_var}</span>
                            </div>
                            <button 
                                onClick={handleDeployPatch}
                                disabled={patchDeploying || patchDeployed}
                                className="mt-3 w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-2"
                            >
                                {patchDeploying ? <RefreshCw className="w-3 h-3 animate-spin"/> : <Code2 className="w-3 h-3"/>}
                                {patchDeployed ? 'V8.0.2 Patch Deployed' : 'Deploy Hotfix V8.0.2'}
                            </button>
                        </div>
                    ))}
                </div>
             )}
          </div>
        </div>

        {/* PANEL B: VERIFICATION ORACLE */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden min-h-[300px]">
             <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-berhane-accent" />
                    <h3 className="font-bold text-slate-200">Asset Verification Oracle</h3>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded border border-slate-700">Moat 4 Interface</span>
            </div>
            <div className="flex-1 p-6 flex flex-col">
                <div className="flex gap-2 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Enter Asset UUID..." 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-berhane-accent font-mono"
                            value={assetIdInput}
                            onChange={(e) => setAssetIdInput(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={handleVerify}
                        disabled={!assetIdInput || verifying}
                        className="bg-berhane-accent hover:bg-sky-500 text-white px-4 rounded-lg font-bold text-xs shadow-lg shadow-sky-900/20 disabled:opacity-50"
                    >
                        {verifying ? 'Verifying...' : 'Verify'}
                    </button>
                </div>

                {verificationResult ? (
                    <div className="flex-1 bg-slate-950 rounded-lg border border-slate-800 p-4 animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs text-slate-500 font-mono">STATUS</span>
                            {verificationResult.status === 'VERIFIED' ? (
                                <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-900/20 px-2 py-0.5 rounded">
                                    <CheckCircle2 className="w-3 h-3" /> VERIFIED ON-CHAIN
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-900/20 px-2 py-0.5 rounded">
                                    <XCircle className="w-3 h-3" /> NOT FOUND
                                </span>
                            )}
                        </div>
                        {verificationResult.status === 'VERIFIED' && (
                            <div className="space-y-3 font-mono text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Audit Hash</span>
                                    <span className="text-berhane-accent">{verificationResult.audit_hash.substring(0, 16)}...</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">On-Chain Score</span>
                                    <span className="text-white font-bold">{verificationResult.on_chain_score}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Timestamp</span>
                                    <span className="text-slate-400">{new Date(verificationResult.verification_timestamp).toLocaleDateString()}</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-700">
                        <Server className="w-12 h-12 mb-2 opacity-20" />
                        <p className="text-xs">Enter UUID to query Immutable Audit Log</p>
                    </div>
                )}
            </div>
        </div>

        {/* PANEL C: BTLF BRIDGE SIMULATOR */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden min-h-[300px] lg:col-span-2">
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-berhane-gold" />
                    <h3 className="font-bold text-slate-200">BTLF Protocol Bridge (Smart Contract Simulator)</h3>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Circuit Breaker</span>
                        <button 
                            onClick={handleTogglePause}
                            className={`w-10 h-5 rounded-full p-1 transition-colors duration-300 ${marketPaused ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            title={marketPaused ? "Market Halted" : "Market Active"}
                        >
                            <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform duration-300 ${marketPaused ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                     <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                        Simulate a transaction against <code>BTLF_Protocol.sol</code>. The system will query the <strong>Pre-Trade Risk Oracle</strong> to determine if the asset requires mitigation (Staged Settlement or Haircut) based on real-time volatility.
                     </p>
                     
                     <div className="flex gap-2 mb-6">
                        <button 
                            onClick={handleSimulateTrade}
                            disabled={simulatingTrade}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-bold text-sm border border-slate-700 flex items-center gap-2 transition-all disabled:opacity-50 w-full justify-center"
                        >
                            {simulatingTrade ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                            {simulatingTrade ? 'Executing Smart Contract...' : 'Simulate Trade Execution'}
                        </button>
                     </div>

                     {/* V4.3.0 Circuit Breaker Visualization */}
                     {marketPaused && (
                         <div className="bg-rose-950/20 border border-rose-900/50 rounded-lg p-4 flex items-center gap-3 animate-pulse">
                             <AlertOctagon className="w-6 h-6 text-rose-500" />
                             <div>
                                 <h4 className="text-sm font-bold text-rose-400">MARKET HALTED</h4>
                                 <p className="text-xs text-rose-300/70">Circuit Breaker is active. All trades revert.</p>
                             </div>
                             {auditState?.btlf_enforcement_active && (
                                 <button 
                                    onClick={handleClearHalt}
                                    disabled={clearingHalt}
                                    className="ml-auto bg-rose-600 hover:bg-rose-500 text-white text-xs px-3 py-1 rounded"
                                 >
                                    {clearingHalt ? 'Resetting...' : 'Override & Reset'}
                                 </button>
                             )}
                         </div>
                     )}
                     
                     {/* V6.0.0 Audit Success Message */}
                     {auditResolved && (
                         <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-lg p-4 flex items-center gap-3 mt-4 animate-in fade-in">
                             <PartyPopper className="w-6 h-6 text-emerald-500" />
                             <div>
                                 <h4 className="text-sm font-bold text-emerald-400">SYSTEM RESTORED</h4>
                                 <p className="text-xs text-emerald-300/70">Patch verified. CodeAuditEngine cleared warning.</p>
                             </div>
                         </div>
                     )}
                </div>

                {/* Transaction Receipt / Output */}
                <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 font-mono text-xs relative overflow-hidden">
                    {tradeResult ? (
                        <div className="space-y-3 relative z-10 animate-in slide-in-from-right-4">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                                <span className="text-slate-500">TX_ID</span>
                                <span className="text-berhane-accent">{tradeResult.transaction_id}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">STATUS</span>
                                <span className={`font-bold px-2 py-0.5 rounded ${
                                    tradeResult.status === 'EXECUTED' ? 'bg-emerald-900/30 text-emerald-400' : 
                                    tradeResult.status === 'REVERTED' ? 'bg-rose-900/30 text-rose-400' : 'text-amber-400'
                                }`}>
                                    {tradeResult.status}
                                </span>
                            </div>
                            
                            {tradeResult.status === 'REVERTED' && (
                                <div className="mt-2 bg-rose-950/20 p-2 rounded border border-rose-900/30">
                                    <span className="text-rose-400 block mb-1">REVERT REASON:</span>
                                    <span className="text-slate-300">{tradeResult.pause_reason}</span>
                                </div>
                            )}

                            {tradeResult.status === 'EXECUTED' && (
                                <>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">RISK MITIGATION</span>
                                        <span className={`font-bold ${tradeResult.mitigation_triggered ? 'text-amber-400' : 'text-slate-400'}`}>
                                            {tradeResult.mitigation_type}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">LOCK DURATION</span>
                                        <div className="text-right">
                                            <span className="text-slate-600 line-through mr-2">{tradeResult.initial_lock_duration_days}d</span>
                                            <span className="text-white font-bold">{tradeResult.final_lock_duration_days}d</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-slate-800 mt-2">
                                        <span className="text-slate-500">PENALTY APPLIED</span>
                                        <span className="text-rose-400">{tradeResult.applied_penalty}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-700 relative z-10">
                            <Activity className="w-10 h-10 mb-2 opacity-20" />
                            <p>Ready for Simulation</p>
                        </div>
                    )}
                    {/* Background Noise Texture */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                </div>
            </div>
        </div>

        {/* PANEL D: SYSTEMIC COHERENCY (V4.3.0) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden min-h-[250px]">
             <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold text-slate-200">Systemic Coherency Constraints</h3>
                </div>
                {auditState && (
                    <span className="flex items-center gap-1 text-[10px] bg-rose-900/50 text-rose-300 px-2 py-0.5 rounded border border-rose-800 animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> AUDIT WARNING ACTIVE
                    </span>
                )}
            </div>
            
            <div className="flex-1 p-4 grid grid-cols-1 gap-4 overflow-y-auto">
                {constraints.map(c => (
                    <div key={c.id} className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex justify-between items-center">
                         <div>
                             <div className="text-xs font-bold text-white mb-1">{c.metric_name}</div>
                             <div className="text-[10px] text-slate-500">{c.description}</div>
                         </div>
                         <div className="text-right">
                             <div className="text-lg font-bold font-mono text-purple-400">{c.current_limit}%</div>
                             <div className="text-[10px] text-slate-600">Max Limit</div>
                         </div>
                    </div>
                ))}

                {/* V6.0.0 Autonomous Audit Panel */}
                <div className={`mt-2 border rounded-lg p-3 ${auditState ? 'bg-rose-950/10 border-rose-900/30' : 'bg-purple-900/10 border-purple-900/30'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold uppercase text-purple-300 flex items-center gap-2">
                            <Microscope className="w-3 h-3" /> Autonomous Code Audit
                        </span>
                        <button 
                            onClick={handleRunCodeAudit}
                            disabled={auditScanning || !!auditState}
                            className="text-[10px] bg-purple-900/30 hover:bg-purple-800 text-purple-200 px-2 py-1 rounded transition-colors disabled:opacity-50"
                        >
                            {auditScanning ? 'Scanning...' : 'Run Analysis'}
                        </button>
                    </div>
                    
                    {auditState ? (
                        <div className="space-y-2 animate-in slide-in-from-left-2">
                             <div className="flex items-center gap-2 text-rose-400 text-xs font-bold bg-rose-900/20 p-2 rounded">
                                 <ShieldAlert className="w-4 h-4" />
                                 CRITICAL: {auditState.detected_warning}
                             </div>
                             <div className="text-[10px] text-slate-400">
                                 Action Taken: <span className="text-white font-bold">BTLF Circuit Breaker Triggered (Halt)</span>
                             </div>
                        </div>
                    ) : (
                        <div className="text-[10px] text-slate-500 italic">
                            {auditScanning ? 'Analyzing Bytecode...' : 'System Nominal. No active warnings.'}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* PANEL E: SIPA DIAGNOSTIC (Phase V) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden min-h-[300px]">
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-slate-400" />
                    <h3 className="font-bold text-slate-200">SIPA Diagnostic Log</h3>
                </div>
                <button 
                    onClick={handleRunSIPA}
                    disabled={auditRunning}
                    className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded border border-slate-700 transition-colors flex items-center gap-2"
                >
                    <Play className="w-3 h-3" /> Run SIPA
                </button>
            </div>
            
            <div className="flex-1 bg-black/80 p-4 font-mono text-[10px] text-emerald-500 overflow-y-auto max-h-[300px]">
                {auditLogs.length === 0 ? (
                    <span className="text-slate-600">System Idle. Initiate SIPA to begin diagnostics...</span>
                ) : (
                    auditLogs.map((log, i) => (
                        <div key={i} className="mb-1 break-words">
                            <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                            {log}
                        </div>
                    ))
                )}
                <div ref={auditLogEndRef} />
            </div>
        </div>
      </div>
    </div>
  );
};
