import React, { useState, useMemo } from 'react';
import { AssetLedgerItem, RawLoan } from '../types';
import { STATUS_COLORS } from '../constants';
import { Check, Search, Filter, AlertCircle, FileText, Droplet, ChevronDown, Download, FileSpreadsheet, X, Building2, User } from 'lucide-react';

interface LedgerViewProps {
  data: AssetLedgerItem[];
  isMartView?: boolean; // Reuses component for the "Mart" view which is filtered
  rawLoans?: RawLoan[];
}

export const LedgerView: React.FC<LedgerViewProps> = ({ data, isMartView = false, rawLoans = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Create a fast lookup map from raw loans to borrower/applicant names
  const loanBorrowerMap = useMemo(() => {
    const map = new Map<string, string>();
    if (rawLoans && rawLoans.length > 0) {
      rawLoans.forEach(loan => {
        if (loan.applicant_name) {
          map.set(loan.loan_id, loan.applicant_name);
        }
      });
    }
    return map;
  }, [rawLoans]);

  const getBorrowerName = (item: AssetLedgerItem): string => {
    return item.borrower_name || item.applicant_name || loanBorrowerMap.get(item.loan_id) || 'Enterprise Borrower';
  };

  // If Mart View, only show compliant and minted. If Warehouse View, show all.
  const displayData = useMemo(() => {
    return isMartView 
      ? data.filter(d => d.is_alpha_compliant && d.dlt_mint_status === 'MINTED')
      : data;
  }, [data, isMartView]);

  // Real-time filtering by borrower name, loan ID, or asset UUID
  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return displayData.filter(item => {
      const borrower = getBorrowerName(item).toLowerCase();
      const loanId = (item.loan_id || '').toLowerCase();
      const assetUuid = (item.asset_uuid || '').toLowerCase();

      const matchesSearch = !term || 
        borrower.includes(term) || 
        loanId.includes(term) || 
        assetUuid.includes(term);
      
      const matchesStatus = statusFilter === 'ALL' || item.settlement_status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [displayData, searchTerm, statusFilter, loanBorrowerMap]);

  const exportToCSV = (exportDataset: AssetLedgerItem[], labelSuffix: string = '') => {
    if (!exportDataset || exportDataset.length === 0) return;

    const escapeCsv = (val: any): string => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = [
      'Asset UUID',
      'Loan Reference ID',
      'Borrower / Applicant Name',
      'CR-Score (Berhane)',
      'IMM Uplift',
      'Alpha Gate Compliant',
      'SFDR Article 9 Ready',
      'Provisioning Cost Reduction (%)',
      'Securitization Denomination',
      'DLT Mint Status',
      'Settlement Status',
      'DLT Transaction Hash',
      'Processed Timestamp'
    ];

    const rows = exportDataset.map(item => [
      escapeCsv(item.asset_uuid),
      escapeCsv(item.loan_id),
      escapeCsv(getBorrowerName(item)),
      escapeCsv(item.berhane_score.toFixed(2)),
      escapeCsv(item.imm_uplift.toFixed(2)),
      escapeCsv(item.is_alpha_compliant ? 'TRUE' : 'FALSE'),
      escapeCsv(item.is_sfdr_article9_ready ? 'TRUE' : 'FALSE'),
      escapeCsv(item.provisioning_cost_reduction_pct.toFixed(2)),
      escapeCsv(item.securitization_denomination),
      escapeCsv(item.dlt_mint_status),
      escapeCsv(item.settlement_status),
      escapeCsv(item.dlt_txn_hash || 'N/A'),
      escapeCsv(item.processed_timestamp)
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${isMartView ? 'securitization_ready_pool' : 'berhane_asset_ledger'}${labelSuffix ? `_${labelSuffix}` : ''}_${timestamp}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(`Exported ${exportDataset.length} records`);
    setShowExportMenu(false);
    setTimeout(() => {
      setDownloadSuccess(null);
    }, 3000);
  };

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {isMartView ? 'Securitization Data Mart' : 'Asset Ledger (Phase IV)'}
          </h2>
          <p className="text-slate-400 text-sm font-mono">
            {isMartView ? 'BERHANE_DATA_MARTS.securitization_ready_pool' : 'BERHANE_DATA_WAREHOUSE.securitization_asset_ledger'}
          </p>
        </div>

        {/* CSV Export Action Button */}
        <div className="relative">
          <div className="flex items-center rounded-lg shadow-sm border border-slate-700 bg-slate-900 overflow-visible">
            <button
              onClick={() => exportToCSV(filteredData, filteredData.length === displayData.length ? 'all' : 'filtered')}
              disabled={filteredData.length === 0}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-l-lg transition-all ${
                downloadSuccess
                  ? 'bg-emerald-500/20 text-emerald-300 border-r border-emerald-500/30'
                  : filteredData.length === 0
                  ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed border-r border-slate-700'
                  : 'bg-berhane-accent/15 hover:bg-berhane-accent/25 text-berhane-accent border-r border-slate-700 active:scale-95'
              }`}
              title="Download currently filtered records as CSV"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 animate-in zoom-in" />
                  <span>{downloadSuccess}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export CSV ({filteredData.length})</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-2 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-r-lg transition-colors"
              title="Export options"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Export Dropdown Options */}
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-30 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 border-b border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">CSV Export Options</span>
              </div>
              <button
                type="button"
                onClick={() => exportToCSV(filteredData, 'filtered')}
                disabled={filteredData.length === 0}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-berhane-accent" />
                  <span>Export Filtered View</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{filteredData.length} records</span>
              </button>
              <button
                type="button"
                onClick={() => exportToCSV(displayData, 'full')}
                disabled={displayData.length === 0}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Export Full Dataset</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{displayData.length} records</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar & Real-Time Search */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search by borrower name or loan ID (e.g. Abyssinia, Awash, LN-)..." 
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg py-2.5 pl-10 pr-9 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-berhane-accent focus:ring-1 focus:ring-berhane-accent transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Settlement Status Filter */}
          <div className="relative sm:w-56 shrink-0">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Filter className="w-4 h-4 text-slate-500" />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-slate-900 border border-slate-700/80 rounded-lg py-2.5 pl-10 pr-9 text-sm text-slate-300 focus:outline-none focus:border-berhane-accent cursor-pointer hover:bg-slate-800 transition-colors shadow-inner"
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

        {/* Real-time Search Status and Match Counter Bar */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 px-1 pt-1">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-white font-mono">{filteredData.length}</strong> of{' '}
              <span className="font-mono">{displayData.length}</span> records
            </span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-berhane-accent/10 border border-berhane-accent/25 text-berhane-accent text-[11px]">
                <span>Filter: &ldquo;{searchTerm}&rdquo;</span>
                <button
                  onClick={() => setSearchTerm('')}
                  className="hover:text-white transition-colors"
                  title="Remove query"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {statusFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
                <span>Status: {statusFilter}</span>
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className="hover:text-white transition-colors"
                  title="Reset status"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
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
                <th className="p-4 text-xs font-semibold text-slate-500 font-mono border-b border-slate-800">BORROWER</th>
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
                  <td colSpan={isMartView ? 7 : 8} className="p-12 text-center text-slate-500">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="text-sm text-slate-300 font-medium">
                        No synthetic assets matched your search
                      </p>
                      {searchTerm ? (
                        <p className="text-xs text-slate-400">
                          No records found matching borrower or loan ID &ldquo;{searchTerm}&rdquo;. Try clearing or refining your query.
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400">
                          No records found for current filter criteria.
                        </p>
                      )}
                      {(searchTerm || statusFilter !== 'ALL') && (
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('ALL');
                          }}
                          className="mt-2 text-xs text-berhane-accent hover:underline font-mono"
                        >
                          Reset filters & show all assets
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => {
                  const borrowerName = getBorrowerName(item);
                  return (
                    <tr key={item.asset_uuid} className="hover:bg-slate-800/50 transition-colors group">
                      <td className="p-4 text-xs font-mono text-slate-400 group-hover:text-white transition-colors">
                        {item.asset_uuid.substring(0, 12)}...
                      </td>
                      <td className="p-4 text-sm text-berhane-accent font-mono font-medium">{item.loan_id}</td>
                      <td className="p-4 text-sm text-slate-200">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-berhane-accent transition-colors">
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-medium text-slate-200 group-hover:text-white transition-colors truncate max-w-[170px]" title={borrowerName}>
                            {borrowerName}
                          </span>
                        </div>
                      </td>
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
                  );
                })
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