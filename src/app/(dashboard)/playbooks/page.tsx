'use client'

import { useState, useRef, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus,
  BookOpen,
  Star,
  ChevronUp,
  Send,
  Bot,
  User,
  Sparkles,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Chat Message Interface
interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

// Playbook Chat Component for Standard B2B Sales
function PlaybookChat({ playbookId }: { playbookId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hi! I'm your B2B Sales Coach. I can help you practice discovery calls, handle objections, perfect your pitch, and improve your closing techniques. What would you like to work on today?",
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageContent = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch('/api/playbook-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          conversationHistory,
          playbookId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.message || 'Sorry, I could not process your request.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Playbook chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, the playbook assistant is not available right now. Please check your configuration.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickSuggestions = [
    'Practice Discovery',
    'Handle Objections', 
    'Closing Techniques',
    'Role Play',
    'Pitch Practice',
    'Cold Call Tips',
  ];

  return (
    <Card className="ring-2 ring-primary/20 overflow-hidden">
      {/* Card Header with Title */}
      <div 
        className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                <h3 className="text-white font-semibold">Standard B2B Sales</h3>
              </div>
              <p className="text-white/70 text-sm">AI-powered sales coaching assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-0 text-xs">
                Default
              </Badge>
              <Badge className="bg-emerald-500/80 text-white border-0 text-xs">
                <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse" />
                Active
              </Badge>
            </div>
            <div className={`h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 ${isMinimized ? 'rotate-180' : 'rotate-0'}`}>
              <ChevronUp className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Chat Content */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMinimized ? 'max-h-0' : 'max-h-[800px]'}`}>
        {/* Chat Messages Area */}
        <div 
          ref={messagesContainerRef}
          className="h-[350px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
            {message.role === 'assistant' && (
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                message.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-md'
                  : 'bg-white text-slate-700 rounded-bl-md shadow-sm border border-slate-100'
              )}
            >
              {message.content}
            </div>
            {message.role === 'user' && (
              <div className="h-8 w-8 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-slate-600" />
              </div>
            )}
          </div>
        ))}

        {/* Loading Animation */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-slate-100">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Quick Suggestions */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-500 mb-2">Suggestions</p>
          <div className="flex gap-2 flex-wrap">
            {quickSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={(e) => {
                  e.stopPropagation();
                  setInputValue(suggestion);
                }}
                className="px-3 py-1.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-full text-xs text-slate-600 hover:text-indigo-600 whitespace-nowrap transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about sales techniques, practice scenarios..."
              className="flex-1 px-4 py-3 bg-slate-100 rounded-xl text-sm
                placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white
                border border-transparent focus:border-indigo-200 transition-all"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="h-12 w-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function PlaybooksPage() {
  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Playbooks" 
        description="Manage your sales playbooks and best practices"
      />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Info card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">What are Playbooks?</p>
                <p className="text-sm text-muted-foreground">
                  Playbooks define your sales methodology - the stages, questions, and best practices your team should follow. The AI uses playbooks to provide more relevant coaching and insights.
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Standard B2B Sales - Dedicated Chat Card */}
          <PlaybookChat playbookId="1" />
          
          {/* Add New Playbook Button */}
          <Button 
            variant="outline" 
            className="w-full border-dashed border-2 h-14 text-muted-foreground hover:text-foreground hover:border-primary/50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add new Playbook
          </Button>
        </div>
      </div>
    </div>
  )
}
