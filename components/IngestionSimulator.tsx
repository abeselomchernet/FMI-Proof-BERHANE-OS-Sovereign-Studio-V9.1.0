import React, { useState } from 'react';
import { RawLoan, RegulatoryChunk } from '../types';
import { FileUp, Database, Plus, RefreshCw, FileText, Scissors, Tag, ShieldAlert, BookOpen, Lock, Link as LinkIcon, Eye, Zap, Server } from 'lucide-react';
import { generateMockRawLoans, generateMockRegulatoryChunks } from '../services/dataService';

interface IngestionSimulatorProps {
  rawData: RawLoan[];
  setRawData: (data: RawLoan[]) => void;
}

export const IngestionSimulator: React.FC<IngestionSimulatorProps> = ({ rawData, setRawData }) => {
  const [activeMode, setActiveMode] = useState<'financial' | 'regulatory'>('financial');
  const [isUploading, setIsUploading] = useState(false);
  
  // State for Regulatory Ingestion Simulation
  const [regChunks, setRegChunks] = useState<RegulatoryChunk[]>([]);

  const handleSimulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      if (activeMode === 'financial') {
        const newBatch = generateMockRawLoans(5);
        setRawData([...rawData, ...newBatch]);
      } else {
        const newChunks = generateMockRegulatoryChunks();
        setRegChunks([...regChunks, ...newChunks]);
      }
      setIsUploading(false);
    }, 1500); // Simulated processing delay
  };

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Ingestion & Knowledge (Phase I)</h2>
          <p className="text-slate-400 text-sm">Unified ingestion pipeline for Financial Structured Data and Regulatory Unstructured Data.</p>
        </div>
        
        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
          <button 
            onClick={() => setActiveMode('financial')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeMode === 'financial' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Financial (CSV)
          </button>
          <button 
            onClick={() => setActiveMode('regulatory')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeMode === 'regulatory' ? 'bg-berhane-accent/20 text-berhane-accent shadow border border-berhane-accent/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Regulatory (PDF)
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-end">
         <button 
          onClick={handleSimulateUpload}
          disabled={isUploading}
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors font-medium shadow-lg ${
            activeMode === 'financial' 
              ? 'bg-berhane-accent hover:bg-sky-400 text-white shadow-sky-900/20'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
          } disabled:opacity-50`}
        >
          {isUploading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : activeMode === 'financial' ? (
            <FileUp className="w-4 h-4" />
          ) : (
            <BookOpen className="w-4 h-4" />
          )}
          <span>
            {isUploading 
              ? (activeMode === 'financial' ? 'Ingesting Batch...' : 'Chunking & Tagging...') 
              : (activeMode === 'financial' ? 'Upload Batch CSV' : 'Ingest Regulatory PDF')
            }
          </span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl flex-1 flex flex-col overflow-hidden">
        
        {activeMode === 'financial' ? (
          // --- FINANCIAL DATA VIEW (Existing) ---
          <>
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <div className="flex items-center space-x-2 text-slate-300">
                    <Database className="w-4 h-4 text-berhane-accent" />
                    <span className="font-mono text-sm font-bold">BERHANE_DATA_WAREHOUSE.raw_loan_book</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">{rawData.length} records</span>
            </div>
            
            <div className="overflow-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950 sticky top-0 z-10">
                  <tr>
                    <th className="p-4 text-xs font-semibold text-slate-500 font-mono border-b border-slate-800">LOAN_ID</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 font-mono border-b border-slate-800">APPLICANT</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 font-mono border-b border-slate-800 text-right">VALUE (ETB)</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 font-mono border-b border-slate-800 text-center">TRAD_SCORE</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 font-mono border-b border-slate-800">UPLOADED_AT</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 font-mono border-b border-slate-800">SOURCE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {rawData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                        No raw data found. Upload a batch to begin.
                      </td>
                    </tr>
                  ) : (
                    rawData.slice().reverse().map((loan) => (
                      <tr key={loan.loan_id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-4 text-sm font-mono text-berhane-accent">{loan.loan_id}</td>
                        <td className="p-4 text-sm text-slate-300">{loan.applicant_name}</td>
                        <td className="p-4 text-sm text-slate-300 font-mono text-right">
                          {loan.value_etb.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-sm text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                                loan.trad_score < 5 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700 text-slate-300'
                            }`}>
                                {loan.trad_score}
                            </span>
                        </td>
                        <td className="p-4 text-xs text-slate-500 font-mono">
                            {new Date(loan.uploaded_at).toLocaleString()}
                        </td>
                        <td className="p-4 text-xs text-slate-500 truncate max-w-[150px]">
                            {loan.source_file_name}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          // --- REGULATORY KNOWLEDGE VIEW (Updated Phase IV) ---
          <>
             <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <div className="flex items-center space-x-2 text-slate-300">
                    <Scissors className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono text-sm font-bold">SMART_LEARNER: Contextual NER & Metadata Pipeline</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Zap className="w-3 h-3 text-purple-400" />
                    <span>NER Model Active</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono border-l border-slate-700 pl-4">{regChunks.length} chunks indexed</span>
                </div>
            </div>

            <div className="overflow-auto flex-1 p-6">
                {regChunks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                        <FileText className="w-16 h-16 opacity-20" />
                        <p className="italic">No Regulatory Index loaded.</p>
                        <p className="text-xs max-w-md text-center">
                            Upload a PDF Directive to initiate the Contextual Chunking Strategy. 
                            The system will extract NBE/ECMA references and apply DLP redaction.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {regChunks.map((chunk) => (
                            <div key={chunk.chunk_id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 group hover:border-slate-600 transition-all shadow-xl shadow-black/20">
                                {/* Header: Metadata Badges */}
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-2">
                                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">
                                            {chunk.source_institution}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold tracking-wider ${
                                            chunk.access_level === 'PUBLIC' 
                                            ? 'bg-emerald-950 border-emerald-900 text-emerald-400' 
                                            : 'bg-rose-950 border-rose-900 text-rose-400'
                                        }`}>
                                            {chunk.access_level}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-600">
                                        {chunk.chunk_id}
                                    </span>
                                </div>

                                {/* NER & Cache Badges (Phase IV) */}
                                <div className="flex gap-2 border-b border-slate-900 pb-2">
                                  {chunk.extraction_method === 'NER_MODEL_V4' && (
                                    <span className="flex items-center gap-1 text-[9px] text-purple-400 font-mono bg-purple-900/10 px-1.5 py-0.5 rounded">
                                      <Zap className="w-2.5 h-2.5" /> NER: A-7
                                    </span>
                                  )}
                                  {chunk.cache_status === 'HIT_TTL_24H' && (
                                    <span className="flex items-center gap-1 text-[9px] text-sky-400 font-mono bg-sky-900/10 px-1.5 py-0.5 rounded">
                                      <Server className="w-2.5 h-2.5" /> CACHE: {chunk.cache_ttl_remaining}
                                    </span>
                                  )}
                                </div>

                                {/* Content Body */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="w-3 h-3 text-slate-500" />
                                        <span className="text-xs font-bold text-slate-300">{chunk.reference_number}</span>
                                    </div>
                                    <p className="text-sm text-slate-400 leading-relaxed font-mono text-xs">
                                        {chunk.content.split(/(\[REDACTED_.*?\])/g).map((part, i) => 
                                            part.startsWith('[REDACTED') ? (
                                                <span key={i} className="bg-slate-800 text-slate-500 px-1 rounded mx-0.5 select-none" title="DLP Redaction Applied">
                                                    {part}
                                                </span>
                                            ) : part
                                        )}
                                    </p>
                                </div>

                                {/* Footer: Causality & DLP Status */}
                                <div className="pt-3 border-t border-slate-900 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        {chunk.regulatory_causality && (
                                            <div className="flex items-center gap-1 text-[10px] text-berhane-gold bg-berhane-gold/10 px-2 py-1 rounded-full">
                                                <LinkIcon className="w-3 h-3" />
                                                <span>Ref: {chunk.regulatory_causality}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {chunk.is_redacted && (
                                            <ShieldAlert className="w-4 h-4 text-slate-600" title="DLP Redaction Active" />
                                        )}
                                        <Tag className="w-4 h-4 text-slate-600" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};