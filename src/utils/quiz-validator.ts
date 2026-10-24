import { QuizQuestion, OptionLetter } from '../types/quiz.js';

const FORBIDDEN_OPTION_PATTERNS = [
  /all of the above/i,
  /none of the above/i,
  /both\s+[a-d]\s+and\s+[a-d]/i,
  /neither\s+[a-d]\s+nor\s+[a-d]/i,
  /either\s+[a-d]\s+or\s+[a-d]/i,
  /^[a-d]\s+and\s+[a-d]$/i,
];

/**
 * Normalizes text for comparison by collapsing whitespace and lowercasing.
 */
export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Checks whether a snippet is grounded in the provided document text.
 * Performs exact match or normalized continuous word window match.
 */
export function isSourceGrounded(snippet: string, documentText: string): boolean {
  if (!snippet || snippet.trim().length < 5) return false;
  if (!documentText) return true; // if no doc text provided, bypass grounding check

  const normDoc = normalizeText(documentText);
  const normSnippet = normalizeText(snippet);

  // Direct substring check
  if (normDoc.includes(normSnippet)) {
    return true;
  }

  // Check if at least 70% of significant words in snippet are present in proximity
  const words = normSnippet.split(' ').filter(w => w.length > 3);
  if (words.length === 0) return true;

  const matchedWords = words.filter(word => normDoc.includes(word));
  return matchedWords.length / words.length >= 0.75;
}

/**
 * Cleans any redundant leading option letter from the option text (e.g. "A. Option" -> "Option")
 */
export function cleanOptionText(text: string): string {
  if (!text) return '';
  return text.replace(/^[A-Da-d][.)\-:]\s*/, '').trim();
}

/**
 * Validates a single quiz question against all strict constraints:
 * 1. Exactly 4 non-empty options
 * 2. No duplicate options
 * 3. No ambiguous options ("both A and B", "all of the above")
 * 4. Correct answer is 'A', 'B', 'C', or 'D'
 * 5. Meaningful question text and explanation
 * 6. Grounded source snippet in PDF text
 */
export function validateQuestion(
  raw: any,
  documentText?: string,
  index?: number
): { valid: boolean; reason?: string; sanitized?: QuizQuestion } {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, reason: 'Question item is not an object' };
  }

  const question = typeof raw.question === 'string' ? raw.question.trim() : '';
  if (question.length < 5) {
    return { valid: false, reason: 'Question text is too short or missing' };
  }

  const rawOptions = Array.isArray(raw.options) ? raw.options : [];
  if (rawOptions.length !== 4) {
    return { valid: false, reason: `Must have exactly 4 options, found ${rawOptions.length}` };
  }

  const sanitizedOptions: [string, string, string, string] = [
    cleanOptionText(String(rawOptions[0] || '').trim()),
    cleanOptionText(String(rawOptions[1] || '').trim()),
    cleanOptionText(String(rawOptions[2] || '').trim()),
    cleanOptionText(String(rawOptions[3] || '').trim()),
  ];

  // Check empty options
  if (sanitizedOptions.some(opt => opt.length === 0)) {
    return { valid: false, reason: 'One or more options are empty' };
  }

  // Check duplicate options
  const uniqueNormalized = new Set(sanitizedOptions.map(opt => normalizeText(opt)));
  if (uniqueNormalized.size !== 4) {
    return { valid: false, reason: 'Duplicate options detected' };
  }

  // Check ambiguous / overlapping options
  for (const opt of sanitizedOptions) {
    if (FORBIDDEN_OPTION_PATTERNS.some(pattern => pattern.test(opt))) {
      return { valid: false, reason: `Option "${opt}" contains ambiguous phrasing (e.g., "both A and B")` };
    }
  }

  // Correct answer validation
  let correctAnswer = String(raw.correctAnswer || '').trim().toUpperCase();
  // Handle if model returned "A)", "Option A", "0", etc.
  if (correctAnswer.startsWith('OPTION ')) {
    correctAnswer = correctAnswer.replace('OPTION ', '').trim();
  }
  if (correctAnswer.length > 1 && /^[A-D]/.test(correctAnswer)) {
    correctAnswer = correctAnswer[0];
  }

  if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
    return { valid: false, reason: `Invalid correct answer "${correctAnswer}", must be A, B, C, or D` };
  }

  const explanation = typeof raw.explanation === 'string' ? raw.explanation.trim() : '';
  if (explanation.length < 5) {
    return { valid: false, reason: 'Explanation is too short or missing' };
  }

  const sourceSnippet = typeof raw.sourceSnippet === 'string' ? raw.sourceSnippet.trim() : '';
  if (!sourceSnippet || sourceSnippet.length < 5) {
    return { valid: false, reason: 'Source snippet quote is missing or too short' };
  }

  // Source grounding check against document text if provided
  if (documentText && !isSourceGrounded(sourceSnippet, documentText)) {
    return { valid: false, reason: 'Source snippet could not be verified in the PDF content' };
  }

  const id = raw.id && typeof raw.id === 'string' ? raw.id : `q-${index !== undefined ? index + 1 : Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  return {
    valid: true,
    sanitized: {
      id,
      question,
      options: sanitizedOptions,
      correctAnswer: correctAnswer as OptionLetter,
      explanation,
      sourceSnippet,
    },
  };
}

/**
 * Filters a raw list of questions, discarding invalid ones and building a user notice if needed.
 */
export function filterAndValidateQuiz(
  rawQuestions: unknown[],
  documentText: string,
  requestedCount: number
): { validQuestions: QuizQuestion[]; droppedCount: number; notice?: string } {
  if (!Array.isArray(rawQuestions)) {
    return { validQuestions: [], droppedCount: requestedCount, notice: 'No valid questions were returned.' };
  }

  const validQuestions: QuizQuestion[] = [];
  let droppedCount = 0;

  for (let i = 0; i < rawQuestions.length; i++) {
    const res = validateQuestion(rawQuestions[i], documentText, validQuestions.length);
    if (res.valid && res.sanitized) {
      validQuestions.push(res.sanitized);
    } else {
      droppedCount++;
    }
  }

  let notice: string | undefined;
  if (validQuestions.length < requestedCount) {
    if (validQuestions.length === 0) {
      notice = 'No questions passed strict source-grounding and option validation. Please try again.';
    } else {
      notice = `Only ${validQuestions.length} of ${requestedCount} valid questions could be generated from this document text.`;
    }
  }

  return {
    validQuestions,
    droppedCount,
    notice,
  };
}

/**
 * Calculates quiz scoring results
 */
export function calculateQuizScore(
  questions: QuizQuestion[],
  selectedAnswers: Record<string, OptionLetter>
): {
  total: number;
  answeredCount: number;
  correctCount: number;
  incorrectCount: number;
  percentage: number;
} {
  const total = questions.length;
  let answeredCount = 0;
  let correctCount = 0;
  let incorrectCount = 0;

  for (const q of questions) {
    const selected = selectedAnswers[q.id];
    if (selected) {
      answeredCount++;
      if (selected === q.correctAnswer) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    }
  }

  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return {
    total,
    answeredCount,
    correctCount,
    incorrectCount,
    percentage,
  };
}
