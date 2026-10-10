import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { IngestionSimulator } from './components/IngestionSimulator';
import { AlphaGateLogic } from './components/AlphaGateLogic';
import { LedgerView } from './components/LedgerView';
import { CausalEngine } from './components/CausalEngine';
import { GovernanceConsole } from './components/GovernanceConsole';
import { SystemBlueprint } from './components/SystemBlueprint';
import { GeminiChatbot } from './components/GeminiChatbot';
import { generateMockRawLoans, processBatch } from './services/dataService';
import { RawLoan, AssetLedgerItem } from './types';
import { Sparkles } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Central State for the Data Warehouse simulation
  const [rawData, setRawData] = useState<RawLoan[]>([]);
  const [processedData, setProcessedData] = useState<AssetLedgerItem[]>([]);

  // Initialize with some mock data on mount
  useEffect(() => {
    const initialRaw = generateMockRawLoans(8);
    setRawData(initialRaw);
    // Process half of them initially to show some data in dashboard
    const initialProcessed = processBatch(initialRaw.slice(0, 4));
    setProcessedData(initialProcessed);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard ledgerData={processedData} />;
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
        return <LedgerView data={processedData} />;
      case 'securitization':
        return <LedgerView data={processedData} isMartView={true} />;
      case 'governance':
        return <GovernanceConsole />;
      default:
        return <Dashboard ledgerData={processedData} />;
    }
  };

  return (
    <div className="flex h-screen bg-berhane-900 text-slate-200 overflow-hidden font-sans selection:bg-berhane-accent selection:text-white relative">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800/40 via-berhane-900 to-berhane-900">
        <div className="h-full p-8 max-w-7xl mx-auto flex flex-col">
          <div className="mb-4 px-3.5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs text-amber-300 font-mono shrink-0">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span><strong>DEMO SIMULATION:</strong> This is a demonstration app with synthetic mock data. Not real financial records or live market assets.</span>
            </span>
            <span className="text-[10px] text-amber-400/80 font-bold uppercase hidden sm:inline">V9.1.0-beta Sandbox</span>
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
