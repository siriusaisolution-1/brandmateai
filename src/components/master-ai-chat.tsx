// src/components/master-ai-chat.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sparkles, Bot, User, CornerDownLeft, X } from 'lucide-react';
import { useAuth } from 'reactfire';
import { requestMasterRouter } from '@/lib/flows-client';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export function MasterAiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const fallbackUser =
    typeof window !== 'undefined' ? window.__E2E_MOCKS__?.currentUser ?? null : null;
  const currentUser = auth.currentUser ?? fallbackUser;
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Welcome message effect
  useEffect(() => {
    if (isOpen && messages.length === 0 && !isLoading) {
      setIsLoading(true);
      requestMasterRouter({ prompt: '', isFirstMessage: true })
        .then((response) => {
          setMessages([{ sender: 'ai', text: response.message }]);
        })
        .catch((error: unknown) => {
          console.error("Failed to get initial greeting:", error);
          setMessages([{ sender: 'ai', text: "Hello! I seem to be having a little trouble starting up. Please try again in a moment." }]);
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await requestMasterRouter({ prompt: input });
      const aiMessage: Message = { sender: 'ai', text: response.message };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: unknown) {
      console.error('Error calling masterRouterFlow:', error);
      const errorMessage: Message = {
        sender: 'ai',
        text: "I'm sorry, I encountered an error. Please try again.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) return null; // Don't render if user not logged in.

  if (!isOpen) {
    return (
      <button
        data-testid="master-ai-chat-trigger"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-primary rounded-full shadow-lg text-white flex items-center justify-center hover:bg-primary/90 transition-transform hover:scale-110"
        aria-label="Open AI Chat"
      >
        <Sparkles className="w-8 h-8" />
      </button>
    );
  }

  return (
    <Card
      data-testid="master-ai-chat-panel"
      className="fixed bottom-6 right-6 w-full max-w-md h-[70vh] flex flex-col shadow-2xl bg-gray-900 border-gray-700"
    >
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Bot className="text-primary" />
          <CardTitle className="text-lg text-copy-primary">BrandMate AI</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'ai' && <Bot className="w-6 h-6 text-primary flex-shrink-0" />}
            <p className={`max-w-xs md:max-w-sm rounded-lg px-4 py-2 text-sm ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-gray-800 text-copy-secondary'}`}>
              {msg.text}
            </p>
            {msg.sender === 'user' && <User className="w-6 h-6 text-copy-primary flex-shrink-0" />}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <Bot className="w-6 h-6 text-primary flex-shrink-0" />
            <p className="max-w-xs md:max-w-sm rounded-lg px-4 py-2 text-sm bg-gray-800 text-copy-secondary animate-pulse">
              Thinking...
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="p-4 border-t border-gray-700">
        <form onSubmit={handleSend} className="flex w-full items-center space-x-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="What should we create today?"
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <CornerDownLeft className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}