import React, { useState } from 'react';
import { Printer, Copy, Check, Quote, Lightbulb, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card.tsx';
import { Button } from './ui/button.tsx';
import { Badge } from './ui/badge.tsx';
import { QuizQuestion } from '../types/quiz.ts';
import { useToast } from './ui/toast.tsx';

interface AnswerKeyViewProps {
  questions: QuizQuestion[];
  pdfFileName?: string;
}

export function AnswerKeyView({ questions, pdfFileName }: AnswerKeyViewProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyAll = async () => {
    try {
      const text = questions
        .map(
          (q, idx) =>
            `Question ${idx + 1}: ${q.question}\n` +
            `Correct Answer: Option ${q.correctAnswer} (${
              q.options[q.correctAnswer.charCodeAt(0) - 65]
            })\n` +
            `Explanation: ${q.explanation}\n` +
            `PDF Source Snippet: "${q.sourceSnippet}"\n`
        )
        .join('\n----------------------------------------\n\n');

      await navigator.clipboard.writeText(
        `PDF QUIZ - ANSWER KEY\nDocument: ${pdfFileName || 'Extracted PDF'}\nTotal Questions: ${questions.length}\n\n${text}`
      );

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      toast({
        title: 'Copied to Clipboard',
        description: 'Full answer key and source citations copied successfully.',
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Copy Failed',
        description: 'Unable to access clipboard.',
        variant: 'error',
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Action Header Card (Hidden when printing) */}
      <Card className="border-border/80 shadow-xs print:hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Comprehensive Answer Key & Source Grounding
              </CardTitle>
              <CardDescription>
                Compact, verifiable answer key referencing exact lines and concepts extracted from the PDF.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAll}
                className="text-xs gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy All'}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handlePrint}
                className="text-xs gap-1.5 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Key
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Printable Heading for Print Output */}
      <div className="hidden print:block border-b border-black/20 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-black">Quiz Answer Key</h1>
        <p className="text-sm text-gray-600">
          Source Document: {pdfFileName || 'PDF Document'} • Generated Questions: {questions.length}
        </p>
      </div>

      {/* Questions & Answer Key List */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const correctOptionText = q.options[q.correctAnswer.charCodeAt(0) - 65];

          return (
            <Card
              key={q.id}
              className="border-border/80 shadow-xs break-inside-avoid print:border print:border-gray-300 print:shadow-none"
            >
              <CardContent className="p-5 space-y-3.5">
                {/* Question Title & Correct Answer Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <Badge variant="secondary" className="font-mono text-xs px-2 py-0.5 mt-0.5">
                      #{idx + 1}
                    </Badge>
                    <h4 className="text-sm sm:text-base font-semibold text-foreground leading-snug">
                      {q.question}
                    </h4>
                  </div>
                  <Badge variant="success" className="font-bold text-xs shrink-0">
                    Option {q.correctAnswer}
                  </Badge>
                </div>

                {/* Correct Option Text */}
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 text-xs sm:text-sm text-emerald-900 dark:text-emerald-100">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 mr-2">
                    Correct Answer:
                  </span>
                  <span className="font-medium">{correctOptionText}</span>
                </div>

                {/* Explanation */}
                <div className="text-xs sm:text-sm text-foreground/80 leading-relaxed flex items-start gap-2 pt-1">
                  <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">Why: </span>
                    <span>{q.explanation}</span>
                  </div>
                </div>

                {/* Grounded Source Snippet */}
                <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-muted-foreground text-[11px]">
                    <Quote className="h-3 w-3 text-primary" />
                    <span>PDF Source Passage:</span>
                  </div>
                  <p className="italic text-foreground/85 border-l-2 border-primary/40 pl-2.5">
                    "{q.sourceSnippet}"
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
