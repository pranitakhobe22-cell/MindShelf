'use client';

import React, { useState } from 'react';
import { supabaseClient } from '@/lib/supabase-client';
import { X, Lock, Mail, ArrowRight, Loader2, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          setSuccessMsg('Account created successfully! You can now sign in.');
          setTimeout(() => {
            onSuccess(data.user);
            onClose();
          }, 1000);
        }
      } else {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          onSuccess(data.user);
          onClose();
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 text-stone-900">
      <div className="w-full max-w-sm bg-white border border-stone-200 rounded-3xl shadow-xl p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#fff1f2] text-[#881337] border border-[#fecdd3] flex items-center justify-center">
              <BookOpen className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-stone-950">
                {isSignUp ? 'Create Study Account' : 'Welcome to MindShelf'}
              </h3>
              <p className="text-[11px] text-stone-500">
                {isSignUp ? 'Keep your notes and quizzes private' : 'Sign in to access your personal shelf'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mt-4">
          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
              University / Personal Email
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#881337] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#881337] focus:bg-white transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-[#fff1f2] border border-[#fecdd3] flex items-start gap-2 text-[#881337] text-xs">
              <AlertCircle className="w-3.5 h-3.5 text-[#881337] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-start gap-2 text-[#14532d] text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#166534] shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 rounded-xl btn-academic text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              onSuccess({ email: 'guest@mind-shelf.internal', isGuest: true });
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors border border-stone-200"
          >
            Continue as Guest (No Login Required)
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-stone-200 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-[11px] text-stone-500 hover:text-stone-900 transition-colors"
          >
            {isSignUp ? (
              <span>Already have an account? <strong className="text-[#881337]">Sign in</strong></span>
            ) : (
              <span>New to MindShelf? <strong className="text-[#881337]">Create study account</strong></span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
