import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types/chat';
import { formatMessageTime } from '../utils/chatUtils';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { content, isBot, timestamp } = message;

  return (
    <div className={`flex items-start space-x-3 mb-4 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
          🤖
        </div>
      )}
      
      <div className={`max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl ${isBot ? 'order-1' : 'order-0'}`}>
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            isBot
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md'
              : 'bg-blue-500 text-white rounded-br-md'
          }`}
        >
          {isBot ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({children}) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                  h2: ({children}) => <h2 className="text-base font-semibold mb-2 mt-3">{children}</h2>,
                  h3: ({children}) => <h3 className="text-sm font-semibold mb-1 mt-2">{children}</h3>,
                  p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                  li: ({children}) => <li className="text-sm">{children}</li>,
                  strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                  em: ({children}) => <em className="italic">{children}</em>,
                  code: ({children}) => (
                    <code className="bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded text-xs">
                      {children}
                    </code>
                  )
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm">{content}</p>
          )}
        </div>
        <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isBot ? 'text-left' : 'text-right'}`}>
          {formatMessageTime(timestamp)}
        </div>
      </div>

      {!isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
          🙋‍♂️
        </div>
      )}
    </div>
  );
};

export default MessageBubble;