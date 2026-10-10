import React, { useState, useEffect } from 'react';
import { 
  Play, RotateCcw, Clock, ArrowRight, DollarSign, CheckCircle2, 
  Terminal, Hash, Copy, Check, Users, ShieldCheck, Database 
} from 'lucide-react';
import { 
  getCurrentAuctionState, advanceAuctionState, submitBid, 
  finalizeAuction, resetAuction, subscribeAuctionState 
} from '../../services/dataService';
import { AuctionState, AuctionWindow } from '../../types';

export const BlueprintAuctionEngine: React.FC = () => {
  const [auctionState, setAuctionState] = useState<AuctionWindow | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [simMessage, setSimMessage] = useState('Simulation Ready. Initial State: PREPARATION');
  const [copiedHash, setCopiedHash] = useState(false);

  const refreshState = async () => {
    const state = await getCurrentAuctionState();
    setAuctionState(state);
  };

  useEffect(() => {
    refreshState();
    // Subscribe to multi-tab synchronized auction updates
    const unsubscribe = subscribeAuctionState((updated) => {
      setAuctionState(updated);
    });
    const interval = setInterval(refreshState, 2500);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleAdvanceState = async () => {
    setIsProcessing(true);
    setSimMessage('Advancing TimeWindowController state with concurrency check...');
    try {
      const newState = await advanceAuctionState(auctionState?.version);
      setSimMessage(`State Transitioned to: ${newState.state} (v${newState.version})`);
      if (newState.state === AuctionState.FINALIZED) {
        setSimMessage(`Auto-Finalization Triggered. UCP: ${newState.clearingPrice} | Hash: ${newState.settlementHash?.substring(0, 8)}...`);
      }
    } catch (e: any) {
      setSimMessage(`Error: ${e.message}`);
    }
    await refreshState();
    setIsProcessing(false);
  };

  const handleSubmitMockBid = async () => {
    setIsProcessing(true);
    try {
      const price = 95 + Math.floor(Math.random() * 10);
      const vol = 100 + Math.floor(Math.random() * 1000);
      await submitBid(`Investor-${Math.floor(Math.random() * 100)}`, vol, price, auctionState?.version);
      setSimMessage(`Bid Accepted: ${vol} units @ ${price} ETB (Concurrency Verified)`);
    } catch (e: any) {
      setSimMessage(`Bid Rejected: ${e.message}`);
    }
    await refreshState();
    setIsProcessing(false);
  };

  const handleFinalize = async () => {
    setIsProcessing(true);
    try {
      const result = await finalizeAuction();
      setSimMessage(`Auction Finalized. UCP: ${result.clearingPrice} | Hash: ${result.settlementHash.substring(0, 8)}...`);
    } catch (e: any) {
      setSimMessage(`Finalization Failed: ${e.message}`);
    }
    await refreshState();
    setIsProcessing(false);
  };

  const handleReset = async () => {
    setIsProcessing(true);
    await resetAuction();
    setSimMessage('Simulation Reset. State: PREPARATION');
    await refreshState();
    setIsProcessing(false);
  };

  const handleCopyHash = () => {
    if (auctionState?.settlementHash) {
      navigator.clipboard.writeText(auctionState.settlementHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const getStatusColor = (state?: AuctionState) => {
    switch (state) {
      case AuctionState.PREPARATION: return 'text-slate-400';
      case AuctionState.OPEN: return 'text-emerald-400';
      case AuctionState.CLOSED: return 'text-amber-400';
      case AuctionState.FINALIZED: return 'text-berhane-accent';
      default: return 'text-slate-500';
    }
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Terminal className="w-24 h-24 text-berhane-accent" />
      </div>
      
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Play className="text-berhane-accent w-5 h-5" /> 15. Live Auction Simulation Console (V9.1.0 Kernel)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized E-PSM order book with optimistic concurrency locking & deterministic clearing
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-black/40 border border-slate-700 px-3 py-1 rounded text-xs font-mono text-slate-300 flex items-center gap-2">
            <span>ID: {auctionState?.auctionId || '---'}</span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-purple-400">v{auctionState?.version || 1}</span>
            {auctionState?.lastModifiedByTab && (
              <span className="text-[10px] text-slate-500 hidden sm:inline">[{auctionState.lastModifiedByTab}]</span>
            )}
          </div>
          <button 
            onClick={handleReset}
            className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Left Col: Controls & Status */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-6">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase mb-2">Auction State Monitor</div>
            <div className="flex items-center gap-3">
              <div className={`text-2xl font-bold font-mono ${getStatusColor(auctionState?.state)}`}>
                {auctionState?.state || 'LOADING'}
              </div>
              {auctionState?.state === AuctionState.OPEN && (
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
              <span className="px-2 py-0.5 rounded border border-slate-700 bg-slate-900 text-[9px] text-slate-400 font-mono">
                Gated by TimeWindowController.sol
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono flex items-center gap-2">
              <span>Window: +48h Duration</span>
              <span>&bull;</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Database className="w-3 h-3" /> Cross-Tab Synced
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={handleAdvanceState}
              disabled={isProcessing || auctionState?.state === AuctionState.FINALIZED}
              className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg font-bold text-sm transition-all relative"
            >
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-sky-400"/> Advance Time</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </button>

            <button 
              onClick={handleSubmitMockBid}
              disabled={isProcessing || auctionState?.state !== AuctionState.OPEN}
              className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg font-bold text-sm transition-all"
            >
              <span className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-400"/> Submit Blind Bid</span>
              <span className="text-xs text-slate-500 font-mono">QIB Gate</span>
            </button>

            <button 
              onClick={handleFinalize}
              disabled={isProcessing || auctionState?.state !== AuctionState.CLOSED}
              className="w-full flex items-center justify-between bg-berhane-accent hover:bg-sky-500 disabled:opacity-50 text-white px-4 py-3 rounded-lg font-bold text-sm transition-all shadow-lg shadow-sky-900/20"
            >
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-white"/> Run Clearing (UCP)</span>
              <span className="text-xs text-white/70 font-mono">FMI L9</span>
            </button>
          </div>

          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs font-mono text-slate-400">
            <div className="text-slate-500 uppercase text-[10px] mb-1 font-bold">Simulator Feed</div>
            <div className="text-white break-words">{simMessage}</div>
          </div>
        </div>

        {/* Mid Col: Order Book / Bids Monitor */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div className="text-xs font-bold text-slate-500 uppercase">Order Book (Encrypted State)</div>
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-mono text-slate-300">{auctionState?.bids.length || 0} Bids Logged</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[280px] space-y-2 pr-1 custom-scrollbar">
            {(!auctionState?.bids || auctionState.bids.length === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs italic py-8">
                No bids submitted. Advance to OPEN to accept institutional bids.
              </div>
            ) : (
              auctionState.bids.map((bid, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-900 p-2.5 rounded border border-slate-800/80 text-xs font-mono">
                  <div>
                    <span className="text-slate-300 font-bold">{bid.investorId}</span>
                    <span className="text-[10px] text-slate-500 block">{new Date(bid.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white">{bid.volume} units</span>
                    <span className="text-emerald-400 block font-bold">@ {bid.price} ETB</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-400 font-mono">
            <span>Target Supply:</span>
            <span className="text-white font-bold">{auctionState?.supply.toLocaleString()} units</span>
          </div>
        </div>

        {/* Right Col: Clearing Outcome & Settlement Intent */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase mb-4">Clearing Results (UCP Engine)</div>

            <div className="space-y-4">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400">Uniform Clearing Price</span>
                <span className="text-lg font-bold font-mono text-berhane-accent">
                  {auctionState?.clearingPrice ? `${auctionState.clearingPrice} ETB` : '---'}
                </span>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400">Total Allocations</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {auctionState?.allocations ? `${auctionState.allocations.length} Trades` : '---'}
                </span>
              </div>

              {/* Settlement Intent Hash Display */}
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-slate-500 uppercase font-mono font-bold flex items-center gap-1">
                    <Hash className="w-3 h-3 text-berhane-accent" /> Settlement Intent Hash
                  </span>
                  {auctionState?.settlementHash && (
                    <button 
                      onClick={handleCopyHash}
                      className="text-slate-400 hover:text-white transition-colors p-1"
                      title="Copy Hash"
                    >
                      {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
                <div className="font-mono text-[11px] text-slate-300 break-all select-all">
                  {auctionState?.settlementHash || 'Awaiting Finalization...'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Deterministic DvP settlement intent generated for CSD gateway.</span>
          </div>
        </div>
      </div>
    </section>
  );
};
