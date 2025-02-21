'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Book, 
  FileText, 
  HelpCircle, 
  Clock, 
  List, 
  MessageSquare, 
  Square,
  ChevronRight
} from 'lucide-react';
import { ContentType, CONTENT_TYPE_CONFIGS } from '@/lib/types/content';

const ICONS = {
  Book,
  FileText,
  HelpCircle,
  Clock,
  List,
  MessageSquare,
  Square
};

interface ContentTypeSelectorProps {
  onSelect: (type: ContentType) => void;
}

export function ContentTypeSelector({ onSelect }: ContentTypeSelectorProps) {
  const [hoveredType, setHoveredType] = useState<ContentType | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {(Object.entries(CONTENT_TYPE_CONFIGS) as [ContentType, typeof CONTENT_TYPE_CONFIGS[ContentType]][]).map(([type, config]) => {
        const Icon = ICONS[config.icon as keyof typeof ICONS];
        
        return (
          <Card
            key={type}
            className={`p-4 cursor-pointer transition-all duration-200 hover:bg-secondary/20 ${
              hoveredType === type ? 'ring-2 ring-primary' : ''
            }`}
            onMouseEnter={() => setHoveredType(type)}
            onMouseLeave={() => setHoveredType(null)}
            onClick={() => onSelect(type)}
          >
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">{config.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {config.description}
                </p>
              </div>
              <ChevronRight className={`h-5 w-5 transition-transform duration-200 ${
                hoveredType === type ? 'translate-x-1' : ''
              }`} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}