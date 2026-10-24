import React from 'react';
import {
  FileQuestion,
  Sparkles,
  ShieldCheck,
  Zap,
  BookOpen,
} from 'lucide-react';
import { Card, CardContent } from './ui/card.tsx';

export function EmptyState() {
  return (
    <Card className="border-border/80 bg-card/60 backdrop-blur-xs p-6 sm:p-10 text-center shadow-xs">
      <CardContent className="p-0 max-w-lg mx-auto space-y-6">
        {/* Visual icon badge */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5">
          <FileQuestion className="h-8 w-8" />
        </div>

        {/* Heading and subtext */}
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            No Quiz Generated Yet
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Upload your PDF document on the left to extract its contents and generate a multiple-choice quiz grounded strictly in your text.
          </p>
        </div>

        {/* Feature pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
          <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-primary text-xs font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>100% Grounded</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal">
              No outside hallucinations. Questions cite the verbatim passage from your PDF.
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-primary text-xs font-semibold">
              <Zap className="h-4 w-4" />
              <span>Strict Validation</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Every question has exactly 4 distinct options with no ambiguous overlapping answers.
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-primary text-xs font-semibold">
              <BookOpen className="h-4 w-4" />
              <span>Printable Key</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Toggle to the Answer Key tab anytime for a print-ready study sheet with full explanations.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
