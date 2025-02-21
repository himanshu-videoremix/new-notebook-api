import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { AudioPlayer } from '@/components/audio-player';
import { Mic, Loader2, AudioWaveform, Plus, PlayCircle } from 'lucide-react';
import { autoContentApi } from '@/lib/api';
import { VoiceCloneDialog } from '@/components/voice-clone-dialog';
import { DialogFooter } from './ui/dialog-wrapper';
import saveAs from 'save-as';
import Link from 'next/link';
interface Voice {
  id: string;
  name: string;
  language: string;
  gender?: string;
  isCloned?: boolean;
  accent?: string;
  preview_url?: string;
}

interface AudioOverviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (options: {
    voice1: string;
    voice2: string;
  }) => Promise<void>;
  audioUrl?: string;
  progress?: number;

}

export function AudioOverviewDialog({
  isOpen,
  onClose,
  onGenerate,
  audioUrl,
  progress
}: AudioOverviewDialogProps) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voice1, setVoice1] = useState('');
  const [voice2, setVoice2] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showVoiceCloneDialog, setShowVoiceCloneDialog] = useState(false);
  const [options, setOptions] = useState({
    format: 'conversational',
    tone: 'professional',
    length: 'medium',
    style: 'educational',
    depth: 'balanced',
    audience: 'general',
    complexity: 'intermediate',
    elements: {
      examples: true,
      questions: true,
      summary: true,
      citations: true,
      keyPoints: true,
      definitions: true,
      references: true
    },
    voiceSettings: {
      host1: {
        speed: 1.0,
        pitch: 1.0,
        emphasis: 'moderate' as const,
        emotionIntensity: 'medium' as const,
        style: 'neutral' as const,
        emotion: 'neutral' as const,
        age: 'adult' as const,
        accent: 'neutral' as const,
        speed_range: { min: 0.8, max: 1.2 },
        pitch_range: { min: 0.8, max: 1.2 },
        emphasis_levels: ['light', 'moderate', 'strong', 'dramatic'],
        emotion_intensities: ['low', 'medium', 'high', 'intense']
      },
      host2: {
        speed: 1.0,
        pitch: 1.0,
        emphasis: 'moderate' as const,
        emotionIntensity: 'medium' as const,
        style: 'neutral' as const,
        emotion: 'neutral' as const,
        age: 'adult' as const,
        accent: 'neutral' as const,
        speed_range: { min: 0.8, max: 1.2 },
        pitch_range: { min: 0.8, max: 1.2 },
        emphasis_levels: ['light', 'moderate', 'strong', 'dramatic'],
        emotion_intensities: ['low', 'medium', 'high', 'intense']
      }
    }
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadVoices = async () => {
      try {
        // Load available voices
        const availableVoices = await autoContentApi.getAvailableVoices();

        setVoices(availableVoices);

        if (availableVoices.length >= 2) {
          // Try to find a female and male voice pair for natural conversation
          const femaleVoices = availableVoices.filter(v => v.gender === 'f');
          const maleVoices = availableVoices.filter(v => v.gender === 'm');

          if (femaleVoices.length > 0 && maleVoices.length > 0) {
            // Set default voice pair
            setVoice1(femaleVoices[0].id);
            setVoice2(maleVoices[0].id);
          } else {
            // Fallback to first two voices if no gender pair found
            setVoice1(availableVoices[0].id);
            setVoice2(availableVoices[1].id);
          }
        }
      } catch (error) {
        console.error('Failed to load voices:', error);
        // Show warning but don't block the dialog
        toast({
          title: "Using default voices",
          description: "Could not load custom voices, using default voice set",
          variant: "default"
        });
      }
    };

    loadVoices();
  }, [toast]);

  // // Progress simulation
  // useEffect(() => {
  //   let interval: NodeJS.Timeout;
  //   if (isGenerating) {
  //     setProgress(0);
  //     interval = setInterval(() => {
  //       setProgress(prev => {
  //         if (prev >= 95) {
  //           clearInterval(interval);
  //           return 95;
  //         }
  //         return prev + 5;
  //       });
  //     }, 1000);
  //   } else {
  //     setProgress(0);
  //   }
  //   return () => clearInterval(interval);
  // }, [isGenerating]);

  const handleVoiceCreated = (clonedVoice: Voice) => {
    setVoices(prev => [...prev, clonedVoice]);
    setShowVoiceCloneDialog(false);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      if (voice1 === voice2) {
        throw new Error('Please select different voices for each speaker');
      }
      await onGenerate({
        voice1,
        voice2,
        ...options,
        voiceSettings: {
          host1: {
            ...options.voiceSettings.host1,
            voice: voice1
          },
          host2: {
            ...options.voiceSettings.host2,
            voice: voice2
          }
        }
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate audio",
        variant: "destructive"
      });
      onClose();
    } finally {
      setIsGenerating(false);
    }
  };

  const renderVoiceOption = (voice: Voice) => {
    const isDisabled = voice.id === voice2;
    const accentLabel = voice.accent ? ` (${voice.accent})` : '';
    const previewButton = voice.preview_url ? (
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
    ) : null;

    return (
      <SelectItem
        key={voice.id}
        value={voice.id}
        disabled={isDisabled}
        className="flex items-center gap-2 text-sm"
      >
        <div className="flex items-center justify-between w-full">
          <span>
            {voice.name}
            {voice.isCloned ? ' (Cloned)' : ` (${voice.gender === 'f' ? 'Female' : 'Male'}${accentLabel})`}
          </span>
          {previewButton}
        </div>
      </SelectItem>
    );
  };
 
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-[#1A1B1E]/95 to-[#2B2D31]/95 backdrop-blur-lg border-[#3B3D41] shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-white">
            <Mic className="w-5 h-5" />
            Audio Overview1
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {audioUrl ? (
            <>
              <AudioPlayer audioUrl={audioUrl} />
              <div className="flex justify-end mt-4">
                <a href={audioUrl} download="audio_overview.mp3">
                  Download
                </a>
              </div>

            </>
          ) : isGenerating ? (
            <div className="space-y-6 py-8">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <AudioWaveform className="w-8 h-8 text-blue-500 animate-pulse" />
                  </div>
                  <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"
                    style={{ borderTopColor: 'rgb(59, 130, 246)', animationDuration: '1.5s' }} />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">Generating Audio Overview</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    This may take a few minutes...
                  </p>
                </div>
                <Progress value={progress} className="w-full h-2" />
                <p className="text-sm text-gray-400">{progress}% complete</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-2">
                <Label>First Speaker Voice</Label>
                <div className="flex gap-2">
                  <Select value={voice1} onValueChange={setVoice1}>
                    <SelectTrigger disabled={voices.length === 0}>
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map(renderVoiceOption)}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowVoiceCloneDialog(true)}
                    className="flex-shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Second Speaker Voice</Label>
                <Select value={voice2} onValueChange={setVoice2}>
                  <SelectTrigger disabled={voices.length === 0}>
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map(renderVoiceOption)}
                  </SelectContent>
                </Select>
              </div>

              <VoiceCloneDialog
                isOpen={showVoiceCloneDialog}
                onClose={() => setShowVoiceCloneDialog(false)}
                onVoiceCreated={handleVoiceCreated}
              />

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || voices.length === 0 || !voice1 || !voice2}
                  className="bg-[#4285f4] hover:bg-[#3b77db]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Audio'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>

    </Dialog>
  );
}

export default AudioOverviewDialog;