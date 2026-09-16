const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';

/**
 * Generate 768-dimensional embedding for text using gemini-embedding-001
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const cleanText = text.replace(/\n+/g, ' ').trim().slice(0, 8000);
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text: cleanText }] },
        outputDimensionality: 768,
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to generate embedding: ${errText}`);
  }

  const data = await response.json();
  if (!data.embedding || !data.embedding.values) {
    throw new Error('Invalid embedding response from Gemini API');
  }

  return data.embedding.values;
}

/**
 * Generate batches of embeddings
 */
export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];
  
  // Process in small batches to avoid rate limits
  for (let i = 0; i < texts.length; i += 5) {
    const batch = texts.slice(i, i + 5);
    const batchPromises = batch.map((txt) => generateEmbedding(txt));
    const batchResults = await Promise.all(batchPromises);
    embeddings.push(...batchResults);
  }

  return embeddings;
}

/**
 * Call Gemini generation API
 */
export async function generateContent(
  prompt: string, 
  systemInstruction?: string,
  jsonMode: boolean = false
): Promise<string> {
  const payload: any = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      topP: 0.95,
      maxOutputTokens: 2048,
      ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
    },
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini generateContent error: ${errText}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text || '';
  return text;
}
