import React from 'react';
import { AlertOctagon, RefreshCw, CheckCircle2, ArrowRight, Code2, ShieldCheck, Search, XCircle, Server } from 'lucide-react';
import { ConflictAlert, VerificationResult } from '../../types';

interface GovernanceConflictMonitorProps {
  scanning: boolean;
  conflicts: ConflictAlert[];
  lastScan: string | null;
  patchDeploying: boolean;
  patchDeployed: boolean;
  assetIdInput: string;
  verifying: boolean;
  verificationResult: VerificationResult | null;
  onRunScan: () => void;
  onDeployPatch: () => void;
  onAssetIdChange: (val: string) => void;
  onVerify: () => void;
}

export const GovernanceConflictMonitor: React.FC<GovernanceConflictMonitorProps> = ({
  scanning,
  conflicts,
  lastScan,
  patchDeploying,
  patchDeployed,
  assetIdInput,
  verifying,
  verificationResult,
  onRunScan,
  onDeployPatch,
  onAssetIdChange,
  onVerify,
}) => {
  return (
    <>
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
              onClick={onRunScan}
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
                    onClick={onDeployPatch}
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
                onChange={(e) => onAssetIdChange(e.target.value)}
              />
            </div>
            <button 
              onClick={onVerify}
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
    </>
  );
};
