'use client';

import { Card } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

interface Message {
  speaker: string;
  content: string;
  timestamp?: string;
}

interface DeepDivePreviewProps {
  content: {
    title: string;
    messages: Message[];
  };
}

export function DeepDivePreview({ content }: DeepDivePreviewProps) {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold">{content.title}</h2>
      </div>

      <div className="space-y-4">
        {content.messages.map((message, index) => (
          <div
            key={index}
            className="animate-in slide-in-from-bottom duration-500"
            style={{ '--stagger': index } as any}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {message.speaker[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{message.speaker}</span>
                  {message.timestamp && (
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp}
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {message.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}