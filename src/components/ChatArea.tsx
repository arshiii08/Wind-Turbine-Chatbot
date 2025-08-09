import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { Message } from '../types/chat';

interface ChatAreaProps {
  messages: Message[];
  isTyping: boolean;
  onSendMessage: (content: string) => void;
  isDarkMode: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isTyping, onSendMessage, isDarkMode }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isTyping) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Wind Turbine Fault Diagnostics
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Welcome! Ask me about turbine issues, maintenance, or performance analysis
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">🏭</div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Welcome
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              I'm here to help you diagnose wind turbine faults, analyze performance data, and recommend maintenance actions. 
              Start by describing your turbine issue.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-4">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your turbine risk question..."
            disabled={isTyping}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed
                     placeholder-gray-500 dark:placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 
                     dark:disabled:bg-gray-600 text-white rounded-lg font-medium
                     focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     disabled:cursor-not-allowed transition-colors duration-200
                     flex items-center space-x-2"
          >
            <Send size={18} />
            <span className="hidden sm:block">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;