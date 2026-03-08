import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { IngestionSimulator } from './components/IngestionSimulator';
import { AlphaGateLogic } from './components/AlphaGateLogic';
import { LedgerView } from './components/LedgerView';
import { CausalEngine } from './components/CausalEngine';
import { GovernanceConsole } from './components/GovernanceConsole';
import { SystemBlueprint } from './components/SystemBlueprint';
import { generateMockRawLoans, processBatch } from './services/dataService';
import { RawLoan, AssetLedgerItem } from './types';

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
    <div className="flex h-screen bg-berhane-900 text-slate-200 overflow-hidden font-sans selection:bg-berhane-accent selection:text-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800/40 via-berhane-900 to-berhane-900">
        <div className="h-full p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
