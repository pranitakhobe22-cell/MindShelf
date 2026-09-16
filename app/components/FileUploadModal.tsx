'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, X, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (doc: any) => void;
}

export default function FileUploadModal({ isOpen, onClose, onSuccess }: FileUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (selected.name.toLowerCase().endsWith('.pdf')) {
        setFile(selected);
        setError(null);
      } else {
        setError('Please select a PDF document.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.name.toLowerCase().endsWith('.pdf')) {
        setFile(selected);
        setError(null);
      } else {
        setError('Please select a PDF document.');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);

      setCurrentStep('Extracting text & page boundaries...');
      const formData = new FormData();
      formData.append('file', file);

      setTimeout(() => {
        setCurrentStep('Computing 768-dimensional embeddings with Gemini...');
      }, 1500);

      setTimeout(() => {
        setCurrentStep('Indexing vectors into Supabase pgvector...');
      }, 3500);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to process document');
      }

      setCurrentStep('Indexed successfully!');
      setTimeout(() => {
        onSuccess(data.document);
        onClose();
        setFile(null);
        setIsUploading(false);
      }, 700);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during upload.');
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 text-stone-900">
      <div className="w-full max-w-md bg-white border border-stone-200 rounded-3xl shadow-xl p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#fff1f2] text-[#881337] border border-[#fecdd3] flex items-center justify-center">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-stone-950">Add to MindShelf</h3>
              <p className="text-xs text-stone-500">Indexes document chunks for verified page citations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            file
              ? 'border-[#881337] bg-[#fff1f2]/30'
              : 'border-stone-200 hover:border-[#881337] hover:bg-stone-50/60'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf"
            className="hidden"
            disabled={isUploading}
          />

          {file ? (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-[#fff1f2] text-[#881337] border border-[#fecdd3] flex items-center justify-center mb-2">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-stone-900 max-w-xs truncate">{file.name}</p>
              <p className="text-[11px] text-stone-500 mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              {!isUploading && (
                <span className="mt-1.5 text-[11px] text-[#881337] hover:underline font-semibold">Choose another file</span>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-500 flex items-center justify-center mb-2">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-stone-900">Drag & drop course PDF here</p>
              <p className="text-[11px] text-stone-500 mt-0.5">or click to browse documents</p>
              <p className="text-[10px] text-stone-400 mt-2 font-mono">Lecture notes, syllabus, textbook chapters</p>
            </div>
          )}
        </div>

        {/* Progress Tracker */}
        {isUploading && (
          <div className="mt-3.5 p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-2.5">
            <Loader2 className="w-4 h-4 text-[#881337] animate-spin shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-stone-900">{currentStep}</p>
              <div className="w-full h-1 bg-stone-200 rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-[#881337] animate-pulse w-3/4 rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-3 p-3 rounded-xl bg-[#fff1f2] border border-[#fecdd3] flex items-start gap-2 text-[#881337] text-xs">
            <AlertCircle className="w-4 h-4 text-[#881337] shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2.5 mt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all ${
              !file || isUploading
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                : 'btn-academic text-white shadow-xs'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Indexing Chunks...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Add to Shelf</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
