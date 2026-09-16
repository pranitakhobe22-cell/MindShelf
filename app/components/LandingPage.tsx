'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Award, 
  ChevronRight,
  User,
  LogOut,
  Zap,
  Bookmark,
  Compass,
  GraduationCap,
  ShieldCheck,
  Mail,
  Lock,
  Loader2,
  HelpCircle,
  BookMarked,
  ScrollText,
  Lightbulb,
  Check,
  Search,
  MessageSquare,
  Clock,
  Target
} from 'lucide-react';
import { supabaseClient } from '@/lib/supabase-client';
import Logo from './Logo';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenAuth: () => void;
  user: any;
  onSignOut: () => void;
  onSelectFeatureMode: (mode: 'general' | 'rag' | 'quiz' | 'summary') => void;
}

export default function LandingPage({
  onEnterApp,
  onOpenAuth,
  user,
  onSignOut,
  onSelectFeatureMode,
}: LandingPageProps) {
  const [activePortalTab, setActivePortalTab] = useState<'instant' | 'auth'>('instant');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Interactive citation preview state
  const [demoCitationOpen, setDemoCitationOpen] = useState(true);

  const handleQuickAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        onEnterApp();
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Authentication error');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-stone-900 flex flex-col font-sans antialiased selection:bg-[#881337] selection:text-white relative">
      {/* ─────────────────────────────────────────────────────────────
          1. SLEEK NAVBAR (Student-Friendly)
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-stone-200/80 bg-white/95 backdrop-blur-md transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-18 flex items-center justify-between">
          {/* Logo & Brand */}
          <Logo size="md" />

          {/* Center Navigation Capsule */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-100/70 p-1 rounded-xl border border-stone-200/60">
            <a 
              href="#how-it-works" 
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:text-[#881337] hover:bg-white hover:shadow-xs transition-all"
            >
              How It Works
            </a>
            <a 
              href="#features" 
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:text-[#881337] hover:bg-white hover:shadow-xs transition-all"
            >
              Study Tools
            </a>
            <a 
              href="#verify-citations" 
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:text-[#881337] hover:bg-white hover:shadow-xs transition-all"
            >
              Real Citations
            </a>
            <a 
              href="#practice-quizzes" 
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:text-[#881337] hover:bg-white hover:shadow-xs transition-all"
            >
              Practice Exams
            </a>
            <a 
              href="#portal" 
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:text-[#881337] hover:bg-white hover:shadow-xs transition-all"
            >
              Try It Live
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onEnterApp}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold btn-academic shadow-xs flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Open My Study Desk</span>
                </button>
                <button
                  onClick={onSignOut}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-stone-500 hover:text-[#881337] hover:bg-[#fff1f2] border border-stone-200 transition-all"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={onOpenAuth}
                  className="px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold text-stone-700 hover:text-[#881337] bg-white hover:bg-stone-50 border border-stone-200 shadow-xs transition-all flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-[#881337]" />
                  <span>Student Sign In</span>
                </button>
                <button
                  onClick={onEnterApp}
                  className="px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold btn-academic flex items-center gap-1.5 shadow-sm shadow-[#881337]/20"
                >
                  <span>Start Studying Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. USER-CENTRIC HERO SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-24 border-b border-stone-200/80 overflow-hidden bg-white">
        {/* Harmonious Academic Aurora Accents */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-180 h-90 bg-linear-to-tr from-rose-100/40 via-purple-50/30 to-amber-100/30 blur-[100px] pointer-events-none -z-10 rounded-full"></div>

        <div className="max-w-5xl mx-auto px-6 text-center">
          {/* User-focused Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-50 border border-stone-200 text-xs text-stone-700 font-semibold mb-6 shadow-xs">
            <GraduationCap className="w-4 h-4 text-[#881337]" />
            <span>Built for college students, professors, and exam takers</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-stone-950 leading-[1.12]">
            From pages to <br className="hidden sm:inline" />
            <span className="italic text-[#881337] font-serif">profound understanding</span>.
          </h1>

          <p className="text-lg sm:text-2xl font-serif text-stone-800 mt-4 max-w-3xl mx-auto font-medium leading-snug">
            Everything you need to comprehend, retain, and master what you study.
          </p>

          <p className="text-xs sm:text-base text-stone-600 max-w-2xl mx-auto mt-3.5 leading-relaxed font-normal">
            Upload lecture slide decks, course syllabus, and dense textbooks. MindShelf turns hundreds of complex pages into clear explanations with <strong>verified slide citations</strong>, <strong>active recall practice exams</strong>, and <strong>1-page revision cheat sheets</strong>.
          </p>

          {/* ─────────────────────────────────────────────────────────────
              3. LIVE STUDENT STUDY DESK (Direct Access)
          ───────────────────────────────────────────────────────────── */}
          <div id="portal" className="max-w-lg mx-auto mt-10 p-6 sm:p-7 rounded-3xl bg-white border border-stone-200 shadow-xl shadow-stone-200/50 text-left relative">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-serif font-bold text-stone-950 flex items-center gap-2">
                  <span>Your Instant Study Desk</span>
                  <span className="w-2 h-2 rounded-full bg-[#166534] animate-pulse"></span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">Pick what you need to study right now</p>
              </div>

              {/* Portal Mode Switcher */}
              <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-semibold">
                <button
                  onClick={() => setActivePortalTab('instant')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activePortalTab === 'instant'
                      ? 'bg-white text-stone-900 shadow-xs font-bold'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  Quick Study
                </button>
                <button
                  onClick={() => setActivePortalTab('auth')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activePortalTab === 'auth'
                      ? 'bg-white text-stone-900 shadow-xs font-bold'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {user ? 'My Account' : 'Sign In'}
                </button>
              </div>
            </div>

            {/* Tab 1: Instant Desk Access */}
            {activePortalTab === 'instant' ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="text-stone-900">Jump right into studying:</strong> Ask questions about tough course concepts, upload your lecture PDF, or generate a 5-question test with instant scoring.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* General Concept Tutor - Royal Plum */}
                  <button
                    onClick={() => onSelectFeatureMode('general')}
                    className="p-3 rounded-xl border border-purple-200/90 bg-purple-50/40 hover:border-purple-400 hover:bg-purple-50 text-stone-900 font-semibold transition-all text-left flex items-center justify-between group shadow-2xs"
                  >
                    <div>
                      <span className="block text-purple-950 font-bold">💬 Socratic Tutor</span>
                      <span className="text-[10px] text-purple-700 font-normal">Ask any tough concept</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-purple-700 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>

                  {/* Document Notes RAG - Oxford Crimson */}
                  <button
                    onClick={() => onSelectFeatureMode('rag')}
                    className="p-3 rounded-xl border border-rose-200/90 bg-rose-50/40 hover:border-[#881337] hover:bg-rose-50 text-stone-900 font-semibold transition-all text-left flex items-center justify-between group shadow-2xs"
                  >
                    <div>
                      <span className="block text-rose-950 font-bold">📚 Search My Notes</span>
                      <span className="text-[10px] text-rose-700 font-normal">With slide citations</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#881337] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>

                  {/* Practice Exam Quiz - Ivy Emerald */}
                  <button
                    onClick={() => onSelectFeatureMode('quiz')}
                    className="p-3 rounded-xl border border-emerald-200/90 bg-emerald-50/40 hover:border-emerald-500 hover:bg-emerald-50 text-stone-900 font-semibold transition-all text-left flex items-center justify-between group shadow-2xs"
                  >
                    <div>
                      <span className="block text-emerald-950 font-bold">📝 Practice Quiz</span>
                      <span className="text-[10px] text-emerald-700 font-normal">5 exam questions</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-700 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>

                  {/* Revision Guide Summary - Antique Gold / Amber */}
                  <button
                    onClick={() => onSelectFeatureMode('summary')}
                    className="p-3 rounded-xl border border-amber-200/90 bg-amber-50/40 hover:border-amber-500 hover:bg-amber-50 text-stone-900 font-semibold transition-all text-left flex items-center justify-between group shadow-2xs"
                  >
                    <div>
                      <span className="block text-amber-950 font-bold">📋 Revision Guide</span>
                      <span className="text-[10px] text-amber-800 font-normal">Formulas & definitions</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-700 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                </div>

                <button
                  onClick={onEnterApp}
                  className="w-full py-3.5 rounded-xl btn-academic text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Open Full Study Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Tab 2: Account Authentication */
              <div className="space-y-3">
                {user ? (
                  <div className="p-4 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-xs text-[#14532d] flex items-center justify-between">
                    <div>
                      <p className="font-bold">Signed in as {user.email}</p>
                      <p className="text-[11px] text-[#166534] mt-0.5">Your private library and quiz scores are active</p>
                    </div>
                    <button
                      onClick={onSignOut}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#bbf7d0] text-[#166534] text-[11px] font-semibold hover:bg-[#f0fdf4]"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleQuickAuth} className="space-y-3">
                    <div>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="student@university.edu"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#881337] focus:bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password (min 6 characters)"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#881337] focus:bg-white"
                        />
                      </div>
                    </div>

                    {authError && (
                      <p className="text-[11px] text-[#881337] bg-[#fff1f2] p-2 rounded-lg border border-[#fecdd3]">{authError}</p>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="flex-1 py-2.5 rounded-xl btn-academic text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        {authLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Sign In to Shelf</span>}
                      </button>
                      <button
                        type="button"
                        onClick={onOpenAuth}
                        className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-semibold"
                      >
                        Register
                      </button>
                    </div>
                  </form>
                )}

                <button
                  type="button"
                  onClick={onEnterApp}
                  className="w-full text-center text-[11px] text-[#881337] hover:underline font-semibold pt-1 block"
                >
                  Continue as Guest without login →
                </button>
              </div>
            )}
          </div>

          {/* Student Benefits Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto mt-12 pt-8 border-t border-stone-200 text-left">
            <div>
              <p className="text-xl sm:text-2xl font-serif font-bold text-purple-700">Zero Guessing</p>
              <p className="text-xs text-stone-500 font-medium mt-0.5">Exact slide & page tags</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-serif font-bold text-[#881337]">100% Reliable</p>
              <p className="text-xs text-stone-500 font-medium mt-0.5">Answers only from your notes</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-serif font-bold text-[#166534]">Active Recall</p>
              <p className="text-xs text-stone-500 font-medium mt-0.5">Retain 80% more for finals</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-serif font-bold text-[#b45309]">Instant Guides</p>
              <p className="text-xs text-stone-500 font-medium mt-0.5">Formulas & exam cheat sheets</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. HOW IT WORKS (Simple 3-Step Student Workflow)
      ───────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20 bg-white">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-800 border border-stone-200 mb-2">
            <Clock className="w-3.5 h-3.5 text-stone-600" />
            <span>Simple 3-Step Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-950 tracking-tight">
            How students study with MindShelf
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-md mx-auto">
            Spend less time searching through slides and more time actually understanding the material.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 text-left">
          {/* Step 1: Oxford Crimson */}
          <div className="p-7 rounded-3xl bg-white border border-stone-200 hover:border-rose-300 hover:bg-rose-50/10 shadow-xs transition-all">
            <span className="w-8 h-8 rounded-xl bg-[#881337] text-white text-sm font-serif font-bold flex items-center justify-center mb-4 shadow-xs">1</span>
            <h3 className="text-base font-serif font-bold text-stone-950 mb-2">
              Drop In Your Course Materials
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Upload your professor's lecture slide decks, syllabus, research papers, or textbook chapters in PDF format. MindShelf indexes and preserves every page in your shelf.
            </p>
          </div>

          {/* Step 2: Royal Plum */}
          <div className="p-7 rounded-3xl bg-white border border-stone-200 hover:border-purple-300 hover:bg-purple-50/10 shadow-xs transition-all">
            <span className="w-8 h-8 rounded-xl bg-purple-700 text-white text-sm font-serif font-bold flex items-center justify-center mb-4 shadow-xs">2</span>
            <h3 className="text-base font-serif font-bold text-stone-950 mb-2">
              Ask Doubts & Verify Slide Citations
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Ask questions in plain English. MindShelf gives you a clear explanation and shows the exact slide or page where the professor covered it so you can verify with confidence.
            </p>
          </div>

          {/* Step 3: Ivy Emerald */}
          <div className="p-7 rounded-3xl bg-white border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/10 shadow-xs transition-all">
            <span className="w-8 h-8 rounded-xl bg-emerald-700 text-white text-sm font-serif font-bold flex items-center justify-center mb-4 shadow-xs">3</span>
            <h3 className="text-base font-serif font-bold text-stone-950 mb-2">
              Quiz Yourself & Cement Mastery
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Before exam day, generate a 5-question multiple-choice practice test. Get immediate feedback, see where you made mistakes, and read explanations with direct page references.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. CORE STUDY TOOLS (4-Color Academic Atelier Suite)
      ───────────────────────────────────────────────────────────── */}
      <section id="features" className="border-t border-b border-stone-200 bg-stone-50/60 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-stone-800 border border-stone-200 mb-2 shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Dedicated Study Suite</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-950 tracking-tight">
              Everything you need to master your syllabus
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-md mx-auto">
              Click any study tool below to jump straight into that mode in your workspace.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Tool 1: Socratic AI Tutor (Royal Plum) */}
            <div 
              onClick={() => onSelectFeatureMode('general')}
              className="rounded-3xl p-6 sm:p-7 flex flex-col justify-between cursor-pointer group bg-white border border-stone-200 hover:border-purple-400 hover:shadow-md transition-all"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-6 h-6 text-purple-700" />
                </div>

                <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 mb-2 border border-purple-200">
                  Concept Synthesis
                </div>
                <h3 className="text-lg font-serif font-bold text-stone-950 mb-2 group-hover:text-purple-900 transition-colors">
                  Socratic AI Tutor
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Break down difficult algorithms, mathematical proofs, and theories step-by-step with an adaptive Socratic academic guide.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-purple-700 font-bold">
                <span>Ask Any Concept</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Tool 2: Document Notes RAG (Oxford Crimson) */}
            <div 
              onClick={() => onSelectFeatureMode('rag')}
              className="rounded-3xl p-6 sm:p-7 flex flex-col justify-between cursor-pointer group bg-white border border-stone-200 hover:border-[#881337] hover:shadow-md transition-all"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Bookmark className="w-6 h-6 text-[#881337]" />
                </div>

                <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-[#881337] mb-2 border border-rose-200">
                  Slide-Grounded Q&A
                </div>
                <h3 className="text-lg font-serif font-bold text-stone-950 mb-2 group-hover:text-[#881337] transition-colors">
                  Talk to Lecture Slides
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Never spend 20 minutes scrolling through slides again. Ask about any equation or theorem with exact slide citations attached.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-[#881337] font-bold">
                <span>Search Your Notes</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Tool 3: Practice Exam Generator (Ivy Emerald) */}
            <div 
              onClick={() => onSelectFeatureMode('quiz')}
              className="rounded-3xl p-6 sm:p-7 flex flex-col justify-between cursor-pointer group bg-white border border-stone-200 hover:border-emerald-500 hover:shadow-md transition-all"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                </div>

                <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 mb-2 border border-emerald-200">
                  Active Recall Quizzes
                </div>
                <h3 className="text-lg font-serif font-bold text-stone-950 mb-2 group-hover:text-emerald-900 transition-colors">
                  Realistic Practice Exams
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Passive reading doesn't stick. Test your memory with 5-question practice quizzes with instant scoring and slide-referenced explanations.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-emerald-700 font-bold">
                <span>Start Practice Quiz</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Tool 4: Revision Cheat Sheet (Antique Amber) */}
            <div 
              onClick={() => onSelectFeatureMode('summary')}
              className="rounded-3xl p-6 sm:p-7 flex flex-col justify-between cursor-pointer group bg-white border border-stone-200 hover:border-amber-400 hover:shadow-md transition-all"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6 text-amber-800" />
                </div>

                <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 mb-2 border border-amber-200">
                  Exam Cheat Sheets
                </div>
                <h3 className="text-lg font-serif font-bold text-stone-950 mb-2 group-hover:text-amber-900 transition-colors">
                  1-Page Revision Guide
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Condenses 50-page chapters into an executive briefing, core vocabulary definitions, formula cheat sheets, and typical exam questions.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-amber-800 font-bold">
                <span>Generate Cheat Sheet</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. REAL CITATIONS IN ACTION (User Proof)
      ───────────────────────────────────────────────────────────── */}
      <section id="verify-citations" className="max-w-5xl mx-auto px-6 py-20 bg-white">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200 mb-2">
            <Search className="w-3 h-3 text-sky-700" />
            <span>Why Students Trust MindShelf</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-950 tracking-tight">
            See exactly which slide your answer comes from
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-xl mx-auto leading-relaxed">
            Generic AI chatbots invent facts and fake page references. MindShelf quotes directly from your uploaded materials and tags the exact page number so you can verify everything.
          </p>
        </div>

        {/* Live Citation Inspector Demo */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white border border-stone-200 shadow-md">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 flex items-center justify-center font-bold text-xs">
                📚
              </div>
              <div>
                <h4 className="text-sm font-serif font-bold text-stone-950">Example Student Query</h4>
                <p className="text-[11px] text-stone-500">From uploaded Computer Science lecture slides</p>
              </div>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Verified by Slide
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-stone-50 text-stone-800 font-medium flex items-center gap-2 border border-stone-200/60">
              <span className="text-sky-800 font-bold uppercase text-[10px]">Student Doubt:</span>
              <span>"What triggers a Page Fault in virtual memory, and what does the OS do next?"</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-stone-200 text-stone-800 leading-relaxed space-y-2">
              <p>
                A page fault occurs when the CPU references a virtual address whose valid bit in the page table is cleared (0), meaning the frame is stored on disk rather than RAM <span className="inline-block px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 font-serif font-bold text-[11px] border border-amber-300">[Slide 14]</span>. The OS pauses the process, reads the missing frame from storage into physical RAM, updates the page table, and resumes execution seamlessly.
              </p>
            </div>

            {/* Verified Citation Box */}
            <div className="p-3.5 rounded-xl bg-sky-50/40 border border-sky-200">
              <div 
                onClick={() => setDemoCitationOpen(!demoCitationOpen)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-sky-700" />
                  <span className="font-semibold text-stone-900">Lecture_04_VirtualMemory.pdf</span>
                  <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-mono font-bold">
                    Slide 14
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-emerald-700 font-bold">Direct Match</span>
                  <span className="text-[11px] text-sky-800 font-semibold underline">
                    {demoCitationOpen ? 'Hide Quote' : 'View Slide Quote'}
                  </span>
                </div>
              </div>

              {demoCitationOpen && (
                <div className="mt-2.5 pt-2.5 border-t border-sky-200 text-[11px] text-stone-700 italic bg-white p-3 rounded-lg">
                  "Slide 14: If valid-invalid bit is 0, the MMU signals a Page Fault Trap to the kernel. The kernel swaps in the requested frame from disk into an available frame in physical memory, updates the internal frame table, and restarts the instruction."
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => onSelectFeatureMode('rag')}
              className="px-5 py-2.5 rounded-xl btn-academic text-xs font-semibold inline-flex items-center gap-2 shadow-xs"
            >
              <span>Upload Your Own Class Slides</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Academic Comparison for Students */}
        <div className="mt-14 grid md:grid-cols-2 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-white border border-red-200 shadow-xs">
            <div className="flex items-center gap-2 text-red-800 font-bold mb-2">
              <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-xs">✕</span>
              <span>Generic AI Chatbots (ChatGPT, etc.)</span>
            </div>
            <ul className="space-y-2 text-stone-600 leading-relaxed">
              <li>• Pulls answers from general internet articles that may disagree with your professor.</li>
              <li>• Fabricates citations and makes up page numbers that don't exist.</li>
              <li>• Can't point you to where the concept was taught in class.</li>
              <li>• High risk of learning incorrect terms that lose points on exams.</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/20 border border-emerald-300 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-serif font-bold mb-2">
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-sans">✓</span>
              <span>MindShelf Study Atelier</span>
            </div>
            <ul className="space-y-2 text-stone-700 leading-relaxed">
              <li>• Strictly answers from the specific notes and slides you upload.</li>
              <li>• Every single answer quotes the exact slide or textbook page number.</li>
              <li>• Lets you double-check the source text in one click.</li>
              <li>• Ensures you use the exact terminology expected by your grading rubric.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. ACTIVE RECALL PRACTICE EXAMS (Pedagogy for Students)
      ───────────────────────────────────────────────────────────── */}
      <section id="practice-quizzes" className="border-t border-stone-200 bg-stone-50/50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-3">
                <Target className="w-3 h-3 text-emerald-700" />
                <span>Proven Exam Strategy</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-950 tracking-tight leading-snug">
                Remember more by testing yourself before the exam
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-4 leading-relaxed">
                Reading slides over and over gives a false sense of mastery. MindShelf creates custom <strong>5-question diagnostic tests</strong> directly from your materials with instant score analysis and explanations.
              </p>

              <div className="mt-6 space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span className="text-stone-700"><strong>Instant Green/Red Feedback:</strong> Find out immediately where your knowledge gaps are.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span className="text-stone-700"><strong>Learn from Mistakes:</strong> Read clear explanations referencing the exact lecture slide.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span className="text-stone-700"><strong>Practice Unlimited Times:</strong> Generate new questions anytime before midterms or finals.</span>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => onSelectFeatureMode('quiz')}
                  className="px-5 py-2.5 rounded-xl btn-emerald text-xs font-semibold inline-flex items-center gap-2 shadow-xs"
                >
                  <span>Try a 5-Question Quiz</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Interactive Exam Preview Box */}
            <div className="rounded-3xl p-6 sm:p-7 bg-white border border-stone-200 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-serif font-bold text-emerald-800 uppercase tracking-wider">Sample Practice Question</span>
                <span className="text-[11px] font-mono text-stone-500">Score: 2/2</span>
              </div>

              <h4 className="text-sm font-serif font-bold text-stone-950 mb-4 leading-snug">
                Which tree traversal algorithm guarantees visiting nodes in non-decreasing sorted order for a Binary Search Tree (BST)?
              </h4>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-600">
                  A. Pre-order Traversal (Root, Left, Right)
                </div>
                <div className="p-3 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-[#14532d] font-bold flex items-center justify-between">
                  <span>B. In-order Traversal (Left, Root, Right)</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-600">
                  C. Post-order Traversal (Left, Right, Root)
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-600">
                  D. Breadth-First Level-Order Traversal
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                <p className="font-serif font-bold mb-0.5">Professor's Note [Slide 28]:</p>
                <p className="text-[11px] text-stone-700 leading-relaxed">
                  In a BST, all keys in the left subtree are smaller than the root, and keys in the right subtree are greater. An in-order walk (Left → Root → Right) produces strictly ascending values.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. CALL TO ACTION SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="border-t border-stone-200 bg-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-purple-50 via-rose-50 to-amber-50 border border-stone-200 flex items-center justify-center mx-auto mb-4 shadow-2xs">
            <BookOpen className="w-6 h-6 text-[#881337]" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-stone-950">
            Ready to master your course materials?
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-md mx-auto">
            Join students studying smarter with slide-grounded answers, exact citations, and instant practice tests.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-6 py-3 rounded-xl btn-academic text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Launch Study Workspace Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-5 py-3 rounded-xl btn-academic-secondary text-xs font-semibold"
            >
              Student Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. CLEAN FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="py-10 border-t border-stone-200 text-center text-xs text-stone-500 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" showSubtitle={false} />
          <p className="text-stone-400 text-[11px]">
            Designed for college students, professors, and competitive exam preparation.
          </p>
        </div>
      </footer>
    </div>
  );
}
