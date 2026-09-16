import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { generateContent } from '@/lib/gemini';

export const runtime = 'nodejs';

// Helper to normalize questions and correct indices
function normalizeQuestions(rawList: any[], docTitle: string) {
  if (!Array.isArray(rawList)) return [];

  return rawList.map((item: any, idx: number) => {
    const id = typeof item.id === 'number' ? item.id : idx + 1;
    const question = item.question || item.q || `Question ${id} regarding ${docTitle}`;
    
    // Normalize options
    let options: string[] = [];
    if (Array.isArray(item.options) && item.options.length >= 2) {
      options = item.options.map((opt: any) => String(opt).trim());
    } else {
      options = [
        'Primary conceptual definition',
        'Secondary theoretical property',
        'Counter-example or limitation',
        'Practical implementation constraint',
      ];
    }

    // Normalize correctIndex
    let correctIndex = 0;
    if (typeof item.correctIndex === 'number') {
      correctIndex = Math.floor(item.correctIndex);
      // Check if it was 1-indexed (1 to options.length)
      if (correctIndex >= options.length && correctIndex === options.length) {
        correctIndex = correctIndex - 1;
      }
    } else if (typeof item.correctIndex === 'string') {
      const upper = item.correctIndex.trim().toUpperCase();
      if (upper === 'A') correctIndex = 0;
      else if (upper === 'B') correctIndex = 1;
      else if (upper === 'C') correctIndex = 2;
      else if (upper === 'D') correctIndex = 3;
      else {
        const parsed = parseInt(upper, 10);
        correctIndex = isNaN(parsed) ? 0 : Math.max(0, parsed);
      }
    } else if (typeof item.answer === 'string') {
      const matchIdx = options.findIndex((o) => o.toLowerCase() === item.answer.toLowerCase());
      if (matchIdx !== -1) correctIndex = matchIdx;
    }

    // Clamp correctIndex to valid options bounds
    correctIndex = Math.max(0, Math.min(correctIndex, options.length - 1));

    const explanation = item.explanation || item.reason || `Detailed academic analysis for "${options[correctIndex]}" as the correct response.`;
    const pageReference = typeof item.pageReference === 'number' ? item.pageReference : (item.page || undefined);

    return {
      id,
      question,
      options,
      correctIndex,
      explanation,
      pageReference,
    };
  });
}

// Fallback high-yield questions when LLM or rate limit fails
function getFallbackQuestions(topic: string) {
  return [
    {
      id: 1,
      question: `What is the foundational principle or definition underlying ${topic}?`,
      options: [
        `The formal mathematical and theoretical baseline governing ${topic}`,
        `A secondary empirical approximation used only in legacy benchmarks`,
        `An obsolete syntax paradigm superseded by modern hardware architectures`,
        `A purely aesthetic design choice with no functional consequences`,
      ],
      correctIndex: 0,
      explanation: `Foundational study begins with the formal theoretical definitions of ${topic}, which establish invariant constraints and baseline behavior.`,
      pageReference: 1,
    },
    {
      id: 2,
      question: `In the context of ${topic}, how are performance bottlenecks or edge-case constraints typically mitigated?`,
      options: [
        'By avoiding any algorithmic optimization and relying exclusively on over-provisioning',
        'Through structural caching, spatial/temporal locality, and optimized algorithmic bounds',
        'By discarding consistency models and ignoring hardware memory hierarchy',
        'By forcing all operations into single-threaded synchronous blocking calls',
      ],
      correctIndex: 1,
      explanation: 'Modern systems leverage caching hierarchies, locality principles, and algorithmic reduction to achieve optimal efficiency.',
      pageReference: 2,
    },
    {
      id: 3,
      question: `Which of the following trade-offs is most characteristic when implementing ${topic}?`,
      options: [
        'Time complexity vs. space complexity and synchronization overhead',
        'Code length vs. font kerning in the terminal emulator',
        'Operating system version vs. monitor refresh rate',
        'No trade-offs exist; optimal throughput is always instantaneous',
      ],
      correctIndex: 0,
      explanation: 'Engineering and computer systems inherently balance time vs. space complexity, alongside concurrent state management trade-offs.',
      pageReference: 3,
    },
    {
      id: 4,
      question: `When validating or debugging systems related to ${topic}, what is the recommended analytical approach?`,
      options: [
        'Deploy directly to production without unit or integration benchmarks',
        'Apply formal unit testing, boundary value analysis, and invariant verification',
        'Randomly mutate system configurations until errors cease to display',
        'Disable all assertion logging and system monitoring tools',
      ],
      correctIndex: 1,
      explanation: 'Rigor in computer science requires boundary testing, formal invariant validation, and regression test suites.',
      pageReference: 4,
    },
    {
      id: 5,
      question: `How does ${topic} interface with modern scalable computing architectures?`,
      options: [
        'It abstracts underlying complexity through modular contracts and clean API boundaries',
        'It requires hard-coded absolute memory addresses across all cluster nodes',
        'It completely prevents horizontal scaling across distributed networks',
        'It operates exclusively in isolation without network or database access',
      ],
      correctIndex: 0,
      explanation: 'Scalable architecture relies on well-defined abstraction boundaries, modular APIs, and encapsulated subsystem state.',
      pageReference: 5,
    },
  ];
}

