import React from 'react';
import { Settings, History, CheckCircle2, RefreshCw, Save, X, PenLine, Activity, ArrowRight } from 'lucide-react';
import { GovernanceParameter, GovernanceHistoryEvent } from '../../types';

interface GovernanceParametersRegistryProps {
  parameters: GovernanceParameter[];
  editingParam: string | null;
  editValue: string;
  updatingParam: boolean;
  showHistory: boolean;
  paramHistory: GovernanceHistoryEvent[];
  onToggleHistory: () => void;
  onStartEdit: (param: GovernanceParameter) => void;
  onCancelEdit: () => void;
  onSaveParam: (key: string) => void;
  onChangeEditValue: (val: string) => void;
}

export const GovernanceParametersRegistry: React.FC<GovernanceParametersRegistryProps> = ({
  parameters,
  editingParam,
  editValue,
  updatingParam,
  showHistory,
  paramHistory,
  onToggleHistory,
  onStartEdit,
  onCancelEdit,
  onSaveParam,
  onChangeEditValue,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden min-h-[300px] lg:col-span-2">
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-berhane-gold" />
          <h3 className="font-bold text-slate-200">Parameter Governance Registry ("Living Law")</h3>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleHistory}
            className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${showHistory ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <History className="w-3 h-3" />
            {showHistory ? 'Hide Audit Log' : 'Audit Log'}
          </button>
          <div className="px-2 py-0.5 bg-berhane-gold/10 text-berhane-gold text-[10px] font-bold rounded border border-berhane-gold/20 flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3" /> V9.0.0 ACTIVE
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-0 grid grid-cols-1 lg:grid-cols-3">
        {/* Main Registry Table */}
        <div className={`lg:col-span-2 p-4 bg-slate-900/50 overflow-x-auto ${showHistory ? 'border-r border-slate-800' : 'lg:col-span-3'}`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase text-slate-500 border-b border-slate-800">
                <th className="py-2 pl-2">Parameter Key</th>
                <th className="py-2">Value</th>
                <th className="py-2">Description</th>
                <th className="py-2 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {parameters.map((param) => (
                <tr key={param.key} className="group hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 pl-2">
                    <div className="text-xs font-bold text-berhane-gold font-mono">{param.key}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">type: {param.solidity_type}</div>
                  </td>
                  <td className="py-4">
                    {editingParam === param.key ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={editValue}
                          onChange={(e) => onChangeEditValue(e.target.value)}
                          className="bg-slate-950 border border-slate-600 rounded px-2 py-1 text-xs text-white w-20 font-mono focus:border-berhane-gold focus:outline-none"
                        />
                        <span className="text-xs text-slate-500 font-mono">{param.unit}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-mono">{param.value}</span>
                        <span className="text-xs text-slate-500 font-mono">{param.unit}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-4">
                    <div className="text-xs text-slate-400">{param.description}</div>
                    <div className="text-[9px] text-slate-600 mt-1">Updated: {new Date(param.last_updated).toLocaleString()}</div>
                  </td>
                  <td className="py-4 text-right pr-2">
                    {editingParam === param.key ? (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => onSaveParam(param.key)}
                          disabled={updatingParam}
                          className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors"
                          title="Execute Governance TX"
                        >
                          {updatingParam ? <RefreshCw className="w-3 h-3 animate-spin"/> : <Save className="w-3 h-3"/>}
                        </button>
                        <button 
                          onClick={onCancelEdit}
                          disabled={updatingParam}
                          className="p-1.5 bg-slate-800 text-slate-400 rounded hover:bg-slate-700 border border-slate-600 transition-colors"
                          title="Cancel"
                        >
                          <X className="w-3 h-3"/>
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => onStartEdit(param)}
                        className="p-1.5 bg-slate-800 text-slate-400 rounded hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors opacity-0 group-hover:opacity-100"
                        title="Propose Change"
                      >
                        <PenLine className="w-3 h-3"/>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 p-3 bg-berhane-gold/5 rounded border border-berhane-gold/10 flex items-start gap-2">
            <Activity className="w-4 h-4 text-berhane-gold mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-berhane-gold">Hot-Swappable Logic Active</h4>
              <p className="text-[10px] text-slate-400 mt-1">
                Changes committed here are immediately reflected in the <code>BTLF_Protocol.sol</code> and Alpha Gate logic. This decouples risk parameters from core contract logic, enabling rapid response to Moat 5 inputs.
              </p>
            </div>
          </div>
        </div>

        {/* Audit Log Sidebar */}
        {showHistory && (
          <div className="lg:col-span-1 bg-slate-950 p-4 border-l border-slate-800 overflow-y-auto max-h-[350px] animate-in slide-in-from-right-4">
            <div className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
              <History className="w-3 h-3" /> Recent Updates
            </div>
            {paramHistory.length === 0 ? (
              <div className="text-center text-[10px] text-slate-600 italic">No history available.</div>
            ) : (
              <div className="space-y-3 relative">
                <div className="absolute top-2 bottom-2 left-1.5 w-px bg-slate-800"></div>
                {paramHistory.map((event) => (
                  <div key={event.id} className="relative pl-5">
                    <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-slate-900 border border-slate-600 z-10"></div>
                    <div className="text-[10px] text-slate-500 font-mono mb-0.5">{new Date(event.timestamp).toLocaleString()}</div>
                    <div className="bg-slate-900 border border-slate-800 p-2 rounded hover:border-slate-700 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-white font-mono">{event.key}</span>
                        <span className="text-[9px] text-slate-500 font-mono">{event.user}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-slate-500 line-through">{event.oldValue}</span>
                        <ArrowRight className="w-3 h-3 text-slate-600" />
                        <span className="text-berhane-gold font-bold">{event.newValue}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
