import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg max-w-xs">
      <span className="text-2xl">🤖</span>
      <div className="flex items-center space-x-1">
        <span className="text-gray-600 dark:text-gray-300 text-sm">Bot is typing</span>
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse"></div>
          <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;