export async function POST(req: NextRequest) {
  try {
    const { documentId, topic } = await req.json();

    let context = '';
    let docTitle = (topic || 'Academic Topic').trim();

    // Check UUID format to prevent Postgres 22P02 syntax errors
    const isUuid = typeof documentId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(documentId);

    if (isUuid) {
      // Fetch document metadata
      const { data: doc } = await supabaseServer
        .from('documents')
        .select('file_name')
        .eq('id', documentId)
        .single();

      if (doc?.file_name) docTitle = doc.file_name;

      // Fetch representative chunks from this document
      const { data: chunks, error } = await supabaseServer
        .from('document_chunks')
        .select('content, page_number')
        .eq('document_id', documentId)
        .limit(10);

      if (!error && chunks && chunks.length > 0) {
        context = chunks
          .map((c) => `[Page ${c.page_number}]: ${c.content.slice(0, 400)}`)
          .join('\n\n');
      }
    }

    const systemPrompt = `You are MindShelf Quiz Master, an expert university exam author.
Generate an engaging, high-yield 5-question multiple choice practice exam based on the provided material or topic.
Return ONLY valid JSON matching this schema:
[
  {
    "id": 1,
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Detailed explanation of why this answer is correct and others are incorrect.",
    "pageReference": 1
  }
]`;

    const userPrompt = context
      ? `Generate 5 exam questions based strictly on this document context for "${docTitle}":\n\n${context}`
      : `Generate 5 challenging exam practice questions on the academic topic: "${docTitle}". Cover key definitions, edge cases, and practical applications.`;

    let questions: any[] = [];

    try {
      // Enable jsonMode: true for Gemini 2.5 Flash
      const rawResponse = await generateContent(userPrompt, systemPrompt, true);

      // Multi-layer resilient JSON extraction
      let cleaned = rawResponse.trim();
      
      // 1. Try direct parse
      try {
        const direct = JSON.parse(cleaned);
        questions = Array.isArray(direct) ? direct : (direct.questions || direct.quiz || direct.data || [direct]);
      } catch {
        // 2. Strip markdown fences if present
        if (cleaned.includes('```')) {
          cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        }

        // 3. Search for array boundaries [ ... ]
        const firstBracket = cleaned.indexOf('[');
        const lastBracket = cleaned.lastIndexOf(']');

        if (firstBracket !== -1 && lastBracket > firstBracket) {
          const arrayStr = cleaned.slice(firstBracket, lastBracket + 1);
          questions = JSON.parse(arrayStr);
        } else {
          // 4. Search for object boundaries { ... }
          const firstBrace = cleaned.indexOf('{');
          const lastBrace = cleaned.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace > firstBrace) {
            const objStr = cleaned.slice(firstBrace, lastBrace + 1);
            const parsedObj = JSON.parse(objStr);
            questions = Array.isArray(parsedObj) ? parsedObj : (parsedObj.questions || parsedObj.quiz || parsedObj.data || [parsedObj]);
          }
        }
      }
    } catch (llmErr) {
      console.warn('Gemini quiz generation error, using academic fallback:', llmErr);
    }

    // Normalize questions or provide fallback if empty
    let normalized = normalizeQuestions(questions, docTitle);
    if (!normalized || normalized.length === 0) {
      normalized = getFallbackQuestions(docTitle.replace('.pdf', ''));
    }

    // Save quiz to Supabase
    let quizId = null;
    try {
      const { data: quizData } = await supabaseServer
        .from('quizzes')
        .insert({
          document_id: isUuid ? documentId : null,
          title: `Quiz: ${docTitle.replace('.pdf', '')}`,
          questions: normalized,
          total_questions: normalized.length,
        })
        .select('id')
        .single();

      if (quizData) quizId = quizData.id;
    } catch (dbErr) {
      console.warn('Non-blocking quiz save warning:', dbErr);
    }

    return NextResponse.json({
      quizId,
      title: `Quiz: ${docTitle.replace('.pdf', '')}`,
      questions: normalized,
    });
  } catch (error) {
    console.error('Quiz generation route error:', error);
    // Return fallback rather than hard 500 error
    const fallbackQuestions = getFallbackQuestions('Computer Science & Engineering');
    return NextResponse.json({
      quizId: null,
      title: 'Practice Examination',
      questions: fallbackQuestions,
    });
  }
}
