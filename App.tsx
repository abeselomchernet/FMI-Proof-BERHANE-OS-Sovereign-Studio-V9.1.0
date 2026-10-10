import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { IngestionSimulator } from './components/IngestionSimulator';
import { AlphaGateLogic } from './components/AlphaGateLogic';
import { LedgerView } from './components/LedgerView';
import { CausalEngine } from './components/CausalEngine';
import { GovernanceConsole } from './components/GovernanceConsole';
import { SystemBlueprint } from './components/SystemBlueprint';
import { GeminiChatbot } from './components/GeminiChatbot';
import { RawLoan, AssetLedgerItem } from './types';
import { 
  loadWarehouseState, 
  saveWarehouseState, 
  resetWarehouseToFactory, 
  subscribeWarehouseChanges,
  exportWarehouseSnapshotJson,
  importWarehouseSnapshotJson
} from './services/warehouseStore';
import { Sparkles, Database, RotateCcw, Download, Upload, Check } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Central State for the Data Warehouse simulation with persistent backing
  const [rawData, setRawData] = useState<RawLoan[]>([]);
  const [processedData, setProcessedData] = useState<AssetLedgerItem[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [copiedExport, setCopiedExport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isFirstMount = useRef(true);

  // Initialize with persisted warehouse data on mount and listen to cross-tab updates
  useEffect(() => {
    const initialSnapshot = loadWarehouseState();
    setRawData(initialSnapshot.rawData);
    setProcessedData(initialSnapshot.processedData);
    setLastSyncTime(new Date(initialSnapshot.updatedAt).toLocaleTimeString());

    // Subscribe to cross-tab updates via BroadcastChannel & storage events
    const unsubscribe = subscribeWarehouseChanges((snapshot) => {
      setRawData(snapshot.rawData);
      setProcessedData(snapshot.processedData);
      setLastSyncTime(new Date(snapshot.updatedAt).toLocaleTimeString());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Persist state changes whenever rawData or processedData is mutated
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const snapshot = saveWarehouseState(rawData, processedData, true);
    setLastSyncTime(new Date(snapshot.updatedAt).toLocaleTimeString());
  }, [rawData, processedData]);

  const handleResetWarehouse = () => {
    if (window.confirm('Reset data warehouse to initial factory mock seeds? Any imported CSV loans or remediations will be reset.')) {
      const resetSnapshot = resetWarehouseToFactory();
      setRawData(resetSnapshot.rawData);
      setProcessedData(resetSnapshot.processedData);
      setLastSyncTime(new Date(resetSnapshot.updatedAt).toLocaleTimeString());
    }
  };

  const handleExportWarehouse = () => {
    const jsonStr = exportWarehouseSnapshotJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `berhane_warehouse_snapshot_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const handleImportWarehouseFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = importWarehouseSnapshotJson(content);
        setRawData(imported.rawData);
        setProcessedData(imported.processedData);
        setLastSyncTime(new Date(imported.updatedAt).toLocaleTimeString());
        alert(`Warehouse snapshot imported successfully! Loaded ${imported.rawData.length} raw loans and ${imported.processedData.length} ledger assets.`);
      } catch (err: any) {
        alert(`Failed to import warehouse snapshot: ${err.message || 'Invalid format'}`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard ledgerData={processedData} rawData={rawData} onNavigate={setActiveTab} />;
      case 'copilot':
        return <GeminiChatbot ledgerData={processedData} />;
      case 'blueprint':
        return <SystemBlueprint />;
      case 'ingestion':
        return <IngestionSimulator rawData={rawData} setRawData={setRawData} />;
      case 'causal_engine':
        return <CausalEngine />;
      case 'alphagate':
        return (
          <AlphaGateLogic 
            rawData={rawData} 
            processedData={processedData} 
            setProcessedData={setProcessedData} 
          />
        );
      case 'warehouse':
        return <LedgerView data={processedData} rawLoans={rawData} />;
      case 'securitization':
        return <LedgerView data={processedData} isMartView={true} rawLoans={rawData} />;
      case 'governance':
        return <GovernanceConsole />;
      default:
        return <Dashboard ledgerData={processedData} rawData={rawData} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-berhane-900 text-slate-200 overflow-hidden font-sans selection:bg-berhane-accent selection:text-white relative">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800/40 via-berhane-900 to-berhane-900">
        <div className="h-full p-8 max-w-7xl mx-auto flex flex-col">
          {/* Top Demo & Warehouse Synchronicity Status Bar */}
          <div className="mb-4 space-y-2 shrink-0">
            <div className="px-3.5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/25 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-300 font-mono">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span><strong>DEMO SIMULATION:</strong> This is a demonstration app with synthetic mock data. Not real financial records or live market assets.</span>
              </span>
              <span className="text-[10px] text-amber-400/80 font-bold uppercase hidden sm:inline">V9.1.0-beta Sandbox</span>
            </div>

            {/* Warehouse State Persistence & Synchronicity Bar */}
            <div className="px-3.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 font-mono">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold text-white">Warehouse Persistence:</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                    Indexed Local Cache Synced
                  </span>
                </div>
                <span className="text-slate-500 hidden md:inline">|</span>
                <span className="text-slate-400 text-[11px] hidden md:inline">
                  {rawData.length} Raw Loans &bull; {processedData.length} Processed Ledger Items
                  {lastSyncTime && <span className="text-slate-500"> (synced {lastSyncTime})</span>}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportWarehouse}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors border border-slate-700"
                  title="Export warehouse snapshot to JSON file"
                >
                  {copiedExport ? <Check className="w-3 h-3 text-emerald-400" /> : <Download className="w-3 h-3 text-slate-400" />}
                  <span>{copiedExport ? 'Exported' : 'Export Snapshot'}</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors border border-slate-700"
                  title="Import warehouse snapshot from JSON file"
                >
                  <Upload className="w-3 h-3 text-slate-400" />
                  <span>Import Snapshot</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportWarehouseFile}
                  accept=".json"
                  className="hidden"
                />

                <button
                  onClick={handleResetWarehouse}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-[11px] transition-colors border border-rose-900/50"
                  title="Reset warehouse to default mock seeds"
                >
                  <RotateCcw className="w-3 h-3 text-rose-400" />
                  <span>Factory Reset</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Floating Copilot Launcher when on other tabs */}
      {activeTab !== 'copilot' && (
        <button
          onClick={() => setActiveTab('copilot')}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-4 py-3 rounded-full shadow-xl shadow-sky-900/40 flex items-center space-x-2.5 transition-all transform hover:scale-105 group border border-sky-400/30"
          title="Open Gemini Sovereign Copilot"
        >
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
          <span className="font-semibold text-sm tracking-tight pr-1">Gemini Copilot</span>
          <span className="bg-white/20 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full">
            AI
          </span>
        </button>
      )}
    </div>
  );
}

export default App;
