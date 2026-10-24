import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateQuestion,
  filterAndValidateQuiz,
  isSourceGrounded,
  calculateQuizScore
} from './quiz-validator.ts';

const SAMPLE_DOC = `
The Mitochondria is known as the powerhouse of the cell. It generates most of the chemical energy needed to power the biochemical reactions through adenosine triphosphate (ATP). Photosynthesis occurs in chloroplasts, primarily in green plant cells.
`;

test('validates correct question conforming to all rules', () => {
  const raw = {
    question: 'What is the primary function of the Mitochondria according to the text?',
    options: [
      'It generates most chemical energy as ATP',
      'It carries out photosynthesis',
      'It acts as the nucleus of the cell',
      'It builds cell walls',
    ],
    correctAnswer: 'A',
    explanation: 'The text states that the mitochondria generates most of the chemical energy needed to power biochemical reactions through ATP.',
    sourceSnippet: 'It generates most of the chemical energy needed to power the biochemical reactions through adenosine triphosphate (ATP).',
  };

  const result = validateQuestion(raw, SAMPLE_DOC);
  assert.equal(result.valid, true);
  assert.ok(result.sanitized);
  assert.equal(result.sanitized.correctAnswer, 'A');
  assert.equal(result.sanitized.options.length, 4);
});

test('rejects questions with duplicate options', () => {
  const raw = {
    question: 'Where does photosynthesis happen?',
    options: ['Chloroplasts', 'Mitochondria', 'Chloroplasts', 'Nucleus'],
    correctAnswer: 'A',
    explanation: 'Occurs in chloroplasts.',
    sourceSnippet: 'Photosynthesis occurs in chloroplasts',
  };

  const result = validateQuestion(raw, SAMPLE_DOC);
  assert.equal(result.valid, false);
  assert.match(result.reason || '', /duplicate/i);
});

test('rejects ambiguous options like "both A and B"', () => {
  const raw = {
    question: 'Which of the following generate energy?',
    options: ['Mitochondria', 'Chloroplasts', 'Both A and B', 'Ribosomes'],
    correctAnswer: 'C',
    explanation: 'Both generate forms of energy.',
    sourceSnippet: 'Mitochondria is known as the powerhouse of the cell',
  };

  const result = validateQuestion(raw, SAMPLE_DOC);
  assert.equal(result.valid, false);
  assert.match(result.reason || '', /ambiguous/i);
});

test('rejects questions with ungrounded source snippets', () => {
  const raw = {
    question: 'Who discovered penicillin?',
    options: ['Alexander Fleming', 'Louis Pasteur', 'Robert Koch', 'Edward Jenner'],
    correctAnswer: 'A',
    explanation: 'Discovered in 1928 by Fleming.',
    sourceSnippet: 'Alexander Fleming discovered penicillin in London laboratory in 1928',
  };

  const result = validateQuestion(raw, SAMPLE_DOC);
  assert.equal(result.valid, false);
  assert.match(result.reason || '', /source snippet/i);
});

test('filterAndValidateQuiz drops invalid questions and calculates notice', () => {
  const questions = [
    {
      question: 'Where does photosynthesis occur?',
      options: ['Chloroplasts', 'Mitochondria', 'Golgi apparatus', 'Vacuole'],
      correctAnswer: 'A',
      explanation: 'Photosynthesis occurs in chloroplasts.',
      sourceSnippet: 'Photosynthesis occurs in chloroplasts, primarily in green plant cells.',
    },
    {
      // Invalid: missing 4th option
      question: 'Broken question?',
      options: ['Opt 1', 'Opt 2'],
      correctAnswer: 'A',
      explanation: 'Invalid',
      sourceSnippet: 'None',
    },
  ];

  const result = filterAndValidateQuiz(questions, SAMPLE_DOC, 3);
  assert.equal(result.validQuestions.length, 1);
  assert.equal(result.droppedCount, 1);
  assert.ok(result.notice?.includes('Only 1 of 3 valid questions'));
});

test('calculateQuizScore computes scores accurately', () => {
  const mockQuestions = [
    {
      id: 'q1',
      question: 'Q1',
      options: ['1', '2', '3', '4'] as [string, string, string, string],
      correctAnswer: 'A' as const,
      explanation: 'exp',
      sourceSnippet: 'src',
    },
    {
      id: 'q2',
      question: 'Q2',
      options: ['1', '2', '3', '4'] as [string, string, string, string],
      correctAnswer: 'B' as const,
      explanation: 'exp',
      sourceSnippet: 'src',
    },
  ];

  const score1 = calculateQuizScore(mockQuestions, { q1: 'A', q2: 'B' });
  assert.equal(score1.correctCount, 2);
  assert.equal(score1.percentage, 100);

  const score2 = calculateQuizScore(mockQuestions, { q1: 'A', q2: 'C' });
  assert.equal(score2.correctCount, 1);
  assert.equal(score2.percentage, 50);
});
