import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, MessageCircle, Sparkles, User, Bot, Loader2 } from 'lucide-react';
import { chatConcierge } from '../services/gemini';
import { TravelPreferences } from '../types';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ConciergeChatProps {
  currentPrefs: TravelPreferences;
}

export const ConciergeChat: React.FC<ConciergeChatProps> = ({ currentPrefs }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Welcome to Travel Sanctuary. I am Sia, your personal concierge. How can I help you discover your next coastal escape?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatConcierge(inputValue, currentPrefs);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-[100] w-16 h-16 rounded-full bg-med-terracotta text-white shadow-2xl flex items-center justify-center group"
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-med-olive rounded-full border-2 border-white"
        />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-28 right-8 z-[100] w-[400px] h-[600px] bg-white rounded-[3rem] shadow-4xl flex flex-col border border-med-blue/5 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-med-blue p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-med-sand" />
                </div>
                <div>
                  <h3 className="font-serif text-xl">Sia</h3>
                  <p className="text-xs text-med-sand/70 font-medium">Your Concierge</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.map((message) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                      message.sender === 'user' ? 'bg-med-terracotta/10' : 'bg-med-blue/10'
                    }`}>
                      {message.sender === 'user' ? <User className="w-4 h-4 text-med-terracotta" /> : <Bot className="w-4 h-4 text-med-blue" />}
                    </div>
                    <div className={`p-4 rounded-3xl text-sm leading-relaxed ${
                      message.sender === 'user' 
                      ? 'bg-med-terracotta text-white rounded-tr-none' 
                      : 'bg-med-sand text-med-blue rounded-tl-none'
                    }`}>
                      {message.text}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-med-blue/10 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-med-blue" />
                    </div>
                    <div className="bg-med-sand p-4 rounded-3xl rounded-tl-none flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-med-blue/50 animate-spin" />
                      <span className="text-xs text-med-blue/50 font-medium italic">Sia is typing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-med-blue/5">
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything about Mediterranean travel..."
                  className="w-full bg-med-sand/50 border-none rounded-2xl py-4 pl-6 pr-14 text-sm font-medium focus:ring-2 focus:ring-med-terracotta/20 placeholder:text-med-blue/30"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-med-terracotta text-white flex items-center justify-center shadow-lg shadow-med-terracotta/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                  title="Send message"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] text-center mt-4 text-med-blue/30 font-medium uppercase tracking-widest">
                Powered by Travel Sanctuary AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
