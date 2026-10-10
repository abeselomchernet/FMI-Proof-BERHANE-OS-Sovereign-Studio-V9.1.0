import React, { useState, useEffect } from 'react';
import { ShieldCheck, Zap, AlertTriangle } from 'lucide-react';
import { 
  runConflictScan, verifyAssetOnChain, runSystemIntegrityAudit, simulateBTLFTransaction, 
  getSystemicConstraints, toggleMarketPause, runAutonomousCodeAudit, calculateLiveKPIs, 
  deployV801Patch, clearEmergencyHalt, getGovernanceParameters, updateGovernanceParameter, 
  getLiquidityPoolStatus, injectLiquidity, getLegalBriefs, fetchRealTimeMarketData, 
  getGovernanceHistory 
} from '../services/dataService';
import { 
  ConflictAlert, VerificationResult, SmartContractState, SystemicConstraint, 
  CodeAuditState, GovernanceParameter, LiquidityPoolStatus, DecisionBrief, 
  MarketData, GovernanceHistoryEvent 
} from '../types';
import { GovernanceLiquidityPool } from './governance/GovernanceLiquidityPool';
import { GovernanceStatutoryBriefs } from './governance/GovernanceStatutoryBriefs';
import { GovernanceParametersRegistry } from './governance/GovernanceParametersRegistry';
import { GovernanceConflictMonitor } from './governance/GovernanceConflictMonitor';
import { GovernanceBTLFBridge } from './governance/GovernanceBTLFBridge';
import { GovernanceSipaLogs } from './governance/GovernanceSipaLogs';

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
  const [marketPaused, setMarketPaused] = useState(false);
  const [constraints, setConstraints] = useState<SystemicConstraint[]>([]);

  // Code Audit State
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
  
  // Parameter Registry State
  const [parameters, setParameters] = useState<GovernanceParameter[]>([]);
  const [editingParam, setEditingParam] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [updatingParam, setUpdatingParam] = useState(false);
  const [paramHistory, setParamHistory] = useState<GovernanceHistoryEvent[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Liquidity State
  const [liquidityStatus, setLiquidityStatus] = useState<LiquidityPoolStatus | null>(null);
  const [injectingLiquidity, setInjectingLiquidity] = useState<string | null>(null);
  const [pendingInjection, setPendingInjection] = useState<string | null>(null);

  // Statutory Proof State
  const [briefs, setBriefs] = useState<DecisionBrief[]>([]);
  const [marketTicker, setMarketTicker] = useState<MarketData | null>(null);

  useEffect(() => {
    getSystemicConstraints().then(setConstraints);
    calculateLiveKPIs().then(() => {});
    getGovernanceParameters().then(setParameters);
    getLiquidityPoolStatus().then(setLiquidityStatus);
    getLegalBriefs().then(setBriefs);
    getGovernanceHistory().then(setParamHistory);
    setMarketTicker(fetchRealTimeMarketData());

    const interval = setInterval(() => {
      calculateLiveKPIs().then(() => {});
      getLiquidityPoolStatus().then(setLiquidityStatus);
      setMarketTicker(fetchRealTimeMarketData());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRunScan = async () => {
    setScanning(true);
    setConflicts([]);
    const results = await runConflictScan();
    setConflicts(results);
    setLastScan(new Date().toLocaleTimeString());
    setScanning(false);
  };

  const handleVerify = async () => {
    if (!assetIdInput) return;
    setVerifying(true);
    setVerificationResult(null);
    const result = await verifyAssetOnChain(assetIdInput);
    setVerificationResult(result);
    setVerifying(false);
  };

  const handleRunSIPA = async () => {
    setAuditRunning(true);
    setAuditLogs([]);
    await runSystemIntegrityAudit((line) => {
      setAuditLogs(prev => [...prev, line]);
    });
    setAuditRunning(false);
  };

  const handleSimulateTrade = async () => {
    const targetId = bridgeAssetId || '0x' + Math.random().toString(16).substr(2, 8);
    setBridgeAssetId(targetId);
    setSimulatingTrade(true);
    setTradeResult(null);

    const result = await simulateBTLFTransaction(targetId);
    setTradeResult(result);
    setSimulatingTrade(false);
  };

  const handleTogglePause = () => {
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
    
    if (result.btlf_enforcement_active) {
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
    if (success) {
      setMarketPaused(false);
      setAuditState(null);
      setPatchDeployed(false);
      setAuditResolved(true);
      setTimeout(() => setAuditResolved(false), 8000);
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

  const confirmInjection = async () => {
    if (pendingInjection) {
      const uuid = pendingInjection;
      setInjectingLiquidity(uuid);
      setPendingInjection(null);
      
      await injectLiquidity(uuid);
      const status = await getLiquidityPoolStatus();
      setLiquidityStatus(status);
      const updatedBriefs = await getLegalBriefs();
      setBriefs(updatedBriefs);
      
      setInjectingLiquidity(null);
    }
  };

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
                  onClick={() => setPendingInjection(null)}
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
        <GovernanceLiquidityPool 
          liquidityStatus={liquidityStatus}
          injectingLiquidity={injectingLiquidity}
          onInitiateInjection={(uuid) => setPendingInjection(uuid)}
        />

        <GovernanceStatutoryBriefs 
          briefs={briefs}
          marketTicker={marketTicker}
        />

        <GovernanceParametersRegistry 
          parameters={parameters}
          editingParam={editingParam}
          editValue={editValue}
          updatingParam={updatingParam}
          showHistory={showHistory}
          paramHistory={paramHistory}
          onToggleHistory={() => setShowHistory(!showHistory)}
          onStartEdit={handleStartEdit}
          onCancelEdit={handleCancelEdit}
          onSaveParam={handleSaveParam}
          onChangeEditValue={setEditValue}
        />

        <GovernanceConflictMonitor 
          scanning={scanning}
          conflicts={conflicts}
          lastScan={lastScan}
          patchDeploying={patchDeploying}
          patchDeployed={patchDeployed}
          assetIdInput={assetIdInput}
          verifying={verifying}
          verificationResult={verificationResult}
          onRunScan={handleRunScan}
          onDeployPatch={handleDeployPatch}
          onAssetIdChange={setAssetIdInput}
          onVerify={handleVerify}
        />

        <GovernanceBTLFBridge 
          marketPaused={marketPaused}
          simulatingTrade={simulatingTrade}
          tradeResult={tradeResult}
          auditState={auditState}
          clearingHalt={clearingHalt}
          auditResolved={auditResolved}
          constraints={constraints}
          auditScanning={auditScanning}
          onTogglePause={handleTogglePause}
          onSimulateTrade={handleSimulateTrade}
          onClearHalt={handleClearHalt}
          onRunCodeAudit={handleRunCodeAudit}
        />

        <GovernanceSipaLogs 
          auditLogs={auditLogs}
          auditRunning={auditRunning}
          onRunSIPA={handleRunSIPA}
        />
      </div>
    </div>
  );
};

export default GovernanceConsole;
