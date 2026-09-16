'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, 
  Paperclip, 
  Sparkles, 
  BookOpen, 
  FileText, 
  ChevronDown, 
  RotateCcw,
  CheckCircle2,
  GraduationCap,
  Bookmark
} from 'lucide-react';
import { DocumentItem } from './Sidebar';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: {
    pageNumber: number;
    fileName: string;
    snippet: string;
    similarity: number;
  }[];
  mode?: string;
  timestamp?: string;
}

interface ChatInterfaceProps {
  activeMode: 'general' | 'rag' | 'quiz' | 'summary';
  setActiveMode: (mode: 'general' | 'rag' | 'quiz' | 'summary') => void;
  selectedDoc: DocumentItem | null;
  documents: DocumentItem[];
  setSelectedDocId: (id: string | null) => void;
  onOpenUpload: () => void;
}

export default function ChatInterface({
  activeMode,
  setActiveMode,
  selectedDoc,
  documents,
  setSelectedDocId,
  onOpenUpload,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCitation, setExpandedCitation] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  // Load chat history from Supabase on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsHistoryLoading(true);
        const res = await fetch('/api/chat');
        const data = await res.json();
        if (data.messages && Array.isArray(data.messages)) {
          const formatted: Message[] = data.messages.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            citations: m.citations || [],
            mode: m.mode || 'general',
            timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          }));
          setMessages(formatted);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setIsHistoryLoading(false);
      }
    };

    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (customMessage?: string) => {
    const textToSend = customMessage || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend.trim(),
      mode: activeMode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          mode: activeMode === 'rag' ? 'rag' : 'general',
          documentId: activeMode === 'rag' && selectedDoc ? selectedDoc.id : null,
          history: messages.slice(-4),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to get response');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        citations: data.citations || [],
        mode: activeMode,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ **Scholarly Notice:** ${err.message || 'Could not connect to the academic engine. Please check your connection and try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = async () => {
    if (messages.length === 0) return;
    if (!confirm('Clear all conversation history from MindShelf?')) return;
    try {
      await fetch('/api/chat', { method: 'DELETE' });
      setMessages([]);
    } catch (err) {
      console.error('Error clearing messages:', err);
      setMessages([]);
    }
  };

  return (
    <div className="flex-1 h-screen flex flex-col bg-white relative overflow-hidden text-stone-900">
      {/* Top Academic Header */}
      <header className="h-14 px-6 border-b border-stone-200 flex items-center justify-between bg-white/95 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border ${
            activeMode === 'rag' 
              ? 'bg-rose-50 border-rose-200 text-[#881337]' 
              : 'bg-purple-50 border-purple-200 text-purple-800'
          }`}>
            {activeMode === 'rag' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#881337] animate-pulse"></span>
                <span className="font-semibold text-[#881337]">Document Grounded (RAG)</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
                <span className="font-semibold text-purple-800">Socratic Academic Tutor</span>
              </>
            )}
          </div>

          {activeMode === 'rag' && (
            <div className="relative">
              {documents.length > 0 ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-50 border border-rose-200 text-xs text-[#881337] font-medium">
                  <Bookmark className="w-3.5 h-3.5 text-[#881337]" />
                  <span className="max-w-55 truncate font-medium">
                    {selectedDoc ? selectedDoc.file_name : 'Select document'}
                  </span>
                </div>
              ) : (
                <button
                  onClick={onOpenUpload}
                  className="text-xs text-[#881337] hover:underline font-medium flex items-center gap-1"
                >
                  Upload PDF notes to enable RAG citations
                </button>
              )}
            </div>
          )}
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="px-2.5 py-1 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors text-xs flex items-center gap-1.5 border border-stone-200"
            title="Reset conversation"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear History</span>
          </button>
        )}
      </header>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto my-auto py-12">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-50 via-rose-50 to-amber-50 border border-stone-200 flex items-center justify-center mx-auto mb-3.5 shadow-xs">
              <GraduationCap className="w-7 h-7 text-[#881337]" />
            </div>

            <h2 className="text-2xl font-serif font-bold text-stone-950 tracking-tight">
              What are we studying today?
            </h2>
            <p className="text-xs text-stone-500 mt-1.5 leading-relaxed max-w-md">
              Ask any concept question, explore algorithms, or attach lecture slides for verified page-referenced explanations.
            </p>

            {/* Smart Study Starters */}
            <div className="grid grid-cols-2 gap-2.5 mt-6 w-full text-left">
              {[
                { label: 'Explain Dijkstra\'s Algorithm step-by-step', mode: 'general', color: 'purple' },
                { label: 'How does Virtual Memory Paging work in OS?', mode: 'general', color: 'purple' },
                { label: 'Summarize key theorems from uploaded notes', mode: 'rag', color: 'rose' },
                { label: 'Generate a 5-question exam practice quiz', mode: 'quiz', color: 'emerald' },
              ].map((starter, i) => {
                const hoverBorder = starter.color === 'purple' 
                  ? 'hover:border-purple-400 hover:bg-purple-50/20' 
                  : starter.color === 'rose' 
                  ? 'hover:border-rose-400 hover:bg-rose-50/20' 
                  : 'hover:border-emerald-400 hover:bg-emerald-50/20';

                const sparkColor = starter.color === 'purple'
                  ? 'text-purple-600'
                  : starter.color === 'rose'
                  ? 'text-[#881337]'
                  : 'text-emerald-600';

                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (starter.mode === 'quiz') {
                        setActiveMode('quiz');
                      } else if (starter.mode === 'rag' && documents.length > 0) {
                        setActiveMode('rag');
                        handleSend(starter.label);
                      } else {
                        handleSend(starter.label);
                      }
                    }}
                    className={`p-3.5 rounded-xl paper-card border border-stone-200 ${hoverBorder} text-xs text-stone-700 hover:text-stone-950 transition-all text-left flex items-start justify-between group`}
                  >
                    <span className="font-medium">{starter.label}</span>
                    <Sparkles className={`w-3.5 h-3.5 ${sparkColor} opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2`} />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-150`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-[#fff1f2] border border-[#fecdd3] text-[#881337] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-2xl p-5 text-sm ${
                    isUser 
                      ? 'bg-[#1c1917] text-[#fdfbf7] shadow-xs rounded-tr-none'
                      : 'paper-card text-[#1c1917] rounded-tl-none'
                  }`}>
                    {/* Message Body */}
                    <div className={isUser ? 'whitespace-pre-wrap' : 'prose-academic'}>
                      {isUser ? (
                        msg.content
                      ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>

                    {/* Citations & Evidence Tray */}
                    {!isUser && msg.citations && msg.citations.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-[#e7e4dc]">
                        <p className="text-[11px] font-semibold text-[#78716c] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#166534]" />
                          <span>Cited Notes Excerpts ({msg.citations.length})</span>
                        </p>

                        <div className="space-y-1.5">
                          {msg.citations.map((cite, cIdx) => {
                            const citeId = `${msg.id}-${cIdx}`;
                            const isExpanded = expandedCitation === citeId;

                            return (
                              <div
                                key={cIdx}
                                className="p-2.5 rounded-xl bg-amber-50/20 border border-amber-200/70 text-xs transition-colors hover:bg-white"
                              >
                                <div
                                  onClick={() => setExpandedCitation(isExpanded ? null : citeId)}
                                  className="flex items-center justify-between cursor-pointer select-none"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <FileText className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                    <span className="text-stone-900 font-medium truncate max-w-55">
                                      {cite.fileName}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono font-bold">
                                      Slide / Page {cite.pageNumber}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-emerald-700 font-mono font-bold">
                                      {cite.similarity}% match
                                    </span>
                                    <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                  </div>
                                </div>

                                {isExpanded && (
                                  <div className="mt-2.5 pt-2 border-t border-amber-200/60 text-stone-700 text-[11px] leading-relaxed italic bg-white p-2.5 rounded-lg">
                                    "{cite.snippet}"
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className={`mt-2 text-[10px] text-right ${isUser ? 'text-[#a8a29e]' : 'text-[#a8a29e]'}`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Natural Thinking Indicator */}
            {isLoading && (
              <div className="flex gap-3.5 justify-start animate-in fade-in duration-150">
                <div className="w-8 h-8 rounded-xl bg-[#fff1f2] border border-[#fecdd3] text-[#881337] flex items-center justify-center shrink-0 shadow-xs">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="paper-card rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2 text-xs text-[#78716c]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#881337] animate-bounce"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#881337] animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#881337] animate-bounce [animation-delay:0.4s]"></div>
                  <span className="ml-1 font-medium text-[#44403c]">
                    {activeMode === 'rag' ? 'Retrieving relevant pages & synthesizing answer...' : 'Reasoning with scholarly precision...'}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Dock */}
      <div className="p-4 border-t border-stone-200 bg-white/95 backdrop-blur-md shrink-0">
        <div className="max-w-3xl mx-auto relative flex items-end gap-2 bg-stone-50 border border-stone-200 rounded-2xl p-2 shadow-xs focus-within:border-[#881337] focus-within:bg-white focus-within:shadow-sm transition-all">
          <button
            onClick={onOpenUpload}
            className="p-2 rounded-xl text-stone-500 hover:text-[#881337] hover:bg-[#fff1f2] transition-colors"
            title="Attach PDF notes"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (activeMode === 'general' && documents.length > 0) {
                setActiveMode('rag');
              } else {
                setActiveMode('general');
              }
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all shrink-0 mb-1 ${
              activeMode === 'rag'
                ? 'bg-[#fff1f2] text-[#881337] border-[#fecdd3]'
                : 'bg-white text-stone-600 border-stone-200 hover:text-stone-900'
            }`}
          >
            {activeMode === 'rag' ? '📚 Notes Active' : '🌐 General'}
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeMode === 'rag'
                ? `Ask questions about ${selectedDoc ? selectedDoc.file_name : 'your notes'}...`
                : 'Ask a question or request an explanation...'
            }
            className="flex-1 max-h-32 min-h-9.5 bg-transparent text-sm text-stone-900 placeholder-stone-400 focus:outline-none resize-none py-1.5 px-1 leading-relaxed"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`p-2.5 rounded-xl btn-academic text-white transition-all shadow-xs shrink-0 mb-0.5 ${
              !input.trim() || isLoading
                ? 'opacity-30 cursor-not-allowed shadow-none'
                : 'hover:scale-102'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-stone-400 mt-2">
          MindShelf Atelier • Grounded with pgvector • Press Enter to send
        </p>
      </div>
    </div>
  );
}
