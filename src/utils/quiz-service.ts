import { GoogleGenAI, Type } from '@google/genai';
import { filterAndValidateQuiz } from './quiz-validator.ts';
import type { QuizQuestion } from '../types/quiz.js';

export interface GenerateQuizRequest {
  text: string;
  numQuestions?: number | string;
  difficulty?: string;
  apiKey?: string;
}

export interface GenerateQuizResult {
  status: number;
  data: {
    questions?: QuizQuestion[];
    requestedCount?: number;
    validCount?: number;
    notice?: string;
    pdfSummary?: {
      charCount: number;
      wordCount: number;
    };
    error?: string;
  };
}

/**
 * Generates a batch of grounded multiple-choice questions.
 * Handles automatic retry with exponential backoff on transient demand spikes.
 */
export async function generateQuestionsBatch(
  ai: GoogleGenAI,
  text: string,
  batchCount: number,
  difficulty: string,
  batchIndex: number,
  totalBatches: number
): Promise<any[]> {
  // For 300+ page books, distribute segments across batches so questions cover the entire book
  let contextText = text;
  if (text.length > 120000 && totalBatches > 1) {
    const segmentLength = Math.min(Math.max(Math.floor(text.length / totalBatches), 80000), 400000);
    const maxStart = Math.max(0, text.length - segmentLength);
    const start = Math.floor((batchIndex / totalBatches) * maxStart);
    contextText = text.slice(start, start + segmentLength);
  } else if (text.length > 400000) {
    contextText = text.slice(0, 400000);
  }

  const prompt = `Generate exactly ${batchCount} multiple-choice quiz questions based strictly and solely on the provided text below.
${totalBatches > 1 ? `Batch ${batchIndex + 1} of ${totalBatches}. Focus on exploring diverse concepts, sections, and details across this part of the book to ensure non-redundant questions.` : ''}
Difficulty target: ${difficulty}.

Source Text:
"""
${contextText}
"""`;

  let lastError: any = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: `You are an expert exam author. Create multiple-choice questions grounded EXCLUSIVELY in the provided document text.
Mandatory Rules:
1. Every question must be fully answerable using ONLY facts explicitly stated in the source text. Do not invent or assume anything outside this text.
2. Provide exactly 4 distinct, plausible options per question.
3. No duplicate options within any question.
4. FORBIDDEN: Do not use "all of the above", "none of the above", "both A and B", "neither A nor B", or overlapping options.
5. The correctAnswer MUST be one single uppercase letter: "A", "B", "C", or "D".
6. The explanation must cite the specific reason from the text proving why that option is correct and the others are incorrect.
7. The sourceSnippet MUST be an exact verbatim quote or excerpt directly from the text that proves the answer.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING },
                sourceSnippet: { type: Type.STRING },
              },
              required: ['question', 'options', 'correctAnswer', 'explanation', 'sourceSnippet'],
            },
          },
        },
      });

      const responseText = response.text;
      if (!responseText) return [];
      const parsed = JSON.parse(responseText.trim());
      return Array.isArray(parsed) ? parsed : [];
    } catch (err: any) {
      lastError = err;
      console.warn(`Batch ${batchIndex + 1} attempt ${attempt} failed:`, err?.message || err);
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }
  }

  throw lastError;
}

export async function handleGenerateQuiz(payload: GenerateQuizRequest): Promise<GenerateQuizResult> {
  const { text, numQuestions = 5, difficulty = 'Medium', apiKey = process.env.GEMINI_API_KEY } = payload;

  if (!text || typeof text !== 'string' || text.trim().length < 40) {
    return {
      status: 400,
      data: {
        error: 'The PDF text is insufficient or empty. Please ensure the PDF has readable text.',
      },
    };
  }

  const validDifficulties = ['Easy', 'Medium', 'Hard'];
  const sanitizedDifficulty = validDifficulties.includes(difficulty) ? difficulty : 'Medium';

  if (!apiKey) {
    console.error('Security alert: GEMINI_API_KEY is not defined in backend environment.');
    return {
      status: 500,
      data: {
        error: 'Server configuration error: AI API key is not configured on the backend.',
      },
    };
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build-proxy',
      },
    },
  });

  const count = Math.max(parseInt(String(numQuestions), 10) || 5, 1);
  const BATCH_SIZE = 20;
  const totalBatches = Math.ceil(count / BATCH_SIZE);
  const batchPromises: Promise<any[]>[] = [];

  for (let i = 0; i < totalBatches; i++) {
    const remaining = count - i * BATCH_SIZE;
    const currentBatchTarget = Math.min(remaining, BATCH_SIZE);
    const batchWithBuffer = Math.ceil(currentBatchTarget * 1.25);
    batchPromises.push(
      generateQuestionsBatch(ai, text, batchWithBuffer, sanitizedDifficulty, i, totalBatches)
    );
  }

  const batchResults = await Promise.all(batchPromises);
  const allParsedQuestions = batchResults.flat();

  if (allParsedQuestions.length === 0) {
    return {
      status: 502,
      data: {
        error: 'The AI model returned no readable questions. Please retry.',
      },
    };
  }

  const validated = filterAndValidateQuiz(allParsedQuestions, text, count);
  const finalQuestions = validated.validQuestions.slice(0, count);

  if (finalQuestions.length === 0) {
    return {
      status: 422,
      data: {
        error: 'Generated questions could not be verified against the PDF text. Please retry or adjust settings.',
      },
    };
  }

  const wordCount = text.trim().split(/\s+/).length;
  return {
    status: 200,
    data: {
      questions: finalQuestions,
      requestedCount: count,
      validCount: finalQuestions.length,
      notice: finalQuestions.length < count
        ? `Only ${finalQuestions.length} of ${count} valid questions could be verified from this document.`
        : undefined,
      pdfSummary: {
        charCount: text.length,
        wordCount,
      },
    },
  };
}
