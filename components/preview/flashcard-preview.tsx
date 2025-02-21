'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardPreviewProps {
  content: {
    title: string;
    cards: Flashcard[];
  };
}

export function FlashcardPreview({ content }: FlashcardPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const handleNext = () => {
    setDirection('right');
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % content.cards.length);
      setDirection(null);
    }, 300);
  };

  const handlePrevious = () => {
    setDirection('left');
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + content.cards.length) % content.cards.length);
      setDirection(null);
    }, 300);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">{content.title}</h2>
        <p className="text-sm text-muted-foreground">
          Card {currentIndex + 1} of {content.cards.length}
        </p>
      </div>

      <div className="relative w-full max-w-xl aspect-[4/3]">
        <Card
          className={`absolute inset-0 p-8 flex items-center justify-center text-center cursor-pointer transition-all duration-500 transform perspective-1000
            ${isFlipped ? 'rotate-y-180' : ''}
            ${direction === 'left' ? 'animate-slide-left' : ''}
            ${direction === 'right' ? 'animate-slide-right' : ''}
          `}
          onClick={handleFlip}
        >
          <div className={`absolute inset-0 backface-hidden p-8 flex items-center justify-center ${isFlipped ? 'hidden' : ''}`}>
            <p className="text-xl">{content.cards[currentIndex].front}</p>
          </div>
          <div className={`absolute inset-0 backface-hidden p-8 flex items-center justify-center rotate-y-180 ${!isFlipped ? 'hidden' : ''}`}>
            <p className="text-xl">{content.cards[currentIndex].back}</p>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={content.cards.length <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleFlip}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={content.cards.length <= 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}