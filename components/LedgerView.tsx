import React, { useState } from 'react';
import { AssetLedgerItem } from '../types';
import { STATUS_COLORS } from '../constants';
import { Check, Search, Filter, AlertCircle, FileText, Droplet, ChevronDown } from 'lucide-react';

interface LedgerViewProps {
  data: AssetLedgerItem[];
  isMartView?: boolean; // Reuses component for the "Mart" view which is filtered
}

export const LedgerView: React.FC<LedgerViewProps> = ({ data, isMartView = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // If Mart View, only show compliant and minted. If Warehouse View, show all.
  const displayData = isMartView 
    ? data.filter(d => d.is_alpha_compliant && d.dlt_mint_status === 'MINTED')
    : data;

  const filteredData = displayData.filter(item => {
    const matchesSearch = item.loan_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.asset_uuid.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || item.settlement_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {isMartView ? 'Securitization Data Mart' : 'Asset Ledger (Phase IV)'}
          </h2>
          <p className="text-slate-400 text-sm font-mono">
            {isMartView ? 'BERHANE_DATA_MARTS.securitization_ready_pool' : 'BERHANE_DATA_WAREHOUSE.securitization_asset_ledger'}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
                type="text" 
                placeholder="Search by Loan ID or Asset UUID..." 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-berhane-accent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        
        {/* Settlement Status Filter */}
        <div className="relative">
             <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="w-4 h-4 text-slate-500" />
             </div>
             <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-10 text-sm text-slate-300 focus:outline-none focus:border-berhane-accent cursor-pointer hover:bg-slate-800 transition-colors h-full"
             >
                 <option value="ALL">All Statuses</option>
                 <option value="PENDING">Pending</option>
                 <option value="SETTLED">Settled</option>
                 <option value="LIQUIDITY_CRUNCH">Liquidity Crunch (Risk)</option>
                 <option value="INJECTED_SETTLEMENT">Injected (Forced)</option>
                 <option value="NOT_APPLICABLE">Not Applicable</option>
             </select>
             <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-slate-500" />
             </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl flex-1 flex flex-col overflow-hidden shadow-xl">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950 sticky top-0 z-10">
              <tr>
                <th className="p-4 text-xs font-semibold text-slate-500 font-mono border-b border-slate-800">ASSET_UUID</th>
                <th className="p-4 text-xs font-semibold text-slate-500 font-mono border-b border-slate-800">LOAN_REF</th>
                <th className="p-4 text-xs font-semibold text-slate-500 font-mono border-b border-slate-800 text-right">CR_SCORE</th>
                <th className="p-4 text-xs font-semibold text-slate-500 font-mono border-b border-slate-800 text-center">ARTICLE_9</th>
                <th className="p-4 text-xs font-semibold text-slate-500 font-mono border-b border-slate-800 text-center">DLT_STATUS</th>
                <th className="p-4 text-xs font-semibold text-slate-500 font-mono border-b border-slate-800 text-center">SETTLEMENT</th>
                {!isMartView && <th className="p-4 text-xs font-semibold text-slate-500 font-mono border-b border-slate-800">TX_HASH</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                    No records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.asset_uuid} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="p-4 text-xs font-mono text-slate-400 group-hover:text-white transition-colors">
                        {item.asset_uuid.substring(0, 12)}...
                    </td>
                    <td className="p-4 text-sm text-berhane-accent font-mono">{item.loan_id}</td>
                    <td className="p-4 text-sm font-mono text-right">
                        <span className={`font-bold ${item.berhane_score >= 9.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {item.berhane_score.toFixed(2)}
                        </span>
                    </td>
                    <td className="p-4 text-center">
                        {item.is_sfdr_article9_ready ? (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10">
                                <Check className="w-4 h-4 text-emerald-500" />
                            </div>
                        ) : (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-800">
                                <span className="text-slate-600 text-xs">-</span>
                            </div>
                        )}
                    </td>
                    <td className="p-4 text-center">
                         <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold tracking-wider ${STATUS_COLORS[item.dlt_mint_status]}`}>
                            {item.dlt_mint_status}
                         </span>
                    </td>
                    <td className="p-4 text-center">
                        {item.settlement_status === 'SETTLED' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-900/30 text-sky-400 border border-sky-900/50">
                                <Check className="w-3 h-3" /> SETTLED
                            </span>
                        ) : item.settlement_status === 'INJECTED_SETTLEMENT' ? (
                             <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-900/30 text-indigo-400 border border-indigo-900/50">
                                <Droplet className="w-3 h-3" /> FORCED
                            </span>
                        ) : item.settlement_status === 'LIQUIDITY_CRUNCH' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-900/30 text-rose-400 border border-rose-900/50 animate-pulse">
                                <AlertCircle className="w-3 h-3" /> CRUNCH
                            </span>
                        ) : item.settlement_status === 'PENDING' ? (
                            <span className="text-slate-500 text-[10px] font-mono">PENDING</span>
                        ) : (
                            <span className="text-slate-600 text-[10px]">-</span>
                        )}
                    </td>
                    {!isMartView && (
                        <td className="p-4 text-xs font-mono text-slate-600 truncate max-w-[150px]">
                            {item.dlt_txn_hash ? item.dlt_txn_hash : '-'}
                        </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {isMartView && (
          <div className="bg-berhane-gold/10 border border-berhane-gold/30 rounded-lg p-4 flex items-start gap-3">
              <FileText className="w-5 h-5 text-berhane-gold mt-0.5" />
              <div>
                  <h4 className="text-sm font-bold text-berhane-gold">Ready for Term Sheet Generation</h4>
                  <p className="text-xs text-slate-400 mt-1">
                      This view represents the <code>securitization_ready_pool</code>. Only assets that have passed the Alpha Gate and have been successfully minted on-chain are visible here. This dataset feeds directly into the Securitization Term Sheet model.
                  </p>
              </div>
          </div>
      )}
    </div>
  );
};