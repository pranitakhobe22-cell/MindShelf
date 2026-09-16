const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:MindShelf%402026@db.qmosvcucbmffgkdysgly.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL.');

    // 1. Enable pgvector extension
    console.log('Enabling vector extension...');
    await client.query('CREATE EXTENSION IF NOT EXISTS vector;');

    // 2. Create documents table
    console.log('Creating documents table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        file_name TEXT NOT NULL,
        file_size BIGINT,
        total_pages INT DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // 3. Create document_chunks table
    console.log('Creating document_chunks table with vector(768)...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS document_chunks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
        file_name TEXT NOT NULL,
        content TEXT NOT NULL,
        page_number INT NOT NULL,
        chunk_index INT NOT NULL,
        embedding vector(768),
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // 4. Create vector similarity match function (RPC)
    console.log('Creating match_document_chunks function...');
    await client.query(`
      CREATE OR REPLACE FUNCTION match_document_chunks (
        query_embedding vector(768),
        match_threshold float DEFAULT 0.2,
        match_count int DEFAULT 5,
        filter_document_id uuid DEFAULT NULL
      )
      RETURNS TABLE (
        id UUID,
        document_id UUID,
        file_name TEXT,
        content TEXT,
        page_number INT,
        chunk_index INT,
        similarity FLOAT
      )
      LANGUAGE plpgsql
      AS $$
      BEGIN
        RETURN QUERY
        SELECT
          document_chunks.id,
          document_chunks.document_id,
          document_chunks.file_name,
          document_chunks.content,
          document_chunks.page_number,
          document_chunks.chunk_index,
          1 - (document_chunks.embedding <=> query_embedding) AS similarity
        FROM document_chunks
        WHERE (filter_document_id IS NULL OR document_chunks.document_id = filter_document_id)
          AND (1 - (document_chunks.embedding <=> query_embedding)) > match_threshold
        ORDER BY document_chunks.embedding <=> query_embedding
        LIMIT match_count;
      END;
      $$;
    `);

    // 5. Create quizzes table
    console.log('Creating quizzes table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        questions JSONB NOT NULL,
        score INT,
        total_questions INT DEFAULT 5,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // 6. Create chat_messages table
    console.log('Creating chat_messages table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id TEXT DEFAULT 'default',
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        citations JSONB,
        mode TEXT DEFAULT 'general',
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    console.log(' Database schema, tables, and vector function created successfully!');
  } catch (err) {
    console.error('Error executing database setup:', err);
  } finally {
    await client.end();
  }
}

setupDatabase();
