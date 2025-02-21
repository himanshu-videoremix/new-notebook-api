'use client';

import { StudyGuidePreview } from './study-guide-preview';
import { FlashcardPreview } from './flashcard-preview';
import { TimelinePreview } from './timeline-preview';
import { AnalysisPreview } from './analysis-preview';
import { DeepDivePreview } from './deep-dive-preview';

interface ContentPreviewProps {
  content: any;
  type: string;
}

export function ContentPreview({ content, type }: ContentPreviewProps) {
  const getPreviewComponent = () => {
    switch (type) {
      case 'deep_dive':
        return <DeepDivePreview content={content} />;
      case 'study_guide':
        return <StudyGuidePreview content={content} />;
      case 'flashcards':
        return <FlashcardPreview content={content} />;
      case 'timeline':
        return <TimelinePreview content={content} />;
      case 'sentiment':
      case 'topics':
      case 'entities':
        return <AnalysisPreview content={{ ...content, type }} />;
      default:
        return (
          <div className="p-6 text-center text-muted-foreground">
            No preview available for this content type
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {getPreviewComponent()}
    </div>
  );
}