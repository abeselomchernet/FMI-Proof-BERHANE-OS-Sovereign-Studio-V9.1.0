import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, User, Send, Sparkles, RefreshCw, Trash2, Copy, Check, 
  Settings, Settings2, ShieldAlert, Cpu, Zap, ArrowRight, BookOpen, AlertCircle,
  Key, Eye, EyeOff, ExternalLink, ShieldCheck, X
} from 'lucide-react';
import { AssetLedgerItem } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
  isError?: boolean;
}

interface PersonaConfig {
  id: string;
  name: string;
  badge: string;
  model: 'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite';
  description: string;
  speed: 'General' | 'Deep Reasoning' | 'Ultra Fast';
  icon: React.ComponentType<{ className?: string }>;
  systemInstruction: string;
  starterPrompts: string[];
}

const PERSONAS: PersonaConfig[] = [
  {
    id: 'risk-officer',
    name: 'Sovereign Risk Officer',
    badge: 'General Tasks',
    model: 'gemini-3.5-flash',
    speed: 'General',
    icon: Bot,
    description: 'Expert in BERHANE OS asset securitization, CR-Scores, and sovereign balance sheet anti-fragility.',
    systemInstruction: 
      'You are the Sovereign Financial Risk Officer of the BERHANE OS Sovereign Studio. You provide expert analysis on credit risk scoring (CR-Scores), asset eligibility for securitization, provisioning cost reductions, and macroeconomic resilience for sovereign markets. Be professional, mathematically grounded, and concise.',
    starterPrompts: [
      'Explain how the AI Alpha Gate elevates loans to meet the 9.0 CR-Score threshold.',
      'How does SFDR Article 9 certification impact foreign exchange reserve generation?',
      'Assess the risk profile of Grade A vs Grade B securitized tranches.',
    ],
  },
  {
    id: 'causal-quant',
    name: 'Causal & Quants Strategist',
    badge: 'Complex Tasks',
    model: 'gemini-3.1-pro-preview',
    speed: 'Deep Reasoning',
    icon: Cpu,
    description: 'High-reasoning specialist for Monte Carlo causal simulations, policy shocks, and E-PSM clearing mechanisms.',
    systemInstruction: 
      'You are the Chief Quantitative Strategist and Causal Systems Architect for the BERHANE OS. You excel at complex counterfactual reasoning, Bayesian causal diagrams, Monte Carlo distribution forecasting, and algorithmic auction clearing (Uniform Clearing Price / E-PSM). Provide rigorous, in-depth breakdowns with theoretical and structural nuance.',
    starterPrompts: [
      'Simulate the counterfactual impact if NBE raises reserve ratios from 15% to 20%.',
      'Explain the deterministic clearing price and settlement hash algorithm in E-PSM.',
      'How does the BTLF protocol prevent cascading bank runs during an ETB currency devaluation shock?',
    ],
  },
  {
    id: 'fast-auditor',
    name: 'Regulatory Fast-Checker',
    badge: 'Fast Tasks',
    model: 'gemini-3.1-flash-lite',
    speed: 'Ultra Fast',
    icon: Zap,
    description: 'Lightning-fast verification of NBE Directives, statutory decision briefs, and compliance covenants.',
    systemInstruction: 
      'You are the High-Throughput Regulatory & Smart Contract Auditor for BERHANE OS. Provide rapid, accurate, pinpoint answers regarding NBE Directives (such as Directive 5.4), legal evidence requirements, smart contract circuit breakers, and compliance requirements. Be direct and concise.',
    starterPrompts: [
      'What are the minimum liquidity coverage ratio (LCR) limits under NBE Directive 5.4?',
      'Check statutory requirements for automated liquidity injections.',
      'List the exact conditions that trigger a BTLF circuit breaker market halt.',
    ],
  },
];

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

  const activePersona = PERSONAS.find(p => p.id === selectedPersonaId) || PERSONAS[0];

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle saving API key to localStorage
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

  // Handle removing API key from localStorage
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

  // Test the entered key
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

  // Adjust persona change
  const handlePersonaChange = (personaId: string) => {
    setSelectedPersonaId(personaId);
    const newPersona = PERSONAS.find(p => p.id === personaId) || PERSONAS[0];
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

  const handleSend = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText || isLoading) return;

    setInput('');

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Build system prompt with optional live context
      let effectiveSystemPrompt = customSystemInstruction.trim() || activePersona.systemInstruction;

      if (includeContext && ledgerData.length > 0) {
        const compliantCount = ledgerData.filter(d => d.is_alpha_compliant).length;
        const avgScore = (ledgerData.reduce((acc, c) => acc + c.berhane_score, 0) / ledgerData.length).toFixed(2);
        effectiveSystemPrompt += `\n\n[LIVE WAREHOUSE TELEMETRY]: Total assets in ledger: ${ledgerData.length}, Alpha compliant assets: ${compliantCount}, Average CR-Score: ${avgScore}. Target CR-Score is 9.0.`;
      }

      // Convert conversation history for backend
      const payloadMessages = newMessages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (userApiKey) {
        headers['x-gemini-api-key'] = userApiKey;
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: payloadMessages,
          systemInstruction: effectiveSystemPrompt,
          model: activePersona.model,
          apiKey: userApiKey || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Server returned an error');
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: data.reply || 'No response returned.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.model || activePersona.model,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `⚠️ **Error communicating with Gemini**: ${err.message || 'Please check your connection and API key.'}`,
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

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `cleared-${Date.now()}`,
        role: 'model',
        content: `Chat history cleared. Active Persona: **${activePersona.name}** (\`${activePersona.model}\`). Ready for your query.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: activePersona.model,
      },
    ]);
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-300 relative">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">BERHANE Sovereign Copilot</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-900/30 text-emerald-400 border border-emerald-500/30">
                FREE OPTION READY
              </span>
              {userApiKey && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-900/40 text-sky-400 border border-sky-500/40 flex items-center gap-1">
                  <Key className="w-2.5 h-2.5" /> CUSTOM KEY ACTIVE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Institutional sovereign advisor with built-in domain knowledge & Gemini support
            </p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Persona quick buttons */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            {PERSONAS.map(p => {
              const isSelected = p.id === selectedPersonaId;
              const IconComp = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePersonaChange(p.id)}
                  title={`${p.name} (${p.model})`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-berhane-accent text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{p.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Persistent Settings Icon Button */}
          <button
            onClick={() => {
              setTempApiKey(userApiKey);
              setShowApiKeyModal(true);
            }}
            className={`relative p-2 rounded-lg border transition-all text-xs font-medium flex items-center gap-1.5 group ${
              userApiKey
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/50'
                : 'bg-slate-950 text-slate-300 border-slate-700 hover:text-white hover:border-berhane-accent'
            }`}
            title="Configure Gemini API Key & Copilot Settings"
            aria-label="Open settings"
          >
            <Settings className="w-4 h-4 text-slate-300 group-hover:text-white transition-transform group-hover:rotate-45" />
            <span className="text-xs font-semibold hidden md:inline">
              {userApiKey ? 'Settings (Key Saved)' : 'Settings'}
            </span>
            {userApiKey && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          {/* Model Config toggle */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`p-2 rounded-lg border transition-all text-xs flex items-center gap-1 ${
              showConfig
                ? 'bg-slate-800 text-berhane-gold border-berhane-gold/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Persona & Context Prompt Details"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {/* Clear Chat */}
          <button
            onClick={handleClearChat}
            className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900/50 transition-all text-xs"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Persistent API Key Settings Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setShowApiKeyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Key className="w-5 h-5 text-berhane-gold" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Gemini API Key Settings</h3>
                <p className="text-xs text-slate-400">
                  Stored securely in your browser's <code className="text-slate-300">localStorage</code>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Enter your Google Gemini API key to use live cloud models. If left blank, the copilot uses the <strong>built-in Free Sovereign Knowledge Engine</strong>.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1.5">
                  Your Gemini API Key (starts with <code className="text-berhane-gold">AIzaSy...</code>)
                </label>
                <div className="relative">
                  <input
                    type={showKeyText ? 'text' : 'password'}
                    value={tempApiKey}
                    onChange={e => setTempApiKey(e.target.value)}
                    placeholder="Paste AIzaSy... here"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-3 pr-10 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-berhane-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeyText(!showKeyText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showKeyText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Status or test message */}
              {testMessage && (
                <div className={`p-2.5 rounded-lg text-xs font-mono flex items-center gap-2 ${
                  testStatus === 'success'
                    ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800'
                    : testStatus === 'error'
                    ? 'bg-rose-950/40 text-rose-300 border border-rose-800'
                    : 'bg-slate-950 text-slate-300 border border-slate-800'
                }`}>
                  {testStatus === 'testing' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {testStatus === 'success' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  {testStatus === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
                  <span>{testMessage}</span>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <div className="flex gap-2">
                  <button
                    onClick={handleTestApiKey}
                    disabled={testStatus === 'testing' || !tempApiKey.trim()}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    Test Key
                  </button>
                  {userApiKey && (
                    <button
                      onClick={handleClearApiKey}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-rose-900/30 hover:text-rose-300 text-xs font-semibold text-slate-400 transition-colors"
                    >
                      Remove Key
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowApiKeyModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleSaveApiKey();
                      setTimeout(() => setShowApiKeyModal(false), 500);
                    }}
                    className="px-4 py-2 rounded-lg bg-berhane-accent hover:bg-sky-500 text-xs font-bold text-white shadow-lg shadow-sky-900/30 transition-all flex items-center gap-1.5"
                  >
                    {saveSuccess ? <Check className="w-3.5 h-3.5" /> : null}
                    <span>{saveSuccess ? 'Saved!' : 'Save Key'}</span>
                  </button>
                </div>
              </div>

              {/* Free Key Helper Link */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">Don't have an API key?</div>
                  <div className="text-[11px] text-slate-400">Get a 100% free Gemini API key with no credit card required.</div>
                </div>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-berhane-gold text-xs font-bold border border-amber-500/30 flex items-center gap-1 transition-colors"
                >
                  <span>Get Free Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collapsible Config & Persona Settings */}
      {showConfig && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-berhane-accent" />
              Model & Role Configuration
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Active Model: <span className="text-berhane-gold font-bold">{activePersona.model}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            {PERSONAS.map(p => (
              <div
                key={p.id}
                onClick={() => handlePersonaChange(p.id)}
                className={`cursor-pointer p-3 rounded-lg border transition-all ${
                  p.id === selectedPersonaId
                    ? 'bg-slate-950 border-berhane-accent shadow-sm ring-1 ring-berhane-accent/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{p.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    p.speed === 'Deep Reasoning'
                      ? 'bg-indigo-900/40 text-indigo-400 border border-indigo-700/40'
                      : p.speed === 'Ultra Fast'
                      ? 'bg-amber-900/40 text-amber-400 border border-amber-700/40'
                      : 'bg-sky-900/40 text-sky-400 border border-sky-700/40'
                  }`}>
                    {p.speed}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mb-2">{p.description}</div>
                <div className="text-[10px] text-berhane-gold font-mono">Model: {p.model}</div>
              </div>
            ))}
          </div>

          <div>
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
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map(message => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`group relative max-w-[85%] md:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-berhane-accent text-white rounded-br-none shadow-md shadow-sky-900/20'
                      : message.isError
                      ? 'bg-rose-950/40 border border-rose-900/50 text-rose-200 rounded-bl-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
                  }`}
                >
                  {/* Message meta */}
                  <div className="flex items-center justify-between gap-4 mb-1.5 text-[10px] opacity-70">
                    <span className="font-semibold font-mono">
                      {isUser ? 'You' : activePersona.name}
                    </span>
                    <div className="flex items-center gap-2">
                      {message.modelUsed && (
                        <span className="font-mono bg-slate-950/40 px-1 rounded text-[9px]">
                          {message.modelUsed}
                        </span>
                      )}
                      <span>{message.timestamp}</span>
                    </div>
                  </div>

                  {/* Message Content with basic formatting */}
                  <div className="whitespace-pre-wrap font-sans break-words space-y-2">
                    {message.content.split('\n\n').map((paragraph, idx) => {
                      // Check for bullet list
                      if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                        const items = paragraph.split('\n').filter(Boolean);
                        return (
                          <ul key={idx} className="list-disc pl-5 space-y-1">
                            {items.map((it, i) => (
                              <li key={i}>{it.replace(/^[-*]\s+/, '')}</li>
                            ))}
                          </ul>
                        );
                      }
                      return <p key={idx}>{paragraph}</p>;
                    })}
                  </div>

                  {/* Action row on hover */}
                  {!isUser && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 bottom-2 flex gap-1 bg-slate-900/90 px-1.5 py-1 rounded border border-slate-700 text-slate-400">
                      <button
                        onClick={() => handleCopy(message.id, message.content)}
                        className="hover:text-white transition-colors"
                        title="Copy text"
                      >
                        {copiedId === message.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none p-4 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-berhane-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-berhane-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-berhane-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-slate-400 font-mono ml-2">
                  {activePersona.name} ({activePersona.model}) is reasoning...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Starter Prompts Carousel */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-900/40">
            <div className="text-[10px] uppercase font-mono text-slate-500 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-berhane-gold" />
              Suggested Queries ({activePersona.name}):
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {activePersona.starterPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(prompt)}
                  className="whitespace-nowrap bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 text-xs transition-colors shrink-0 text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Input Box */}
        <div className="p-3 md:p-4 bg-slate-900 border-t border-slate-800">
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
            <span>Model: <span className="text-slate-300">{activePersona.model}</span> • Role: <span className="text-slate-300">{activePersona.name}</span></span>
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
              <span>•</span>
              <span>Shift + Enter for multiline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
