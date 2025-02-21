import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { autoContentApi } from '@/lib/api/autocontent';
import type { GenerationOptions, AnalysisOptions } from '@/lib/types/api';

export function useAutoContent() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateDeepDive = async (text: string, options: GenerationOptions) => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await autoContentApi.generateDeepDive(text, {
        host1: options.speakers?.host1 || 'Host',
        host2: options.speakers?.host2 || 'Expert',
        format: options.format || 'structured',
        voice1: options.voice1,
        voice2: options.voice2
      });

      toast({
        title: 'Deep Dive Generated',
        description: 'Your deep dive conversation has been created successfully.'
      });

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate deep dive';
      setError(message);
      toast({
        title: 'Generation Failed',
        description: message,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeContent = async (text: string, type: string, options?: AnalysisOptions) => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await autoContentApi.analyzeContent(text, type);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setError(message);
      toast({
        title: 'Analysis Failed',
        description: message,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    error,
    generateDeepDive,
    analyzeContent
  };
}