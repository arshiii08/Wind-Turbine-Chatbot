import React from 'react';
import { Plus, MessageSquare, Settings } from 'lucide-react';
import { Chat } from '../types/chat';
import { formatChatTime } from '../utils/chatUtils';

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  isDarkMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  chats, 
  currentChatId, 
  onNewChat, 
  onSelectChat,
  isDarkMode 
}) => {
  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">WT</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">WindTech</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Diagnostics AI</p>
          </div>
        </div>
        
        <button
          onClick={onNewChat}
          className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-500 hover:bg-blue-600 
                   text-white rounded-lg font-medium transition-colors duration-200
                   focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus size={18} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
          Recent Chats
        </h3>
        
        {chats.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No chat history yet
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors duration-200 
                         hover:bg-gray-100 dark:hover:bg-gray-700 group ${
                  currentChatId === chat.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    : 'bg-white dark:bg-gray-700/50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full 
                                flex items-center justify-center mt-0.5">
                    <MessageSquare size={14} className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {chat.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatChatTime(chat.updatedAt)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          <p>© 2025 WindTech Systems</p>
          <p className="mt-1">Industrial IoT Division</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;