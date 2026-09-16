'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  HelpCircle, 
  Award, 
  FileText,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { DocumentItem } from './Sidebar';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  pageReference?: number;
}

interface QuizViewProps {
  selectedDoc: DocumentItem | null;
  documents: DocumentItem[];
}

export default function QuizView({ selectedDoc }: QuizViewProps) {
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const generateQuiz = async (customTopic?: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setQuestions([]);
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setScore(0);
      setIsComplete(false);

      const targetTopic = customTopic || topic || (selectedDoc ? selectedDoc.file_name : 'Computer Science');

      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: selectedDoc ? selectedDoc.id : null,
          topic: targetTopic,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        throw new Error('No questions returned from quiz engine.');
      }
    } catch (err) {
      console.error('Quiz error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Could not generate quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === questions[currentIndex].correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsComplete(false);
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="flex-1 h-screen overflow-y-auto p-8 flex flex-col items-center justify-center bg-white text-stone-900">
      {/* Quiz Initial Screen */}
      {questions.length === 0 && !isLoading && (
        <div className="max-w-xl w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mx-auto mb-3.5 shadow-xs">
            <CheckCircle2 className="w-7 h-7 text-emerald-700" />
          </div>

          <h2 className="text-2xl font-serif font-bold text-stone-950 tracking-tight">
            Active Recall Practice Examination
          </h2>
          <p className="text-xs text-stone-500 mt-1.5 max-w-md mx-auto leading-relaxed">
            Test your concept mastery with 5 diagnostic multiple-choice questions drawn directly from your lecture notes or academic curriculum.
          </p>

          <div className="mt-8 p-6 rounded-2xl paper-card text-left">
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Question Source
            </label>
            {selectedDoc ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/40 border border-emerald-200/80 mb-4">
                <FileText className="w-5 h-5 text-emerald-700 shrink-0" />
                <div className="flex-1 truncate">
                  <p className="text-xs font-semibold text-stone-900 truncate">{selectedDoc.file_name}</p>
                  <p className="text-[11px] text-stone-500">{selectedDoc.total_pages} pages indexed in pgvector</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                  Document Notes
                </span>
              </div>
            ) : (
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="e.g. Operating Systems Virtual Memory & Paging"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                />
                <p className="text-[11px] text-stone-500 mt-1.5">
                  Tip: Select an uploaded PDF from your shelf to test questions directly from class!
                </p>
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2">
                <span className="leading-snug">{errorMessage}</span>
                <button
                  type="button"
                  onClick={() => generateQuiz()}
                  className="px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-[11px] font-semibold shrink-0 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            <button
              onClick={() => generateQuiz()}
              className="w-full py-3 rounded-xl btn-emerald text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>Generate 5-Question Practice Exam</span>
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center text-center p-8">
          <div className="w-12 h-12 rounded-full border-3 border-stone-200 border-t-[#881337] animate-spin mb-3"></div>
          <h3 className="text-base font-serif font-bold text-stone-950">Formulating Exam Questions...</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm">
            Reviewing document chunks and generating multiple-choice questions with full academic explanations.
          </p>
        </div>
      )}

      {/* Active Question Card */}
      {questions.length > 0 && !isComplete && (
        <div className="max-w-2xl w-full">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-serif font-bold uppercase tracking-wider text-emerald-800">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-xs text-stone-500 font-medium">
              Score: {score}/{currentIndex + (isAnswered ? 1 : 0)}
            </span>
          </div>

          <div className="w-full h-1.5 bg-stone-200 rounded-full mb-5 overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          {/* Test Card */}
          <div className="paper-card rounded-2xl p-6 sm:p-7 shadow-sm mb-4">
            <h3 className="text-base font-serif font-bold text-stone-950 leading-snug mb-5">
              {currentQ.question}
            </h3>

            <div className="space-y-2.5">
              {currentQ.options.map((opt, i) => {
                const isSelected = selectedOption === i;
                const isCorrect = i === currentQ.correctIndex;

                let btnStyles = 'bg-stone-50 border-stone-200 hover:border-emerald-500 hover:bg-white text-stone-800';

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyles = 'bg-[#f0fdf4] border-[#bbf7d0] text-[#14532d] font-semibold';
                  } else if (isSelected && !isCorrect) {
                    btnStyles = 'bg-[#fff1f2] border-[#fecdd3] text-[#881337] font-semibold';
                  } else {
                    btnStyles = 'bg-stone-50/50 border-stone-200 text-stone-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(i)}
                    disabled={isAnswered}
                    className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left text-xs transition-all ${btnStyles}`}
                  >
                    <span className="w-5 h-5 rounded-md border border-current/40 flex items-center justify-center text-[11px] font-semibold shrink-0 mt-0.5">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1 leading-relaxed">{opt}</span>
                    {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-[#166534] shrink-0 mt-0.5" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-[#881337] shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className="mt-5 p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-stone-800 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 text-emerald-900 font-serif font-bold mb-1">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Academic Explanation</span>
                  {currentQ.pageReference && (
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-mono font-bold">
                      Slide / Page {currentQ.pageReference}
                    </span>
                  )}
                </div>
                <p className="leading-relaxed text-stone-700">{currentQ.explanation}</p>
              </div>
            )}
          </div>

          {isAnswered && (
            <div className="flex justify-end">
              <button
                onClick={handleNextQuestion}
                className="px-5 py-2.5 rounded-xl btn-emerald text-white text-xs font-semibold flex items-center gap-2 shadow-xs"
              >
                <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Completed Results */}
      {isComplete && (
        <div className="max-w-md w-full text-center paper-card rounded-2xl p-8 shadow-md animate-in zoom-in-95 duration-150">
          <div className="w-14 h-14 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] flex items-center justify-center mx-auto mb-3">
            <Award className="w-7 h-7 text-emerald-700" />
          </div>

          <h3 className="text-xl font-serif font-bold text-stone-950">Examination Completed</h3>
          <p className="text-xs text-stone-500 mt-0.5">Summary of your active recall session</p>

          <div className="my-5 p-5 rounded-xl bg-stone-50 border border-stone-200">
            <p className="text-3xl font-serif font-bold text-stone-950">
              {score} / {questions.length}
            </p>
            <p className="text-xs text-stone-600 font-semibold mt-1">
              {Math.round((score / questions.length) * 100)}% Accuracy
            </p>
            <div className="mt-2 text-xs text-stone-500">
              {score === questions.length ? (
                <span className="text-[#166534] font-bold">Outstanding! Full syllabus concept mastery.</span>
              ) : score >= questions.length * 0.7 ? (
                <span className="text-[#b45309] font-bold">Solid effort. Review missed questions in your notes.</span>
              ) : (
                <span className="text-[#881337] font-bold">Review lecture slides recommended before exam.</span>
              )}
            </div>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={handleReset}
              className="flex-1 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 border border-stone-200 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retake</span>
            </button>
            <button
              onClick={() => generateQuiz()}
              className="flex-1 py-2 rounded-xl btn-emerald text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>New Exam</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
