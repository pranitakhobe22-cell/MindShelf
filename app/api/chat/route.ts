import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { generateEmbedding, generateContent } from '@/lib/gemini';

export const runtime = 'nodejs';

// GET /api/chat - Retrieve saved chat history
export async function GET() {
  try {
    const { data: messages, error } = await supabaseServer
      .from('chat_messages')
      .select('id, role, content, citations, mode, created_at')
      .order('created_at', { ascending: true })
      .limit(60);

    if (error) {
      console.error('Error fetching chat messages:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    console.error('Error in GET /api/chat:', error);
    return NextResponse.json({ error: 'Failed to retrieve chat history' }, { status: 500 });
  }
}

// DELETE /api/chat - Clear chat history
export async function DELETE() {
  try {
    const { error } = await supabaseServer
      .from('chat_messages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all rows safely

    if (error) {
      console.error('Error clearing chat messages:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Chat history cleared' });
  } catch (error) {
    console.error('Error in DELETE /api/chat:', error);
    return NextResponse.json({ error: 'Failed to clear chat history' }, { status: 500 });
  }
}

// POST /api/chat - Handle message & RAG retrieval
export async function POST(req: NextRequest) {
  try {
    const { message, mode = 'general', documentId, history = [] } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let answer = '';
    let citations: { pageNumber: number; fileName: string; snippet: string; similarity: number }[] = [];

    if (mode === 'rag' && documentId) {
      // 1. Generate 768-dim embedding for user query
      const queryEmbedding = await generateEmbedding(message);

      // 2. Call Supabase RPC match_document_chunks
      const { data: matchedChunks, error: matchError } = await supabaseServer.rpc(
        'match_document_chunks',
        {
          query_embedding: queryEmbedding,
          match_threshold: 0.25,
          match_count: 4,
          filter_document_id: documentId,
        }
      );

      if (matchError) {
        console.error('RPC match error:', matchError);
      }

      const chunks = matchedChunks || [];

      if (chunks.length > 0) {
        citations = chunks.map((c: any) => ({
          pageNumber: c.page_number,
          fileName: c.file_name,
          snippet: c.content.slice(0, 220) + '...',
          similarity: Math.round(c.similarity * 100),
        }));

        const contextText = chunks
          .map((c: any) => `[Source: ${c.file_name}, Page ${c.page_number}]:\n"${c.content}"`)
          .join('\n\n---\n\n');

        const systemPrompt = `You are MindShelf, an expert AI Academic Research Assistant.
Your task is to answer the user's question truthfully and rigorously using the provided excerpts from their academic textbook or lecture notes.

GUIDELINES:
1. Base your answers strictly on the provided context excerpts whenever possible.
2. Always cite the exact page number whenever referencing a fact, formula, or concept (e.g., "[Page 14]" or "[Source: Notes.pdf, Page 12]").
3. Use formatted Markdown with bold keywords, bullet points, and code/math blocks where appropriate.
4. If the context does not contain enough information to fully answer, state what the document says first, and then briefly supplement with general academic knowledge while noting that it is beyond the text.`;

        const userPrompt = `DOCUMENT CONTEXT:
${contextText}

STUDENT QUESTION:
${message}`;

        answer = await generateContent(userPrompt, systemPrompt);
      } else {
        const systemPrompt = `You are MindShelf, an expert academic tutor. The student asked a question regarding their uploaded document, but no direct matching text chunk met the similarity threshold.
Provide a clear, helpful general answer, and gently advise the student to check if the concept is phrased differently in the document.`;
        answer = await generateContent(message, systemPrompt);
      }
    } else {
      // General Academic Tutor Mode
      const systemPrompt = `You are MindShelf, a world-class AI Academic Professor and Study Coach.
You help university students understand complex concepts in Computer Science, Mathematics, Engineering, Data Science, and Academic Research.

GUIDELINES:
1. Break down difficult concepts into intuitive explanations with real-world analogies.
2. Provide clean, well-commented code snippets or mathematical formulations when helpful.
3. Be encouraging, precise, and academically rigorous.
4. Structure responses with clear headings, bullet points, and actionable takeaways.`;

      let promptWithHistory = message;
      if (history.length > 0) {
        const recentHistory = history.slice(-4).map((h: any) => `${h.role === 'user' ? 'Student' : 'Tutor'}: ${h.content}`).join('\n');
        promptWithHistory = `PREVIOUS CONVERSATION:\n${recentHistory}\n\nSTUDENT QUESTION:\n${message}`;
      }

      answer = await generateContent(promptWithHistory, systemPrompt);
    }

    // Save interaction to Supabase chat_messages table
    try {
      await supabaseServer.from('chat_messages').insert([
        { role: 'user', content: message, mode },
        { role: 'assistant', content: answer, citations: citations.length > 0 ? citations : null, mode },
      ]);
    } catch (saveErr) {
      console.warn('Non-blocking error saving chat history:', saveErr);
    }

    return NextResponse.json({
      answer,
      citations,
      mode,
    });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error generating response' },
      { status: 500 }
    );
  }
}
