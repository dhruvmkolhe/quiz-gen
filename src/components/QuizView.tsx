import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  Check,
  ListOrdered,
  Maximize2,
  HelpCircle,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { Button } from './ui/button.tsx';
import { Badge } from './ui/badge.tsx';
import { Progress } from './ui/progress.tsx';
import { QuizCard } from './QuizCard.tsx';
import { QuizQuestion, OptionLetter } from '../types/quiz.ts';
import { calculateQuizScore } from '../utils/quiz-validator.ts';

interface QuizViewProps {
  questions: QuizQuestion[];
  selectedAnswers: Record<string, OptionLetter>;
  revealedAnswers: Record<string, boolean>;
  onSelectOption: (questionId: string, option: OptionLetter) => void;
  onRevealAnswer: (questionId: string) => void;
  onRevealAll: () => void;
  onResetQuiz: () => void;
  notice?: string;
  onOpenScoreSummary: () => void;
}

export function QuizView({
  questions,
  selectedAnswers,
  revealedAnswers,
  onSelectOption,
  onRevealAnswer,
  onRevealAll,
  onResetQuiz,
  notice,
  onOpenScoreSummary,
}: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'list'>('single');

  const total = questions.length;
  const currentQuestion = questions[currentIndex];
  const score = calculateQuizScore(questions, selectedAnswers);

  const answeredPercent = total > 0 ? Math.round((score.answeredCount / total) * 100) : 0;
  const remainingCount = Math.max(0, total - score.answeredCount);
  const isAllAnswered = total > 0 && score.answeredCount === total;

  const revealedCount = Object.keys(revealedAnswers).filter((k) => revealedAnswers[k]).length;
  const allRevealed = revealedCount === total && total > 0;

  const goToPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const goToNext = () => {
    if (currentIndex < total - 1) setCurrentIndex(currentIndex + 1);
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner (if any questions were dropped due to strict source grounding) */}
      {notice && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3 text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="font-semibold">Quality Validation Notice: </span>
            <span>{notice}</span>
          </div>
        </div>
      )}

      {/* Prominent Visual Progress Bar & Counter Tracker */}
      <div className="rounded-2xl border border-border/90 bg-card p-5 sm:p-6 shadow-sm space-y-4">
        {/* Counter Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                <BarChart3 className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                Quiz Progress Tracker
              </span>
            </div>

            {/* Big, bold visual counter */}
            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
                {score.answeredCount}
              </span>
              <span className="text-base sm:text-lg font-medium text-muted-foreground">
                of {total} answered
              </span>

              <Badge
                variant={isAllAnswered ? 'success' : 'accent'}
                className="ml-2 text-xs font-semibold py-0.5 px-2.5"
              >
                {answeredPercent}% Complete
              </Badge>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'single' ? 'list' : 'single')}
              className="text-xs gap-1.5 cursor-pointer h-8"
              title="Toggle single question or all questions view"
            >
              {viewMode === 'single' ? (
                <>
                  <ListOrdered className="h-3.5 w-3.5" />
                  View All ({total})
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5" />
                  Single View
                </>
              )}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={onRevealAll}
              disabled={allRevealed}
              className="text-xs gap-1.5 cursor-pointer h-8"
            >
              <Eye className="h-3.5 w-3.5" />
              {allRevealed ? 'All Revealed' : 'Reveal All'}
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={onOpenScoreSummary}
              className="text-xs gap-1.5 cursor-pointer h-8 shadow-xs"
            >
              <Trophy className="h-3.5 w-3.5" />
              Summary
            </Button>
          </div>
        </div>

        {/* Visual Progress Bar with Interactive Gradient */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              Progress Status
            </span>
            <span className="font-mono font-medium">
              {isAllAnswered ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  All Questions Answered
                </span>
              ) : (
                <span>{remainingCount} {remainingCount === 1 ? 'question' : 'questions'} remaining</span>
              )}
            </span>
          </div>

          <div className="relative">
            <Progress
              value={score.answeredCount}
              max={total}
              className="h-3 bg-muted/80 rounded-full"
              indicatorClassName={
                isAllAnswered
                  ? 'bg-emerald-500 transition-all duration-500'
                  : 'bg-primary transition-all duration-500'
              }
            />
          </div>
        </div>

        {/* Metric Badges Strip */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span>Answered: <strong className="text-foreground">{score.answeredCount}</strong></span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
            <span>Remaining: <strong className="text-foreground">{remainingCount}</strong></span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            <span>Revealed: <strong className="text-foreground">{revealedCount}</strong></span>
          </div>

          {revealedCount > 0 && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-medium">
              <Check className="h-3 w-3" />
              <span>Score: <strong>{score.correctCount}</strong> / {revealedCount} ({Math.round((score.correctCount / Math.max(revealedCount, 1)) * 100)}%)</span>
            </div>
          )}
        </div>
      </div>

      {/* Celebratory Completion Alert when all questions are answered */}
      {isAllAnswered && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center justify-between gap-4 text-xs sm:text-sm text-emerald-900 dark:text-emerald-100 animate-in fade-in-50">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-emerald-950 dark:text-emerald-50">
                All {total} questions have been answered!
              </p>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                You can now reveal all explanations or open the score summary to review your results.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={onOpenScoreSummary}
            className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs text-xs"
          >
            <Trophy className="h-3.5 w-3.5 mr-1.5" />
            View Summary
          </Button>
        </div>
      )}

      {/* Question Number Strip / Navigator */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5">
          <span>Question Navigator</span>
          <span className="text-[11px]">
            {viewMode === 'single' ? `Viewing #${currentIndex + 1}` : 'All Questions'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto p-1 scrollbar-thin">
          {questions.map((q, idx) => {
            const isCurrent = idx === currentIndex && viewMode === 'single';
            const isAnswered = selectedOptionExists(selectedAnswers[q.id]);
            const isRev = !!revealedAnswers[q.id];
            const isCorr = isRev && selectedAnswers[q.id] === q.correctAnswer;
            const isWrong = isRev && isAnswered && !isCorr;

            let btnColor = 'border-border/80 bg-card text-muted-foreground hover:bg-muted/80 hover:text-foreground';
            if (isRev) {
              if (isCorr) {
                btnColor = 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold';
              } else if (isWrong) {
                btnColor = 'border-destructive bg-destructive/15 text-destructive font-bold';
              } else {
                btnColor = 'border-primary/40 bg-muted text-foreground';
              }
            } else if (isAnswered) {
              btnColor = 'border-primary/60 bg-primary/10 text-primary font-semibold';
            }

            if (isCurrent) {
              btnColor += ' border-primary bg-primary/15 text-primary ring-2 ring-primary/40 font-bold shadow-xs';
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx);
                  if (viewMode === 'list') {
                    const el = document.getElementById(`question-card-${idx}`);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                className={`h-9 w-9 shrink-0 rounded-lg border text-xs flex items-center justify-center transition-all cursor-pointer ${btnColor}`}
                title={`Question ${idx + 1}: ${isAnswered ? 'Answered' : 'Unanswered'}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area: Single Question Mode or All Questions List Mode */}
      {viewMode === 'single' ? (
        <div className="space-y-4">
          {currentQuestion && (
            <QuizCard
              key={currentQuestion.id}
              question={currentQuestion}
              index={currentIndex}
              totalQuestions={total}
              selectedOption={selectedAnswers[currentQuestion.id]}
              isRevealed={!!revealedAnswers[currentQuestion.id]}
              onSelectOption={(opt) => onSelectOption(currentQuestion.id, opt)}
              onRevealAnswer={() => onRevealAnswer(currentQuestion.id)}
            />
          )}

          {/* Bottom Pagination & Progress Row */}
          <div className="rounded-xl border border-border/80 bg-card p-3.5 flex items-center justify-between gap-3 shadow-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrev}
              disabled={currentIndex === 0}
              className="gap-1.5 cursor-pointer text-xs"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {/* Center Progress indicator */}
            <div className="flex flex-col items-center gap-1 min-w-0">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="font-semibold text-foreground">
                  Question {currentIndex + 1} of {total}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {score.answeredCount}/{total} answered ({answeredPercent}%)
                </span>
              </div>
              <div className="w-28 sm:w-40">
                <Progress value={score.answeredCount} max={total} className="h-1.5" />
              </div>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={goToNext}
              disabled={currentIndex === total - 1}
              className="gap-1.5 cursor-pointer text-xs"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        /* List Mode: All questions stacked */
        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div key={q.id} id={`question-card-${idx}`}>
              <QuizCard
                question={q}
                index={idx}
                totalQuestions={total}
                selectedOption={selectedAnswers[q.id]}
                isRevealed={!!revealedAnswers[q.id]}
                onSelectOption={(opt) => onSelectOption(q.id, opt)}
                onRevealAnswer={() => onRevealAnswer(q.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function selectedOptionExists(val: any): boolean {
  return typeof val === 'string' && val.length > 0;
}
