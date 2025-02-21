'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, MessageSquare, Save, ChevronRight, Play, ThumbsUp, ThumbsDown, Share2, MoreVertical } from 'lucide-react';
import { autoContentApi as api } from '@/lib/api';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface SourceOverviewProps {
  source: {
    id: string;
    title: string;
    content: string;
    type: string;
  };
  onSaveNote?: (note: string) => void;
  onClose?: () => void;
}

export function SourceOverview({ source, onSaveNote, onClose }: SourceOverviewProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [overview, setOverview] = useState<{
    summary?: string;
    suggestedQuestions?: string[];
    keyTopics?: string[];
    readingTime?: number;
    confidence?: number;
  }>({});
  const { toast } = useToast();

  useEffect(() => {
    // Auto-start analysis when component mounts
    analyzeSource();
  }, [source.id]);

  const analyzeSource = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    let mockData = false;

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      let summary, topics, questions;

      // Check if we should use mock data
      const config = api.validateApiConfig();
      if (!config.valid || config.mock) {
        mockData = true;
        summary = {
          content: `${source.title} is a platform offering personalized video and image marketing tools to boost customer engagement and conversions. It allows users to easily create personalized content for various platforms like Facebook, LinkedIn, and email, using templates and integrations with popular marketing tools. The platform emphasizes ease of use and scalability, promising significant ROI improvements through personalized experiences. Multiple pricing tiers offer varying features and project allowances. Testimonials highlight substantial revenue increases achieved by users leveraging the platform's capabilities.`,
          status: 'completed'
        };

        topics = {
          topics: [
            { name: 'Video Marketing' },
            { name: 'Personalization' },
            { name: 'Customer Engagement' },
            { name: 'ROI Optimization' },
            { name: 'Marketing Automation' }
          ]
        };

        questions = [
          { question: 'How does personalized video marketing boost customer engagement?' },
          { question: 'What platforms are supported for content distribution?' },
          { question: 'What are the key features that differentiate this platform?' }
        ];
      } else {
        // Get source summary
        summary = await api.summarizeSource(source.id, {
          length: 'medium',
          format: 'paragraph',
          focus: 'overview',
          includeKeyPoints: true
        });

        // Extract key topics
        topics = await api.extractTopics(source.id, {
          maxTopics: 5,
          minConfidence: 0.7
        });

        // Generate suggested questions
        questions = await api.generateQuestions(source.id, {
          count: 3,
          type: 'open_ended',
          difficulty: 'intermediate'
        });
      }

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      setOverview({
        summary: summary.content,
        keyTopics: topics.topics?.map((t: any) => t.name) || [],
        suggestedQuestions: questions.map((q: any) => q.question),
        readingTime: Math.ceil(source.content.split(' ').length / 200), // Rough estimate: 200 words per minute
        confidence: 0.92
      });

      toast({
        title: "Analysis complete",
        description: mockData ? "Using offline data for analysis" : "Source has been analyzed successfully"
      });
    } catch (error) {
      console.error('Failed to analyze source:', error);
      toast({
        title: "Analysis failed",
        description: "Failed to analyze the source. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveNote = (content: string) => {
    if (onSaveNote) {
      onSaveNote(content);
      toast({
        title: "Note saved",
        description: "Your note has been saved successfully"
      });
    }
  };

  return (
    <Card className="p-6 bg-[#1A1B1E] border-[#2B2D31] shadow-2xl max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <FileText className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{source.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="bg-[#2B2D31] text-gray-400">
                {source.type.toUpperCase()}
              </Badge>
              {overview.readingTime && (
                <span className="text-sm text-gray-400">
                  {overview.readingTime} min read
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-[#2B2D31]"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-[#2B2D31]"
            onClick={onClose}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <div className="mb-6 space-y-2">
          <Progress value={analysisProgress} className="h-2" />
          <p className="text-sm text-center text-gray-400">
            Analyzing source... {analysisProgress}%
          </p>
        </div>
      )}

      {/* Content */}
      <div className="space-y-6">
        {overview.summary && (
          <>
            {/* Overview Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-200">Overview</h3>
                {overview.confidence && (
                  <Badge variant="secondary" className="bg-[#2B2D31] text-gray-400">
                    {Math.round(overview.confidence * 100)}% confidence
                  </Badge>
                )}
              </div>
              <p className="text-gray-300 leading-relaxed">{overview.summary}</p>
              <div className="flex items-center gap-4 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-[#2B2D31]"
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Helpful
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-[#2B2D31]"
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Not helpful
                </Button>
              </div>
            </div>

            {/* Key Topics */}
            {overview.keyTopics && overview.keyTopics.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-200 mb-3">Key Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {overview.keyTopics.map((topic, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-[#2B2D31] text-gray-300 hover:bg-[#3B3D41] cursor-pointer"
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Questions */}
            {overview.suggestedQuestions && overview.suggestedQuestions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-200 mb-3">Suggested Questions</h3>
                <div className="space-y-2">
                  {overview.suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-between text-left text-gray-300 hover:bg-[#2B2D31] h-auto py-3"
                      onClick={() => handleSaveNote(question)}
                    >
                      <span className="line-clamp-2">{question}</span>
                      <ChevronRight className="h-4 w-4 flex-shrink-0 ml-4" />
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1 bg-transparent border-[#2B2D31] text-gray-300 hover:bg-[#2B2D31]"
                onClick={() => handleSaveNote(overview.summary || '')}
              >
                <Save className="h-4 w-4 mr-2" />
                Save to note
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-transparent border-[#2B2D31] text-gray-300 hover:bg-[#2B2D31]"
              >
                <Play className="h-4 w-4 mr-2" />
                Audio Overview
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}