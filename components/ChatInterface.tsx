import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { Send, Paperclip, Menu, Bot } from 'lucide-react';
import { Message } from '../types';
import Sidebar from './Sidebar';
import { INITIAL_GREETING } from '../constants';

export default function ChatInterface() {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  
  // Refs for Layout & Scrolling
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Track if we are currently touching the screen to avoid fighting user scroll
  const isTouchingRef = useRef(false);

  // --- Visual Viewport Sync (The High-Performance Fix) ---
  // We use `transform` instead of `top` to avoid layout reflows (jank).
  // We sync strictly to window.visualViewport to handle iOS keyboard pushing.
  useLayoutEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      if (!containerRef.current || !window.visualViewport) return;
      
      const vv = window.visualViewport;
      
      // 1. Set Height: Match the visible area exactly
      containerRef.current.style.height = `${vv.height}px`;
      
      // 2. Set Position: Use transform to counteract any document scroll/pan.
      // On iOS, offsetTop > 0 means the browser pushed the view up. 
      // We slide our container down by that amount to keep it visually fixed at the top.
      // Using translate3d forces GPU acceleration.
      containerRef.current.style.transform = `translate3d(0, ${vv.offsetTop}px, 0)`;
      
      // 3. Scroll Correction: Keep input visible
      // Only force scroll to bottom if we aren't manually scrolling up to read history
      if (document.activeElement === textareaRef.current && !isTouchingRef.current) {
          if (scrollAreaRef.current) {
               // We use a small tolerance to check if we were already at bottom
               const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
               const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
               
               if (isAtBottom) {
                   scrollAreaRef.current.scrollTop = scrollHeight;
               }
          }
      }
    };

    // Listeners
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
      // Initial sync
      handleResize();
    }
    
    // Add touch tracking to prevent jarring scrolls while user is interacting
    const handleTouchStart = () => { isTouchingRef.current = true; };
    const handleTouchEnd = () => { isTouchingRef.current = false; };
    
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // --- Auto-Resize Textarea Logic ---
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustTextareaHeight();
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; 
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`; 
    }
  };
  
  // Focus handler to ensure viewport sync happens immediately when keyboard triggers
  const handleFocus = () => {
    // Force a visual viewport check after a short delay to allow keyboard animation to start
    setTimeout(() => {
        if (window.visualViewport) {
            window.visualViewport.dispatchEvent(new Event('resize'));
            if (scrollAreaRef.current) {
                scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
            }
        }
    }, 300);
  };

  // --- Scroll Management ---
  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages, isStreaming]);

  // --- Message Submission ---
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: userText };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      // Refocus to keep keyboard open if desired, or let it close. 
      // Usually keeping it open is better for chat flow.
      textareaRef.current.focus(); 
    }
    
    // Mock Agent Response
    setTimeout(() => {
      const agentMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: agentMsgId, role: 'agent', content: '' }]);
      
      const responseText = "Here is a smooth, non-janky response that streams in without breaking your layout. Notice how the keyboard interactions on mobile should feel much more native now.";
      let i = 0;
      
      const interval = setInterval(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === agentMsgId 
            ? { ...msg, content: msg.content + responseText.charAt(i) }
            : msg
        ));
        i++;
        if (i >= responseText.length) {
          clearInterval(interval);
          setIsStreaming(false);
        }
      }, 30);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    // MAIN CONTAINER: 
    // Fixed position. We control Top/Height manually via Transform.
    // 'w-full' ensures width is 100%. 'overflow-hidden' prevents double scrollbars.
    <div 
      ref={containerRef}
      className="fixed left-0 top-0 w-full bg-white text-slate-900 overflow-hidden font-sans flex flex-col will-change-transform"
      style={{ height: '100%' }} // Initial fallback
    >
      
      {/* Sidebar Component */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* --- MAIN CHAT AREA --- */}
      <main className="flex-1 flex flex-col min-w-0 relative h-full">
        
        {/* HEADER - Fixed at the top of the flex container */}
        <header className="h-14 border-b flex items-center px-4 justify-between bg-white flex-shrink-0 z-10 shadow-sm transition-all">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors" 
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
              C
            </div>
            <div>
              <h1 className="font-semibold text-sm leading-tight text-gray-900">Charles</h1>
              <p className="text-xs text-gray-500 leading-tight">ChatBot</p>
            </div>
          </div>
          <div className="text-gray-400">
             {/* Right side icons */}
          </div>
        </header>

        {/* MESSAGES LIST AREA */}
        {/* flex-1: Takes available space between Header and Input */}
        <div 
          ref={scrollAreaRef}
          className="flex-1 overflow-y-auto p-4 space-y-6 overscroll-contain bg-white custom-scrollbar scroll-smooth"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 mt-[-50px]">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                 <Bot size={32} className="text-gray-400" />
              </div>
              <p className="font-medium text-lg text-black">No messages yet</p>
              <p className="text-sm">{INITIAL_GREETING}</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                
                {/* Agent Avatar */}
                {msg.role === 'agent' && (
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex-shrink-0 flex items-center justify-center text-purple-600 self-end mb-1">
                    <Bot size={16} />
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`
                  max-w-[85%] md:max-w-[70%] p-3 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-sm' 
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'}
                `}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </div>

        {/* INPUT AREA */}
        <div className="border-t bg-white flex-shrink-0 pb-safe z-20">
          <div className="p-3">
            <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500 transition-all">
              
              {/* Attachment Button */}
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors hidden sm:block rounded-full hover:bg-gray-100">
                <Paperclip size={20} />
              </button>

              {/* Text Area */}
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                placeholder="Type a message..."
                className="flex-1 max-h-[150px] bg-transparent border-none focus:ring-0 resize-none p-2 text-base leading-6 overflow-y-auto min-h-[40px] outline-none placeholder:text-gray-400"
                style={{ height: 'auto' }}
              />

              {/* Send Button */}
              <button 
                onClick={sendMessage}
                disabled={!input.trim() && !isStreaming}
                className={`
                  p-2 rounded-xl transition-all duration-200 mb-0.5 flex-shrink-0
                  ${input.trim() 
                    ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md transform hover:scale-105 active:scale-95' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                `}
              >
                <Send size={20} className={input.trim() ? "ml-0.5" : ""} />
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}