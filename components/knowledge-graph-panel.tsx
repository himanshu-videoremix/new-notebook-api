'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { 
  Network,
  GitBranch,
  Search,
  Workflow
} from 'lucide-react';

interface KnowledgeGraphPanelProps {
  selectedSources: string[];
  onGraphGenerated: (data: any) => void;
}

export function KnowledgeGraphPanel({
  selectedSources,
  onGraphGenerated
}: KnowledgeGraphPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [concept1, setConcept1] = useState('');
  const [concept2, setConcept2] = useState('');
  const { toast } = useToast();

  const handleGraphGeneration = async (type: string) => {
    if (selectedSources.length === 0) {
      toast({
        title: "No sources selected",
        description: "Please select sources to generate graph",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      let result;
      switch (type) {
        case 'build':
          result = await api.buildKnowledgeGraph(selectedSources, {
            depth: 3,
            includeRelations: true,
            format: 'json',
            clusterRelated: true
          });
          break;
        case 'paths':
          if (!concept1 || !concept2) {
            toast({
              title: "Missing concepts",
              description: "Please enter both concepts to find paths",
              variant: "destructive"
            });
            return;
          }
          result = await api.findPathsBetweenConcepts(concept1, concept2, {
            maxPaths: 5,
            maxLength: 4,
            includeExplanations: true
          });
          break;
      }
      
      onGraphGenerated(result);
      
      toast({
        title: "Graph generated",
        description: `${type} graph generated successfully`
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: `Failed to generate ${type} graph`,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-secondary/50 border-border/50">
        <h3 className="text-sm font-medium mb-3">Knowledge Graph</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto p-4 bg-secondary/30"
            onClick={() => handleGraphGeneration('build')}
            disabled={isGenerating}
          >
            <Network className="h-5 w-5" />
            <span className="text-xs">Build Graph</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto p-4 bg-secondary/30"
            onClick={() => handleGraphGeneration('cluster')}
            disabled={isGenerating}
          >
            <GitBranch className="h-5 w-5" />
            <span className="text-xs">Cluster</span>
          </Button>
        </div>
      </Card>

      <Card className="p-4 bg-secondary/50 border-border/50">
        <h3 className="text-sm font-medium mb-3">Find Paths</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="First concept"
              value={concept1}
              onChange={(e) => setConcept1(e.target.value)}
              className="bg-secondary/30"
            />
            <Input
              placeholder="Second concept"
              value={concept2}
              onChange={(e) => setConcept2(e.target.value)}
              className="bg-secondary/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-secondary/30"
              onClick={() => handleGraphGeneration('paths')}
              disabled={isGenerating}
            >
              <Search className="h-4 w-4" />
              <span className="text-xs">Find Paths</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-secondary/30"
              onClick={() => handleGraphGeneration('explore')}
              disabled={isGenerating}
            >
              <Workflow className="h-4 w-4" />
              <span className="text-xs">Explore</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}