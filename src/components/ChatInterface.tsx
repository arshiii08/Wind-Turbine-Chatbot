import React, { useEffect, useState } from "react";
import { askQuestion, getMyChats } from "../api";

interface Chat {
  question: string;
  answer: string;
  intent?: string;
  created_at?: string;
}

const ChatInterface: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);

  const fetchChats = async () => {
    try {
      const res = await getMyChats();
      setChats(res.data);
    } catch {
      alert("Failed to load chat history.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await askQuestion(question);
      setChats([{ question, answer: res.data.answer }, ...chats]);
      setQuestion("");
    } catch {
      alert("Bot request failed.");
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 border px-3 py-2"
        />
        <button type="submit" className="bg-blue-700 text-white px-4 py-2 rounded">Ask</button>
      </form>

      <div className="space-y-4">
        <h3 className="text-lg font-bold">Your Conversations</h3>
        {chats.map((chat, idx) => (
          <div key={idx} className="border p-3 rounded">
            <p><strong>You:</strong> {chat.question}</p>
            <p><strong>Bot:</strong> {chat.answer}</p>
            {chat.intent && <p className="text-sm text-gray-500">Intent: {chat.intent}</p>}
            {chat.created_at && <p className="text-sm text-gray-500">Time: {new Date(chat.created_at).toLocaleString()}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatInterface;
