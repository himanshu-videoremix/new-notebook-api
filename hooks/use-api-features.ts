import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { useGemini } from '@/hooks/use-gemini';

interface ApiState {
  isLoading: boolean;
  error: string | null;
  data: any;
  status: {
    [key: string]: string;
  };
}

export function useApiFeatures() {
  const [state, setState] = useState<ApiState>({
    isLoading: false,
    error: null,
    data: null,
    status: {}
  });
  const { toast } = useToast();
  const gemini = useGemini();

  const createContent = useCallback(async (request: {
    text: string;
    outputType: string;
    resources: Array<{ content: string; type: string }>;
    customization?: any;
  }) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    let result;

    try {
      // Try AutoContent API first
      try {
        const response = await api.createContent({
          ...request,
          includeCitations: true
        });

        if (!response.request_id) {
          throw new Error('Invalid API response - no request ID');
        }

        result = await api.pollStatus(response.request_id);
      } catch (error) {
        console.warn('AutoContent API failed, trying Gemini:', error);
        
        // Try Gemini
        const combinedText = request.resources
          .map(r => r.content)
          .join('\n\n');

        switch (request.outputType) {
          case 'sentiment':
            result = await gemini.analyzeSentiment(combinedText);
            break;
          case 'keywords':
            result = await gemini.extractKeywords(combinedText, {
              maxKeywords: request.customization?.maxKeywords || 20
            });
            break;
          case 'entities':
            result = await gemini.extractEntities(combinedText);
            break;
          case 'readability':
            result = await gemini.analyzeReadability(combinedText);
            break;
          case 'argumentation':
            result = await gemini.extractArgumentation(combinedText);
            break;
          case 'study_guide':
            result = await gemini.generateStudyGuide(combinedText);
            break;
          case 'flashcards':
            result = await gemini.generateFlashcards(combinedText, {
              count: request.customization?.count || 10,
              complexity: request.customization?.complexity || 'intermediate'
            });
            break;
          case 'questions':
            result = await gemini.generateQuestions(combinedText, {
              count: request.customization?.count || 5,
              type: request.customization?.type || 'multiple_choice'
            });
            break;
          case 'deep_dive':
            result = await gemini.generateDeepDive(combinedText, {
              host1: request.customization?.speakers?.host1 || 'Host',
              host2: request.customization?.speakers?.host2 || 'Expert',
              format: request.customization?.format || 'structured'
            });
            break;
          default:
            throw new Error(`Unsupported content type: ${request.outputType}`);
        }
      }

      setState(prev => ({
        ...prev,
        data: result.content,
        status: {
          ...prev.status,
          [result.id || Date.now()]: 'completed'
        },
        isLoading: false
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Content creation failed';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      
      toast({
        title: "Generation failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  }, [toast, gemini]);

  const checkStatus = useCallback(async (requestId: string) => {
    try {
      const status = await api.getContentStatus(requestId);
      
      setState(prev => ({
        ...prev,
        status: {
          ...prev.status,
          [requestId]: status.status
        }
      }));

      return status;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Status check failed';
      toast({
        title: "Status check failed",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  const getUsage = useCallback(async () => {
    try {
      return await api.getUsage();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get usage data';
      toast({
        title: "Usage check failed",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  const getContentList = useCallback(async () => {
    try {
      return await api.getContentList();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get content list';
      toast({
        title: "Content list failed",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  const setWebhook = useCallback(async (url: string) => {
    try {
      await api.setWebhook(url);
      toast({
        title: "Webhook updated",
        description: "Webhook URL has been set successfully"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set webhook';
      toast({
        title: "Webhook update failed",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  const getWebhook = useCallback(async () => {
    try {
      return await api.getWebhook();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get webhook';
      toast({
        title: "Webhook retrieval failed",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  return {
    ...state,
    createContent,
    checkStatus,
    getUsage,
    getContentList,
    setWebhook,
    getWebhook
  };
}