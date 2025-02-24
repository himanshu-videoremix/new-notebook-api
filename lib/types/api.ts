'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { useVoices } from '@/hooks/use-voices';
import { autoContentApi } from '@/lib/api';
import type { Voice, ProcessRequest, ProcessResponse } from '@/lib/types/api';
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
import { Settings2, Loader2, Plus, PlayCircle, Music, Volume2, Sliders } from 'lucide-react';
import { VoiceCloneDialog } from '@/components/voice-clone-dialog';

// API Types
export interface ProcessRequest {
  text: string;
  outputType: string;
  resources?: Array<{ content: string; type: string }>;
  customization?: {
    format?: string;
    tone?: string;
    length?: string;
    voice1?: string;
    voice2?: string;
    speakers?: {
      host1: string;
      host2: string;
    };
    audio?: {
      backgroundMusic?: {
        enabled: boolean;
        volume: number;
        genre?: string;
        track?: string;
      };
      soundEffects?: {
        enabled: boolean;
        volume: number;
        transitions?: boolean;
        ambience?: boolean;
      };
      postProcessing?: {
        normalization?: boolean;
        noiseReduction?: boolean;
        compression?: boolean;
        equalization?: boolean;
        reverb?: boolean;
      };
      chapters?: {
        enabled: boolean;
        markers: Array<{
          title: string;
          timestamp: number;
        }>;
      };
      mixing?: {
        voiceVolume: number;
        musicVolume: number;
        effectsVolume: number;
      };
    };
  };
  includeCitations: boolean;
  voice1?: number;
  voice2?: number;
}

interface AudioSettings {
  backgroundMusic: {
    enabled: boolean;
    volume: number;
    genre?: string;
    track?: string;
  };
  soundEffects: {
    enabled: boolean;
    volume: number;
    transitions: boolean;
    ambience: boolean;
  };
  postProcessing: {
    normalization: boolean;
    noiseReduction: boolean;
    compression: boolean;
    equalization: boolean;
    reverb: boolean;
  };
  chapters: {
    enabled: boolean;
    markers: Array<{
      title: string;
      timestamp: number;
    }>;
  };
  mixing: {
    voiceVolume: number;
    musicVolume: number;
    effectsVolume: number;
  };
}

interface DeepDiveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (options: {
    voice1: string;
    voice2: string;
    format?: string;
    tone?: string;
    length?: string;
    style?: string;
    speakers?: {
      host1: {
        name: string;
        role: string;
        style: string;
      };
      host2: {
        name: string;
        role: string;
        style: string;
      };
    };
  }) => Promise<void>;
  isGenerating?: boolean;
  progress?: number;
}

