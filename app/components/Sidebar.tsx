'use client';

import React from 'react';
import { 
  BookOpen, 
  MessageSquare, 
  FileText, 
  CheckCircle2, 
  Upload, 
  Trash2, 
  Database, 
  Bookmark, 
  ChevronRight,
  Plus,
  User,
  LogOut,
  ArrowLeft,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import Logo from './Logo';

export interface DocumentItem {
  id: string;
  file_name: string;
  total_pages: number;
  file_size?: number;
  created_at?: string;
}

interface SidebarProps {
  activeMode: 'general' | 'rag' | 'quiz' | 'summary';
  setActiveMode: (mode: 'general' | 'rag' | 'quiz' | 'summary') => void;
  documents: DocumentItem[];
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;
  onOpenUpload: () => void;
  onDeleteDoc: (id: string) => void;
  onNewChat: () => void;
  user: any;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onViewLanding: () => void;
}

export default function Sidebar({
  activeMode,
  setActiveMode,
  documents,
  selectedDocId,
  setSelectedDocId,
  onOpenUpload,
  onDeleteDoc,
  onNewChat,
  user,
  onOpenAuth,
  onSignOut,
  onViewLanding,
}: SidebarProps) {
  return (
    <aside className="w-80 h-screen flex flex-col bg-white border-r border-stone-200 select-none text-stone-900">
      {/* Brand Header */}
      <div className="p-4 border-b border-stone-200 bg-stone-50/50">
        <div className="flex items-center justify-between">
          <Logo size="sm" onClick={onViewLanding} />

          <button
            onClick={onViewLanding}
            className="px-2 py-1 rounded-lg text-stone-500 hover:text-[#881337] hover:bg-stone-100 transition-colors text-[11px] font-semibold flex items-center gap-1 border border-stone-200"
            title="Return to Overview"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Landing</span>
          </button>
        </div>

        {/* User Account Bar */}
        <div className="mt-3 pt-2.5 border-t border-stone-200 flex items-center justify-between text-xs">
          {user ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 min-w-0 pr-1">
                <div className="w-5 h-5 rounded-full bg-[#fff1f2] text-[#881337] border border-[#fecdd3] flex items-center justify-center text-[10px] font-bold shrink-0">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="truncate text-[11px] text-stone-700 font-medium max-w-36">
                  {user.email}
                </span>
              </div>
              <button
                onClick={onSignOut}
                className="p-1 rounded text-stone-400 hover:text-[#881337] hover:bg-[#fff1f2] transition-colors shrink-0"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-stone-500 font-medium">Guest Study Session</span>
              <button
                onClick={onOpenAuth}
                className="text-[11px] font-bold text-[#881337] hover:underline"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        {/* New Session Button */}
        <button
          onClick={onNewChat}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-semibold transition-all shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 text-[#881337]" />
          <span>New Study Session</span>
        </button>
      </div>

      {/* Navigation Modules */}
      <div className="px-3 py-3 border-b border-stone-200">
        <p className="text-[10px] uppercase tracking-wider font-bold text-[#a8a29e] mb-1.5 px-2">
          Study Modules
        </p>
        <div className="space-y-1">
          <button
            onClick={() => setActiveMode('general')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'general'
                ? 'bg-purple-900 text-white shadow-xs'
                : 'text-stone-700 hover:bg-purple-50/80 hover:text-purple-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className={`w-4 h-4 ${activeMode === 'general' ? 'text-purple-200' : 'text-purple-600'}`} />
              <span>General Study Desk</span>
            </div>
            {activeMode === 'general' && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
          </button>

          <button
            onClick={() => {
              setActiveMode('rag');
              if (!selectedDocId && documents.length > 0) {
                setSelectedDocId(documents[0].id);
              }
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'rag'
                ? 'bg-[#881337] text-white shadow-xs'
                : 'text-stone-700 hover:bg-rose-50/80 hover:text-[#881337]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bookmark className={`w-4 h-4 ${activeMode === 'rag' ? 'text-rose-200' : 'text-[#881337]'}`} />
              <span>Notes & Document Q&A</span>
            </div>
            {activeMode === 'rag' && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
          </button>

          <button
            onClick={() => {
              setActiveMode('quiz');
              if (!selectedDocId && documents.length > 0) {
                setSelectedDocId(documents[0].id);
              }
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'quiz'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:bg-emerald-50/80 hover:text-emerald-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className={`w-4 h-4 ${activeMode === 'quiz' ? 'text-emerald-200' : 'text-emerald-600'}`} />
              <span>Exam Practice Quiz</span>
            </div>
            {activeMode === 'quiz' && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
          </button>

          <button
            onClick={() => {
              setActiveMode('summary');
              if (!selectedDocId && documents.length > 0) {
                setSelectedDocId(documents[0].id);
              }
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'summary'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'text-stone-700 hover:bg-amber-50/80 hover:text-amber-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className={`w-4 h-4 ${activeMode === 'summary' ? 'text-amber-200' : 'text-amber-600'}`} />
              <span>Revision Cheat Sheet</span>
            </div>
            {activeMode === 'summary' && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
          </button>
        </div>
      </div>

      {/* Document Shelf */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <div className="flex items-center justify-between mb-2 px-2">
          <p className="text-[10px] uppercase tracking-wider font-bold text-[#a8a29e]">
            Notes Shelf ({documents.length})
          </p>
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1 text-[11px] text-[#881337] hover:underline font-bold transition-colors"
          >
            <Upload className="w-3 h-3" />
            <span>Add PDF</span>
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="p-5 rounded-2xl border border-dashed border-stone-200 text-center my-2 bg-stone-50/50">
            <FileText className="w-6 h-6 text-stone-400 mx-auto mb-1.5 opacity-60" />
            <p className="text-xs text-stone-900 font-bold font-serif">Your shelf is empty</p>
            <p className="text-[11px] text-stone-500 mt-0.5">Upload textbook chapters or lecture slides</p>
            <button
              onClick={onOpenUpload}
              className="mt-3 px-3.5 py-1.5 text-xs bg-[#fff1f2] hover:bg-[#ffe4e6] text-[#881337] border border-[#fecdd3] rounded-xl transition-all font-bold inline-block"
            >
              Add Document
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {documents.map((doc) => {
              const isSelected = selectedDocId === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDocId(doc.id);
                    if (activeMode === 'general') setActiveMode('rag');
                  }}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#fff1f2] border-[#fecdd3] shadow-xs ring-1 ring-[#881337]/20'
                      : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#ffe4e6] text-[#881337]' : 'bg-stone-100 text-stone-500'}`}>
                      <FileText className="w-4 h-4 shrink-0" />
                    </div>
                    <div className="truncate">
                      <p className={`text-xs font-medium truncate ${isSelected ? 'text-[#881337] font-bold' : 'text-stone-900'}`}>
                        {doc.file_name}
                      </p>
                      <p className="text-[10px] text-stone-400">
                        {doc.total_pages} {doc.total_pages === 1 ? 'page' : 'pages'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDoc(doc.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-all"
                    title="Remove from shelf"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Clean Status Footer */}
      <div className="p-4 pb-7 border-t border-stone-200 bg-stone-50/60 text-[11px] text-stone-500">
        <div className="flex items-center justify-between mb-1.5">
          <span className="flex items-center gap-1.5 font-semibold text-stone-700">
            <Database className="w-3.5 h-3.5 text-[#166534]" />
            <span>Supabase pgvector</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f0fdf4] text-[#166534] font-bold border border-[#bbf7d0]">
            Connected
          </span>
        </div>
        <div className="flex items-center justify-between text-stone-500">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#881337]" />
            <span>Gemini 2.5 Flash</span>
          </span>
          <span className="text-[10px] font-mono text-stone-400">
            768-dim RAG
          </span>
        </div>
      </div>
    </aside>
  );
}
