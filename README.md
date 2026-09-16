# 📚 MindShelf — AI Academic Assistant & Knowledge Hub

> **Full-Stack AI Study Atelier & Document-Grounded RAG System**  
> Built with **Next.js (App Router), TypeScript, PostgreSQL + pgvector (Supabase), and Google Gemini**.

[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-pgvector_PostgreSQL-emerald?style=flat&logo=supabase)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash_&_Embeddings-orange?style=flat&logo=google)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Editorial_Warm_Theme-teal?style=flat&logo=tailwindcss)](https://tailwindcss.com/)

---

## 💡 Overview

**MindShelf** is an autonomous academic companion designed for university students, educators, and researchers. Unlike generic chatbot wrappers that hallucinate sources or output walls of plain text, MindShelf delivers an **editorial, human-crafted study desk** with:

1. **🌐 Dual-Mode Academic Intelligence:**
   - **General Study Desk:** Direct dialogue with an AI academic tutor for conceptual doubts, algorithmic proofs, math, and code explanations.
   - **Document-Grounded RAG:** Ingests textbooks, lecture notes, and research papers into **Supabase `pgvector`** and returns answers with **verifiable page-level citations**.
2. **📝 Interactive Exam Practice Generator:**
   - Automatically formulates 5-question multiple-choice practice exams from uploaded course materials.
   - Real-time instant visual feedback (green/red), score calculation, and detailed academic rationales with source page references.
3. **📑 Revision Cheat Sheet & Formula Synthesizer:**
   - Compiles executive overviews, core definitions, and high-yield exam practice questions in one click.
4. **🎨 Warm Editorial Aesthetic:**
   - Crafted with a human-first, tactile paper aesthetic (warm stone & cream tones, paper cards, clean typography) inspired by Notion and research journals.

---

## 🏗️ System Architecture

```
                                  ┌───────────────────────────┐
                                  │      Student / User       │
                                  └─────────────┬─────────────┘
                                                │
                                                ▼
                               ┌─────────────────────────────────┐
                               │     MindShelf Next.js App       │
                               │  (Editorial Paper Study Desk)   │
                               └───────┬───────────────┬─────────┘
                                       │               │
                     Upload PDF Notes  │               │ Ask Query / Quiz
                                       ▼               ▼
                       ┌──────────────────────┐  ┌───────────────────────────┐
                       │   lib/pdf-utils.ts   │  │   Gemini Embedding Model  │
                       │ Page-by-Page Parser  │  │   (gemini-embedding-001)  │
                       └──────────┬───────────┘  │      768-dim Vectors      │
                                  │              └─────────────┬─────────────┘
                          Chunks  │                            │
                                  ▼                            ▼
                       ┌──────────────────────┐  ┌───────────────────────────┐
                       │   Supabase Storage   │  │    PostgreSQL Database    │
                       │      & Metadata      │  │    (pgvector Extension)   │
                       └──────────────────────┘  │  match_document_chunks()  │
                                                 └─────────────┬─────────────┘
                                                               │
                                       Top Retrieved Chunks    │
                                       with Page Citations     ▼
                                                 ┌───────────────────────────┐
                                                 │     Google Gemini 2.5     │
                                                 │   Academic Synthesizer    │
                                                 └─────────────┬─────────────┘
                                                               │
                                                               ▼
                                                 ┌───────────────────────────┐
                                                 │  Verified Cited Answer /  │
                                                 │   Interactive Quiz Deck   │
                                                 └───────────────────────────┘
```

---

## 📂 Project Structure

```
MindShelf/
├── app/
│   ├── layout.tsx                 # Root layout with editorial font & metadata
│   ├── page.tsx                   # Main orchestrator (Sidebar + Active Views)
│   ├── globals.css                # Warm paper & editorial typography design system
│   │
│   ├── api/
│   │   ├── chat/route.ts          # Dual-mode chat (General vs Document RAG)
│   │   ├── upload/route.ts        # PDF parsing, 768-dim embeddings & pgvector insertion
│   │   ├── documents/route.ts     # Document shelf listing & deletion
│   │   ├── quiz/route.ts          # Interactive 5-question exam generator
│   │   └── summary/route.ts       # One-click revision guide synthesizer
│   │
│   └── components/
│       ├── Sidebar.tsx            # Navigation, document shelf, engine status
│       ├── ChatInterface.tsx      # Editorial chat with expandable citation cards
│       ├── QuizView.tsx           # Interactive MCQ exam player with live scoring
│       ├── SummaryView.tsx        # Revision guide viewer with clipboard copy
│       └── FileUploadModal.tsx    # Drag-and-drop PDF upload with progress tracker
│
├── lib/
│   ├── supabase-client.ts         # Client-safe Supabase instance (browser)
│   ├── supabase-server.ts         # Server-side Supabase instance (secret key protected)
│   ├── gemini.ts                  # Gemini 768-dim embeddings & generation utilities
│   └── pdf-utils.ts               # Page-aware text chunking logic
│
├── scripts/
│   └── setup-db.js                # Automated Supabase schema & pgvector migration
│
├── .env.example                   # Environment configuration template
└── README.md                      # Documentation & architecture breakdown
```

---

## 🚀 Quick Start (Local Setup)

### 1. Clone the repository

```bash
git clone https://github.com/pranitakhobe22-cell/MindShelf.git
cd MindShelf
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
```

### 4. Initialize Supabase pgvector Schema

Run the automated database setup script to enable the `vector` extension, tables, and similarity search functions:

```bash
node scripts/setup-db.js
```

### 5. Launch the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Key Technical Decisions

- **Why 768-Dimensional Embeddings?**
  Gemini's `gemini-embedding-001` supports flexible dimensionality. We lock it to 768 dimensions with `outputDimensionality: 768`, ensuring compatibility with pgvector indexing and cosine similarity.
- **Separation of Client vs Server Keys:**
  Supabase's `service_role` key is strictly kept in `lib/supabase-server.ts` and utilized only in secure Next.js API routes, preventing client-side bundle leakage.
- **Page-Preserving Chunking:**
  Rather than naive text splitting that loses document boundaries, `lib/pdf-utils.ts` extracts text page-by-page so every chunk retains its true physical page number (`pageNumber: 14`).

---

## 📜 License

MIT License — Built by Pranita Khobe for academic and research workflows.
