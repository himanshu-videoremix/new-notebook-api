'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
import { Settings2, Loader2, Plus, PlayCircle } from 'lucide-react';
import { ContentType, ContentOptions, CONTENT_TYPE_CONFIGS } from '@/lib/types/content';
import { autoContentApi } from '@/lib/api';
import { VoiceCloneDialog } from './voice-clone-dialog';
import type { Voice } from '@/lib/types/api';

interface ContentGenerationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (options: {
    type: string;
    customization: Partial<ContentOptions>;
  }) => Promise<void>;
  contentType: string;
  isGenerating?: boolean;
  progress?: number;
}

export function ContentGenerationDialog({
  isOpen,
  onClose,
  onGenerate,
  contentType,
  isGenerating = false,
  progress = 0
}: ContentGenerationDialogProps) {
  const [selectedType, setSelectedType] = useState<ContentType>(contentType as ContentType);
  const [options, setOptions] = useState<Partial<ContentOptions>>(
    CONTENT_TYPE_CONFIGS[contentType as ContentType]?.defaultOptions || {}
  );
  const [voices, setVoices] = useState<Voice[]>([]);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [showVoiceCloneDialog, setShowVoiceCloneDialog] = useState(false);

  useEffect(() => {
    setSelectedType(contentType as ContentType);
    setOptions(CONTENT_TYPE_CONFIGS[contentType as ContentType]?.defaultOptions || {});

    // Load voices if this is a deep dive
    if (contentType === 'deep_dive') {
      const loadVoices = async () => {
        try {
          const availableVoices = await autoContentApi.getAvailableVoices();
          setVoices(availableVoices);
          
          if (availableVoices.length >= 2) {
            const femaleVoices = availableVoices.filter(v => v.gender === 'f');
            const maleVoices = availableVoices.filter(v => v.gender === 'm');
            
            if (femaleVoices.length > 0 && maleVoices.length > 0) {
              setOptions(prev => ({
                ...prev,
                voice1: femaleVoices[0].id,
                voice2: maleVoices[0].id
              }));
            } else {
              setOptions(prev => ({
                ...prev,
                voice1: availableVoices[0].id,
                voice2: availableVoices[1].id
              }));
            }
          }
        } catch (error) {
          console.error('Failed to load voices:', error);
          toast({
            title: "Voice loading failed",
            description: "Using default voices",
            variant: "default"
          });
        }
      };

      loadVoices();
    }
  }, [contentType]);

  const handleVoiceCreated = (clonedVoice: Voice) => {
    setVoices(prev => [...prev, clonedVoice]);
    setShowVoiceCloneDialog(false);
  };

  const handleGenerate = async () => {
    try {
      if (selectedType === 'deep_dive') {
        if (!options.voice1 || !options.voice2) {
          throw new Error('Please select voices for both speakers');
        }
        if (options.voice1 === options.voice2) {
          throw new Error('Please select different voices for each speaker');
        }
      }

      await onGenerate({
        type: selectedType,
        customization: options
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate content",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-lg border-gray-700/50 shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Settings2 className="w-5 h-5" />
            Customize {selectedType.replace('_', ' ').toUpperCase()}
          </DialogTitle>
        </DialogHeader>
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            {selectedType === 'deep_dive' && (
              <TabsTrigger value="voice">Voice</TabsTrigger>
            )}
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Format</Label>
                <Select
                  value={options.format}
                  onValueChange={(v) => setOptions(prev => ({ ...prev, format: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="structured">Structured</SelectItem>
                    <SelectItem value="conversational">Conversational</SelectItem>
                    <SelectItem value="bullet">Bullet Points</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tone</Label>
                <Select
                  value={options.tone}
                  onValueChange={(v) => setOptions(prev => ({ ...prev, tone: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Length</Label>
                <Select
                  value={options.length}
                  onValueChange={(v) => setOptions(prev => ({ ...prev, length: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="long">Long</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Audience</Label>
                <Select
                  value={options.audience}
                  onValueChange={(v) => setOptions(prev => ({ ...prev, audience: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
              {['examples', 'questions', 'summary', 'citations', 'keyPoints', 'definitions', 'references'].map((element) => (
                <div key={element} className="flex items-center justify-between">
                  <Label className="capitalize">{element}</Label>
                  <Switch
                    checked={options.elements?.[element] || false}
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

          {selectedType === 'deep_dive' && (
            <TabsContent value="voice" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Voice Selection</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVoiceCloneDialog(true)}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" /> Clone Voice
                </Button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>First Speaker Voice</Label>
                  <Select 
                    value={options.voice1} 
                    onValueChange={(v) => setOptions(prev => ({ ...prev, voice1: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map(voice => (
                        <SelectItem 
                          key={voice.id} 
                          value={voice.id}
                          disabled={voice.id === options.voice2}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            {voice.name} 
                            {voice.isCloned ? '(Cloned)' : `(${voice.gender === 'f' ? 'Female' : 'Male'}${voice.accent ? ` - ${voice.accent}` : ''})`}
                          </div>
                          {voice.preview_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                const audio = new Audio(voice.preview_url);
                                audio.play();
                              }}
                            >
                              <PlayCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Second Speaker Voice</Label>
                  <Select 
                    value={options.voice2} 
                    onValueChange={(v) => setOptions(prev => ({ ...prev, voice2: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map(voice => (
                        <SelectItem 
                          key={voice.id} 
                          value={voice.id}
                          disabled={voice.id === options.voice1}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            {voice.name} 
                            {voice.isCloned ? '(Cloned)' : `(${voice.gender === 'f' ? 'Female' : 'Male'}${voice.accent ? ` - ${voice.accent}` : ''})`}
                          </div>
                          {voice.preview_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                const audio = new Audio(voice.preview_url);
                                audio.play();
                              }}
                            >
                              <PlayCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <VoiceCloneDialog
                isOpen={showVoiceCloneDialog}
                onClose={() => setShowVoiceCloneDialog(false)}
                onVoiceCreated={handleVoiceCreated}
              />
            </TabsContent>
          )}

          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div className="grid gap-4 p-4 border rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Maximum Length (words)</Label>
                  <Input
                    type="number"
                    value={options.advanced?.maxLength || ''}
                    onChange={(e) => setOptions(prev => ({
                      ...prev,
                      advanced: {
                        ...prev.advanced,
                        maxLength: parseInt(e.target.value) || undefined
                      }
                    }))}
                    placeholder="No limit"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Minimum Confidence (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={options.advanced?.minConfidence ? options.advanced.minConfidence * 100 : ''}
                    onChange={(e) => setOptions(prev => ({
                      ...prev,
                      advanced: {
                        ...prev.advanced,
                        minConfidence: parseInt(e.target.value) / 100 || undefined
                      }
                    }))}
                    placeholder="Default"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {isGenerating && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-center text-muted-foreground">
              Generating content... {progress}%
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate'
            )}
          </Button>
        </div>
      </div>
      </DialogContent>
    </Dialog>
  );
}