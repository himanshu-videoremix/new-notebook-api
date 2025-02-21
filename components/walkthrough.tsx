'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface WalkthroughStep {
  target: string;
  title: string;
  description: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    target: '[data-walkthrough="sources"]',
    title: 'Source Management',
    description: 'Your source library for managing documents, PDFs, and other content. Select multiple sources to analyze them together or generate combined insights.',
    position: 'right'
  },
  {
    target: '[data-walkthrough="add-source"]',
    title: 'Add Sources',
    description: 'Upload files (PDF, TXT), paste text, or add web links. Supports multiple file types with automatic content analysis.',
    position: 'right'
  },
  {
    target: '[data-walkthrough="chat"]',
    title: 'Chat Interface',
    description: 'Chat naturally about your sources with our AI assistant. Get summaries, ask questions, and explore topics with accurate, contextual responses.',
    position: 'right'
  },
  {
    target: '[data-walkthrough="studio"]',
    title: 'Studio Features',
    description: 'Your creative workspace for content generation. Create study guides, briefings, FAQs, timelines and more - all customizable to your needs.',
    position: 'left'
  },
  {
    target: '[data-walkthrough="deep-dive"]',
    title: 'Deep Dive',
    description: 'Generate engaging audio discussions that break down complex topics. Customize voices, style, and analysis depth for perfect learning content.',
    position: 'left'
  },
  {
    target: '[data-walkthrough="notes"]',
    title: 'Notes',
    description: 'Your knowledge base for saving insights and creating study materials. Generate structured content like FAQs, timelines, and outlines.',
    position: 'left'
  },
  {
    target: '[data-walkthrough="study-guide"]',
    title: 'Study Guide',
    description: 'Create comprehensive study materials with key concepts, examples, and practice questions. Perfect for exam prep or deep learning.',
    position: 'left'
  },
  {
    target: '[data-walkthrough="briefing"]',
    title: 'Briefing Document',
    description: 'Generate concise, professional summaries of your sources. Ideal for quick understanding or sharing key insights.',
    position: 'left'
  },
  {
    target: '[data-walkthrough="faq"]',
    title: 'FAQ Generator',
    description: 'Automatically create comprehensive Q&A sets from your sources. Great for understanding complex topics or creating help documentation.',
    position: 'left'
  },
  {
    target: '[data-walkthrough="timeline"]',
    title: 'Timeline',
    description: 'Visualize events and developments chronologically. Perfect for historical analysis or project planning.',
    position: 'left'
  },
  {
    target: '[data-walkthrough="outline"]',
    title: 'Outline Generator',
    description: 'Create structured overviews of your content with hierarchical organization. Ideal for planning or summarizing complex documents.',
    position: 'left'
  }
];

// Additional dialog tooltips
const DIALOG_TOOLTIPS = {
  deepDive: {
    basic: {
      title: 'Basic Settings',
      description: 'Configure the fundamental aspects of your deep dive conversation including format, tone, length, and style.'
    },
    content: {
      title: 'Content Elements',
      description: 'Choose what elements to include in your deep dive, such as examples, questions, summaries, and citations.'
    },
    voice: {
      title: 'Voice Settings',
      description: 'Select and customize voices for each speaker. Adjust speed, pitch, emphasis, and emotion to create natural-sounding conversations.'
    },
    advanced: {
      title: 'Advanced Options',
      description: 'Fine-tune your deep dive with advanced settings like maximum length, confidence thresholds, and metadata generation.'
    }
  }
};

export function Walkthrough() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Show walkthrough unless explicitly dismissed
    const dismissed = localStorage.getItem('walkthroughDismissed');
    if (!dismissed) {
      setIsActive(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsActive(false);
    localStorage.setItem('walkthroughDismissed', 'true');
  };

  const handleReset = () => {
    localStorage.removeItem('walkthroughDismissed');
    setCurrentStep(0);
    setIsActive(true);
  };

  const handleNext = () => {
    if (currentStep < WALKTHROUGH_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!isActive) return null;

  const currentTarget = document.querySelector(WALKTHROUGH_STEPS[currentStep].target);
  if (!currentTarget) return null;

  return (
    <TooltipProvider>
      <div className="fixed inset-0 bg-black/50 z-[100]">
        <Tooltip open={true}>
          <TooltipTrigger asChild>
            <div 
              className="absolute pointer-events-none ring-2 ring-blue-500 ring-offset-2 ring-offset-black/50 rounded-lg"
              style={{
                left: currentTarget.getBoundingClientRect().left,
                top: currentTarget.getBoundingClientRect().top,
                width: currentTarget.getBoundingClientRect().width,
                height: currentTarget.getBoundingClientRect().height,
              }}
            />
          </TooltipTrigger>
          <TooltipContent
            side={WALKTHROUGH_STEPS[currentStep].position}
            className="w-96 p-6 bg-[#2B2D31] border-[#3B3D41] shadow-lg z-[101] max-w-[90vw]"
            sideOffset={16}
            avoidCollisions={true}
            collisionPadding={16}
            forceMount
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">
                  {WALKTHROUGH_STEPS[currentStep].title}
                </h3>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {WALKTHROUGH_STEPS[currentStep].description}
              </p>
              <div className="flex flex-col gap-4 pt-4">
                {/* Progress Indicators */}
                <div className="flex gap-1.5">
                  {WALKTHROUGH_STEPS.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 w-6 rounded-full ${
                        index === currentStep 
                          ? 'bg-blue-500' 
                          : index < currentStep 
                            ? 'bg-[#3B3D41]/80'
                            : 'bg-[#3B3D41]/30'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex items-center justify-between gap-3">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-gray-400 hover:text-white bg-[#1A1B1E]/50 border-[#3B3D41] hover:bg-[#3B3D41]"
                      onClick={handlePrevious}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    onClick={handleNext} 
                  >
                    {currentStep === WALKTHROUGH_STEPS.length - 1 ? (
                      <>
                        Finish
                        <X className="h-4 w-4 ml-1" />
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Skip Tutorial Link */}
                <button
                  onClick={handleDismiss}
                  className="text-xs text-gray-400 hover:text-white hover:underline text-center"
                >
                  Skip tutorial
                </button>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}