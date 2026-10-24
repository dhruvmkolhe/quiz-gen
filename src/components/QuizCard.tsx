import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Eye,
  Quote,
  Lightbulb,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from './ui/card.tsx';
import { Button } from './ui/button.tsx';
import { Badge } from './ui/badge.tsx';
import { RadioGroup, RadioGroupItem } from './ui/radio-group.tsx';
import { QuizQuestion, OptionLetter } from '../types/quiz.ts';

interface QuizCardProps {
  question: QuizQuestion;
  index: number;
  totalQuestions: number;
  selectedOption?: OptionLetter;
  isRevealed: boolean;
  onSelectOption: (option: OptionLetter) => void;
  onRevealAnswer: () => void;
}

const OPTION_LETTERS: OptionLetter[] = ['A', 'B', 'C', 'D'];

export function QuizCard({
  question,
  index,
  totalQuestions,
  selectedOption,
  isRevealed,
  onSelectOption,
  onRevealAnswer,
}: QuizCardProps) {
  const isCorrect = selectedOption === question.correctAnswer;
  const isAnswered = selectedOption !== undefined;

  return (
    <Card className="overflow-hidden border-border/80 shadow-xs transition-all duration-200">
      <CardContent className="p-5 sm:p-6 space-y-5">
        {/* Header row: Question index badge & status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-xs px-2.5 py-1">
              Question {index + 1} of {totalQuestions}
            </Badge>
            {isRevealed && (
              <Badge
                variant={isCorrect ? 'success' : isAnswered ? 'destructive' : 'outline'}
                className="text-xs"
              >
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Correct
                  </>
                ) : isAnswered ? (
                  <>
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Incorrect
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5 mr-1" /> Solution Revealed
                  </>
                )}
              </Badge>
            )}
          </div>

          <div className="text-xs text-muted-foreground font-mono">
            {isAnswered ? `Selected: Option ${selectedOption}` : 'Not answered yet'}
          </div>
        </div>

        {/* Question Text */}
        <div className="text-base sm:text-lg font-bold text-foreground leading-snug">
          {question.question}
        </div>

        {/* 4 Options (A-D) */}
        <RadioGroup
          value={selectedOption || ''}
          onValueChange={(val) => {
            if (!isRevealed) {
              onSelectOption(val as OptionLetter);
            }
          }}
          disabled={isRevealed}
          className="space-y-2.5"
        >
          {OPTION_LETTERS.map((letter, optIndex) => {
            const optText = question.options[optIndex];
            const isThisOptionSelected = selectedOption === letter;
            const isThisCorrect = question.correctAnswer === letter;

            // Post-reveal styling logic:
            // Correct option -> green border & background
            // Selected WRONG option -> red border & background
            // Unselected options after reveal -> muted
            let containerStyle =
              'border-border/80 hover:border-primary/50 hover:bg-muted/40 bg-card';
            let letterBadgeStyle = 'bg-muted text-muted-foreground';

            if (isRevealed) {
              if (isThisCorrect) {
                containerStyle =
                  'border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 ring-1 ring-emerald-500 font-medium';
                letterBadgeStyle = 'bg-emerald-500 text-white font-bold';
              } else if (isThisOptionSelected && !isThisCorrect) {
                containerStyle =
                  'border-destructive bg-destructive/10 text-destructive dark:text-rose-200 ring-1 ring-destructive';
                letterBadgeStyle = 'bg-destructive text-white font-bold';
              } else {
                containerStyle = 'border-border/60 bg-muted/20 opacity-60';
                letterBadgeStyle = 'bg-muted text-muted-foreground';
              }
            } else if (isThisOptionSelected) {
              containerStyle =
                'border-primary bg-primary/10 text-foreground ring-1 ring-primary font-medium';
              letterBadgeStyle = 'bg-primary text-primary-foreground font-bold';
            }

            return (
              <label
                key={letter}
                onClick={() => {
                  if (!isRevealed) onSelectOption(letter);
                }}
                className={`flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border text-sm transition-all cursor-pointer ${containerStyle} ${
                  isRevealed ? 'cursor-default' : ''
                }`}
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold uppercase transition-colors ${letterBadgeStyle}`}
                >
                  {letter}
                </div>

                <div className="flex-1 min-w-0 leading-relaxed text-foreground select-none">
                  {optText}
                </div>

                {isRevealed && isThisCorrect && (
                  <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 self-center" />
                )}
                {isRevealed && isThisOptionSelected && !isThisCorrect && (
                  <XCircle className="h-5 w-5 text-destructive shrink-0 self-center" />
                )}
              </label>
            );
          })}
        </RadioGroup>

        {/* Reveal Answer Action Button */}
        {!isRevealed ? (
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              {isAnswered ? 'Answer chosen — ready to verify' : 'Pick an option or reveal directly'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onRevealAnswer}
              className="text-xs gap-1.5 hover:border-primary hover:text-primary cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              Reveal Answer
            </Button>
          </div>
        ) : (
          /* Answer Revealed: Explanation & Grounded PDF Snippet */
          <div className="rounded-xl border border-border/80 bg-muted/30 p-4 sm:p-5 space-y-4 animate-in fade-in-50 duration-200">
            {/* Why It's Correct block */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Lightbulb className="h-4 w-4" />
                <span>Why Option {question.correctAnswer} is Correct:</span>
              </div>
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed pl-6">
                {question.explanation}
              </p>
            </div>

            {/* Source Grounding Quote Box */}
            <div className="rounded-lg border border-border/60 bg-background/80 p-3.5 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-muted-foreground">
                <Quote className="h-3.5 w-3.5 text-primary" />
                <span>Verified Source Passage (from PDF):</span>
              </div>
              <blockquote className="italic text-foreground/80 border-l-2 border-primary/50 pl-3 leading-relaxed">
                "{question.sourceSnippet}"
              </blockquote>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
