'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import * as Popover from '@radix-ui/react-popover';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { LuMessageCircle, LuX, LuSend, LuSparkles, LuUser } from 'react-icons/lu';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const INACTIVITY_TIMEOUT = 30000;
const TYPING_DELAY = 2000; // 2 second loading animation

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [side, setSide] = useState<'right' | 'left'>('right');
  const [isDragging, setIsDragging] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hey! I'm Max. How can I help you today?",
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, buttonX: 0, buttonY: 0 });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    setIsHidden(false);
    if (!isOpen) {
      inactivityTimerRef.current = setTimeout(() => {
        setIsHidden(true);
      }, INACTIVITY_TIMEOUT);
    }
  }, [isOpen]);

  useEffect(() => {
    resetInactivityTimer();
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [isOpen, resetInactivityTimer]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOpen) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      buttonX: position.x,
      buttonY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      setPosition({
        x: dragStartRef.current.buttonX + deltaX,
        y: dragStartRef.current.buttonY + deltaY,
      });
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      const wWidth = window.innerWidth;
      const buttonCenterX = wWidth - 36 + position.x;
      if (buttonCenterX < wWidth / 2) {
        setSide('left');
        setPosition(prev => ({ ...prev, x: -(wWidth - 72 - 24) }));
      } else {
        setSide('right');
        setPosition(prev => ({ ...prev, x: 0 }));
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position.x]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    resetInactivityTimer();

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // 2 second loading animation before response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Thanks for reaching out! This is a demo response. Connect me to your AI backend for real conversations.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
      resetInactivityTimer();
    }, TYPING_DELAY);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    resetInactivityTimer();
  };

  const handleButtonClick = () => {
    if (!isDragging) {
      setIsOpen(!isOpen);
      setIsHidden(false);
    }
  };

  const getHiddenOffset = () => {
    if (!isHidden || isOpen) return 0;
    return side === 'right' ? 45 : -45;
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      {/* Floating Trigger Button - Matte finish */}
      <Popover.Trigger asChild>
        <button
          ref={buttonRef}
          className={`fixed z-[9999] h-14 w-14 rounded-2xl
            bg-slate-800/80 backdrop-blur-md text-white/90
            border border-white/10
            shadow-lg shadow-black/20
            focus:outline-none focus:ring-2 focus:ring-white/20
            flex items-center justify-center
            ${isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:bg-slate-700/80'}`}
          style={{
            bottom: `${24 - position.y}px`,
            right: side === 'right' ? `${24 - position.x + getHiddenOffset()}px` : 'auto',
            left: side === 'left' ? `${24 + position.x + (windowWidth - 72 - 24) - getHiddenOffset()}px` : 'auto',
            transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseDown={handleMouseDown}
          onMouseEnter={() => {
            setIsHovered(true);
            setIsHidden(false);
            resetInactivityTimer();
          }}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleButtonClick}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
          <LuMessageCircle
            className={`h-5 w-5 absolute transition-all duration-400 ease-out ${
              isHovered && isOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
            }`}
          />
          <LuX
            className={`h-5 w-5 absolute transition-all duration-400 ease-out ${
              isHovered && isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
            }`}
          />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="chatbot-content z-[9998] w-[360px] rounded-2xl flex flex-col overflow-hidden
            bg-slate-900/90 backdrop-blur-xl
            border border-white/10
            shadow-2xl shadow-black/30"
          side="top"
          sideOffset={12}
          align="end"
          onPointerDownOutside={(e) => {
            if ((e.target as HTMLElement).closest('[data-radix-popover-trigger]')) {
              e.preventDefault();
            }
          }}
          onInteractOutside={resetInactivityTimer}
        >
          {/* Header - Clean minimal */}
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
                <LuSparkles className="h-4 w-4 text-amber-400/90" />
              </div>
              <div>
                <h3 className="text-white/90 font-medium text-sm" style={{ fontFamily: "'Lora', serif" }}>
                  Max
                </h3>
                <p className="text-white/40 text-xs">AI Assistant</p>
              </div>
            </div>
            <Popover.Close asChild>
              <button
                className="h-8 w-8 rounded-xl text-white/40 hover:text-white/80 hover:bg-white/5
                  transition-all duration-200 flex items-center justify-center focus:outline-none"
                aria-label="Close chat"
              >
                <LuX className="h-4 w-4" />
              </button>
            </Popover.Close>
          </div>

          {/* Messages Area */}
          <ScrollArea.Root className="flex-1 h-[380px]">
            <ScrollArea.Viewport className="h-full w-full p-4">
              <div className="flex flex-col gap-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex gap-2.5 max-w-[85%] ${
                        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      } items-end`}
                    >
                      <div
                        className={`h-7 w-7 rounded-lg flex-shrink-0 flex items-center justify-center ${
                          message.role === 'user' ? 'bg-white/10' : 'bg-white/5'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <LuUser className="h-3.5 w-3.5 text-white/60" />
                        ) : (
                          <LuSparkles className="h-3.5 w-3.5 text-amber-400/80" />
                        )}
                      </div>
                      <div
                        className={`px-4 py-2.5 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-white/10 rounded-br-md'
                            : 'bg-white/5 rounded-bl-md'
                        }`}
                      >
                        <p className="text-white/80 text-[13px] leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Loading Animation - 2s typing indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-2.5 items-end">
                      <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center">
                        <LuSparkles className="h-3.5 w-3.5 text-amber-400/80" />
                      </div>
                      <div className="px-4 py-3 bg-white/5 rounded-2xl rounded-bl-md">
                        <div className="flex gap-1.5 items-center">
                          <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
                          <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-[pulse_1.5s_ease-in-out_0.3s_infinite]" />
                          <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-[pulse_1.5s_ease-in-out_0.6s_infinite]" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              className="flex select-none touch-none p-0.5 bg-transparent data-[orientation=vertical]:w-1.5"
              orientation="vertical"
            >
              <ScrollArea.Thumb className="flex-1 bg-white/10 rounded-full" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>

          {/* Input Area - Clean minimal */}
          <div className="p-3 border-t border-white/5">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                onFocus={resetInactivityTimer}
                placeholder="Message Max..."
                className="flex-1 px-4 py-2.5 bg-white/5 rounded-xl
                  text-white/90 text-sm placeholder:text-white/30
                  border border-transparent
                  focus:outline-none focus:border-white/10 focus:bg-white/8
                  transition-all duration-200"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="h-10 w-10 rounded-xl bg-white/10 text-white/70
                  hover:bg-white/15 hover:text-white/90
                  disabled:opacity-30 disabled:cursor-not-allowed
                  transition-all duration-200 flex items-center justify-center focus:outline-none"
                aria-label="Send message"
              >
                <LuSend className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
