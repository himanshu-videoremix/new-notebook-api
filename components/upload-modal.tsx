'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Link2, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { geminiService } from '@/lib/gemini';
import { storageService } from '@/lib/storage';
import { SourceOverview } from '@/components/source-overview';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (resource: {
    type: string;
    content: string;
    metadata?: any;
    overviewMessage?: any;
  }) => void;
}

export function UploadModal({ isOpen, onClose, onUploadComplete }: UploadModalProps) {
  // Group all state hooks at the top
  const [activeTab, setActiveTab] = useState<'file' | 'link' | 'text'>('file');
  const [files, setFiles] = useState<Array<File>>([]);
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const [showOverview, setShowOverview] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Handle initialization
  useEffect(() => {
    setIsReady(true);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive"
        });
        return false;
      }

      // Validate file type
      const validTypes = ['application/pdf', 'text/plain'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Only PDF and text files are supported",
          variant: "destructive"
        });
        return false;
      }

      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  // In upload-modal.tsx, update the handleUpload function
  const handleUpload = async () => {
    setUploading(true);
    setProgress(0);
    let content: string;
    let type: string;
    let title: string;

    try {
      switch (activeTab) {
        case 'file':
          if (files.length === 0) return;
          const file = files[0];
          const reader = new FileReader();
          content = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
          });
          type = file.type;
          title = file.name;
          break;

        case 'link':
          if (!url) return;
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            toast({
              title: "Invalid URL",
              description: "URL must start with http:// or https://",
              variant: "destructive",
            });
            return;
          }
          content = url;
          type = 'url';
          title = new URL(url).hostname;
          if (url.includes('youtube.com') || url.includes('youtu.be')) {
            type = 'youtube';
          }
          break;

        case 'text':
          if (!text.trim()) return;
          if (text.length > 50000) {
            toast({
              title: "Text too long",
              description: "Maximum 50,000 characters allowed",
              variant: "destructive",
            });
            return;
          }
          content = text;
          type = 'text';
          title = 'Text Document';
          break;

        default:
          return;
      }

      // Create source object
      const newSource = {
        id: Date.now().toString(),
        title,
        content,
        type,
        selected: false,
        timestamp: Date.now(),
      };

      // Generate overview using Gemini
      setProgress(30);
      try {
        // Use generateSummary for summary
        const summaryResult = await geminiService.generateSummary(content.slice(0, 30000));
        const summary = summaryResult.text || JSON.stringify(summaryResult);

        // Generate suggested questions
        const questionsResult = await geminiService.generateQuestions(content.slice(0, 30000), {
          count: 5,
          type: 'open-ended',
        });
        const suggestedQuestions = Array.isArray(questionsResult)
          ? questionsResult.map(q => q.question)
          : [];

        // Extract topics using extractKeywords
        const keywordsResult = await geminiService.extractKeywords(content.slice(0, 30000), {
          maxKeywords: 10,
        });
        const topics = Array.isArray(keywordsResult.keywords)
          ? keywordsResult.keywords.map((k: { term: string }) => k.term)
          : [];

        setProgress(60);

        // Generate citations
        const citations = await geminiService.generateCitations(content);
        setProgress(90);

        // Add metadata to source
        const sourceWithMetadata = {
          ...newSource,
          metadata: {
            summary: summary,
            rawContent: content
          }
        };

        // Store additional metadata separately
        storageService.saveSourceMetadata(sourceWithMetadata.id, {
          suggestedQuestions,
          topics,
          citations: Array.isArray(citations) ? citations : [],
          readingTime: Math.ceil(content.split(' ').length / 200)
        });

        // Add overview message to chat
        const overviewMessage = {
          text: summary,
          sender: 'assistant' as const,
          isOverview: true,
          error: false,
          source: {
            title: sourceWithMetadata.title,
            type: sourceWithMetadata.type,
            suggestedQuestions,
            citations: Array.isArray(citations) ? citations : [],
            error: false,
          },
        };

        // Save source with metadata
        const sources = storageService.loadSources();
        storageService.saveSources([...sources, sourceWithMetadata]);
        setSelectedSource(sourceWithMetadata);
        setShowOverview(true);
        setProgress(100);

        // Notify parent
        if (onUploadComplete) {
          onUploadComplete({
            ...sourceWithMetadata,
            overviewMessage,
          });
        }

        toast({
          title: "Upload complete",
          description: "Your content has been uploaded and analyzed successfully",
        });

        onClose();
      } catch (error) {
        console.error('Failed to generate overview:', error);

        // Save source even if analysis fails
        const sources = storageService.loadSources();
        storageService.saveSources([
          ...sources,
          {
            ...newSource,
            metadata: {
              summary: '',
              rawContent: content
            }
          },
        ]);

        // Store error information separately
        storageService.saveSourceMetadata(newSource.id, {
          error: true,
          errorMessage: error instanceof Error ? error.message : 'Analysis failed'
        });

        // Add error message to chat
        const errorMessage = {
          text: error instanceof Error ? error.message : 'Content analysis failed. Please try analyzing again later.',
          sender: 'assistant' as const,
          isOverview: true,
          error: true,
          source: {
            title: newSource.title,
            type: newSource.type,
            error: true,
          },
        };

        toast({
          title: "Analysis failed",
          description: error instanceof Error
            ? error.message
            : "Content was uploaded but analysis failed. You can try analyzing it again later.",
          variant: "destructive",
          duration: 5000,
        });

        // Still notify parent of upload
        if (onUploadComplete) {
          onUploadComplete({
            ...newSource,
            overviewMessage: errorMessage,
          });
        }

        onClose();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading your content",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Early return while initializing
  if (!isReady) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-lg border-gray-700/50 shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            <Upload className="w-5 h-5" />
            Add Sources
          </DialogTitle>
          <p className="text-gray-400/90 leading-relaxed text-sm">
            Sources let NotebookLM base its responses on the information that matters most to you.
            <br />
            Examples: marketing plans, course reading, research notes, meeting transcripts, sales documents, etc.
          </p>
        </DialogHeader>
        <div>
          <div className="p-6">
            {/* Tabs */}
            <div className="flex gap-4 mb-6">
              <Button
                variant="ghost"
                className={`flex-1 ${activeTab === 'file' ? 'bg-[#2B2D31] text-white' : 'text-gray-400'}`}
                onClick={() => setActiveTab('file')}
              >
                <Upload className="h-4 w-4 mr-2" />
                File Upload
              </Button>
              <Button
                variant="ghost"
                className={`flex-1 ${activeTab === 'link' ? 'bg-[#2B2D31] text-white' : 'text-gray-400'}`}
                onClick={() => setActiveTab('link')}
              >
                <Link2 className="h-4 w-4 mr-2" />
                Add Link
              </Button>
              <Button
                variant="ghost"
                className={`flex-1 ${activeTab === 'text' ? 'bg-[#2B2D31] text-white' : 'text-gray-400'}`}
                onClick={() => setActiveTab('text')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Paste Text
              </Button>
            </div>

            {/* Content Area */}
            <div className="min-h-[300px]">
              {activeTab === 'file' && (
                <div
                  {...getRootProps()}
                  className={`
                  border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-200
                  ${isDragActive ? 'border-blue-500 bg-[#2B2D31]' : 'border-[#2B2D31] hover:border-blue-500'}
                `}
                >
                  <input {...getInputProps()} />
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-blue-500/10 rounded-full">
                      <Upload className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">Upload sources</h3>
                  <p className="text-gray-400 mb-2 select-none">
                    {isDragActive ? (
                      "Drop files here..."
                    ) : (
                      <>
                        Drag & drop or <span className="text-blue-500 hover:underline cursor-pointer">choose file</span> to upload
                      </>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    Supported file types: PDF, TXT (Max 10MB)
                  </p>
                </div>
              )}

              {activeTab === 'link' && (
                <div className="space-y-4">
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter URL (e.g., https://example.com or YouTube link)"
                    className="bg-[#2B2D31] border-[#3B3D41] text-white"
                  />
                  <p className="text-sm text-gray-500">
                    Enter a valid URL starting with http:// or https://
                  </p>
                </div>
              )}

              {activeTab === 'text' && (
                <div className="space-y-4">
                  <Textarea
                    ref={textAreaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste or type your text content here..."
                    className="min-h-[200px] bg-[#2B2D31] border-[#3B3D41] text-white"
                  />
                  <p className="text-sm text-gray-500">
                    {text.length}/50,000 characters
                  </p>
                </div>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div className="mt-4 space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-center text-gray-400">
                    Uploading... {progress}%
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span>Source limit</span>
                  <div className="w-32 bg-[#2B2D31] rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '4%' }}></div>
                  </div>
                  <span>2/50</span>
                </div>
              </div>
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}