'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  BookOpen, 
  Bookmark,
  GraduationCap
} from 'lucide-react';
import { DocumentItem } from './Sidebar';

interface SummaryViewProps {
  selectedDoc: DocumentItem | null;
  onOpenUpload: () => void;
}

export default function SummaryView({ selectedDoc, onOpenUpload }: SummaryViewProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerateSummary = async () => {
    if (!selectedDoc) return;
    try {
      setIsLoading(true);
      setSummary(null);

      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: selectedDoc.id }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to synthesize study guide');
      }

      setSummary(data.summary);
    } catch (err: any) {
      console.error('Summary error:', err);
      alert(err.message || 'Could not generate summary.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto p-8 flex flex-col items-center bg-white text-stone-900">
      {!selectedDoc ? (
        <div className="my-auto max-w-md text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <BookOpen className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-serif font-bold text-stone-950">Select Course Material</h2>
          <p className="text-xs text-stone-500 mt-1 mb-4">
            Pick a document from your shelf to generate a structured revision cheat sheet and formula guide.
          </p>
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 rounded-xl btn-amber text-white text-xs font-semibold shadow-xs"
          >
            Add PDF to Shelf
          </button>
        </div>
      ) : (
        <div className="max-w-3xl w-full">
          {/* Header Card */}
          <div className="paper-card rounded-2xl p-4 flex items-center justify-between mb-5 shadow-xs border-amber-200/40">
            <div className="flex items-center gap-3 truncate pr-4">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center shrink-0">
                <FileText className="w-4.5 h-4.5" />
              </div>
              <div className="truncate">
                <h3 className="text-sm font-serif font-bold text-stone-950 truncate">{selectedDoc.file_name}</h3>
                <p className="text-[11px] text-stone-500">
                  {selectedDoc.total_pages} pages indexed in Supabase pgvector
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {summary && (
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium flex items-center gap-1.5 border border-stone-200 transition-colors"
                  title="Copy to clipboard"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
              <button
                onClick={handleGenerateSummary}
                disabled={isLoading}
                className="px-3.5 py-1.5 rounded-lg btn-amber text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>{summary ? 'Regenerate' : 'Generate Cheat Sheet'}</span>
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border-2 border-stone-200 border-t-amber-600 animate-spin mb-3"></div>
              <p className="text-sm font-serif font-bold text-stone-950">Compiling Revision Guide...</p>
              <p className="text-xs text-stone-500 mt-1">Reading document chunks & extracting key formulas</p>
            </div>
          )}

          {/* Study Guide Content */}
          {summary && !isLoading && (
            <div className="paper-card rounded-2xl p-8 shadow-xs border border-stone-200 animate-in fade-in duration-150">
              <div className="prose-academic max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {summary}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Prompt State */}
          {!summary && !isLoading && (
            <div className="py-16 text-center rounded-2xl border border-dashed border-amber-200 bg-amber-50/30">
              <Bookmark className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <h4 className="text-sm font-serif font-bold text-stone-950">Ready to Synthesize</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
                Click above to generate an executive overview, core terminology, and high-yield exam practice points.
              </p>
              <button
                onClick={handleGenerateSummary}
                className="px-4 py-2 rounded-xl btn-amber text-white text-xs font-semibold"
              >
                Generate Revision Guide
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
