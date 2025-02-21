'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface StudyGuideSection {
  title: string;
  content: string;
  subsections?: StudyGuideSection[];
}

interface StudyGuidePreviewProps {
  content: {
    title: string;
    sections: StudyGuideSection[];
  };
}

export function StudyGuidePreview({ content }: StudyGuidePreviewProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionTitle)
        ? prev.filter(title => title !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const renderSection = (section: StudyGuideSection, depth = 0) => {
    const isExpanded = expandedSections.includes(section.title);
    
    return (
      <div key={section.title} className="animate-in slide-in-from-left duration-500" style={{ '--stagger': depth } as any}>
        <Button
          variant="ghost"
          className="w-full justify-start p-2 hover:bg-secondary/20"
          onClick={() => toggleSection(section.title)}
        >
          <div className="flex items-center gap-2">
            {section.subsections?.length ? (
              isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            ) : (
              <div className="w-4" />
            )}
            <span className="font-medium">{section.title}</span>
          </div>
        </Button>
        
        {isExpanded && (
          <div className="pl-6 space-y-2 animate-in slide-in-from-top duration-300">
            <div className="prose prose-sm dark:prose-invert">
              {section.content}
            </div>
            {section.subsections?.map(subsection =>
              renderSection(subsection, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold">{content.title}</h2>
      </div>
      <div className="space-y-2">
        {content.sections.map(section => renderSection(section))}
      </div>
    </Card>
  );
}