export function DeepDiveDialog({
  isOpen,
  onClose,
  onGenerate,
  isGenerating = false,
  progress = 0
}: DeepDiveDialogProps) {
  const { voices, isLoading: voicesLoading, handleVoiceCreated, playVoicePreview } = useVoices();
  const [selectedVoices, setSelectedVoices] = useState<{voice1: string; voice2: string}>({
    voice1: '',
    voice2: ''
  });
  const [showVoiceCloneDialog, setShowVoiceCloneDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('speakers');
  const [format, setFormat] = useState('conversational');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [style, setStyle] = useState('educational');
  const [voiceSettings, setVoiceSettings] = useState({
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
  });
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    backgroundMusic: {
      enabled: true,
      volume: 0.3,
      genre: 'ambient'
    },
    soundEffects: {
      enabled: true,
      volume: 0.2,
      transitions: true,
      ambience: true
    },
    postProcessing: {
      normalization: true,
      noiseReduction: true,
      compression: true,
      equalization: true,
      reverb: false
    },
    chapters: {
      enabled: true,
      markers: []
    },
    mixing: {
      voiceVolume: 1.0,
      musicVolume: 0.3,
      effectsVolume: 0.2
    }
  });
  const [speakerSettings, setSpeakerSettings] = useState({
    host1: {
      name: 'Host',
      role: 'Host',
      style: 'formal' as const
    },
    host2: {
      name: 'Expert',
      role: 'Expert',
      style: 'formal' as const
    }
  });
  const { toast } = useToast();

  useEffect(() => {
    if (voices.length >= 2) {
      const femaleVoices = voices.filter(v => v.gender === 'f');
      const maleVoices = voices.filter(v => v.gender === 'm');
      
      if (femaleVoices.length > 0 && maleVoices.length > 0) {
        setSelectedVoices({
          voice1: femaleVoices[0].id,
          voice2: maleVoices[0].id
        });
      } else {
        setSelectedVoices({
          voice1: voices[0].id,
          voice2: voices[1].id
        });
      }
    }
  }, [voices]);

  const handleGenerate = async () => {
    try {
      if (!selectedVoices.voice1 || !selectedVoices.voice2) {
        throw new Error('Please select voices for both speakers');
      }
      if (selectedVoices.voice1 === selectedVoices.voice2) {
        throw new Error('Please select different voices for each speaker');
      }

      await onGenerate({
        voice1: selectedVoices.voice1,
        voice2: selectedVoices.voice2,
        format,
        tone,
        length,
        style: style,
        speakers: {
          ...speakerSettings,
          voiceSettings
        }
      });

      onClose();
    } catch (error) {
      console.error('Deep dive generation error:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate deep dive",
        variant: "destructive"
      });
    }

  return(
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[1000px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-lg border-gray-700/50 shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Settings2 className="w-5 h-5" />
            Deep Dive Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="speakers">Speakers</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label>Examples</Label>
                  <Switch
                    checked={true}
                    onCheckedChange={(checked) => {
                      // Update content settings
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Questions</Label>
                  <Switch
                    checked={true}
                    onCheckedChange={(checked) => {
                      // Update content settings
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Summary</Label>
                  <Switch
                    checked={true}
                    onCheckedChange={(checked) => {
                      // Update content settings
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Citations</Label>
                  <Switch
                    checked={true}
                    onCheckedChange={(checked) => {
                      // Update content settings
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Key Points</Label>
                  <Switch
                    checked={true}
                    onCheckedChange={(checked) => {
                      // Update content settings
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Definitions</Label>
                  <Switch
                    checked={true}
                    onCheckedChange={(checked) => {
                      // Update content settings
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>References</Label>
                  <Switch
                    checked={true}
                    onCheckedChange={(checked) => {
                      // Update content settings
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Transitions</Label>
                  <Switch
                    checked={true}
                    onCheckedChange={(checked) => {
                      // Update content settings
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Analogies</Label>
                  <Switch
                    checked={true}
                    onCheckedChange={(checked) => {
                      // Update content settings
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="speakers" className="space-y-4 mt-4">
              <div className="grid gap-6">
                {/* Host 1 Settings */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">First Speaker Settings</h3>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Name</Label>
                      <Input
                        value={speakerSettings.host1.name}
                        onChange={(e) => setSpeakerSettings(prev => ({
                          ...prev,
                          host1: { ...prev.host1, name: e.target.value }
                        }))}
                        placeholder="Enter speaker name"
                        className="bg-secondary/50 border-border/50"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Role</Label>
                      <Select
                        value={speakerSettings.host1.role}
                        onValueChange={(value) => setSpeakerSettings(prev => ({
                          ...prev,
                          host1: { ...prev.host1, role: value }
                        }))}
                      >
                        <SelectTrigger className="bg-secondary/50 border-border/50">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Host">Host</SelectItem>
                          <SelectItem value="Expert">Expert</SelectItem>
                          <SelectItem value="Interviewer">Interviewer</SelectItem>
                          <SelectItem value="Moderator">Moderator</SelectItem>
                          <SelectItem value="Analyst">Analyst</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Voice</Label>
                      <div className="flex gap-2">
                        <Select value={selectedVoices.voice1} onValueChange={(v) => setSelectedVoices(prev => ({ ...prev, voice1: v }))}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select voice" />
                          </SelectTrigger>
                          <SelectContent>
                            {voices.map(voice => (
                              <SelectItem 
                                key={voice.id} 
                                value={voice.id}
                                disabled={voice.id === selectedVoices.voice2}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span>
                                    {voice.name} ({voice.gender === 'f' ? 'Female' : 'Male'})
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`ml-2 ${!voice.preview_url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (voice.preview_url) {
                                        try {
                                          playVoicePreview(voice.preview_url);
                                        } catch (error) {
                                          toast({
                                            title: "Preview failed",
                                            description: "Could not play voice preview",
                                            variant: "destructive"
                                          });
                                        }
                                      }
                                    }}
                                    disabled={!voice.preview_url}
                                  >
                                    <PlayCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              </SelectItem>
                            ))}
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
                  </div>
                </div>

                {/* Host 2 Settings */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Second Speaker Settings</h3>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Name</Label>
                      <Input
                        value={speakerSettings.host2.name}
                        onChange={(e) => setSpeakerSettings(prev => ({
                          ...prev,
                          host2: { ...prev.host2, name: e.target.value }
                        }))}
                        placeholder="Enter speaker name"
                        className="bg-secondary/50 border-border/50"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Role</Label>
                      <Select
                        value={speakerSettings.host2.role}
                        onValueChange={(value) => setSpeakerSettings(prev => ({
                          ...prev,
                          host2: { ...prev.host2, role: value }
                        }))}
                      >
                        <SelectTrigger className="bg-secondary/50 border-border/50">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Host">Host</SelectItem>
                          <SelectItem value="Expert">Expert</SelectItem>
                          <SelectItem value="Interviewer">Interviewer</SelectItem>
                          <SelectItem value="Moderator">Moderator</SelectItem>
                          <SelectItem value="Analyst">Analyst</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Voice</Label>
                      <Select value={selectedVoices.voice2} onValueChange={(v) => setSelectedVoices(prev => ({ ...prev, voice2: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select voice" />
                        </SelectTrigger>
                        <SelectContent>
                          {voices.map(voice => (
                            <SelectItem 
                              key={voice.id} 
                              value={voice.id}
                              disabled={voice.id === selectedVoices.voice1}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span>
                                  {voice.name} ({voice.gender === 'f' ? 'Female' : 'Male'})
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`ml-2 ${!voice.preview_url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (voice.preview_url) {
                                      try {
                                        playVoicePreview(voice.preview_url);
                                      } catch (error) {
                                        toast({
                                          title: "Preview failed",
                                          description: "Could not play voice preview",
                                          variant: "destructive"
                                        });
                                      }
                                    }
                                  }}
                                  disabled={!voice.preview_url}
                                >
                                  <PlayCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="style" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="structured">Structured</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="narrative">Narrative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
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
                  <Select value={length} onValueChange={setLength}>
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
                  <Label>Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="educational">Educational</SelectItem>
                      <SelectItem value="debate">Debate</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="audio" className="space-y-4 mt-4">
              <div className="space-y-6">
                {/* Background Music */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Music className="h-4 w-4" />
                      Background Music
                    </Label>
                    <Switch
                      checked={audioSettings.backgroundMusic.enabled}
                      onCheckedChange={(enabled) => setAudioSettings(prev => ({
                        ...prev,
                        backgroundMusic: { ...prev.backgroundMusic, enabled }
                      }))}
                    />
                  </div>
                  {audioSettings.backgroundMusic.enabled && (
                    <div className="space-y-4 pl-6">
                      <div className="space-y-2">
                        <Label>Volume</Label>
                        <Slider
                          value={[audioSettings.backgroundMusic.volume * 100]}
                          onValueChange={([value]) => setAudioSettings(prev => ({
                            ...prev,
                            backgroundMusic: {
                              ...prev.backgroundMusic,
                              volume: value / 100
                            }
                          }))}
                          min={0}
                          max={100}
                          step={1}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Genre</Label>
                        <Select
                          value={audioSettings.backgroundMusic.genre}
                          onValueChange={(value) => setAudioSettings(prev => ({
                            ...prev,
                            backgroundMusic: {
                              ...prev.backgroundMusic,
                              genre: value
                            }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select genre" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ambient">Ambient</SelectItem>
                            <SelectItem value="classical">Classical</SelectItem>
                            <SelectItem value="jazz">Jazz</SelectItem>
                            <SelectItem value="electronic">Electronic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Speed</Label>
                          <Slider
                            value={[voiceSettings.host2.speed * 100]}
                            onValueChange={([value]) => setVoiceSettings(prev => ({
                              ...prev,
                              host2: {
                                ...prev.host2,
                                speed: value / 100
                              }
                            }))}
                            min={80}
                            max={120}
                            step={1}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Pitch</Label>
                          <Slider
                            value={[voiceSettings.host2.pitch * 100]}
                            onValueChange={([value]) => setVoiceSettings(prev => ({
                              ...prev,
                              host2: {
                                ...prev.host2,
                                pitch: value / 100
                              }
                            }))}
                            min={80}
                            max={120}
                            step={1}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Emphasis</Label>
                          <Select
                            value={voiceSettings.host2.emphasis}
                            onValueChange={(value: 'light' | 'moderate' | 'strong' | 'dramatic') => 
                              setVoiceSettings(prev => ({
                                ...prev,
                                host2: { ...prev.host2, emphasis: value }
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select emphasis" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="strong">Strong</SelectItem>
                              <SelectItem value="dramatic">Dramatic</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Emotion</Label>
                          <Select
                            value={voiceSettings.host2.emotion}
                            onValueChange={(value: 'neutral' | 'happy' | 'sad' | 'excited' | 'serious') => 
                              setVoiceSettings(prev => ({
                                ...prev,
                                host2: { ...prev.host2, emotion: value }
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select emotion" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="neutral">Neutral</SelectItem>
                              <SelectItem value="happy">Happy</SelectItem>
                              <SelectItem value="sad">Sad</SelectItem>
                              <SelectItem value="excited">Excited</SelectItem>
                              <SelectItem value="serious">Serious</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Speed</Label>
                          <Slider
                            value={[voiceSettings.host1.speed * 100]}
                            onValueChange={([value]) => setVoiceSettings(prev => ({
                              ...prev,
                              host1: {
                                ...prev.host1,
                                speed: value / 100
                              }
                            }))}
                            min={80}
                            max={120}
                            step={1}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Pitch</Label>
                          <Slider
                            value={[voiceSettings.host1.pitch * 100]}
                            onValueChange={([value]) => setVoiceSettings(prev => ({
                              ...prev,
                              host1: {
                                ...prev.host1,
                                pitch: value / 100
                              }
                            }))}
                            min={80}
                            max={120}
                            step={1}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Emphasis</Label>
                          <Select
                            value={voiceSettings.host1.emphasis}
                            onValueChange={(value: 'light' | 'moderate' | 'strong' | 'dramatic') => 
                              setVoiceSettings(prev => ({
                                ...prev,
                                host1: { ...prev.host1, emphasis: value }
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select emphasis" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="strong">Strong</SelectItem>
                              <SelectItem value="dramatic">Dramatic</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Emotion</Label>
                          <Select
                            value={voiceSettings.host1.emotion}
                            onValueChange={(value: 'neutral' | 'happy' | 'sad' | 'excited' | 'serious') => 
                              setVoiceSettings(prev => ({
                                ...prev,
                                host1: { ...prev.host1, emotion: value }
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select emotion" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="neutral">Neutral</SelectItem>
                              <SelectItem value="happy">Happy</SelectItem>
                              <SelectItem value="sad">Sad</SelectItem>
                              <SelectItem value="excited">Excited</SelectItem>
                              <SelectItem value="serious">Serious</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      Sound Effects
                    </Label>
                    <Switch
                      checked={audioSettings.soundEffects.enabled}
                      onCheckedChange={(enabled) => setAudioSettings(prev => ({
                        ...prev,
                        soundEffects: { ...prev.soundEffects, enabled }
                      }))}
                    />
                  </div>
                  {audioSettings.soundEffects.enabled && (
                    <div className="space-y-4 pl-6">
                      {/* Additional settings for sound effects can go here */}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}