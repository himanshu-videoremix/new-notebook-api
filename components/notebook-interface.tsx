'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import {
  Settings,
  Share2,
  Book,
  List,
  ChevronDown,
  Upload,
  Send,
  Sparkles,
  Info,
  HelpCircle,
  MessageSquare,
  Trash2,
  CheckSquare,
  Loader2,
  Edit,
  PlayCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { UploadModal } from '@/components/upload-modal';
import AudioOverviewDialog from '@/components/audio-overview-dialog';
import { DeepDiveDialog } from '@/components/deep-dive-dialog';
import { BriefingDocDialog } from '@/components/briefing-doc-dialog';
import { StudyGuideDialog } from '@/components/study-guide-dialog';
import { ContentGenerationDialog } from '@/components/content-generation-dialog';
import { ChatInterface } from '@/components/chat-interface';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { autoContentApi } from '@/lib/api';
import { storageService } from '@/lib/storage';
import type { ProcessRequest } from '@/lib/types/api';
import { NotebookSkeleton } from '@/components/notebook-skeleton';
import { Walkthrough } from '@/components/walkthrough';
import { useApiFeatures } from '@/hooks/use-api-features';
import { Label } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useVoices } from '@/hooks/use-voices';

export function NotebookInterface() {
  const staticAudioUrl = "https://autocontentapi.blob.core.windows.net/audios/67fa9f5b-3d38-4382-abf8-13f7d103d817_20250224092847.wav";
  const staticGithubContent = {
    faq: {
      what_is_github: "GitHub is an AI-powered developer platform where you can build and ship software. It's a collaborative platform that offers tools for coding, security, automation, and project management.",
      key_features: [
        {
          name: "GitHub Copilot",
          description: "AI-powered coding assistance that helps you write code faster and more securely. It offers code completion, chat functionality, and can be integrated throughout your workflows."
        },
        {
          name: "GitHub Actions",
          description: "Allows you to automate any workflow. Optimize your processes with simple and secure CI/CD."
        },
        {
          name: "GitHub Codespaces",
          description: "Provides comprehensive dev environments in the cloud so you can start building instantly."
        },
        {
          name: "GitHub Mobile",
          description: "Allows you to manage projects and chat with GitHub Copilot from anywhere."
        },
        {
          name: "GitHub Issues",
          description: "Helps you to create issues and manage projects with tools that adapt to your code."
        },
        {
          name: "GitHub Discussions",
          description: "Provides a space for open-ended conversations alongside your projects."
        },
        {
          name: "Code Review",
          description: "Create review processes that improve code quality and fit neatly into your workflow."
        },
        {
          name: "GitHub Advanced Security",
          description: "Helps you to find and fix vulnerabilities with AI, so you can ship more secure software faster."
        }
      ],
      benefits: [
        "Increased productivity: GitHub Copilot can help you work 55% faster.",
        "Improved security: GitHub Advanced Security helps you find and fix vulnerabilities quickly. Resolve vulnerabilities 7x faster.",
        "Streamlined workflows: Automate tasks and improve the developer experience with GitHub Copilot.",
        "Better collaboration: Collaborate with your team on a single, integrated platform.",
        "Scalability: GitHub scales with teams of any size in any industry."
      ],
      application_security: "GitHub provides built-in application security features that allow you to find and fix vulnerabilities. GitHub Advanced Security uses AI to help you apply fixes quickly. Also, GitHub helps you detect, prevent, and remediate leaked secrets across your organization.",
      open_source: "You can become an open source partner through GitHub Sponsors to support the tools and libraries that power your work.",
      enterprise_suitability: "Yes, GitHub offers enterprise-grade security features, AI features, and 24/7 support. It is used by companies of all sizes, from startups to enterprises."
    },
    response_text: "Here is some FAQ-style content based on the provided source:\nWhat is GitHub?\nGitHub is an AI-powered developer platform where you can build and ship software. It's a collaborative platform that offers tools for coding, security, automation, and project management.[1][2][3][4][5]\nWhat are some key features of GitHub?\n•GitHub Copilot: AI-powered coding assistance that helps you write code faster and more securely. It offers code completion, chat functionality, and can be integrated throughout your workflows.[1][4][4][6]\n•GitHub Actions: Allows you to automate any workflow. Optimize your processes with simple and secure CI/CD.[3][6]\n•GitHub Codespaces: Provides comprehensive dev environments in the cloud so you can start building instantly.[3][7]\n•GitHub Mobile: Allows you to manage projects and chat with GitHub Copilot from anywhere.[8]\n•GitHub Issues: Helps you to create issues and manage projects with tools that adapt to your code.[9]\n•GitHub Discussions: Provides a space for open-ended conversations alongside your projects.[9]\n•Code Review: Create review processes that improve code quality and fit neatly into your workflow.[10]\n•GitHub Advanced Security: Helps you to find and fix vulnerabilities with AI, so you can ship more secure software faster.[11]\nWhat are the benefits of using GitHub?\n•Increased productivity: GitHub Copilot can help you work 55% faster.[6]\n•Improved security: GitHub Advanced Security helps you find and fix vulnerabilities quickly. Resolve vulnerabilities 7x faster.[4][11][5]\n•Streamlined workflows: Automate tasks and improve the developer experience with GitHub Copilot.[4]\n•Better collaboration: Collaborate with your team on a single, integrated platform.[5]\n•Scalability: GitHub scales with teams of any size in any industry.[10]\nHow can GitHub help with application security?\nGitHub provides built-in application security features that allow you to find and fix vulnerabilities. GitHub Advanced Security uses AI to help you apply fixes quickly. Also, GitHub helps you detect, prevent, and remediate leaked secrets across your organization.[8][11][11]\nHow does GitHub support open source?\nYou can become an open source partner through GitHub Sponsors to support the tools and libraries that power your work.[10]\nIs GitHub suitable for enterprises?\nYes, GitHub offers enterprise-grade security features, AI features, and 24/7 support. It is used by companies of all sizes, from startups to enterprises.[12][10]\n"
  };
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAudioDialog, setShowAudioDialog] = useState(false);
  const [showDeepDiveDialog, setShowDeepDiveDialog] = useState(false);
  const [showBriefingDialog, setShowBriefingDialog] = useState(false);
  const [showStudyGuideDialog, setShowStudyGuideDialog] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showGenerationDialog, setShowGenerationDialog] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState('');
  const [sources, setSources] = useState<any[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [audioUrl, setAudioUrl] = useState<string>();
  // const [audioUrl, setAudioUrl] = useState(staticAudioUrl);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectAll, setSelectAll] = useState(false);
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const [notes, setNotes] = useState([]);
  const [isModifying, setIsModifying] = useState(false);
  const [modificationInstructions, setModificationInstructions] = useState('');
  const [generatedSummary, setgeneratedSummary] = useState<{
  } | null>(null);
  const [modifiedAudioUrl, setModifiedAudioUrl] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState(null);
  const { data, createContent, status, error } = useApiFeatures();
  const [messages, setMessages] = useState([]);
  const { voices, isLoading: voicesLoading, handleVoiceCreated, playVoicePreview } = useVoices();
  const [selectedVoices, setSelectedVoices] = useState<{ voice1: string; voice2: string }>({
    voice1: '142',
    voice2: '20'
  });


  // Load saved sources on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedSources = storageService.loadSources();
    setSources(savedSources);
    setSelectedSources(savedSources.filter(s => s.selected).map(s => s.id));
    setSelectAll(savedSources.length > 0 && savedSources.every(s => s.selected));
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return null;
  }

  const truncateText = (text, maxLines = 3) => {
    if (!text) return '';

    // Split by newlines and take only the first few lines
    const lines = text.split('\n').slice(0, maxLines);

    // Join them back together
    return lines.join('\n') + (text.split('\n').length > maxLines ? '...' : '');
  };

  const toggleExpandedView = () => {
    setIsPreviewExpanded(!isPreviewExpanded);
    setIsSidebarVisible(!isPreviewExpanded);
  };

  const handleUploadComplete = (resource: any) => {
    const newSource = {
      ...resource,
      id: Date.now().toString(),
      selected: false
    };

    storageService.saveSources([...sources, newSource]);
    setSources(prev => [...prev, newSource]);

    setSelectedSources([newSource.id]);

    setShowUploadModal(false);
  };

  const handleSourceSelect = (sourceId: string) => {
    setSelectedSources(prev => {
      const newSelection = prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId];

      const updatedSources = sources.map(source => ({
        ...source,
        selected: newSelection.includes(source.id)
      }));
      storageService.saveSources(updatedSources);
      setSources(updatedSources);
      setSelectAll(updatedSources.length > 0 && updatedSources.every(s => s.selected));

      return newSelection;
    });
  };

  const handleSourceSelection = async (outputType, index) => {
    if (sources.length === 0) {
      toast({
        title: "Error",
        description: "Please add some sources first",
        variant: "destructive",
      });
      return;
    }

    // Toggle the selected state for the source in the sources array.
    setSources((prevSources) =>
      prevSources.map((source, i) =>
        i === index ? { ...source, selected: !source.selected } : source
      )
    );

    // Update the selectedSources state based on whether the source is already selected.
    const sourceId = sources[index].id;
    setSelectedSources((prevSelected) =>
      prevSelected.includes(sourceId)
        ? prevSelected.filter((id) => id !== sourceId)
        : [...prevSelected, sourceId]
    );

    setIsGenerating(true);

    try {
      const requestData = {
        text: "Sample input text",
        outputType,
        resources: sources.map((s) => ({ content: s.content, type: s.type })),
        customization: {},
      };

      const result = await createContent(requestData);
      console.log("Generated result:", result);

      if (result && result.text) {
        console.log("Setting generated summary:", result.text);
        setgeneratedSummary({
          content: result.text,
          summary: result.text,
        });
      } else {
        setgeneratedSummary({
          content: "No content generated",
          summary: "No summary available",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate content",
        variant: "destructive",
      });
    }

    setIsGenerating(false);
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    const updatedSources = storageService.selectAllSources(newSelectAll);
    setSources(updatedSources);
    setSelectedSources(newSelectAll ? updatedSources.map(s => s.id) : []);
  };

  const handleDeleteSource = (sourceId: string) => {
    const updatedSources = storageService.deleteSource(sourceId);
    setSources(updatedSources);
    setSelectedSources(prev => prev.filter(id => id !== sourceId));
    setSelectAll(updatedSources.length > 0 && updatedSources.every(s => s.selected));
  };

  const handleModifyPodcast = async (options: { voice1: string; voice2: string }) => {
    console.log('handleModifyPodcast');

    if (!audioUrl) {
      toast({
        title: "No audio found",
        description: "Please provide an audio URL to modify.",
        variant: "destructive"
      });
      return;
    }

    setIsModifying(true);
    try {
      const result = await autoContentApi.modifyPodcast({
        audioUrl: audioUrl,
        voice1: options.voice1,
        voice2: options.voice2,
        instructions: modificationInstructions,
        callbackData: 'optional-callback-data'
      });

      console.log('API Response:', result);

      if (result.finalResult?.audio_url) {
        console.log(`Final modified audio available at: ${result.finalResult.audio_url}`);
        setModifiedAudioUrl(result.finalResult.audio_url);
        setShowAudioDialog(true);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to modify podcast';
      console.error('Error modifying podcast:', errorMessage);
      toast({
        title: "Podcast modification failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsModifying(false);
    }
  };


  const handleGenerateAudio = async (options: { voice1: string; voice2: string }) => {
    if (selectedSources.length === 0) {
      toast({
        title: "No sources selected",
        description: "Please select sources to generate audio overview",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingAudio(true);
    try {
      const selectedSourceContents = sources
        .filter(s => selectedSources.includes(s.id))
        .map(s => s.content);
      console.log("Calleddddd")
      const result = await autoContentApi.createDeepDiveContent(
        selectedSourceContents,
        "Generate audio overview",
        {
          outputType: 'audio',
          includeCitations: true,
          customization: {
            format: 'conversational',
            tone: 'professional',
            length: 'medium',
            style: 'educational',
            depth: 'balanced',
            audience: 'general',
            complexity: 'intermediate',
            speakers: {
              host1: "Host",
              host2: "Expert",
              roles: {
                host1Role: "Host",
                host2Role: "Expert"
              },
              style: "formal",
              voiceSettings: {
                host1: {
                  speed: 1.0,
                  pitch: 1.0,
                  emphasis: "moderate",
                  emotionIntensity: "medium"
                },
                host2: {
                  speed: 1.0,
                  pitch: 1.0,
                  emphasis: "moderate",
                  emotionIntensity: "medium"
                }
              }
            },
            voice1: options.voice1,
            voice2: options.voice2
          }
        }
      );

      console.log("API Response:", result); // Debugging the response structure

      if (result.finalResult?.audio_url) {
        setAudioUrl(result.finalResult.audio_url);
        setShowAudioDialog(true);
        setProgress(result?.finalResult.status)
      } else {
        console.error("Audio URL is missing. Full response:", result);
        throw new Error("No audio URL returned");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate audio overview';
      console.error('Failed to generate audio:', errorMessage);
      toast({
        title: "Audio generation failed",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsGeneratingAudio(false);
    }
  };


  const handleGenerateContent = async (type: string) => {
    console.log("call setShowStudyGuideDialog setShowStudyGuideDialog")
    if (type === 'study_guide') {
      setShowStudyGuideDialog(true);
    } else if (type === 'briefing_doc') {
      setShowBriefingDialog(true);
    } else {
      setSelectedContentType(type);
      setShowGenerationDialog(true);
    }
  };

  const handleCustomGenerate = async (options: {
    type: string;
    complexity: string;
    format: string;
    length: string;
    tone: string;
    audience: string;
    citations: boolean;
  }) => {
    try {
      console.log("Generating content with options:", options);

      setIsGenerating(true);
      setGenerationProgress(0);

      const selectedSourceContents = sources
        .filter(s => selectedSources.includes(s.id))
        .map(s => s.content);

      console.log("Selected sources:", selectedSourceContents);

      const request: ProcessRequest = {
        resources: selectedSourceContents.map(content => ({
          content,
          type: options.type === 'deep_dive'
            ? (options.format === 'audio' ? 'audio' : 'text')  // If format is 'audio', use 'audio', else 'text'
            : 'website'  // Default to 'website'
        })),
        text: `Generate ${options.type} content`,
        outputType: options.type,
        includeCitations: options.citations,
        customization: {
          format: options?.customization?.format,
          tone: options?.customization?.tone,
          length: options?.customization?.length,
          complexity: options?.customization?.complexity,
          audience: options?.customization?.audience
        }

      };

      console.log("Request payload:", request);

      const response = await autoContentApi.createContent(request);
      console.log("API response:", response);

      if (response.status === 'success') {
        console.log("Content request ID:", response.request_id);
        handleGeneratedContent(options.type, response?.finalResult?.response_text)
        setShowGenerationDialog(false);
      }

      if (response.request_id) {
        let result;
        do {
          result = await autoContentApi.getContentStatus(response.request_id);
          console.log("Polling status:", result);

          if (result.progress) {
            setGenerationProgress(result.progress);
          }
          if (result.status === 'failed') {
            throw new Error(result.error || 'Content generation failed');
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        } while (result.status === 'processing');

        if (result.status === 'completed' && result?.content) {
          console.log(result, "completed Result");
          console.log("Generated content:", result?.content);
          toast({
            title: "Content generated",
            description: `${options.type} content has been generated successfully`
          });
          handleGeneratedContent(options.type, result.content, result.metadata);
          setShowGenerationDialog(false);
        }
      }
    } catch (error) {
      console.error('Content generation error:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate content",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };



  const handleGeneratedContent = (type: string, content: string) => {
    console.log("Generated Content Type:", type);
    console.log("Generated Content:", content);

    setPreviewContent(content);

    switch (type) {
      case 'study_guide':
      case 'briefing_doc':
      case 'faq':
      case 'timeline':
      case 'outline':
      case 'flashcards':
        console.log(`Adding ${type} content to notes...`);

        // Add to notes section
        const note = {
          id: Date.now().toString(),
          title: `${type.replace('_', ' ').toUpperCase()}`,
          content,
          type,
          timestamp: new Date().toISOString()
        };

        console.log("New Note:", note);

        setNotes((prevNotes) => [note, ...prevNotes]);
        break;

      default:
        console.warn('Unhandled content type:', type);
    }
  };


  const handleCustomize = (type: string) => {
    setSelectedContentType(type);
    if (type === 'deep_dive') {
      setShowDeepDiveDialog(true);
    } else {
      setShowGenerationDialog(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1B1E] text-white">
      <Walkthrough />
      <div className="flex h-screen w-full">
        {/* Sources Sidebar */}
        <div
          className="w-1/3 h-full pt-14 bg-[#1A1B1E] border-r border-[#2B2D31] flex flex-col"
          data-walkthrough="sources"
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium text-white">Sources</h2>
              {sources.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-[#2B2D31] ml-2"
                  onClick={handleSelectAll}
                >
                  <CheckSquare className={`h-4 w-4 mr-2 ${selectAll ? 'text-blue-500' : ''}`} />
                  {selectAll ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-[#2B2D31]"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button
            data-walkthrough="add-source"
            variant="outline"
            className="mx-4 justify-start text-gray-400 bg-transparent border-[#2B2D31] hover:bg-[#2B2D31]"
            onClick={() => setShowUpload(true)}
          >
            + Add source
          </Button>

          <div className="flex-1 mt-4 overflow-y-auto">
            {sources.length > 0 ? (
              <div className="space-y-2 p-4">
                {sources.map((source, index) => (
                  <div
                    key={source.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${selectedSources.includes(source.id)
                      ? "bg-[#2B2D31]"
                      : "hover:bg-[#2B2D31]/50"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSources.includes(source.id)}
                      onChange={() => handleSourceSelection("summary", index)}
                      className="h-4 w-4 rounded border-gray-600 bg-gray-700 checked:bg-blue-500"
                    />
                    <div
                      className="flex-1 min-w-0"
                      onClick={() => handleSourceSelect(source.id)}
                    >
                      <p className="text-sm font-medium text-white truncate">
                        {source.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {source.type.toUpperCase()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-500 hover:bg-[#2B2D31]"
                      onClick={() => handleDeleteSource(source.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 px-4">
                <Upload className="h-6 w-6 mb-2" />
                <p className="text-sm text-center">Saved sources will appear here</p>
                <p className="text-xs text-center mt-1">
                  Click Add source above to add PDFs, websites, text, videos, or audio files.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Main Content */}
        <div
          className="w-1/3 pt-14 flex flex-col border-r border-[#2B2D31]"
          data-walkthrough="chat"
        >
          <Suspense fallback={<div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse">Loading chat...</div>

          </div>}>
            <ChatInterface
              onShowUpload={() => setShowUpload(true)}
              sources={sources}
              suggesstionMessages={messages}
              generatedSummary={generatedSummary}
            />
          </Suspense>
        </div>

        {/* Studio Sidebar */}
        {isPreviewExpanded ? (
          // Show only the expanded preview
          <div
            className="w-1/3 h-full p-[18px] pt-14 bg-[#1A1B1E]"
            onClick={toggleExpandedView}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[20px] font-semibold tracking-wide">Preview</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpandedView();
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div
              className="text-[15px] leading-relaxed whitespace-pre-wrap"
              onClick={(e) => e.stopPropagation()} // Stops event from bubbling up
            >
              {previewContent.replace(/\[\d+\]/g, "")}
            </div>
          </div>
        ) : (
          <div
            className="w-1/3 h-full pt-14 bg-[#1A1B1E]"
            data-walkthrough="studio"
          >

            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-medium text-white">Studio</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-[#2B2D31]"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-white">Audio Overview</h3>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 text-gray-400 hover:text-white hover:bg-[#2B2D31] transition-colors"
                        >
                          <HelpCircle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        align="start"
                        className="max-w-sm p-4 bg-[#2B2D31] border-[#3B3D41] shadow-xl rounded-lg"
                      >
                        <p className="text-sm text-gray-300 leading-relaxed">
                          Audio Overviews are lively "deep dive" discussions that summarize the key topics in your sources. This is an experimental feature and below are some notes to help you get started:
                        </p>
                        <ul className="mt-3 space-y-2 text-sm text-gray-300">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-400">•</span>
                            <span>Audio Overviews (including the voices) are AI-generated, so there might be inaccuracies and audio glitches.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-400">•</span>
                            <span>Audio Overviews are not a comprehensive or objective view of a topic, but simply a reflection of your sources.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-400">•</span>
                            <span>Audio Overviews are only in English at this moment.</span>
                          </li>
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="bg-[#2B2D31] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2" data-walkthrough="deep-dive">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <h3 className="text-sm font-medium text-white">Deep Dive conversation</h3>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">Two hosts (English only)</p>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className={`w-full text-gray-400 bg-transparent border-[#3B3D41] hover:bg-[#3B3D41] ${selectedSources.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      disabled={selectedSources.length === 0}
                      onClick={() => handleCustomize('deep_dive')}
                    >
                      Customize
                    </Button>

                    <Button
                      variant="outline"
                      className={`w-full text-gray-400 bg-transparent border-[#3B3D41] hover:bg-[#3B3D41] ${selectedSources.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      disabled={selectedSources.length === 0 || isGeneratingAudio || showAudioDialog}
                      onClick={() => handleGenerateAudio({ voice1: 'en-US-1', voice2: 'en-US-2' })}
                    >
                      {isGeneratingAudio ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating...</span>
                        </div>
                      ) : (
                        'Generate'
                      )}
                    </Button>
                  </div>

                  {audioUrl && (
                    <div className="mt-4">
                      <h4 className="text-white text-sm font-medium mb-2">Generated Audio</h4>
                      <audio controls src={audioUrl} className="w-full">
                        Your browser does not support the audio element.
                      </audio>


                      <div className="space-y-4">
                        {/* Modification Instructions */}
                        <div className="grid gap-2">
                          <Label>Modification Instructions</Label>
                          <textarea
                            className="w-full p-2 bg-[#3B3D41] text-white rounded-lg mb-2 text-sm mt-[10px]"
                            placeholder="Enter modification instructions..."
                            value={modificationInstructions}
                            onChange={(e) => setModificationInstructions(e.target.value)}
                          />
                        </div>

                        {/* Speaker 1 Voice Selection */}
                        <div className="grid gap-2">
                          {/* <Label>First Speaker Voice</Label>
                         */}
                          <span>Select Voice 1</span>
                          <Select
                            value={selectedVoices.voice1}
                            onValueChange={(v) =>
                              setSelectedVoices((prev) => ({ ...prev, voice1: v }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select voice" />
                            </SelectTrigger>
                            <SelectContent>
                              {voices.map((voice) => (
                                <div key={voice.id} className="relative cursor-pointer">
                                  <SelectItem
                                    value={voice.id}
                                    disabled={voice.id === selectedVoices.voice2 /* or voice1 for the other dropdown */}
                                  >
                                    <div className="flex items-center justify-between w-full pr-7">
                                      <span>
                                        {voice.name} ({voice.gender?.trim().toLowerCase() === "female" ? "Female" : "Male"})
                                      </span>
                                    </div>
                                  </SelectItem>

                                  {/* Position the play button as an absolutely positioned element */}
                                  {voice.preview_url && (
                                    <div
                                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
                                      onClick={(e) => {
                                        e.stopPropagation();

                                        // Play the preview without closing the dropdown
                                        setTimeout(() => {
                                          playVoicePreview(voice.preview_url);
                                        }, 0);
                                      }}
                                    >
                                      <PlayCircle className="h-4 w-4" />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Speaker 2 Voice Selection */}
                        <div className="grid gap-2">
                          {/* <Label>Second Speaker Voice</Label> */}
                          <span>Select Voice 2</span>

                          <Select
                            value={selectedVoices.voice2}
                            onValueChange={(v) =>
                              setSelectedVoices((prev) => ({ ...prev, voice2: v }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select voice" />
                            </SelectTrigger>
                            <SelectContent>
                              {voices.map((voice) => (
                                <div key={voice.id} className="relative cursor-pointer">
                                  <SelectItem
                                    value={voice.id}
                                    disabled={voice.id === selectedVoices.voice2 /* or voice1 for the other dropdown */}
                                  >
                                    <div className="flex items-center justify-between w-full pr-7">
                                      <span>
                                        {voice.name} ({voice.gender?.trim().toLowerCase() === "female" ? "Female" : "Male"})
                                      </span>
                                    </div>
                                  </SelectItem>

                                  {/* Position the play button as an absolutely positioned element */}
                                  {voice.preview_url && (
                                    <div
                                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
                                      onClick={(e) => {
                                        e.stopPropagation();

                                        // Play the preview without closing the dropdown
                                        setTimeout(() => {
                                          playVoicePreview(voice.preview_url);
                                        }, 0);
                                      }}
                                    >
                                      <PlayCircle className="h-4 w-4" />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Modify Podcast Button */}
                        <Button
                          variant="outline"
                          className="w-full text-gray-400 bg-transparent border-[#3B3D41] hover:bg-[#3B3D41]"
                          disabled={isModifying || !modificationInstructions || !selectedVoices.voice1 || !selectedVoices.voice2}
                          onClick={() => handleModifyPodcast({
                            instructions: modificationInstructions,
                            voice1: selectedVoices.voice1,
                            voice2: selectedVoices.voice2
                          })}

                        >
                          {isModifying ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Modifying...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Edit className="w-4 h-4" />
                              <span>Modify Podcast</span>
                            </div>
                          )}
                        </Button>
                      </div>
                      {modifiedAudioUrl && (
                        <div className="mt-4">
                          <h4 className="text-white text-sm font-medium mb-2">Modified Audio</h4>
                          <audio controls src={modifiedAudioUrl} className="w-full">
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3
                    className="text-xs font-medium text-gray-400"
                    data-walkthrough="notes"
                  >
                    Notes
                  </h3>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-gray-400 bg-transparent border-[#2B2D31] hover:bg-[#2B2D31]"
                  >
                    + Add note
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="ghost"
                      className="justify-start text-gray-400 hover:bg-[#2B2D31] text-xs w-full disabled:opacity-50"
                      data-walkthrough="study-guide"
                      onClick={() => handleCustomize('study_guide')}
                      disabled={selectedSources.length === 0 || isGenerating}
                    >
                      <Book className="h-3 w-3 mr-2" />
                      Study guide
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-gray-400 hover:bg-[#2B2D31] text-xs w-full disabled:opacity-50"
                      data-walkthrough="briefing"
                      onClick={() => setShowBriefingDialog(true)}
                      disabled={selectedSources.length === 0 || isGenerating}
                    >
                      <MessageSquare className="h-3 w-3 mr-2" />
                      Briefing doc
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-gray-400 hover:bg-[#2B2D31] text-xs w-full disabled:opacity-50"
                      data-walkthrough="faq"
                      onClick={() => handleGenerateContent('faq')}
                      disabled={selectedSources.length === 0 || isGenerating}
                    >
                      <MessageSquare className="h-3 w-3 mr-2" />
                      FAQ
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-gray-400 hover:bg-[#2B2D31] text-xs w-full disabled:opacity-50"
                      data-walkthrough="timeline"
                      onClick={() => handleGenerateContent('timeline')}
                      disabled={selectedSources.length === 0 || isGenerating}
                    >
                      <MessageSquare className="h-3 w-3 mr-2" />
                      Timeline
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-gray-400 hover:bg-[#2B2D31] text-xs w-full disabled:opacity-50"
                      data-walkthrough="outline"
                      onClick={() => handleGenerateContent('outline')}
                      disabled={selectedSources.length === 0 || isGenerating}
                    >
                      <MessageSquare className="h-3 w-3 mr-2" />
                      Outline
                    </Button>
                  </div>
                  {previewContent && (
                    <div
                      className={`mt-4 p-4 bg-[#1A1B1E] text-white rounded-lg border border-gray-600 shadow-lg ${isPreviewExpanded
                        ? "fixed inset-0 z-50 overflow-auto m-4 ml-[1411px] !mt-[64px] p-6"
                        : "max-h-60 overflow-hidden cursor-pointer"
                        }`}
                      onClick={toggleExpandedView}
                    >
                      <div className="flex justify-between items-center mb-3">
                        {/* <h3 className="text-[20px] font-semibold tracking-wide">
                        {finalResult?.outputType || "Preview"}
                      </h3> */}
                        {isPreviewExpanded && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpandedView();
                            }}
                            className="text-gray-400 hover:text-white"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                      <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
                        {isPreviewExpanded
                          ? previewContent.replace(/\[\d+\]/g, "") // Removes numbers like [1], [2], etc.
                          : truncateText(previewContent.replace(/\[\d+\]/g, ""))
                        }
                      </div>
                    </div>
                  )}



                  <div className="flex flex-col items-center justify-center h-48 text-gray-500 mt-8">
                    <Book className="h-6 w-6 mb-2" />
                    <p className="text-sm text-center">
                      Saved notes will appear here
                    </p>
                    <p className="text-xs text-center mt-1">
                      Save a chat message to create a new note, or click Add note above.
                    </p>
                  </div>
                </div>
              </div>
            </div>


          </div>
        )}
        <AudioOverviewDialog
          isOpen={showAudioDialog}
          onClose={() => setShowAudioDialog(false)}
          onGenerate={handleGenerateAudio}
          audioUrl={audioUrl}
          progress={progress}
        />

        <DeepDiveDialog
          isOpen={showDeepDiveDialog}
          onClose={() => setShowDeepDiveDialog(false)}
          onGenerate={handleGenerateAudio}
          isGenerating={isGeneratingAudio}
          progress={progress}
        />

        <ContentGenerationDialog
          isOpen={showGenerationDialog}
          onClose={() => setShowGenerationDialog(false)}
          onGenerate={handleCustomGenerate}
          contentType={selectedContentType}
          isGenerating={isGenerating}
          progress={generationProgress}
        />

        <BriefingDocDialog
          isOpen={showBriefingDialog}
          onClose={() => setShowBriefingDialog(false)}
          onGenerate={async (options) => {
            try {
              setIsGenerating(true);
              setGenerationProgress(0);

              const selectedSourceContents = sources
                .filter(s => selectedSources.includes(s.id))
                .map(s => s.content);

              const request = {
                resources: selectedSourceContents.map(content => ({
                  content,
                  type: 'website'
                })),
                text: 'Generate briefing document',
                outputType: 'briefing_doc',
                includeCitations: false,
                customization: options
              };

              const response = await autoContentApi.createContent(request);

              if (response.request_id) {
                let result;
                do {
                  result = await autoContentApi.getContentStatus(response.request_id);
                  if (result.progress) {
                    setGenerationProgress(result.progress);
                  }
                  if (result.status === 'failed') {
                    throw new Error(result.error || 'Briefing document generation failed');
                  }
                  await new Promise(resolve => setTimeout(resolve, 1000));
                } while (result.status === 'processing');

                if (result.status === 'completed' && result.content) {
                  toast({
                    title: "Briefing document generated",
                    description: "Your briefing document has been created successfully"
                  });
                  handleGeneratedContent('briefing_doc', result.content, result.metadata);
                  setShowBriefingDialog(false);
                }
              }
            } catch (error) {
              console.error('Briefing document generation error:', error);
              toast({
                title: "Generation failed",
                description: error instanceof Error ? error.message : "Failed to generate briefing document",
                variant: "destructive"
              });
            } finally {
              setIsGenerating(false);
            }
          }}
          isGenerating={isGenerating}
          progress={generationProgress}
        />

        <StudyGuideDialog
          isOpen={showStudyGuideDialog}
          onClose={() => setShowStudyGuideDialog(false)}
          onGenerate={async (options) => {
            try {
              console.log("Study Guide Generation Started...");
              setIsGenerating(true);
              setGenerationProgress(0);

              const selectedSourceContents = sources
                .filter(s => selectedSources.includes(s.id))
                .map(s => s.content);

              console.log("Selected Sources for Study Guide:", selectedSourceContents);

              const request = {
                resources: selectedSourceContents.map(content => ({
                  content,
                  type: 'website'
                })),
                text: 'Generate study guide',
                outputType: 'study_guide',
                includeCitations: false,
                customization: {
                  format: options.format,
                  tone: options.tone,
                  length: options.length,
                  complexity: options.complexity,
                  audience: options.audience
                }
              };

              console.log("Generated Request Payload:", request);

              const response = await autoContentApi.createContent(request);
              console.log("API Response:", response);

              if (response.request_id) {
                let result;
                do {
                  result = await autoContentApi.getContentStatus(response.request_id);
                  console.log("Current Generation Status:", result.status, "| Progress:", result.progress);

                  if (result.progress) {
                    setGenerationProgress(result.progress);
                  }

                  if (result.status === 'failed') {
                    throw new Error(result.error || 'Study guide generation failed');
                  }

                  await new Promise(resolve => setTimeout(resolve, 1000));
                } while (result.status === 'processing');
                console.log(result, "Result done");
                if (result.status === 'completed' && result.content) {

                  console.log("Study Guide Successfully Generated:", result.content);

                  toast({
                    title: "Study guide generated",
                    description: "Your study guide has been created successfully"
                  });

                  handleGeneratedContent('study_guide', result.content, result.metadata);
                  console.log("caaasa setShowStudyGuideDialog")
                  setShowStudyGuideDialog(false);
                }
              }
            } catch (error) {
              console.error('Study guide generation error:', error);

              toast({
                title: "Generation failed",
                description: error instanceof Error ? error.message : "Failed to generate study guide",
                variant: "destructive"
              });
            } finally {
              console.log("Study Guide Generation Process Completed.");
              setIsGenerating(false);
            }
          }}
          isGenerating={isGenerating}
          progress={generationProgress}
        />


        <UploadModal
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          onUploadComplete={handleUploadComplete}
        />
      </div>
    </div>
  );
}