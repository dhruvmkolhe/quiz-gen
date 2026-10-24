import React, { useRef, useState } from 'react';
import {
  FileText,
  UploadCloud,
  X,
  FileCheck2,
  Sparkles,
  AlertCircle,
  RotateCcw,
  BookOpen,
  Check,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card.tsx';
import { Button } from './ui/button.tsx';
import { Input } from './ui/input.tsx';
import { RadioGroup, RadioGroupItem } from './ui/radio-group.tsx';
import { Badge } from './ui/badge.tsx';
import { Progress } from './ui/progress.tsx';
import { DifficultyLevel, QuizSettings } from '../types/quiz.ts';
import { extractTextFromPdf, createSamplePdfFile, PdfExtractionResult } from '../utils/pdf-extractor.ts';
import { SAMPLE_DOCUMENTS } from '../data/sample-docs.ts';
import { useToast } from './ui/toast.tsx';

interface UploadPanelProps {
  currentPdf: PdfExtractionResult | null;
  onPdfExtracted: (result: PdfExtractionResult) => void;
  onPdfRemoved: () => void;
  settings: QuizSettings;
  onSettingsChange: (settings: QuizSettings) => void;
  onGenerateQuiz: () => void;
  isGenerating: boolean;
  isExtracting: boolean;
  setIsExtracting: (val: boolean) => void;
  generationError: string | null;
  onRetryGeneration: () => void;
  extractedTextError: string | null;
  setExtractedTextError: (err: string | null) => void;
}

export function UploadPanel({
  currentPdf,
  onPdfExtracted,
  onPdfRemoved,
  settings,
  onSettingsChange,
  onGenerateQuiz,
  isGenerating,
  isExtracting,
  setIsExtracting,
  generationError,
  onRetryGeneration,
  extractedTextError,
  setExtractedTextError,
}: UploadPanelProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);

  const [extractionStatus, setExtractionStatus] = useState<string>('Reading and parsing PDF pages in browser...');

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleProcessFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a PDF document (.pdf).',
        variant: 'error',
      });
      return;
    }

    setIsExtracting(true);
    setExtractionProgress(5);
    setExtractionStatus('Opening document and initializing streams...');
    setExtractedTextError(null);

    try {
      const result = await extractTextFromPdf(file, (current, total) => {
        const pct = Math.max(5, Math.round((current / total) * 100));
        setExtractionProgress(pct);
        setExtractionStatus(`Extracting page ${current} of ${total} (${pct}%)...`);
      });
      setExtractionProgress(100);
      onPdfExtracted(result);

      const shortName = file.name.length > 30 ? file.name.slice(0, 27) + '...' : file.name;
      toast({
        title: 'PDF Uploaded Successfully',
        description: `Extracted ${result.numPages} ${result.numPages === 1 ? 'page' : 'pages'} (${result.wordCount.toLocaleString()} words) from "${shortName}".`,
        variant: 'success',
      });
    } catch (err: any) {
      console.error('PDF extraction failed:', err);
      const isNoText = err.message === 'NO_READABLE_TEXT';

      const errorMsg = isNoText
        ? 'This PDF contains no readable or extractable text (it may be a scanned image-only PDF or password-protected). Please try another file.'
        : `Could not parse PDF: ${err.message || 'Unknown error'}. Please try another file.`;

      setExtractedTextError(errorMsg);

      toast({
        title: isNoText ? 'No Readable Text Found' : 'Extraction Error',
        description: errorMsg,
        variant: 'error',
      });
    } finally {
      setIsExtracting(false);
      setExtractionProgress(0);
      setExtractionStatus('Reading and parsing PDF pages in browser...');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleLoadSample = (sample: typeof SAMPLE_DOCUMENTS[0]) => {
    const sampleFile = createSamplePdfFile(sample.title, sample.content);
    handleProcessFile(sampleFile);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone Card */}
      <Card className="overflow-hidden border-border/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Source Document
            </CardTitle>
            {currentPdf && (
              <Badge variant="success" className="font-medium text-xs">
                <Check className="h-3 w-3 mr-1" /> Ready for Quiz
              </Badge>
            )}
          </div>
          <CardDescription>
            Upload any text-based PDF — from a short article to a 300+ page book — to generate fully grounded questions.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* File Picker input (hidden) */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,application/pdf"
            className="hidden"
            aria-label="Upload PDF file"
          />

          {!currentPdf && !isExtracting ? (
            /* Drag and Drop Box */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
                isDragOver
                  ? 'border-primary bg-primary/5 scale-[0.99]'
                  : 'border-border/80 hover:border-primary/60 hover:bg-muted/30 bg-muted/10'
              }`}
            >
              <div className="mb-3 rounded-full bg-primary/10 p-4 text-primary group-hover:scale-110 group-hover:bg-primary/15 transition-all">
                <UploadCloud className="h-7 w-7" />
              </div>
              <h4 className="text-sm font-semibold text-foreground mb-1">
                Drop your PDF here, or <span className="text-primary underline underline-offset-2">browse files</span>
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm">
                No page or file size limit — supports full books (300+ pages), textbooks, research papers, manuals, or lecture notes.
              </p>
            </div>
          ) : isExtracting ? (
            /* Extraction Loading State with live page counter */
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-primary font-medium text-sm">
                <Sparkles className="h-4 w-4 animate-spin text-primary" />
                <span>{extractionStatus}</span>
              </div>
              <Progress value={extractionProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">Extracting text streams and validating readability across all pages</p>
            </div>
          ) : currentPdf ? (
            /* Active File Card */
            <div className="rounded-xl border border-border bg-muted/30 p-4 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="rounded-lg bg-primary/10 p-2.5 text-primary shrink-0 mt-0.5">
                    <FileCheck2 className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-foreground truncate" title={currentPdf.fileName}>
                      {currentPdf.fileName}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                      <span>{formatFileSize(currentPdf.fileSizeBytes)}</span>
                      <span>•</span>
                      <span>{currentPdf.numPages} {currentPdf.numPages === 1 ? 'page' : 'pages'}</span>
                      <span>•</span>
                      <span>{currentPdf.wordCount.toLocaleString()} words</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onPdfRemoved}
                  title="Remove file"
                  aria-label="Remove uploaded PDF"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Document Summary Snippet preview */}
              <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Extracted preview: </span>
                <span className="italic line-clamp-2">
                  "{currentPdf.text.slice(0, 180).replace(/\s+/g, ' ')}..."
                </span>
              </div>
            </div>
          ) : null}

          {/* Extracted Text Error Box */}
          {extractedTextError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive space-y-2">
              <div className="flex items-start gap-2 font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Text Extraction Failed</span>
              </div>
              <p className="leading-relaxed text-destructive/90">{extractedTextError}</p>
              <div className="pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-7 text-xs border-destructive/40 text-destructive hover:bg-destructive/15"
                >
                  Choose Another PDF
                </Button>
              </div>
            </div>
          )}

          {/* Sample Documents Picker */}
          {!currentPdf && (
            <div className="pt-2">
              <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                No PDF ready? Try a sample document:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SAMPLE_DOCUMENTS.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => handleLoadSample(doc)}
                    className="flex flex-col text-left p-2.5 rounded-lg border border-border/80 bg-card hover:bg-accent hover:border-primary/40 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {doc.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{doc.category}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quiz Generation Settings Card */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Quiz Configuration
          </CardTitle>
          <CardDescription>
            Specify how many grounded questions and the cognitive difficulty level you need.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Number of Questions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="num-questions" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                Number of Questions
                <span className="text-xs text-muted-foreground font-normal">(No upper limit)</span>
              </label>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground">
                {settings.numQuestions} Questions
              </span>
            </div>
            <Input
              id="num-questions"
              type="number"
              min={1}
              value={settings.numQuestions}
              disabled={isGenerating}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                  onSettingsChange({
                    ...settings,
                    numQuestions: Math.max(1, val),
                  });
                }
              }}
              className="font-mono text-sm"
              placeholder="Enter any number of questions (e.g. 10, 50, 100)..."
            />
            {/* Quick pill presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-muted-foreground mr-1">Presets:</span>
              {[5, 10, 25, 50, 100].map((num) => (
                <button
                  key={num}
                  type="button"
                  disabled={isGenerating}
                  onClick={() => onSettingsChange({ ...settings, numQuestions: num })}
                  className={`text-xs px-2.5 py-0.5 rounded-md border transition-colors cursor-pointer ${
                    settings.numQuestions === num
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block">
              Difficulty Level
            </label>
            <RadioGroup
              value={settings.difficulty}
              onValueChange={(val) =>
                onSettingsChange({
                  ...settings,
                  difficulty: val as DifficultyLevel,
                })
              }
              className="grid grid-cols-3 gap-2"
              disabled={isGenerating}
            >
              {(['Easy', 'Medium', 'Hard'] as DifficultyLevel[]).map((level) => {
                const isSelected = settings.difficulty === level;
                return (
                  <label
                    key={level}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-medium cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary'
                        : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <RadioGroupItem value={level} id={`diff-${level}`} className="sr-only" />
                    <span>{level}</span>
                  </label>
                );
              })}
            </RadioGroup>
          </div>

          {/* Generation Error State with Retry Button */}
          {generationError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive space-y-3">
              <div className="flex items-start gap-2 font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Quiz Generation Failed</span>
              </div>
              <p className="leading-relaxed text-destructive/90">{generationError}</p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onRetryGeneration}
                  disabled={isGenerating}
                  className="h-8 text-xs gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Retry Generation
                </Button>
                <span className="text-[11px] text-muted-foreground">Uploaded PDF is preserved</span>
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <Button
            size="lg"
            onClick={onGenerateQuiz}
            disabled={!currentPdf || isGenerating || isExtracting}
            className="w-full text-sm sm:text-base font-semibold shadow-md gap-2"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin" />
                Generating Grounded Quiz...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Quiz ({settings.numQuestions} Qs)
              </>
            )}
          </Button>

          {!currentPdf && (
            <p className="text-center text-xs text-muted-foreground">
              Upload a PDF above to enable quiz generation.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
