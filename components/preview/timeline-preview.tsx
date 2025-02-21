'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ChevronDown } from 'lucide-react';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
}

interface TimelinePreviewProps {
  content: {
    title: string;
    events: TimelineEvent[];
  };
}

export function TimelinePreview({ content }: TimelinePreviewProps) {
  const [expandedEvents, setExpandedEvents] = useState<string[]>([]);

  const toggleEvent = (eventDate: string) => {
    setExpandedEvents(prev =>
      prev.includes(eventDate)
        ? prev.filter(date => date !== eventDate)
        : [...prev, eventDate]
    );
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Clock className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold">{content.title}</h2>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
        
        <div className="space-y-4">
          {content.events.map((event, index) => {
            const isExpanded = expandedEvents.includes(event.date);
            
            return (
              <div
                key={event.date}
                className="relative pl-10 animate-in slide-in-from-left duration-500"
                style={{ '--stagger': index } as any}
              >
                <div className="absolute left-[14px] top-2 w-2 h-2 rounded-full bg-primary" />
                
                <Button
                  variant="ghost"
                  className="w-full justify-start p-4 hover:bg-secondary/20 text-left"
                  onClick={() => toggleEvent(event.date)}
                >
                  <div className="flex items-start gap-4">
                    <time className="text-sm text-muted-foreground whitespace-nowrap">
                      {event.date}
                    </time>
                    <div className="flex-1">
                      <h3 className="font-medium">{event.title}</h3>
                      {isExpanded && (
                        <p className="mt-2 text-sm text-muted-foreground animate-in slide-in-from-top duration-300">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}