'use client';

import React, { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase-client';
import Sidebar, { DocumentItem } from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import QuizView from './components/QuizView';
import SummaryView from './components/SummaryView';
import FileUploadModal from './components/FileUploadModal';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';

export default function Home() {
  const [currentView, setCurrentView] = useState<'landing' | 'app'>('landing');
  const [activeMode, setActiveMode] = useState<'general' | 'rag' | 'quiz' | 'summary'>('general');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Initialize and listen to Supabase authentication state
  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: authListener } = supabaseClient.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fetch documents on initial load
  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      if (data.documents) {
        setDocuments(data.documents);
        if (data.documents.length > 0 && !selectedDocId) {
          setSelectedDocId(data.documents[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document from MindShelf?')) return;
    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        if (selectedDocId === id) {
          const remaining = documents.filter((d) => d.id !== id);
          setSelectedDocId(remaining.length > 0 ? remaining[0].id : null);
        }
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleUploadSuccess = (newDoc: any) => {
    fetchDocuments();
    setSelectedDocId(newDoc.id);
    setActiveMode('rag');
  };

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    setUser(null);
  };

  const handleSelectFeatureMode = (mode: 'general' | 'rag' | 'quiz' | 'summary') => {
    setActiveMode(mode);
    setCurrentView('app');
  };

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || null;

  return (
    <div className="min-h-screen w-full bg-white text-[#1c1917] antialiased font-sans">
      {/* SPA View 1: Public Landing Page (Fully Scrollable) */}
      {currentView === 'landing' ? (
        <LandingPage
          onEnterApp={() => setCurrentView('app')}
          onOpenAuth={() => setIsAuthOpen(true)}
          user={user}
          onSignOut={handleSignOut}
          onSelectFeatureMode={handleSelectFeatureMode}
        />
      ) : (
        /* SPA View 2: Full Application Workspace */
        <div className="flex h-screen w-screen overflow-hidden animate-in fade-in duration-200">
          {/* Sidebar Navigation & MindShelf Library */}
          <Sidebar
            activeMode={activeMode}
            setActiveMode={setActiveMode}
            documents={documents}
            selectedDocId={selectedDocId}
            setSelectedDocId={setSelectedDocId}
            onOpenUpload={() => setIsUploadOpen(true)}
            onDeleteDoc={handleDeleteDoc}
            onNewChat={() => {
              setActiveMode('general');
            }}
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
            onSignOut={handleSignOut}
            onViewLanding={() => setCurrentView('landing')}
          />

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col h-screen overflow-hidden">
            {(activeMode === 'general' || activeMode === 'rag') && (
              <ChatInterface
                activeMode={activeMode}
                setActiveMode={setActiveMode}
                selectedDoc={selectedDoc}
                documents={documents}
                setSelectedDocId={setSelectedDocId}
                onOpenUpload={() => setIsUploadOpen(true)}
              />
            )}

            {activeMode === 'quiz' && (
              <QuizView
                selectedDoc={selectedDoc}
                documents={documents}
              />
            )}

            {activeMode === 'summary' && (
              <SummaryView
                selectedDoc={selectedDoc}
                onOpenUpload={() => setIsUploadOpen(true)}
              />
            )}
          </main>
        </div>
      )}

      {/* PDF Upload Modal */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(u) => {
          setUser(u);
          setCurrentView('app');
        }}
      />
    </div>
  );
}
