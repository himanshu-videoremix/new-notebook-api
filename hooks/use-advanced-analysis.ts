import { useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface AnalysisOptions {
  granularity?: 'document' | 'paragraph' | 'sentence';
  aspects?: string[];
  includeEmotions?: boolean;
  includeEvidence?: boolean;
  includeCitations?: boolean;
  minConfidence?: number;
}

export function useAdvancedAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const analyzeSentiment = async (content: string, options?: AnalysisOptions) => {
    setIsAnalyzing(true);
    try {
      const result = await api.analyzeContentSentiment(content, options);
      setResults(result);
      return result;
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Failed to analyze sentiment",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const extractArgumentation = async (content: string, options?: AnalysisOptions) => {
    setIsAnalyzing(true);
    try {
      const result = await api.extractArgumentation(content, options);
      setResults(result);
      return result;
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Failed to extract argumentation",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateOutline = async (content: string, options?: {
    depth?: number;
    format?: 'hierarchical' | 'flat';
    includeKeyPoints?: boolean;
  }) => {
    setIsAnalyzing(true);
    try {
      const result = await api.generateContentOutline(content, options);
      setResults(result);
      return result;
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate outline",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const searchSemantic = async (query: string, options?: {
    sources?: string[];
    maxResults?: number;
    minRelevance?: number;
  }) => {
    setIsAnalyzing(true);
    try {
      const result = await api.semanticSearch(query, options);
      setResults(result);
      return result;
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Failed to perform semantic search",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const findConcepts = async (concept: string, options?: {
    maxResults?: number;
    includeDefinitions?: boolean;
  }) => {
    setIsAnalyzing(true);
    try {
      const result = await api.findRelatedConcepts(concept, options);
      setResults(result);
      return result;
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Failed to find related concepts",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    results,
    analyzeSentiment,
    extractArgumentation,
    generateOutline,
    searchSemantic,
    findConcepts
  };
}