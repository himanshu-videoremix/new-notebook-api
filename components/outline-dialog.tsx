'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { List, Loader2, Sparkles } from 'lucide-react';

interface OutlineOptions {
  format: 'hierarchical' | 'flat' | 'mindmap';
  style: 'academic' | 'business' | 'creative';
  depth: 'shallow' | 'balanced' | 'deep';
  elements: {
    descriptions: boolean;
    examples: boolean;
    references: boolean;
    notes: boolean;
    keyPoints: boolean;
    subTopics: boolean;
  };
  advanced: {
    maxDepth?: number;
    minConfidence?: number;
    autoNumber?: boolean;
    includeIntro?: boolean;
    includeSummary?: boolean;
    balanceDepth?: boolean;
  };
}

interface OutlineDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (options: OutlineOptions) => Promise<void>;
  isGenerating?: boolean;
  progress?: number;
}

export function OutlineDialog({
  isOpen,
  onClose,
  onGenerate,
  isGenerating = false,
  progress = 0
}: OutlineDialogProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [options, setOptions] = useState<OutlineOptions>({
    format: 'hierarchical',
    style: 'academic',
    depth: 'balanced',
    elements: {
      descriptions: true,
      examples: true,
      references: true,
      notes: true,
      keyPoints: true,
      subTopics: true
    },
    advanced: {
      maxDepth: 3,
      minConfidence: 0.8,
      autoNumber: true,
      includeIntro: true,
      includeSummary: true,
      balanceDepth: true
    }
  });
  const { toast } = useToast();

  const handleGenerate = async () => {
    try {
      await onGenerate(options);
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate outline",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-gradient-to-br from-[#1A1B1E]/95 to-[#2B2D31]/95 backdrop-blur-lg border-[#3B3D41] shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-white">
            <List className="w-5 h-5" />
            Create Outline
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select
                    value={options.format}
                    onValueChange={(v: OutlineOptions['format']) => 
                      setOptions(prev => ({ ...prev, format: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hierarchical">Hierarchical</SelectItem>
                      <SelectItem value="flat">Flat</SelectItem>
                      <SelectItem value="mindmap">Mind Map</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Style</Label>
                  <Select
                    value={options.style}
                    onValueChange={(v: OutlineOptions['style']) => 
                      setOptions(prev => ({ ...prev, style: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Depth</Label>
                  <Select
                    value={options.depth}
                    onValueChange={(v: OutlineOptions['depth']) => 
                      setOptions(prev => ({ ...prev, depth: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select depth" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shallow">Shallow</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="deep">Deep</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                {Object.entries(options.elements).map(([element, enabled]) => (
                  <div key={element} className="flex items-center justify-between">
                    <Label className="capitalize">{element.replace(/([A-Z])/g, ' $1')}</Label>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) => setOptions(prev => ({
                        ...prev,
                        elements: {
                          ...prev.elements,
                          [element]: checked
                        }
                      }))}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 mt-4">
              <div className="grid gap-4 p-4 border rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(options.advanced).map(([key, value]) => {
                    if (typeof value === 'boolean') {
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                          <Switch
                            checked={value}
                            onCheckedChange={(checked) => setOptions(prev => ({
                              ...prev,
                              advanced: {
                                ...prev.advanced,
                                [key]: checked
                              }
                            }))}
                          />
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                Generating outline... {progress}%
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isGenerating}
              className="bg-secondary/50 border-border/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-[#4285f4] hover:bg-[#3b77db]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Outline
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}