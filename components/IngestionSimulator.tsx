import React, { useState, useRef } from 'react';
import { RawLoan, RegulatoryChunk } from '../types';
import { 
  FileUp, Database, Plus, RefreshCw, FileText, Scissors, Tag, 
  ShieldAlert, BookOpen, Lock, Link as LinkIcon, Eye, Zap, Server, 
  Upload, Download, AlertCircle, CheckCircle2, X, HelpCircle, FileSpreadsheet
} from 'lucide-react';
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

  // State for CSV/JSON Import
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: 'idle' | 'success' | 'error' | 'parsing';
    message?: string;
    count?: number;
    details?: string[];
  }>({ type: 'idle' });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulated synthetic batch generator
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
    }, 1200);
  };

  // CSV parsing helper supporting quotes, commas, CRLF
  const parseCSV = (csvText: string): RawLoan[] => {
    const lines = csvText
      .split(/\r\n|\n|\r/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length < 2) {
      throw new Error('CSV file must include a header row and at least one data row.');
    }

    // Split row handling quoted commas
    const parseCSVRow = (rowStr: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < rowStr.length; i++) {
        const char = rowStr[i];
        if (char === '"') {
          if (inQuotes && rowStr[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const header = parseCSVRow(lines[0]).map(h => h.toLowerCase().replace(/[\s_-]+/g, ''));
    
    // Find column indexes
    const loanIdIdx = header.findIndex(h => h.includes('loanid') || h === 'id' || h.includes('loan'));
    const valueIdx = header.findIndex(h => h.includes('value') || h.includes('amount') || h.includes('etb') || h.includes('principal'));
    const applicantIdx = header.findIndex(h => h.includes('applicant') || h.includes('borrower') || h.includes('name') || h.includes('entity'));
    const tradScoreIdx = header.findIndex(h => h.includes('tradscore') || h.includes('score') || h.includes('creditscore') || h.includes('trad'));
    const uploadAtIdx = header.findIndex(h => h.includes('upload') || h.includes('date') || h.includes('timestamp') || h.includes('time'));
    const sourceIdx = header.findIndex(h => h.includes('source') || h.includes('file'));

    const parsedLoans: RawLoan[] = [];
    const parseErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVRow(lines[i]);
      if (row.length === 0 || (row.length === 1 && !row[0])) continue;

      const rawLoanId = loanIdIdx !== -1 && row[loanIdIdx] ? row[loanIdIdx] : `LN-IMP-${Math.floor(1000 + Math.random() * 9000)}`;
      const rawApplicant = applicantIdx !== -1 && row[applicantIdx] ? row[applicantIdx] : `Imported Enterprise ${i}`;
      
      let rawValue = 500000;
      if (valueIdx !== -1 && row[valueIdx]) {
        const cleanVal = row[valueIdx].replace(/[^0-9.-]+/g, '');
        const parsedVal = parseFloat(cleanVal);
        if (!isNaN(parsedVal) && parsedVal > 0) {
          rawValue = parsedVal;
        } else {
          parseErrors.push(`Row ${i + 1}: Invalid loan value "${row[valueIdx]}", defaulted to 500,000 ETB.`);
        }
      }

      let rawTradScore = 5;
      if (tradScoreIdx !== -1 && row[tradScoreIdx]) {
        const cleanScore = parseFloat(row[tradScoreIdx].replace(/[^0-9.-]+/g, ''));
        if (!isNaN(cleanScore)) {
          rawTradScore = Math.min(10, Math.max(1, Math.round(cleanScore)));
        }
      } else {
        // reasonable default
        rawTradScore = Math.floor(Math.random() * 4) + 4;
      }

      const uploadedAt = uploadAtIdx !== -1 && row[uploadAtIdx] ? row[uploadAtIdx] : new Date().toISOString();
      const sourceFile = sourceIdx !== -1 && row[sourceIdx] ? row[sourceIdx] : 'imported_feed.csv';

      parsedLoans.push({
        loan_id: rawLoanId,
        applicant_name: rawApplicant,
        value_etb: rawValue,
        trad_score: rawTradScore,
        uploaded_at: uploadedAt,
        source_file_name: sourceFile
      });
    }

    if (parsedLoans.length === 0) {
      throw new Error('No valid loan records could be parsed from the provided CSV file.');
    }

    return parsedLoans;
  };

  // JSON parsing helper
  const parseJSON = (jsonText: string): RawLoan[] => {
    let data: any;
    try {
      data = JSON.parse(jsonText);
    } catch (e: any) {
      throw new Error(`Invalid JSON format: ${e.message}`);
    }

    // Support both an array or an object with loans/records/data array
    const records = Array.isArray(data) 
      ? data 
      : (data.loans || data.records || data.data || data.items);

    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('JSON file must contain an array of synthetic loan objects (or { "loans": [...] }).');
    }

    const parsed: RawLoan[] = records.map((item: any, idx: number) => {
      const loan_id = String(item.loan_id || item.loanId || item.id || `LN-JSON-${1000 + idx}`);
      const applicant_name = String(item.applicant_name || item.borrower_name || item.applicant || item.borrower || `Enterprise ${idx + 1}`);
      const value_etb = Number(item.value_etb ?? item.amount ?? item.principal ?? item.value ?? 1000000);
      const trad_score = Number(item.trad_score ?? item.tradScore ?? item.credit_score ?? 6);
      const uploaded_at = item.uploaded_at || item.timestamp || new Date().toISOString();
      const source_file_name = item.source_file_name || item.source || 'imported_dataset.json';

      return {
        loan_id,
        applicant_name,
        value_etb: isNaN(value_etb) || value_etb <= 0 ? 500000 : value_etb,
        trad_score: isNaN(trad_score) ? 5 : Math.min(10, Math.max(1, trad_score)),
        uploaded_at,
        source_file_name
      };
    });

    return parsed;
  };

  const handleFileProcess = async (file: File) => {
    setImportStatus({ type: 'parsing', message: `Processing ${file.name}...` });
    try {
      const content = await file.text();
      let importedLoans: RawLoan[] = [];

      const isJson = file.name.endsWith('.json') || content.trim().startsWith('{') || content.trim().startsWith('[');
      if (isJson) {
        importedLoans = parseJSON(content);
      } else {
        importedLoans = parseCSV(content);
      }

      // Tag imported loans with the actual file name
      const taggedLoans = importedLoans.map(loan => ({
        ...loan,
        source_file_name: loan.source_file_name === 'batch_upload_v1.csv' ? file.name : (loan.source_file_name || file.name)
      }));

      // Deduplicate or append to rawData
      setRawData([...rawData, ...taggedLoans]);
      setImportStatus({
        type: 'success',
        count: taggedLoans.length,
        message: `Successfully ingested ${taggedLoans.length} synthetic loan records from "${file.name}".`
      });

      // Auto close after 2.5 seconds on success
      setTimeout(() => {
        setShowImportModal(false);
        setImportStatus({ type: 'idle' });
      }, 2200);

    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: err.message || 'An error occurred during file ingestion.'
      });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Download sample CSV template
  const downloadSampleCSV = () => {
    const sampleHeaders = ['loan_id', 'applicant_name', 'value_etb', 'trad_score', 'uploaded_at', 'source_file_name'];
    const sampleRows = [
      ['LN-9001', 'Abyssinia Agro-Export Corp', '3450000', '7', new Date().toISOString(), 'sample_pipeline_import.csv'],
      ['LN-9002', 'Awash Valley Logistics Ltd', '1850000', '6', new Date().toISOString(), 'sample_pipeline_import.csv'],
      ['LN-9003', 'Teklehaimanot Trading Plc', '4200000', '4', new Date().toISOString(), 'sample_pipeline_import.csv'],
      ['LN-9004', 'Selam Textile Mills', '2900000', '8', new Date().toISOString(), 'sample_pipeline_import.csv'],
      ['LN-9005', 'Zema Solar Solutions', '1250000', '5', new Date().toISOString(), 'sample_pipeline_import.csv']
    ];
    const csvContent = [
      sampleHeaders.join(','),
      ...sampleRows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `berhane_sample_loans_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download sample JSON template
  const downloadSampleJSON = () => {
    const sampleLoans = [
      {
        loan_id: 'LN-EXT-701',
        applicant_name: 'Entoto Highland Coffee Co',
        value_etb: 2750000,
        trad_score: 8,
        uploaded_at: new Date().toISOString(),
        source_file_name: 'synthetic_external_feed.json'
      },
      {
        loan_id: 'LN-EXT-702',
        applicant_name: 'Tana Basin AgriTech Corp',
        value_etb: 4100000,
        trad_score: 5,
        uploaded_at: new Date().toISOString(),
        source_file_name: 'synthetic_external_feed.json'
      },
      {
        loan_id: 'LN-EXT-703',
        applicant_name: 'Diredawa Light Manufacturing',
        value_etb: 1950000,
        trad_score: 6,
        uploaded_at: new Date().toISOString(),
        source_file_name: 'synthetic_external_feed.json'
      }
    ];

    const blob = new Blob([JSON.stringify(sampleLoans, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `berhane_sample_loans_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
            Financial (CSV / JSON)
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Pipeline: <strong className="text-slate-200">ETL Validator v4.2 Ready</strong></span>
          <span className="text-slate-600">•</span>
          <span>Ingested Records: <strong className="text-berhane-accent font-mono">{rawData.length}</strong></span>
        </div>

        <div className="flex items-center gap-3">
          {activeMode === 'financial' && (
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all hover:border-slate-500 shadow-md"
              title="Upload custom CSV or JSON synthetic loan data file"
            >
              <Upload className="w-4 h-4 text-berhane-accent" />
              <span>Import CSV / JSON</span>
            </button>
          )}

          <button 
            onClick={handleSimulateUpload}
            disabled={isUploading}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors font-medium shadow-lg text-sm ${
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
                : (activeMode === 'financial' ? 'Simulate Random Batch' : 'Ingest Regulatory PDF')
              }
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl flex-1 flex flex-col overflow-hidden">
        
        {activeMode === 'financial' ? (
          // --- FINANCIAL DATA VIEW ---
          <>
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center space-x-2 text-slate-300">
                    <Database className="w-4 h-4 text-berhane-accent" />
                    <span className="font-mono text-sm font-bold">BERHANE_DATA_WAREHOUSE.raw_loan_book</span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={downloadSampleCSV}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-800 transition-colors border border-slate-700/60"
                    title="Download synthetic CSV schema template"
                  >
                    <Download className="w-3.5 h-3.5 text-berhane-accent" />
                    <span>Sample CSV</span>
                  </button>
                  <button 
                    onClick={downloadSampleJSON}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-800 transition-colors border border-slate-700/60"
                    title="Download synthetic JSON schema template"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sample JSON</span>
                  </button>
                  <span className="text-xs text-slate-500 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{rawData.length} records</span>
                </div>
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
                      <td colSpan={6} className="p-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <FileSpreadsheet className="w-10 h-10 text-slate-600 stroke-[1.5]" />
                          <p className="text-sm font-medium text-slate-400">No raw financial loan data found.</p>
                          <p className="text-xs text-slate-500 max-w-sm">
                            Import an external CSV or JSON file with synthetic loans, or simulate a random synthetic batch to begin.
                          </p>
                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={() => setShowImportModal(true)}
                              className="px-3.5 py-1.5 text-xs bg-berhane-accent hover:bg-sky-400 text-white rounded font-medium transition-colors"
                            >
                              Import CSV / JSON
                            </button>
                            <button
                              onClick={handleSimulateUpload}
                              className="px-3.5 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors border border-slate-700"
                            >
                              Simulate Batch
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rawData.slice().reverse().map((loan) => (
                      <tr key={loan.loan_id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-4 text-sm font-mono text-berhane-accent">{loan.loan_id}</td>
                        <td className="p-4 text-sm text-slate-300 font-medium">{loan.applicant_name}</td>
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
                        <td className="p-4 text-xs text-slate-400 truncate max-w-[160px] font-mono">
                            <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-[11px]">
                              {loan.source_file_name}
                            </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          // --- REGULATORY KNOWLEDGE VIEW (Phase IV) ---
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

      {/* CSV / JSON Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-xl p-6 shadow-2xl space-y-6 relative">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-berhane-accent" />
                <h3 className="text-lg font-bold text-white">Import Synthetic Loan Records</h3>
              </div>
              <button 
                onClick={() => {
                  setShowImportModal(false);
                  setImportStatus({ type: 'idle' });
                }}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drag & Drop Zone */}
            <div 
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                isDragging 
                  ? 'border-berhane-accent bg-berhane-accent/10 text-white' 
                  : 'border-slate-700 hover:border-slate-500 bg-slate-950/60 text-slate-400'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".csv,.json,text/csv,application/json" 
                className="hidden" 
                onChange={handleFileInputChange}
              />
              <div className="p-3 rounded-full bg-slate-800/80 border border-slate-700 text-berhane-accent shadow-inner">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">
                  Click to select or drag and drop synthetic data files
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports CSV (.csv) and JSON (.json) format
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded border border-slate-800">
                loan_id, applicant_name, value_etb, trad_score
              </span>
            </div>

            {/* Status alerts */}
            {importStatus.type === 'parsing' && (
              <div className="p-3 bg-sky-950/60 border border-sky-800 rounded-lg flex items-center gap-2.5 text-xs text-sky-300">
                <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                <span>{importStatus.message}</span>
              </div>
            )}

            {importStatus.type === 'success' && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg flex items-center gap-2.5 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{importStatus.message}</span>
              </div>
            )}

            {importStatus.type === 'error' && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-lg flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Import Error:</strong>
                  <span>{importStatus.message}</span>
                </div>
              </div>
            )}

            {/* Quick Template Download & Info Footer */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                  Need sample formatted synthetic data?
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={downloadSampleCSV}
                    className="text-berhane-accent hover:text-sky-300 underline font-mono text-[11px]"
                  >
                    Download CSV Template
                  </button>
                  <span className="text-slate-600">|</span>
                  <button 
                    onClick={downloadSampleJSON}
                    className="text-emerald-400 hover:text-emerald-300 underline font-mono text-[11px]"
                  >
                    Download JSON Template
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Imported synthetic files populate the raw staging warehouse (<code className="text-slate-400 font-mono">raw_loan_book</code>), immediately becoming available for AlphaGate transformation, CR-Scoring, and DLT Securitization.
              </p>
            </div>

            {/* Close Button */}
            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => {
                  setShowImportModal(false);
                  setImportStatus({ type: 'idle' });
                }}
                className="px-4 py-2 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};