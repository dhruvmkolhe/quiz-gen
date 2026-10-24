import React, { useEffect, useState } from 'react';
import { Sparkles, Brain, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from './ui/card.tsx';
import { Skeleton } from './ui/skeleton.tsx';
import { Progress } from './ui/progress.tsx';

const LOADING_STEPS = [
  'Extracting and verifying document text...',
  'Analyzing key concepts and topics...',
  'Generating grounded multiple-choice questions...',
  'Validating strict 4-option rules and single correct answers...',
  'Checking source grounding against PDF text...',
];

export function QuizLoadingState({ targetCount }: { targetCount: number }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < LOADING_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 2800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return 92;
        return prev + Math.floor(Math.random() * 8) + 4;
      });
    }, 800);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Active Progress Banner */}
      <Card className="border-primary/20 bg-primary/5 shadow-xs">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-primary font-semibold text-sm sm:text-base">
              <Brain className="h-5 w-5 animate-pulse text-primary" />
              <span>Generating {targetCount} Grounded Quiz Questions...</span>
            </div>
            <span className="font-mono text-xs text-primary font-bold">{progress}%</span>
          </div>

          <Progress value={progress} className="h-2.5" />

          <div className="space-y-1.5 pt-1">
            {LOADING_STEPS.map((step, idx) => {
              const isDone = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              if (idx > currentStepIndex + 1) return null;

              return (
                <div
                  key={step}
                  className={`flex items-center gap-2 text-xs transition-colors ${
                    isDone
                      ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                      : isCurrent
                      ? 'text-primary font-semibold'
                      : 'text-muted-foreground/60'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isCurrent ? 'bg-primary animate-ping' : 'bg-muted-foreground/30'
                      }`}
                    />
                  )}
                  <span>{step}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Skeleton placeholders resembling Question Cards */}
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="border-border/60 bg-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-28 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
            <Skeleton className="h-6 w-5/6 rounded-md" />
            <div className="space-y-2.5 pt-2">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
