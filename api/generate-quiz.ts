import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleGenerateQuiz } from '../src/utils/quiz-service.ts';

export const config = {
  maxDuration: 60,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle pre-flight CORS requests if any
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { text, numQuestions = 5, difficulty = 'Medium' } = req.body || {};

    const result = await handleGenerateQuiz({
      text,
      numQuestions,
      difficulty,
      apiKey: process.env.GEMINI_API_KEY,
    });

    return res.status(result.status).json(result.data);
  } catch (err: any) {
    console.error('Quiz generation error:', err?.message || err);
    return res.status(500).json({
      error: err?.message || 'An unexpected error occurred while generating the quiz.',
    });
  }
}
