'use client';

import { useState, useEffect } from 'react';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

export function Workspace() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const words = input.trim().split(/\s+/).filter(Boolean).length;
    const chars = input.length;
    setWordCount(words);
    setCharCount(chars);

    // Simulate autosave
    const timeout = setTimeout(() => {
      if (input) {
        toast({
          title: "Changes saved",
          description: "Your content has been automatically saved.",
          duration: 1000,
        });
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [input, toast]);

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to generate content.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setOutput("This is a simulated response from the AutoContent API. In a real implementation, this would be the generated content based on your input and uploaded sources.");
      setLoading(false);
    }, 3000);
  };

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Input</h2>
          <div className="text-sm text-gray-500">
            {wordCount} words | {charCount} characters
          </div>
        </div>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your text here..."
          className="min-h-[400px] resize-none"
        />
        <Button
          onClick={handleGenerate}
          className="w-full bg-[#4285f4] hover:bg-[#3b77db]"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Generate
            </>
          )}
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Output</h2>
        <div className="min-h-[400px] p-4 rounded-md border bg-white">
          {loading ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : output ? (
            <div className="prose max-w-none">
              {output}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Generated content will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}