export interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatContextType {
  chats: Chat[];
  currentChatId: string | null;
  currentMessages: Message[];
  isTyping: boolean;
  isDarkMode: boolean;
  createNewChat: () => void;
  selectChat: (chatId: string) => void;
  sendMessage: (content: string) => void;
  toggleDarkMode: () => void;
}