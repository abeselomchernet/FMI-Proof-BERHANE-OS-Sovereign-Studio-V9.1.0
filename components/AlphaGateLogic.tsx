import React, { useState, useEffect } from 'react';
import { RawLoan, AssetLedgerItem } from '../types';
import { runAlphaGateTransformation } from '../services/dataService';
import { ArrowRight, Cpu, CheckCircle2, XCircle, Zap, Lock, AlertTriangle, Lightbulb } from 'lucide-react';
import { TARGET_BERHANE_SCORE } from '../constants';

interface AlphaGateLogicProps {
  rawData: RawLoan[];
  processedData: AssetLedgerItem[];
  setProcessedData: React.Dispatch<React.SetStateAction<AssetLedgerItem[]>>;
}

export const AlphaGateLogic: React.FC<AlphaGateLogicProps> = ({ rawData, processedData, setProcessedData }) => {
  const [processing, setProcessing] = useState(false);
  const [latestResult, setLatestResult] = useState<AssetLedgerItem | null>(null);
  
  // New state for Failure Analysis Tooltip
  const [hoveredAsset, setHoveredAsset] = useState<AssetLedgerItem | null>(null);
  const [remediatingAsset, setRemediatingAsset] = useState<string | null>(null);

  const unprocessedLoans = rawData.filter(
    raw => !processedData.find(proc => proc.loan_id === raw.loan_id)
  );

  const handleRunAlphaGate = () => {
    if (unprocessedLoans.length === 0) return;
    
    setProcessing(true);
    
    // Simulate async processing visual
    let count = 0;
    const interval = setInterval(() => {
        if (count >= unprocessedLoans.length) {
            clearInterval(interval);
            setProcessing(false);
            return;
        }
        
        const raw = unprocessedLoans[count];
        const result = runAlphaGateTransformation(raw);
        setLatestResult(result);
        setProcessedData(prev => [result, ...prev]); // Functional update to ensure state consistency
        count++;
    }, 800); // 800ms per item for visual effect
  };

  const handleIssuerCommitment = (asset: AssetLedgerItem) => {
      setRemediatingAsset(asset.asset_uuid);
      // Simulate API call to update record
      setTimeout(() => {
          setProcessedData(prev => prev.map(item => {
              if (item.asset_uuid === asset.asset_uuid) {
                  return {
                      ...item,
                      imm_uplift: item.imm_uplift + 1.0,
                      berhane_score: item.berhane_score + 1.0,
                      is_alpha_compliant: (item.berhane_score + 1.0) >= TARGET_BERHANE_SCORE,
                      dlt_mint_status: (item.berhane_score + 1.0) >= TARGET_BERHANE_SCORE ? 'MINTED' : 'REJECTED_ALPHA_GATE_FAIL'
                  };
              }
              return item;
          }));
          setRemediatingAsset(null);
          setHoveredAsset(null);
      }, 1500);
  };


  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            AI Alpha Gate (Phase III) <Cpu className="text-berhane-accent w-6 h-6" />
          </h2>
          <p className="text-slate-400 text-sm">Cloud Functions (Python) • Enforces CR-Score ≥ 9.0</p>
        </div>
        <button 
          onClick={handleRunAlphaGate}
          disabled={processing || unprocessedLoans.length === 0}
          className="bg-berhane-gold hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-berhane-900 px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors font-bold shadow-[0_0_20px_rgba(251,191,36,0.3)]"
        >
          <Zap className={`w-4 h-4 ${processing ? 'animate-pulse' : ''}`} />
          <span>{processing ? 'Processing...' : `Run Alpha Gate (${unprocessedLoans.length} Pending)`}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Input Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Input Stream</h3>
          <div className="space-y-3 overflow-y-auto flex-1 pr-2">
            {unprocessedLoans.length === 0 ? (
                <div className="text-center text-slate-600 italic py-10">Queue Empty</div>
            ) : (
                unprocessedLoans.map((loan, idx) => (
                    <div key={loan.loan_id} className="bg-slate-950 p-3 rounded border border-slate-800 opacity-70">
                        <div className="flex justify-between">
                            <span className="font-mono text-xs text-berhane-accent">{loan.loan_id}</span>
                            <span className="text-xs text-slate-500">Trad: {loan.trad_score}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 truncate">{loan.applicant_name}</div>
                    </div>
                ))
            )}
          </div>
        </div>

        {/* Processing Core Visualization */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            
            {latestResult ? (
                <div key={latestResult.asset_uuid} className="z-10 w-full max-w-sm animate-in zoom-in duration-300">
                    <div className={`border-2 rounded-xl p-6 bg-slate-900/90 backdrop-blur shadow-2xl ${latestResult.is_alpha_compliant ? 'border-emerald-500/50 shadow-emerald-900/20' : 'border-rose-500/50 shadow-rose-900/20'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-mono text-sm text-slate-400">Processing: {latestResult.loan_id}</span>
                            {latestResult.is_alpha_compliant ? <Lock className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Trad. Score</span>
                                <span className="font-mono">{latestResult.berhane_score - latestResult.imm_uplift}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-berhane-accent">IMM Uplift (AI)</span>
                                <span className="font-mono text-berhane-accent">+{latestResult.imm_uplift.toFixed(2)}</span>
                            </div>
                            <div className="h-px bg-slate-700 my-2"></div>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-white">CR-Score</span>
                                <span className={`text-2xl font-bold font-mono ${latestResult.is_alpha_compliant ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {latestResult.berhane_score.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className={`mt-4 text-center text-xs font-bold py-1 px-2 rounded ${latestResult.is_alpha_compliant ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {latestResult.is_alpha_compliant ? 'ALPHA COMPLIANT' : 'REJECTED: THRESHOLD < 9.0'}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center z-10 opacity-50">
                    <Cpu className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500">Waiting for processor...</p>
                </div>
            )}
        </div>

        {/* Output Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col relative">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Ledger Output</h3>
          <div className="space-y-3 overflow-y-auto flex-1 pr-2">
            {processedData.length === 0 ? (
                 <div className="text-center text-slate-600 italic py-10">Ledger Empty</div>
            ) : (
                processedData.slice(0, 8).map((asset) => (
                    <div 
                        key={asset.asset_uuid} 
                        className={`p-3 rounded border flex justify-between items-center cursor-help transition-all ${asset.is_alpha_compliant ? 'bg-emerald-950/20 border-emerald-900/30' : 'bg-rose-950/20 border-rose-900/30 hover:bg-rose-900/20'}`}
                        onMouseEnter={() => !asset.is_alpha_compliant && setHoveredAsset(asset)}
                        onMouseLeave={() => setHoveredAsset(null)}
                    >
                         <div className="flex flex-col">
                             <span className="text-xs font-mono text-slate-300">{asset.loan_id}</span>
                             <span className="text-[10px] text-slate-500">{asset.asset_uuid.substring(0,8)}...</span>
                         </div>
                         <div className="flex items-center gap-2">
                             <span className={`font-mono font-bold text-sm ${asset.is_alpha_compliant ? 'text-emerald-400' : 'text-rose-400'}`}>
                                 {asset.berhane_score.toFixed(1)}
                             </span>
                             {asset.is_alpha_compliant ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                         </div>
                         {/* Compliance Badge for MSME-1003 Remediation */}
                         {asset.loan_id === 'MSME-1003' && asset.is_alpha_compliant && (
                             <span className="absolute -right-2 -top-2 bg-emerald-500 text-slate-900 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg animate-in zoom-in">+1.00 IMM</span>
                         )}
                    </div>
                ))
            )}
          </div>

          {/* Failure Analysis Tooltip */}
          {hoveredAsset && (
              <div className="absolute bottom-4 left-4 right-4 bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-xl z-20 animate-in slide-in-from-bottom-2 fade-in duration-200">
                  <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                      <div className="flex-1">
                          <h4 className="text-sm font-bold text-white mb-1">Failure Analysis: {hoveredAsset.loan_id}</h4>
                          <div className="text-xs text-slate-400 mb-2 font-mono">
                              Score: {hoveredAsset.berhane_score.toFixed(2)} / Target: 9.00
                          </div>
                          <div className="bg-slate-900/50 p-2 rounded text-xs text-slate-300 mb-2">
                              Shortfall: <span className="text-rose-400 font-bold">{(9.0 - hoveredAsset.berhane_score).toFixed(2)} pts</span>
                              <br/>
                              Root Cause: High External Volatility Premium (Moat 5)
                          </div>
                          
                          {/* Remediation Action for Near Misses */}
                          {hoveredAsset.berhane_score >= 8.0 && (
                              <div className="mt-2 pt-2 border-t border-slate-700">
                                  <div className="flex items-center gap-2 text-berhane-gold text-xs font-bold mb-2">
                                      <Lightbulb className="w-3 h-3" /> Recommended Action
                                  </div>
                                  <button 
                                      onClick={() => handleIssuerCommitment(hoveredAsset)}
                                      disabled={remediatingAsset === hoveredAsset.asset_uuid}
                                      className="w-full bg-berhane-gold hover:bg-amber-400 text-berhane-900 text-xs font-bold py-1.5 rounded transition-colors disabled:opacity-50"
                                  >
                                      {remediatingAsset === hoveredAsset.asset_uuid ? 'Processing Commitment...' : 'Simulate Issuer Collateral Boost (+5%)'}
                                  </button>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          )}
        </div>

      </div>
    </div>
  );
};