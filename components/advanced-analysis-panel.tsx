'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { autoContentApi } from '@/lib/api';
import { ProcessRequest, ProcessResponse } from '@/lib/types/api';
import { 
  Brain, 
  LineChart, 
  Fingerprint, 
  Network, 
  GitCompare, 
  Lightbulb,
  Sparkles,
  Table,
  BarChart2
} from 'lucide-react';

interface AdvancedAnalysisPanelProps {
  selectedContent: string;
  onAnalysisComplete: (result: any) => void;
}

export function AdvancedAnalysisPanel({ 
  selectedContent,
  onAnalysisComplete 
}: AdvancedAnalysisPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnalysis = async (type: string) => {
    if (!selectedContent) {
      toast({
        title: "No content",
        description: "Please select content to analyze.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const request: ProcessRequest = {
        text: selectedContent,
        outputType: type,
        includeCitations: true,
        resources: []
      };

      // Add type-specific options
      switch (type) {
        case 'sentiment':
          request.customization = {
            granularity: 'paragraph'
          };
          break;
        case 'argumentation':
          request.customization = {
            includeEvidence: true
          };
          break;
        case 'outline':
          request.customization = {
            depth: 3,
            format: 'hierarchical'
          };
          break;
        case 'semantic':
          request.customization = {
            maxResults: 10
          };
          break;
        case 'concepts':
          request.customization = {
            maxResults: 10
          };
          break;
        case 'enhance':
          request.customization = {
            tasks: ['grammar', 'style', 'clarity']
          };
          break;
        case 'variations':
          request.customization = {
            count: 3
          };
          break;
        case 'tables':
          request.customization = {
            format: 'json'
          };
          break;
        case 'charts':
          request.customization = {
            format: 'svg'
          };
          break;
      }
      
      const response = await autoContentApi.createContent(request);
      
      if (response.request_id) {
        const result = await autoContentApi.pollStatus(response.request_id);
        if (result.status === 'completed') {
          onAnalysisComplete(result.content);
        } else {
          throw new Error('Analysis failed or timed out');
        }
      } else {
        throw new Error('Invalid API response - no request ID');
      }
      
      toast({
        title: "Analysis complete",
        description: `${type} analysis completed successfully`
      });
    } catch (error) {
      console.error('Analysis error:', error);
      
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : `Failed to perform ${type} analysis`,
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-secondary/50 border-border/50">
        <h3 className="text-sm font-medium mb-3">Content Analysis</h3>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto p-4 bg-secondary/30"
            onClick={() => handleAnalysis('sentiment')}
            disabled={isAnalyzing}
          >
            <Brain className="h-5 w-5" />
            <span className="text-xs">Sentiment</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto p-4 bg-secondary/30"
            onClick={() => handleAnalysis('argumentation')}
            disabled={isAnalyzing}
          >
            <LineChart className="h-5 w-5" />
            <span className="text-xs">Arguments</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto p-4 bg-secondary/30"
            onClick={() => handleAnalysis('outline')}
            disabled={isAnalyzing}
          >
            <Fingerprint className="h-5 w-5" />
            <span className="text-xs">Outline</span>
          </Button>
        </div>
      </Card>

      <Card className="p-4 bg-secondary/50 border-border/50">
        <h3 className="text-sm font-medium mb-3">Discovery</h3>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto p-4 bg-secondary/30"
            onClick={() => handleAnalysis('semantic')}
            disabled={isAnalyzing}
          >
            <Network className="h-5 w-5" />
            <span className="text-xs">Semantic</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto p-4 bg-secondary/30"
            onClick={() => handleAnalysis('concepts')}
            disabled={isAnalyzing}
          >
            <GitCompare className="h-5 w-5" />
            <span className="text-xs">Concepts</span>
          </Button>
        </div>
      </Card>

      <Card className="p-4 bg-secondary/50 border-border/50">
        <h3 className="text-sm font-medium mb-3">Enhancement</h3>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto p-4 bg-secondary/30"
            onClick={() => handleAnalysis('enhance')}
            disabled={isAnalyzing}
          >
            <Lightbulb className="h-5 w-5" />
            <span className="text-xs">Enhance</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto p-4 bg-secondary/30"
            onClick={() => handleAnalysis('variations')}
            disabled={isAnalyzing}
          >
            <Sparkles className="h-5 w-5" />
            <span className="text-xs">Variations</span>
          </Button>
        </div>
      </Card>

      <Card className="p-4 bg-secondary/50 border-border/50">
        <h3 className="text-sm font-medium mb-3">Data Extraction</h3>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto p-4 bg-secondary/30"
            onClick={() => handleAnalysis('tables')}
            disabled={isAnalyzing}
          >
            <Table className="h-5 w-5" />
            <span className="text-xs">Tables</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto p-4 bg-secondary/30"
            onClick={() => handleAnalysis('charts')}
            disabled={isAnalyzing}
          >
            <BarChart2 className="h-5 w-5" />
            <span className="text-xs">Charts</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}