'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Upload, Settings2, Quote, Book, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { autoContentApi } from '@/lib/api';
import { ProcessRequest } from '@/lib/types/api';

interface Message {
  text: string;
  sender: 'user' | 'assistant';
  isOverview?: boolean;
  error?: boolean;
  citations?: Array<{
    text: string;
    source: string;
    context: string;
  }>;
  suggestions?: string[];
}

interface ChatSettings {
  tone: 'professional' | 'casual' | 'technical';
  length: 'concise' | 'balanced' | 'detailed';
  includeCitations: boolean;
  useSourceContext: boolean;
}

export function ChatInterface({
  onShowUpload,
  generatedSummary,
}: {
  onShowUpload: () => void;
  generatedSummary: { content: string; summary: string } | null;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSummaryy, setGeneratedSummary] = useState<{ content: string; summary: string } | null>(null);

  const [settings, setSettings] = useState<ChatSettings>({
    tone: 'professional',
    length: 'balanced',
    includeCitations: true,
    useSourceContext: true
  });
  const [isTyping, setIsTyping] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');

    useEffect(() => {
    if (generatedSummary) {
      console.log("Generated content received:", generatedSummary.content);
      setGeneratedSummary(generatedSummary.summary || "No summary available");
    }
  }, [generatedSummary]);

  useEffect(() => {
    console.log("Generated summary set to:", generatedSummary);
  }, [generatedSummary]);


  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' as const };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const request: ProcessRequest = {
        text: input,
        outputType: 'chat',
        includeCitations: settings.includeCitations,
        customization: {
          tone: settings.tone,
          length: settings.length,
          useSourceContext: settings.useSourceContext
        }
      };

      const response = await autoContentApi.createContent(request);

      if (response.request_id) {
        // Handle streaming response
        let result;
        do {
          result = await autoContentApi.getContentStatus(response.request_id);
          if (result.content) {
            setStreamingResponse(result.content);
          }
          await new Promise(resolve => setTimeout(resolve, 100));
        } while (result.status === 'processing');

        if (result.status === 'completed') {
          const assistantMessage: Message = {
            text: result.content,
            sender: 'assistant',
            citations: result.citations,
            suggestions: result.suggestions
          };
          setMessages(prev => [...prev, assistantMessage]);
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        text: 'An error occurred while processing your request.',
        sender: 'assistant',
        error: true
      }]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      setStreamingResponse('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1A1B1E]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="text-gray-400 hover:text-white hover:bg-[#2B2D31]"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onShowUpload}
              className="text-gray-400 hover:text-white hover:bg-[#2B2D31]"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>
  
        {isTyping && (
          <div className="flex items-center gap-2 p-2 text-gray-400 text-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              />
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.4s' }}
              />
            </div>
            <span>Assistant is typing...</span>
          </div>
        )}
  
        {streamingResponse && (
          <div className="p-4 bg-[#2B2D31] rounded-lg animate-in slide-in-from-bottom">
            <p className="text-gray-300">{streamingResponse}</p>
          </div>
        )}
  
        {/* Generated Summary Block */}
        {generatedSummary ? (
          <div className="flex justify-start canvas-slide-in">
            <div className="max-w-[80%] rounded-lg p-3 text-primary-foreground shadow-lg shadow-primary/20">
              <div className="text-white text-[16px] leading-[18px] whitespace-pre-wrap">
                {generatedSummary.summary}
              </div>
            </div>
          </div>
        ) : isLoading && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-lg p-3 shadow-md">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          </div>
        )}
  
        {/* Render messages */}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.error
                  ? 'bg-red-900/20 border border-red-900/50'
                  : 'bg-[#2B2D31] text-gray-100'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              {message.citations && message.citations.length > 0 && (
                <div className="mt-4 border-t border-[#3B3D41] pt-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Quote className="h-4 w-4" />
                    Citations
                  </h4>
                  <div className="space-y-3">
                    {message.citations.map((citation, idx) => (
                      <div key={idx} className="text-sm">
                        <p className="text-gray-300 italic mb-1">
                          "{citation.text}"
                        </p>
                        <p className="text-gray-400 text-xs flex items-center gap-1">
                          <Book className="h-3 w-3" />
                          {citation.source}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Suggested Questions
                  </h4>
                  {message.suggestions.map((suggestion, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#2B2D31] text-sm"
                      onClick={() => {
                        setInput(suggestion);
                        handleSend();
                      }}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
  
      <div className="p-4 border-t border-[#2B2D31]">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-[#2B2D31] border-[#3B3D41] text-white placeholder-gray-400"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
  
}