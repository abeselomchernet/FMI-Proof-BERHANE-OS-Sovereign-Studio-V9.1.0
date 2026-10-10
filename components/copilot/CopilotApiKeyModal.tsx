import React from 'react';
import { Key, X, Eye, EyeOff, ShieldCheck, Check, RefreshCw, Trash2, ExternalLink } from 'lucide-react';

interface CopilotApiKeyModalProps {
  showApiKeyModal: boolean;
  tempApiKey: string;
  userApiKey: string;
  showKeyText: boolean;
  saveSuccess: boolean;
  testStatus: 'idle' | 'testing' | 'success' | 'error';
  testMessage: string;
  onClose: () => void;
  onTempApiKeyChange: (val: string) => void;
  onToggleShowKeyText: () => void;
  onSaveApiKey: () => void;
  onTestApiKey: () => void;
  onClearApiKey: () => void;
}

export const CopilotApiKeyModal: React.FC<CopilotApiKeyModalProps> = ({
  showApiKeyModal,
  tempApiKey,
  userApiKey,
  showKeyText,
  saveSuccess,
  testStatus,
  testMessage,
  onClose,
  onTempApiKeyChange,
  onToggleShowKeyText,
  onSaveApiKey,
  onTestApiKey,
  onClearApiKey,
}) => {
  if (!showApiKeyModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 rounded-xl">
              <Key className="w-5 h-5 text-berhane-accent" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Gemini API Key Configuration</h3>
              <p className="text-xs text-slate-400">Secure browser-level persistent authentication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-slate-300 leading-relaxed">
            <div className="flex items-start gap-2 mb-1.5 text-sky-400 font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Direct Browser Authentication</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Your API key is stored safely in your browser's <code className="text-slate-200 font-mono">localStorage</code>. It is transmitted directly to the secure Gemini endpoint to generate real-time AI responses.
            </p>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1.5">
              Google AI Studio API Key:
            </label>
            <div className="relative flex items-center">
              <input
                type={showKeyText ? 'text' : 'password'}
                value={tempApiKey}
                onChange={e => onTempApiKeyChange(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-3.5 pr-10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-berhane-accent font-mono"
              />
              <button
                type="button"
                onClick={onToggleShowKeyText}
                className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors"
                title={showKeyText ? 'Hide key' : 'Show key'}
              >
                {showKeyText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Test Status Message */}
          {testStatus !== 'idle' && (
            <div className={`p-3 rounded-xl border font-mono text-[11px] flex items-center gap-2 ${
              testStatus === 'testing' ? 'bg-sky-950/30 border-sky-800 text-sky-300' :
              testStatus === 'success' ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300' :
              'bg-rose-950/30 border-rose-800 text-rose-300'
            }`}>
              {testStatus === 'testing' && <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />}
              {testStatus === 'success' && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              {testStatus === 'error' && <X className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
              <span className="break-all">{testMessage}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-berhane-accent hover:underline flex items-center gap-1 font-medium"
            >
              <span>Get a free API key from Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div>
            {userApiKey && (
              <button
                onClick={onClearApiKey}
                className="text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-rose-950/30 text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Key</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onTestApiKey}
              disabled={testStatus === 'testing' || (!tempApiKey.trim() && !userApiKey.trim())}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              {testStatus === 'testing' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Test Connection</span>
            </button>
            <button
              onClick={onSaveApiKey}
              className="px-4 py-2 bg-berhane-accent hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-sky-900/30 flex items-center gap-1.5"
            >
              {saveSuccess ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{saveSuccess ? 'Saved!' : 'Save & Apply'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
