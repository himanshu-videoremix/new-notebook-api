import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { autoContentApi } from '@/lib/api';
import { API_KEY } from '@/lib/constants';
import type { Voice } from '@/lib/types/api';
import { audioPreviewUtils } from '@/lib/utils/audio';

export function useVoices() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadVoices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const availableVoices = await autoContentApi.getAvailableVoices();
      setVoices(availableVoices);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load voices';
      setError(message);
      toast({
        title: "Voice loading failed",
        description: "Using default voices",
        variant: "default"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleVoiceCreated = useCallback((clonedVoice: Voice) => {
    setVoices(prev => [...prev, clonedVoice]);
  }, []);

  const playVoicePreview = useCallback((url: string) => {
    try {
      audioPreviewUtils.playPreview(url, API_KEY);
    } catch (error) {
      toast({
        title: "Preview failed",
        description: "Could not play voice preview",
        variant: "destructive"
      });
    }
  }, [toast]);

  useEffect(() => {
    loadVoices();
    return () => {
      audioPreviewUtils.stopPreview();
    };
  }, [loadVoices]);

  return {
    voices,
    isLoading,
    error,
    loadVoices,
    handleVoiceCreated,
    playVoicePreview
  };
}