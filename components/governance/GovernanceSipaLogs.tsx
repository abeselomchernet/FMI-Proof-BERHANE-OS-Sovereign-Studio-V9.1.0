import React, { useRef, useEffect } from 'react';
import { Activity, Play } from 'lucide-react';

interface GovernanceSipaLogsProps {
  auditLogs: string[];
  auditRunning: boolean;
  onRunSIPA: () => void;
}

export const GovernanceSipaLogs: React.FC<GovernanceSipaLogsProps> = ({
  auditLogs,
  auditRunning,
  onRunSIPA,
}) => {
  const auditLogEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (auditLogEndRef.current) {
      auditLogEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [auditLogs]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden min-h-[300px]">
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-slate-400" />
          <h3 className="font-bold text-slate-200">SIPA Diagnostic Log</h3>
        </div>
        <button 
          onClick={onRunSIPA}
          disabled={auditRunning}
          className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded border border-slate-700 transition-colors flex items-center gap-2"
        >
          <Play className="w-3 h-3" /> Run SIPA
        </button>
      </div>
      
      <div className="flex-1 bg-black/80 p-4 font-mono text-[10px] text-emerald-500 overflow-y-auto max-h-[300px]">
        {auditLogs.length === 0 ? (
          <span className="text-slate-600">System Idle. Initiate SIPA to begin diagnostics...</span>
        ) : (
          auditLogs.map((log, i) => (
            <div key={i} className="mb-1 break-words">
              <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
              {log}
            </div>
          ))
        )}
        <div ref={auditLogEndRef} />
      </div>
    </div>
  );
};
