import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { openaiService } from '@/lib/openai';

// Cache implementation
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface OpenAIState {
  isLoading: boolean;
  error: string | null;
  data: any;
}

export function useOpenAI() {
  const [state, setState] = useState<OpenAIState>({
    isLoading: false,
    error: null,
    data: null
  });
  const { toast } = useToast();

  // Cache management
  const getCachedData = (key: string) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    return null;
  };

  const setCachedData = (key: string, data: any) => {
    cache.set(key, { data, timestamp: Date.now() });
  };

  // Rate limiting
  const rateLimiter = useCallback(async (fn: () => Promise<any>) => {
    const now = Date.now();
    const lastCall = (window as any).__lastOpenAICall || 0;
    const minDelay = 1000; // 1 second between calls

    if (now - lastCall < minDelay) {
      await new Promise(resolve => setTimeout(resolve, minDelay));
    }

    (window as any).__lastOpenAICall = Date.now();
    return fn();
  }, []);

  // Generic operation handler
  const handleOperation = useCallback(async (
    operation: () => Promise<any>,
    cacheKey?: string
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check cache first
      if (cacheKey) {
        const cached = getCachedData(cacheKey);
        if (cached) {
          setState(prev => ({ ...prev, data: cached, isLoading: false }));
          return cached;
        }
      }

      // Rate limit and execute operation
      const result = await rateLimiter(operation);

      // Cache result if needed
      if (cacheKey) {
        setCachedData(cacheKey, result);
      }

      setState(prev => ({ ...prev, data: result, isLoading: false }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      
      toast({
        title: "OpenAI Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  }, [toast, rateLimiter]);

  // Specific operations
  const analyzeSentiment = useCallback(async (text: string) => {
    return handleOperation(
      () => openaiService.analyzeSentiment(text),
      `sentiment:${text.slice(0, 50)}`
    );
  }, [handleOperation]);

  const extractKeywords = useCallback(async (text: string, options: { maxKeywords: number }) => {
    return handleOperation(
      () => openaiService.extractKeywords(text, options),
      `keywords:${text.slice(0, 50)}:${options.maxKeywords}`
    );
  }, [handleOperation]);

  const extractEntities = useCallback(async (text: string) => {
    return handleOperation(
      () => openaiService.extractEntities(text),
      `entities:${text.slice(0, 50)}`
    );
  }, [handleOperation]);

  const analyzeReadability = useCallback(async (text: string) => {
    return handleOperation(
      () => openaiService.analyzeReadability(text),
      `readability:${text.slice(0, 50)}`
    );
  }, [handleOperation]);

  const extractArgumentation = useCallback(async (text: string) => {
    return handleOperation(
      () => openaiService.extractArgumentation(text),
      `argumentation:${text.slice(0, 50)}`
    );
  }, [handleOperation]);

  const generateStudyGuide = useCallback(async (text: string) => {
    return handleOperation(
      () => openaiService.generateStudyGuide(text)
    );
  }, [handleOperation]);

  const generateFlashcards = useCallback(async (text: string, options: { count: number; complexity: string }) => {
    return handleOperation(
      () => openaiService.generateFlashcards(text, options)
    );
  }, [handleOperation]);

  const generateQuestions = useCallback(async (text: string, options: { count: number; type: string }) => {
    return handleOperation(
      () => openaiService.generateQuestions(text, options)
    );
  }, [handleOperation]);

  const compareDocuments = useCallback(async (texts: string[]) => {
    return handleOperation(
      () => openaiService.compareDocuments(texts)
    );
  }, [handleOperation]);

  const generateTimeline = useCallback(async (text: string) => {
    return handleOperation(
      () => openaiService.generateTimeline(text)
    );
  }, [handleOperation]);

  const clearCache = useCallback(() => {
    cache.clear();
  }, []);

  return {
    ...state,
    analyzeSentiment,
    extractKeywords,
    extractEntities,
    analyzeReadability,
    extractArgumentation,
    generateStudyGuide,
    generateFlashcards,
    generateQuestions,
    compareDocuments,
    generateTimeline,
    clearCache
  };
}