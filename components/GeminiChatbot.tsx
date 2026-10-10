import React, { useState, useRef } from 'react';
import { 
  Bot, RefreshCw, Trash2, Settings, Settings2, Key, Send 
} from 'lucide-react';
import { AssetLedgerItem } from '../types';
import { 
  CopilotPersonaSelector, COPILOT_PERSONAS, PersonaConfig 
} from './copilot/CopilotPersonaSelector';
import { CopilotMessageList, ChatMessage } from './copilot/CopilotMessageList';
import { CopilotApiKeyModal } from './copilot/CopilotApiKeyModal';

interface GeminiChatbotProps {
  ledgerData?: AssetLedgerItem[];
}

const STORAGE_KEY = 'berhane_gemini_api_key';

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({ ledgerData = [] }) => {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('risk-officer');
  const [customSystemInstruction, setCustomSystemInstruction] = useState<string>('');
  const [showConfig, setShowConfig] = useState(false);
  const [includeContext, setIncludeContext] = useState(true);

  // Persistent User API Key State (localStorage)
  const [userApiKey, setUserApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [tempApiKey, setTempApiKey] = useState<string>(userApiKey);
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [showKeyText, setShowKeyText] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');

  const activePersona: PersonaConfig = 
    COPILOT_PERSONAS.find(p => p.id === selectedPersonaId) || COPILOT_PERSONAS[0];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `Welcome to **BERHANE OS Sovereign Copilot**.\n\nI am configured as the **${activePersona.name}** powered by **${activePersona.model}**.\n\nAsk me about asset securitization, AI Alpha Gate transformation logic, Causal Engine Monte Carlo stress tests, or NBE regulatory compliance.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: activePersona.model,
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSaveApiKey = () => {
    const cleanedKey = tempApiKey.trim();
    setUserApiKey(cleanedKey);
    try {
      if (cleanedKey) {
        localStorage.setItem(STORAGE_KEY, cleanedKey);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to persist key to localStorage:', e);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleClearApiKey = () => {
    setTempApiKey('');
    setUserApiKey('');
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear key from localStorage:', e);
    }
    setTestStatus('idle');
    setTestMessage('');
  };

  const handleTestApiKey = async () => {
    const keyToTest = tempApiKey.trim() || userApiKey.trim();
    if (!keyToTest) {
      setTestStatus('error');
      setTestMessage('Please enter an API key to test.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Pinging Gemini API with your key...');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': keyToTest,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Ping' }],
          apiKey: keyToTest,
          model: 'gemini-3.5-flash',
        }),
      });

      const data = await res.json();
      if (res.ok && data.isLiveGemini) {
        setTestStatus('success');
        setTestMessage('Key validated successfully! Connected to Google Gemini.');
      } else if (res.ok) {
        setTestStatus('success');
        setTestMessage('Key received and ready for requests.');
      } else {
        setTestStatus('error');
        setTestMessage(data.error || 'API key test failed.');
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(err.message || 'Connection error.');
    }
  };

  const handlePersonaChange = (personaId: string) => {
    setSelectedPersonaId(personaId);
    const newPersona = COPILOT_PERSONAS.find(p => p.id === personaId) || COPILOT_PERSONAS[0];
    setCustomSystemInstruction('');
    setMessages(prev => [
      ...prev,
      {
        id: `switch-${Date.now()}`,
        role: 'model',
        content: `Switched persona to **${newPersona.name}** (Model: \`${newPersona.model}\` • Mode: ${newPersona.speed}). How can I assist you with this protocol?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: newPersona.model,
      },
    ]);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (window.confirm('Clear current copilot chat history?')) {
      setMessages([
        {
          id: `fresh-${Date.now()}`,
          role: 'model',
          content: `Session cleared. Ready for your queries as **${activePersona.name}**.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: activePersona.model,
        },
      ]);
    }
  };

  const handleSend = async (overridePrompt?: string) => {
    const textToSend = (overridePrompt || input).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    if (!overridePrompt) setInput('');
    setIsLoading(true);

    try {
      const systemInstruction = customSystemInstruction.trim() || activePersona.systemInstruction;
      
      const payloadMessages = messages
        .filter(m => !m.isError)
        .concat(userMessage)
        .map(m => ({
          role: m.role,
          content: m.content,
        }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userApiKey ? { 'x-gemini-api-key': userApiKey } : {}),
        },
        body: JSON.stringify({
          messages: payloadMessages,
          systemInstruction,
          model: activePersona.model,
          apiKey: userApiKey || undefined,
          context: includeContext ? {
            totalAssetsInWarehouse: ledgerData.length,
            gradeACount: ledgerData.filter(d => d.tranche === 'Grade A').length,
            gradeBCount: ledgerData.filter(d => d.tranche === 'Grade B').length,
            distressedCount: ledgerData.filter(d => d.tranche === 'Distressed').length,
            sampleAssets: ledgerData.slice(0, 3).map(a => ({
              id: a.loan_id,
              borrower: a.borrower_name,
              score: a.berhane_score,
              tranche: a.tranche,
              status: a.settlement_status,
            })),
          } : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to receive response from Gemini Copilot server.');
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || activePersona.model,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Gemini Copilot Error:', error);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `**Copilot Error:** ${error.message || 'An unexpected error occurred while communicating with the model backend.'}\n\n*Tip:* Click **"Input API Key"** to provide your Google AI Studio key directly.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <CopilotApiKeyModal 
        showApiKeyModal={showApiKeyModal}
        tempApiKey={tempApiKey}
        userApiKey={userApiKey}
        showKeyText={showKeyText}
        saveSuccess={saveSuccess}
        testStatus={testStatus}
        testMessage={testMessage}
        onClose={() => setShowApiKeyModal(false)}
        onTempApiKeyChange={setTempApiKey}
        onToggleShowKeyText={() => setShowKeyText(!showKeyText)}
        onSaveApiKey={handleSaveApiKey}
        onTestApiKey={handleTestApiKey}
        onClearApiKey={handleClearApiKey}
      />

      {/* Top Header & Persona Control */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 flex flex-col gap-4 shadow-lg shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-900/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Gemini Sovereign Copilot</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-berhane-accent/20 text-sky-300 border border-berhane-accent/30 font-semibold">
                  Multi-Persona V9.1
                </span>
                {userApiKey && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    Key Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Institutional AI for credit risk modeling, causal shock simulations, and regulatory auditing
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setTempApiKey(userApiKey);
                setShowApiKeyModal(true);
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 flex items-center space-x-1.5 transition-colors"
              title="Configure Custom Google Gemini API Key"
            >
              <Key className="w-3.5 h-3.5 text-berhane-gold" />
              <span>{userApiKey ? 'Manage API Key' : 'Input API Key'}</span>
            </button>

            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`text-xs px-3 py-1.5 rounded-lg border flex items-center space-x-1.5 transition-colors ${
                showConfig
                  ? 'bg-berhane-accent text-white border-berhane-accent'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Configure Persona Parameters"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>System Prompt</span>
            </button>

            <button
              onClick={handleClearChat}
              className="bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs p-2 rounded-lg border border-slate-700 hover:border-rose-900/40 transition-colors"
              title="Clear Chat History"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Persona Selector Tabs */}
        <CopilotPersonaSelector 
          selectedPersonaId={selectedPersonaId}
          onSelectPersona={handlePersonaChange}
        />
      </div>

      {/* Collapsible System Instruction Panel */}
      {showConfig && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs animate-in slide-in-from-top-2 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Settings2 className="w-4 h-4 text-berhane-accent" />
              <span>Live System Instruction Override</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Model: {activePersona.model}
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              Custom System Instruction (Overrides default role behavior):
            </label>
            <textarea
              value={customSystemInstruction}
              onChange={e => setCustomSystemInstruction(e.target.value)}
              placeholder={activePersona.systemInstruction}
              rows={2}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-berhane-accent resize-none font-mono"
            />
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={includeContext}
                onChange={e => setIncludeContext(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-berhane-accent focus:ring-0"
              />
              <span>Inject live Asset Ledger telemetry into prompt context</span>
            </label>
            {customSystemInstruction && (
              <button
                onClick={() => setCustomSystemInstruction('')}
                className="text-[11px] text-slate-400 hover:text-white underline"
              >
                Reset to default persona instruction
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Chat Thread */}
      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl flex flex-col min-h-0 overflow-hidden shadow-inner">
        <CopilotMessageList 
          messages={messages}
          isLoading={isLoading}
          activePersona={activePersona}
          copiedId={copiedId}
          onCopy={handleCopy}
          onSelectPrompt={(prompt) => handleSend(prompt)}
        />

        {/* Bottom Input Box */}
        <div className="p-3 md:p-4 bg-slate-900 border-t border-slate-800 shrink-0">
          <div className="relative flex items-end gap-2 bg-slate-950 border border-slate-800 focus-within:border-berhane-accent rounded-xl p-2 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${activePersona.name} (${activePersona.model})... (Enter to send, Shift+Enter for new line)`}
              rows={2}
              disabled={isLoading}
              className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none max-h-32 p-1"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="bg-berhane-accent hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 rounded-lg shrink-0 transition-all shadow-md shadow-sky-900/20"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex justify-between items-center mt-2 px-1 text-[10px] text-slate-500 font-mono">
            <span>Model: <span className="text-slate-300">{activePersona.model}</span> &bull; Role: <span className="text-slate-300">{activePersona.name}</span></span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setTempApiKey(userApiKey);
                  setShowApiKeyModal(true);
                }}
                className="hover:text-berhane-accent flex items-center gap-1 transition-colors underline cursor-pointer"
                title="Open API Key Settings"
              >
                <Key className="w-3 h-3 text-berhane-gold" />
                <span>{userApiKey ? 'Custom Key: Saved' : 'Input API Key'}</span>
              </button>
              <span>&bull;</span>
              <span>Shift + Enter for multiline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeminiChatbot;
