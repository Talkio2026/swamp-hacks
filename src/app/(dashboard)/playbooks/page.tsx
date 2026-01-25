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
  TrendingUp,
  Zap,
  BarChart3,
  Target,
  Lightbulb,
  Search,
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
  const [isMinimized, setIsMinimized] = useState(true);
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
    <Card className="ring-2 ring-indigo-500/20 overflow-hidden">
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
              className="flex-1 px-4 py-3 bg-slate-100 rounded-xl text-sm text-slate-900
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

// Workforce Insights Chat Component - RAG-powered analysis across all calls
interface InsightSource {
  callSid: string;
  clientName: string;
  companyName?: string;
  summary: string;
  relevanceScore: number;
}

function InsightsChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hi! I'm your Workforce Insights Assistant powered by AI. I can analyze patterns across all your client calls to help you understand your performance, identify areas for improvement, and discover what's working well. Ask me anything about your sales patterns!",
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [sources, setSources] = useState<InsightSource[]>([]);
  const [showSources, setShowSources] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const handleSend = async (customMessage?: string) => {
    const messageToSend = customMessage || inputValue.trim();
    if (!messageToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageToSend,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customMessage) setInputValue('');
    setIsLoading(true);
    setSources([]);

    try {
      const conversationHistory = messages.slice(-6).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch('/api/insights/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          conversationHistory,
          model: 'claude-3-haiku',
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
      
      // Store sources for reference
      if (data.sources?.length > 0) {
        setSources(data.sources);
      }
    } catch (error) {
      console.error('Insights chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, the insights service is not available right now. Please make sure OpenRouter API is configured.',
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

  const quickInsights = [
    { label: 'My Performance', query: 'How am I performing overall? What are my strengths and areas for improvement?' },
    { label: 'Top Objections', query: 'What are the most common objections I face and how can I handle them better?' },
    { label: 'Success Patterns', query: 'What patterns do you see in my successful vs unsuccessful calls?' },
    { label: 'Buying Signals', query: 'Am I recognizing and responding to buying signals effectively?' },
    { label: 'Improvement Focus', query: "Based on my call history, what's the one thing I should focus on improving?" },
  ];

  return (
    <Card className="ring-2 ring-emerald-500/20 overflow-hidden">
      {/* Card Header */}
      <div 
        className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4 cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                <h3 className="text-white font-semibold">Workforce Insights</h3>
              </div>
              <p className="text-white/70 text-sm">AI-powered analysis across all your calls</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-0 text-xs">
                <Search className="h-3 w-3 mr-1" />
                RAG Search
              </Badge>
              <Badge className="bg-emerald-500/80 text-white border-0 text-xs">
                <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse" />
                Live
              </Badge>
            </div>
            <div className={`h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 ${isMinimized ? 'rotate-180' : 'rotate-0'}`}>
              <ChevronUp className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Chat Content */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMinimized ? 'max-h-0' : 'max-h-[900px]'}`}>
        {/* Chat Messages Area */}
        <div 
          ref={messagesContainerRef}
          className="h-[350px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-emerald-50/50 to-white"
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
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                  message.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-md'
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
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-slate-100">
                <div className="flex gap-1.5 items-center">
                  <span className="text-xs text-slate-500 mr-2">Analyzing calls...</span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sources Section (when available) */}
        {sources.length > 0 && (
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/80">
            <button
              onClick={() => setShowSources(!showSources)}
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700"
            >
              <Target className="h-3 w-3" />
              {sources.length} relevant calls referenced
              <ChevronUp className={`h-3 w-3 transition-transform ${showSources ? '' : 'rotate-180'}`} />
            </button>
            {showSources && (
              <div className="mt-2 space-y-1">
                {sources.slice(0, 3).map((source, i) => (
                  <div key={source.callSid} className="text-xs text-slate-600 bg-white px-2 py-1 rounded border border-slate-100">
                    <span className="font-medium">{source.clientName}</span>
                    {source.companyName && <span className="text-slate-400"> • {source.companyName}</span>}
                    <span className="text-emerald-600 ml-2">({Math.round(source.relevanceScore * 100)}% match)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Insights */}
        <div className="px-4 py-3 border-t border-slate-100 bg-emerald-50/30">
          <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
            <Lightbulb className="h-3 w-3" />
            Quick Insights
          </p>
          <div className="flex gap-2 flex-wrap">
            {quickInsights.map((insight) => (
              <button
                key={insight.label}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSend(insight.query);
                }}
                disabled={isLoading}
                className="px-3 py-1.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-full text-xs text-slate-600 hover:text-emerald-600 whitespace-nowrap transition-all disabled:opacity-50"
              >
                {insight.label}
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
              placeholder="Ask about your performance patterns, objections, success factors..."
              className="flex-1 px-4 py-3 bg-slate-100 rounded-xl text-sm text-slate-900
                placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white
                border border-transparent focus:border-emerald-200 transition-all"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isLoading}
              className="h-12 w-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50"
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
          
          {/* Workforce Insights - RAG-powered analysis */}
          <InsightsChat />
          
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
