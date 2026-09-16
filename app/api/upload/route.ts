import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { parsePdfBuffer } from '@/lib/pdf-utils';
import { generateBatchEmbeddings } from '@/lib/gemini';

export const runtime = 'nodejs';
export const maxDuration = 60; // Allow sufficient time for embedding generation

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Extract text and chunks with page numbers
    const parsed = await parsePdfBuffer(buffer, file.name);

    if (parsed.chunks.length === 0) {
      return NextResponse.json(
        { error: 'Could not extract readable text from PDF. It may be an image-only scanned document.' },
        { status: 422 }
      );
    }

    // 2. Insert document record into Supabase
    const { data: docData, error: docError } = await supabaseServer
      .from('documents')
      .insert({
        file_name: parsed.fileName,
        file_size: file.size,
        total_pages: parsed.totalPages,
      })
      .select()
      .single();

    if (docError || !docData) {
      console.error('Error inserting document:', docError);
      return NextResponse.json({ error: 'Database error storing document' }, { status: 500 });
    }

    const documentId = docData.id;

    // 3. Generate 768-dim embeddings in batches
    const chunkTexts = parsed.chunks.map((c) => c.content);
    const embeddings = await generateBatchEmbeddings(chunkTexts);

    // 4. Prepare records for document_chunks table
    const chunkRecords = parsed.chunks.map((chunk, index) => ({
      document_id: documentId,
      file_name: parsed.fileName,
      content: chunk.content,
      page_number: chunk.pageNumber,
      chunk_index: chunk.chunkIndex,
      embedding: embeddings[index],
    }));

    // Insert in batches of 50
    for (let i = 0; i < chunkRecords.length; i += 50) {
      const batch = chunkRecords.slice(i, i + 50);
      const { error: chunkError } = await supabaseServer
        .from('document_chunks')
        .insert(batch);

      if (chunkError) {
        console.error('Error inserting document chunks:', chunkError);
        return NextResponse.json({ error: 'Database error saving embeddings' }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      document: {
        id: documentId,
        fileName: parsed.fileName,
        totalPages: parsed.totalPages,
        chunkCount: parsed.chunks.length,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error during upload' },
      { status: 500 }
    );
  }
}
