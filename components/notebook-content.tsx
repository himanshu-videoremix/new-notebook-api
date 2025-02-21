'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface NotebookContentProps {
  selectedSource: string | null;
}

export function NotebookContent({ selectedSource }: NotebookContentProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{text: string; sender: 'user' | 'assistant'}[]>([]);

  if (!selectedSource) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Select a source to get started
      </div>
    );
  }

  return (
    <div className="h-full p-6">
      <div className="mb-6">
        <h2 className="text-xl font-medium text-white">Chat</h2>
      </div>

      <div className="bg-[#1A1B1E] rounded-lg p-6 mb-6">
        <h3 className="text-white mb-4">Source Description:</h3>
        <div className="space-y-4 text-gray-300">
          <div>
            <strong className="text-white">Name:</strong> VideoRemix.io
          </div>
          <div>
            <strong className="text-white">Category:</strong> Video Editing and Conversion
          </div>
          <div>
            <strong className="text-white">Description:</strong>
            <p className="mt-2">
              An online video editor and conversion tool that allows users to create, edit, and
              convert videos. Features include basic editing tools, templates, effects, and the
              ability to export videos to various formats.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col h-[400px] bg-[#1A1B1E] rounded-lg border border-[#2A2B2E]">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg, i) => (
            <div key={i} className={`mb-4 ${msg.sender === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block p-3 rounded-lg ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-[#2A2B2E] text-gray-300'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-[#2A2B2E]">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-[#2A2B2E] border-[#3A3B3E] text-white"
            />
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}