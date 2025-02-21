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
import { FileText, Loader2, Sparkles } from 'lucide-react';

interface BriefingDocOptions {
  format: 'structured' | 'bullet' | 'narrative';
  tone: 'professional' | 'technical' | 'casual';
  length: 'concise' | 'standard' | 'detailed';
  audience: 'executive' | 'technical' | 'general';
  elements: {
    executiveSummary: boolean;
    keyFindings: boolean;
    recommendations: boolean;
    analysis: boolean;
    citations: boolean;
    appendix: boolean;
  };
  advanced: {
    maxLength?: number;
    minConfidence?: number;
    includeMetrics?: boolean;
    includeTimeline?: boolean;
    includeRisks?: boolean;
    includeBudget?: boolean;
  };
}

interface BriefingDocDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (options: BriefingDocOptions) => Promise<void>;
  isGenerating?: boolean;
  progress?: number;
}

export function BriefingDocDialog({
  isOpen,
  onClose,
  onGenerate,
  isGenerating = false,
  progress = 0
}: BriefingDocDialogProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [options, setOptions] = useState<BriefingDocOptions>({
    format: 'structured',
    tone: 'professional',
    length: 'standard',
    audience: 'executive',
    elements: {
      executiveSummary: true,
      keyFindings: true,
      recommendations: true,
      analysis: true,
      citations: true,
      appendix: false
    },
    advanced: {
      maxLength: undefined,
      minConfidence: undefined,
      includeMetrics: false,
      includeTimeline: false,
      includeRisks: false,
      includeBudget: false
    }
  });
  const { toast } = useToast();

  const handleGenerate = async () => {
    try {
      await onGenerate(options);
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate briefing document",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-gradient-to-br from-[#1A1B1E]/95 to-[#2B2D31]/95 backdrop-blur-lg border-[#3B3D41] shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-white">
            <FileText className="w-5 h-5" />
            Create Briefing Document
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
                    onValueChange={(v: BriefingDocOptions['format']) => 
                      setOptions(prev => ({ ...prev, format: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="structured">Structured</SelectItem>
                      <SelectItem value="bullet">Bullet Points</SelectItem>
                      <SelectItem value="narrative">Narrative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select
                    value={options.tone}
                    onValueChange={(v: BriefingDocOptions['tone']) => 
                      setOptions(prev => ({ ...prev, tone: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Length</Label>
                  <Select
                    value={options.length}
                    onValueChange={(v: BriefingDocOptions['length']) => 
                      setOptions(prev => ({ ...prev, length: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concise">Concise</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select
                    value={options.audience}
                    onValueChange={(v: BriefingDocOptions['audience']) => 
                      setOptions(prev => ({ ...prev, audience: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="executive">Executive</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="general">General</SelectItem>
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
                Generating briefing document... {progress}%
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
                  Generate Briefing
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}