import React, { useState, useEffect, useCallback } from 'react';
import { Moon, Sun } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Chat, Message } from './types/chat';
import { generateChatTitle } from './utils/chatUtils';

function App() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isDarkMode, setIsDarkMode] = useLocalStorage('windtech-dark-mode', true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auth
  const [token, setToken] = useState<string | null>(null);
  const [view, setView] = useState<"login" | "signup" | "chat">("login");


  // Ensure view is "login" if no token is present
  useEffect(() => {
    localStorage.removeItem("token");
    setToken(null);
    setView("login");
  }, []);

  // ✅ fetchUserChats must be defined BEFORE useEffect
  const fetchUserChats = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch("http://localhost:8000/my-chats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      const userChats: Chat[] = data.map((item: any, index: number) => ({
        id: `chat-${index}`,
        title: item.question.slice(0, 20) + "...",
        messages: [
          {
            id: `user-${index}`,
            content: item.question,
            isBot: false,
            timestamp: new Date(item.created_at),
          },
          {
            id: `bot-${index}`,
            content: item.answer,
            isBot: true,
            timestamp: new Date(item.created_at),
          },
        ],
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.created_at),
      }));

      setChats(userChats);
    } catch (error) {
      console.error("❌ Failed to load user chats:", error);
    }
  }, [token]);

  useEffect(() => {
    if (view === "chat" && token && chats.length === 0) {
      fetchUserChats();
    }
  }, [view, token, fetchUserChats, chats.length]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setView("login");
  };

  // Dark mode setup
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load messages when current chat changes
  useEffect(() => {
    if (currentChatId) {
      const chat = chats.find(c => c.id === currentChatId);
      if (chat) {
        setCurrentMessages(chat.messages);
      }
    } else {
      setCurrentMessages([]);
    }
  }, [currentChatId, chats]);

  const createNewChat = useCallback(() => {
    setCurrentChatId(null);
    setCurrentMessages([]);
    setIsSidebarOpen(false);
  }, []);

  const selectChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId);
    setIsSidebarOpen(false);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      isBot: false,
      timestamp: new Date()
    };

    const newMessages = [...currentMessages, userMessage];
    setCurrentMessages(newMessages);
    setIsTyping(true);

    let chatId = currentChatId;
    let chatTitle = '';

    if (!chatId) {
      chatId = `chat-${Date.now()}`;
      chatTitle = generateChatTitle(content);
      setCurrentChatId(chatId);
    }

    let botMessage: Message;

    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: content }),
      });

      const data = await res.json();

      botMessage = {
        id: `bot-${Date.now()}`,
        content: data.answer || "⚠️ No response from model.",
        isBot: true,
        timestamp: new Date()
      };
    } catch (error) {
      botMessage = {
        id: `bot-${Date.now()}`,
        content: `❌ Error: ${(error as Error).message}`,
        isBot: true,
        timestamp: new Date()
      };
    }

    const finalMessages = [...newMessages, botMessage];
    setCurrentMessages(finalMessages);
    setIsTyping(false);

    const now = new Date();
    setChats((prevChats: Chat[]) => {
      const existingChatIndex = prevChats.findIndex(c => c.id === chatId);
      if (existingChatIndex >= 0) {
        const updatedChats = [...prevChats];
        updatedChats[existingChatIndex] = {
          ...updatedChats[existingChatIndex],
          messages: finalMessages,
          updatedAt: now
        };
        return updatedChats;
      } else {
        const newChat: Chat = {
          id: chatId!,
          title: chatTitle,
          messages: finalMessages,
          createdAt: now,
          updatedAt: now
        };
        return [newChat, ...prevChats];
      }
    });
  }, [currentMessages, currentChatId, setChats, token]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(!isDarkMode);
  }, [isDarkMode, setIsDarkMode]);

  // 🔐 Show login/signup if not authenticated
  if (view === "login") {
    return <LoginForm onLogin={(jwt: string) => {
      setToken(jwt);
      setView("chat");
    }} onSwitch={setView} />;
  }

  if (view === "signup") {
    return <SignupForm onSwitch={setView} />;
  }

  // ✅ Authenticated view: Full chatbot
  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900 flex">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative lg:translate-x-0 z-50 lg:z-auto
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar
          chats={chats}
          currentChatId={currentChatId}
          onNewChat={createNewChat}
          onSelectChat={selectChat}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 
                      flex items-center justify-between px-4 lg:px-6">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
                     text-gray-600 dark:text-gray-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="hidden lg:block"></div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
                      text-gray-600 dark:text-gray-400 transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 min-h-0">
          <ChatArea
            messages={currentMessages}
            isTyping={isTyping}
            onSendMessage={sendMessage}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
