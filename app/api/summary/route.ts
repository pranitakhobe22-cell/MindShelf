import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { generateContent } from '@/lib/gemini';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { documentId } = await req.json();

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const { data: doc } = await supabaseServer
      .from('documents')
      .select('file_name, total_pages')
      .eq('id', documentId)
      .single();

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Fetch key chunks across the document
    const { data: chunks, error } = await supabaseServer
      .from('document_chunks')
      .select('content, page_number')
      .eq('document_id', documentId)
      .order('chunk_index', { ascending: true })
      .limit(12);

    if (error || !chunks || chunks.length === 0) {
      return NextResponse.json({ error: 'No content available to summarize' }, { status: 400 });
    }

    const context = chunks
      .map((c) => `[Page ${c.page_number}]: ${c.content}`)
      .join('\n\n');

    const systemPrompt = `You are MindShelf Academic Synthesizer.
Generate a structured, high-yield academic study guide for students preparing for examinations.

Structure your response with:
# 📖 Executive Summary
(A concise, high-level breakdown of the core topic and its significance)

# 🔑 Key Terminology & Definitions
(Bullet list of critical terms and their precise definitions)

# 📐 Core Concepts, Formulas & Algorithms
(Important theorems, formulas, or algorithmic steps with explanations)

# 🎯 High-Yield Exam Questions to Practice
(3-4 conceptual questions a professor would ask in an oral exam or midterm)

Use clean Markdown with bolding, code/formula formatting, and page citations where applicable.`;

    const userPrompt = `Synthesize a comprehensive study guide from these lecture excerpts from "${doc.file_name}":\n\n${context}`;

    const summary = await generateContent(userPrompt, systemPrompt);

    return NextResponse.json({
      fileName: doc.file_name,
      totalPages: doc.total_pages,
      summary,
    });
  } catch (error) {
    console.error('Summary error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate study guide' },
      { status: 500 }
    );
  }
}
