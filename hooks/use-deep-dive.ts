import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { openaiService } from '@/lib/openai';
import { geminiService } from '@/lib/gemini';

interface DeepDiveOptions {
  tone?: 'technical' | 'formal' | 'casual';
  format?: 'structured' | 'bullet' | 'paragraph';
  length?: 'short' | 'medium' | 'long';
  speakers?: {
    host1: string;
    host2: string;
  };
}

interface DeepDiveState {
  isGenerating: boolean;
  isExporting: boolean;
  error: string | null;
  content: string | null;
  metadata: {
    title?: string;
    timestamp?: Date;
    format?: string;
  } | null;
}

export function useDeepDive() {
  const [state, setState] = useState<DeepDiveState>({
    isGenerating: false,
    isExporting: false,
    error: null,
    content: null,
    metadata: null
  });
  const { toast } = useToast();

  const generate = useCallback(async (
    sources: string[],
    options: DeepDiveOptions = {}
  ) => {
    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      // Try AutoContent API first
      try {
        const request = {
          text: "Generate deep dive conversation",
          outputType: 'deep_dive',
          includeCitations: true,
          resources: sources.map(source => ({
            content: source,
            type: source.split('.').pop() || 'text'
          })),
          customization: {
            tone: options.tone || 'technical',
            format: options.format || 'structured',
            length: options.length || 'long',
            speakers: options.speakers || {
              host1: 'Host',
              host2: 'Expert'
            }
          }
        };

        const response = await api.createContent(request);
        
        if (!response.request_id) {
          throw new Error('Invalid API response - no request ID');
        }

        const result = await api.pollStatus(response.request_id);

        if (result.status !== 'completed' || !result.content) {
          throw new Error('Content generation failed or timed out');
        }

        setState(prev => ({
          ...prev,
          content: result.content,
          metadata: {
            title: 'Deep Dive Conversation',
            timestamp: new Date(),
            format: options.format
          },
          isGenerating: false
        }));

        return result;
      } catch (error) {
        console.warn('AutoContent API failed, trying Gemini:', error);
        
        // Try Gemini
        const combinedText = sources.join('\n\n');
        const geminiResult = await geminiService.generateDeepDive(
          combinedText,
          {
            host1: options.speakers?.host1 || 'Host',
            host2: options.speakers?.host2 || 'Expert',
            format: options.format || 'structured'
          }
        );

        setState(prev => ({
          ...prev,
          content: geminiResult.content,
          metadata: {
            title: geminiResult.title,
            timestamp: new Date(),
            format: options.format
          },
          isGenerating: false
        }));

        return geminiResult;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate deep dive';
      setState(prev => ({ ...prev, error: errorMessage, isGenerating: false }));
      
      toast({
        title: "Generation failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  }, [toast]);

  const exportContent = useCallback(async (format: 'pdf' | 'docx' | 'md') => {
    if (!state.content) {
      toast({
        title: "No content",
        description: "Generate content before exporting",
        variant: "destructive"
      });
      return;
    }

    setState(prev => ({ ...prev, isExporting: true }));

    try {
      const response = await api.exportStudioContent(state.content, format);
      
      // Create download link
      const blob = new Blob([response], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `deep-dive.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export complete",
        description: `Content exported as ${format.toUpperCase()}`
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      toast({
        title: "Export failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setState(prev => ({ ...prev, isExporting: false }));
    }
  }, [state.content, toast]);

  const share = useCallback(async (options?: {
    expiresIn?: number;
    password?: string;
  }) => {
    if (!state.content) {
      toast({
        title: "No content",
        description: "Generate content before sharing",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await api.shareContent(state.content, {
        accessType: 'view',
        expiresIn: options?.expiresIn,
        password: options?.password
      });

      return response.shareUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Share failed';
      toast({
        title: "Share failed",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  }, [state.content, toast]);

  const clear = useCallback(() => {
    setState({
      isGenerating: false,
      isExporting: false,
      error: null,
      content: null,
      metadata: null
    });
  }, []);

  return {
    ...state,
    generate,
    exportContent,
    share,
    clear
  };
}