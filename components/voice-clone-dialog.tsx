'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Mic, Upload, AudioWaveform as Waveform, Loader2 } from 'lucide-react';
import { autoContentApi } from '@/lib/api';

interface Voice {
  id: string;
  name: string;
  language: string;
  gender?: string;
  isCloned?: boolean;
  sourceAudio?: string;
}

interface VoiceCloneDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceCreated: (voice: Voice) => void;
}

export function VoiceCloneDialog({
  isOpen,
  onClose,
  onVoiceCreated
}: VoiceCloneDialogProps) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isCloning, setIsCloning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Audio file must be under 10MB",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an audio file (MP3 or WAV)",
          variant: "destructive"
        });
        return;
      }
      
      setAudioFile(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        setAudioFile(new File([audioBlob], 'recording.wav', { type: 'audio/wav' }));
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Stop recording after 30 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          stream.getTracks().forEach(track => track.stop());
          setIsRecording(false);
        }
      }, 30000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: "Recording failed",
        description: "Could not access microphone",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const handleClone = async () => {
    if (!audioFile || !name) {
      toast({
        title: "Missing information",
        description: "Please provide a name and audio sample",
        variant: "destructive"
      });
      return;
    }

    setIsCloning(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 1000);

      const clonedVoice = await autoContentApi.cloneVoice(audioFile, name);
      
      clearInterval(progressInterval);
      setProgress(100);

      onVoiceCreated(clonedVoice);
      toast({
        title: "Voice cloned successfully",
        description: `Created new voice: ${name}`
      });
      
      // Reset form
      setName('');
      setAudioFile(null);
      setAudioBlob(null);
      setProgress(0);
      onClose();
    } catch (error) {
      toast({
        title: "Voice cloning failed",
        description: error instanceof Error ? error.message : "Failed to clone voice",
        variant: "destructive"
      });
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-[#1A1B1E]/95 to-[#2B2D31]/95 backdrop-blur-lg border-[#3B3D41] shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-white">
            <Mic className="w-5 h-5" />
            Clone Voice
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Voice Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name for cloned voice"
            />
          </div>

          <div className="grid gap-2">
            <Label>Gender</Label>
            <Select value={gender} onValueChange={(value: 'male' | 'female') => setGender(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Voice Sample</Label>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? (
                    <>
                      <Waveform className="w-4 h-4 mr-2 animate-pulse text-red-500" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Record Audio
                    </>
                  )}
                </Button>
                <div className="relative flex-1">
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="voice-sample"
                  />
                  <Label
                    htmlFor="voice-sample"
                    className="flex items-center justify-center gap-2 h-10 px-4 border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Audio
                  </Label>
                </div>
              </div>

              {(audioFile || audioBlob) && (
                <div className="p-3 border rounded-md">
                  <div className="flex items-center gap-2 text-sm">
                    <Waveform className="w-4 h-4 text-primary" />
                    {audioFile?.name || 'Recorded audio'}
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Upload MP3/WAV (max 10MB) or record up to 30 seconds
            </p>
          </div>

          {isCloning && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                Cloning voice... {progress}%
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isCloning}
            >
              Cancel
            </Button>
            <Button
              onClick={handleClone}
              disabled={isCloning || !audioFile || !name}
              className="bg-[#4285f4] hover:bg-[#3b77db]"
            >
              {isCloning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cloning...
                </>
              ) : (
                'Clone Voice'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}