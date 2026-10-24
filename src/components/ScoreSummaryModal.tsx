import React from 'react';
import { Trophy, Award, CheckCircle2, XCircle, HelpCircle, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog.tsx';
import { Button } from './ui/button.tsx';
import { Badge } from './ui/badge.tsx';
import { Progress } from './ui/progress.tsx';
import { QuizQuestion, OptionLetter } from '../types/quiz.ts';
import { calculateQuizScore } from '../utils/quiz-validator.ts';

interface ScoreSummaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: QuizQuestion[];
  selectedAnswers: Record<string, OptionLetter>;
  onResetQuiz: () => void;
  onReviewAnswers: () => void;
}

export function ScoreSummaryModal({
  open,
  onOpenChange,
  questions,
  selectedAnswers,
  onResetQuiz,
  onReviewAnswers,
}: ScoreSummaryModalProps) {
  const score = calculateQuizScore(questions, selectedAnswers);
  const unansweredCount = score.total - score.answeredCount;

  // Grade classification
  let gradeBadge = { label: 'Keep Practicing', color: 'bg-amber-500/15 text-amber-600 border-amber-500/30' };
  if (score.percentage >= 90) {
    gradeBadge = { label: 'Outstanding!', color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' };
  } else if (score.percentage >= 75) {
    gradeBadge = { label: 'Great Job!', color: 'bg-indigo-500/15 text-indigo-600 border-indigo-500/30' };
  } else if (score.percentage >= 60) {
    gradeBadge = { label: 'Good Effort', color: 'bg-sky-500/15 text-sky-600 border-sky-500/30' };
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Trophy className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">Quiz Performance Summary</DialogTitle>
          <DialogDescription className="text-center">
            Detailed breakdown of your answered questions and accuracy.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Main Score Box */}
          <div className="rounded-xl border border-border bg-muted/30 p-5 text-center space-y-2">
            <div className="text-4xl font-extrabold text-foreground tracking-tight">
              {score.correctCount} <span className="text-xl font-medium text-muted-foreground">/ {score.total}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-semibold text-primary">{score.percentage}% Accuracy</span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${gradeBadge.color}`}
              >
                {gradeBadge.label}
              </span>
            </div>
            <div className="pt-2">
              <Progress value={score.percentage} className="h-2.5" />
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-card p-3 text-center">
              <div className="flex items-center justify-center text-emerald-500 mb-1">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="text-lg font-bold text-foreground">{score.correctCount}</div>
              <div className="text-[11px] text-muted-foreground font-medium">Correct</div>
            </div>

            <div className="rounded-lg border border-border bg-card p-3 text-center">
              <div className="flex items-center justify-center text-destructive mb-1">
                <XCircle className="h-4 w-4" />
              </div>
              <div className="text-lg font-bold text-foreground">{score.incorrectCount}</div>
              <div className="text-[11px] text-muted-foreground font-medium">Incorrect</div>
            </div>

            <div className="rounded-lg border border-border bg-card p-3 text-center">
              <div className="flex items-center justify-center text-muted-foreground mb-1">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div className="text-lg font-bold text-foreground">{unansweredCount}</div>
              <div className="text-[11px] text-muted-foreground font-medium">Unanswered</div>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              onResetQuiz();
            }}
            className="text-xs gap-1.5 cursor-pointer text-muted-foreground hover:text-destructive"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset & New Quiz
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              onReviewAnswers();
            }}
            className="text-xs cursor-pointer"
          >
            Review Questions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
