import React, { useRef, useEffect } from 'react';
import { Bot, User, Copy, Check, Sparkles } from 'lucide-react';
import { PersonaConfig } from './CopilotPersonaSelector';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
  isError?: boolean;
}

interface CopilotMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  activePersona: PersonaConfig;
  copiedId: string | null;
  onCopy: (id: string, text: string) => void;
  onSelectPrompt: (prompt: string) => void;
}

export const CopilotMessageList: React.FC<CopilotMessageListProps> = ({
  messages,
  isLoading,
  activePersona,
  copiedId,
  onCopy,
  onSelectPrompt,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
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
                      onClick={() => onCopy(message.id, message.content)}
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
                onClick={() => onSelectPrompt(prompt)}
                className="whitespace-nowrap bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 text-xs transition-colors shrink-0 text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
