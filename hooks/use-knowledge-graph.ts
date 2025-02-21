import { useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface GraphOptions {
  depth?: number;
  includeRelations?: boolean;
  format?: 'json' | 'graphml';
  clusterRelated?: boolean;
}

interface PathOptions {
  maxPaths?: number;
  maxLength?: number;
  includeExplanations?: boolean;
}

export function useKnowledgeGraph() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [graphData, setGraphData] = useState<any>(null);
  const { toast } = useToast();

  const buildGraph = async (sources: string[], options?: GraphOptions) => {
    setIsGenerating(true);
    try {
      const result = await api.buildKnowledgeGraph(sources, options);
      setGraphData(result);
      return result;
    } catch (error) {
      toast({
        title: "Graph generation failed",
        description: "Failed to build knowledge graph",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const findPaths = async (concept1: string, concept2: string, options?: PathOptions) => {
    setIsGenerating(true);
    try {
      const result = await api.findPathsBetweenConcepts(concept1, concept2, options);
      setGraphData(result);
      return result;
    } catch (error) {
      toast({
        title: "Path finding failed",
        description: "Failed to find paths between concepts",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearGraph = () => {
    setGraphData(null);
  };

  return {
    isGenerating,
    graphData,
    buildGraph,
    findPaths,
    clearGraph
  };
}