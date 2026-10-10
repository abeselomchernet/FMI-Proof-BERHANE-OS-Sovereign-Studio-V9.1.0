import React from 'react';
import { 
  Zap, AlertOctagon, PartyPopper, Activity, RefreshCw, Play, Scale, 
  AlertTriangle, Microscope, ShieldAlert 
} from 'lucide-react';
import { SmartContractState, SystemicConstraint, CodeAuditState } from '../../types';

interface GovernanceBTLFBridgeProps {
  marketPaused: boolean;
  simulatingTrade: boolean;
  tradeResult: SmartContractState | null;
  auditState: CodeAuditState | null;
  clearingHalt: boolean;
  auditResolved: boolean;
  constraints: SystemicConstraint[];
  auditScanning: boolean;
  onTogglePause: () => void;
  onSimulateTrade: () => void;
  onClearHalt: () => void;
  onRunCodeAudit: () => void;
}

export const GovernanceBTLFBridge: React.FC<GovernanceBTLFBridgeProps> = ({
  marketPaused,
  simulatingTrade,
  tradeResult,
  auditState,
  clearingHalt,
  auditResolved,
  constraints,
  auditScanning,
  onTogglePause,
  onSimulateTrade,
  onClearHalt,
  onRunCodeAudit,
}) => {
  return (
    <>
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
                onClick={onTogglePause}
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
                onClick={onSimulateTrade}
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
                    onClick={onClearHalt}
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
                onClick={onRunCodeAudit}
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
    </>
  );
};
