/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Layers,
  FileCheck,
} from 'lucide-react';
import { ToastProvider, useToast } from './components/ui/toast.tsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs.tsx';
import { Button } from './components/ui/button.tsx';
import { ThemeToggle } from './components/ThemeToggle.tsx';
import { UploadPanel } from './components/UploadPanel.tsx';
import { QuizView } from './components/QuizView.tsx';
import { AnswerKeyView } from './components/AnswerKeyView.tsx';
import { EmptyState } from './components/EmptyState.tsx';
import { QuizLoadingState } from './components/QuizLoadingState.tsx';
import { ScoreSummaryModal } from './components/ScoreSummaryModal.tsx';
import { PdfExtractionResult } from './utils/pdf-extractor.ts';
import {
  QuizQuestion,
  QuizSettings,
  OptionLetter,
  QuizGenerationResponse,
} from './types/quiz.ts';

function QuizApp() {
  const { toast } = useToast();

  // State
  const [currentPdf, setCurrentPdf] = useState<PdfExtractionResult | null>(null);
  const [extractedTextError, setExtractedTextError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  const [settings, setSettings] = useState<QuizSettings>({
    numQuestions: 5,
    difficulty: 'Medium',
  });

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [activeTab, setActiveTab] = useState<'quiz' | 'answer-key'>('quiz');
  const [qualityNotice, setQualityNotice] = useState<string | undefined>(undefined);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, OptionLetter>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [isScoreSummaryOpen, setIsScoreSummaryOpen] = useState<boolean>(false);

  // File Handlers
  const handlePdfExtracted = (result: PdfExtractionResult) => {
    setCurrentPdf(result);
    setExtractedTextError(null);
    setGenerationError(null);
    // When a new file is uploaded, reset existing quiz state
    setQuestions([]);
    setSelectedAnswers({});
    setRevealedAnswers({});
    setQualityNotice(undefined);
  };

  const handlePdfRemoved = () => {
    setCurrentPdf(null);
    setExtractedTextError(null);
    setGenerationError(null);
    setQuestions([]);
    setSelectedAnswers({});
    setRevealedAnswers({});
    setQualityNotice(undefined);
  };

  // Full Quiz Reset
  const handleFullReset = () => {
    setCurrentPdf(null);
    setExtractedTextError(null);
    setGenerationError(null);
    setQuestions([]);
    setSelectedAnswers({});
    setRevealedAnswers({});
    setQualityNotice(undefined);
    setSettings({ numQuestions: 5, difficulty: 'Medium' });
    setActiveTab('quiz');

    toast({
      title: 'Reset Complete',
      description: 'Ready to generate a new quiz.',
      variant: 'default',
    });
  };

  // Quiz Generation Call to Backend Route
  const handleGenerateQuiz = async () => {
    if (!currentPdf || !currentPdf.text) {
      toast({
        title: 'No PDF Loaded',
        description: 'Please upload a PDF document first.',
        variant: 'error',
      });
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setSelectedAnswers({});
    setRevealedAnswers({});
    setQualityNotice(undefined);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: currentPdf.text,
          numQuestions: settings.numQuestions,
          difficulty: settings.difficulty,
        }),
      });

      const data: QuizGenerationResponse & { error?: string } = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to generate quiz from server.');
      }

      if (!data.questions || data.questions.length === 0) {
        throw new Error('No valid questions could be verified against the PDF text.');
      }

      setQuestions(data.questions);
      setQualityNotice(data.notice);
      setActiveTab('quiz');

      toast({
        title: 'Quiz Generated Successfully',
        description: `Created ${data.questions.length} grounded ${settings.difficulty.toLowerCase()} questions.`,
        variant: 'success',
      });
    } catch (err: any) {
      console.error('Quiz generation failure:', err);
      const msg = err.message || 'An error occurred while generating the quiz.';
      setGenerationError(msg);

      toast({
        title: 'Generation Failed',
        description: msg,
        variant: 'error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Answer interaction
  const handleSelectOption = (questionId: string, option: OptionLetter) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleRevealAnswer = (questionId: string) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [questionId]: true,
    }));
  };

  const handleRevealAll = () => {
    const allRev: Record<string, boolean> = {};
    for (const q of questions) {
      allRev[q.id] = true;
    }
    setRevealedAnswers(allRev);

    toast({
      title: 'Answers Revealed',
      description: 'All explanations and source citations are now visible.',
      variant: 'info',
    });
  };

  const hasQuiz = questions.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground leading-none">
                  PDF Quiz Generator
                </h1>
                <span className="hidden sm:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Grounded AI
                </span>
              </div>
              <p className="hidden sm:block text-xs text-muted-foreground mt-0.5">
                Generate verified multiple-choice quizzes with source citations
              </p>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2.5">
            {hasQuiz && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleFullReset}
                className="text-xs gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
                title="Reset quiz and start fresh"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New Quiz</span>
              </Button>
            )}

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area: Responsive Two-Column Layout */}
      <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Upload & Configuration Panel (lg:col-span-4 or 5) */}
          <div className="lg:col-span-5 space-y-6">
            <UploadPanel
              currentPdf={currentPdf}
              onPdfExtracted={handlePdfExtracted}
              onPdfRemoved={handlePdfRemoved}
              settings={settings}
              onSettingsChange={setSettings}
              onGenerateQuiz={handleGenerateQuiz}
              isGenerating={isGenerating}
              isExtracting={isExtracting}
              setIsExtracting={setIsExtracting}
              generationError={generationError}
              onRetryGeneration={handleGenerateQuiz}
              extractedTextError={extractedTextError}
              setExtractedTextError={setExtractedTextError}
            />
          </div>

          {/* Right Column: Quiz Display & Answer Key (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            {isGenerating ? (
              <QuizLoadingState targetCount={settings.numQuestions} />
            ) : hasQuiz ? (
              <Tabs
                value={activeTab}
                onValueChange={(val) => setActiveTab(val as 'quiz' | 'answer-key')}
                className="w-full"
              >
                {/* Tabs Switcher Strip */}
                <div className="flex items-center justify-between pb-3">
                  <TabsList className="grid grid-cols-2 w-full sm:w-auto">
                    <TabsTrigger value="quiz" className="gap-2">
                      <Layers className="h-4 w-4" />
                      <span>Quiz View ({questions.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="answer-key" className="gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Answer Key View</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="quiz">
                  <QuizView
                    questions={questions}
                    selectedAnswers={selectedAnswers}
                    revealedAnswers={revealedAnswers}
                    onSelectOption={handleSelectOption}
                    onRevealAnswer={handleRevealAnswer}
                    onRevealAll={handleRevealAll}
                    onResetQuiz={handleFullReset}
                    notice={qualityNotice}
                    onOpenScoreSummary={() => setIsScoreSummaryOpen(true)}
                  />
                </TabsContent>

                <TabsContent value="answer-key">
                  <AnswerKeyView
                    questions={questions}
                    pdfFileName={currentPdf?.fileName}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-muted/20 py-6 mt-12 print:hidden">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">PDF Quiz Generator</span>
            <span>•</span>
            <span>All quiz content is strictly grounded in uploaded PDF text</span>
          </div>

          <div className="flex items-center gap-4">
            {hasQuiz && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFullReset}
                className="h-8 text-xs gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" />
                Generate another quiz
              </Button>
            )}
          </div>
        </div>
      </footer>

      {/* Score Summary Modal */}
      {hasQuiz && (
        <ScoreSummaryModal
          open={isScoreSummaryOpen}
          onOpenChange={setIsScoreSummaryOpen}
          questions={questions}
          selectedAnswers={selectedAnswers}
          onResetQuiz={handleFullReset}
          onReviewAnswers={() => setIsScoreSummaryOpen(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <QuizApp />
    </ToastProvider>
  );
}
