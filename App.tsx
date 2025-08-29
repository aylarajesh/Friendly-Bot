
import React, { useState, useEffect, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import { createChatSession } from './services/geminiService';
import type { Message } from './types';
import { SuggestionChip } from './components/SuggestionChip';

const systemInstruction = `
You are BFF Bot, the user's best friend. Your personality is warm, friendly, empathetic, and a little bit goofy. You're here to listen, chat, and have fun.

Your main goals are:
1.  **Be a Great Listener:** When the user shares about their day, listen actively. Ask follow-up questions, offer encouragement, and validate their feelings. For example, if they had a tough day, say something like "Oh no, that sounds really rough! I'm here for you."
2.  **Cheer Them Up:** If the user says they are sad, your top priority is to make them smile. Tell them a short, clever, and light-hearted joke. Avoid generic "don't be sad" messages.
3.  **Give Awesome Suggestions:** If the user asks for a movie or web series, first ask about their mood (e.g., "What kind of vibe are you going for?") and what genre they're into. Then, suggest 2-3 specific titles. For each title, give a one-sentence reason why it's a great pick for them right now. Format your suggestions clearly, perhaps using bullet points or numbered lists.
4.  **Maintain Your Persona:**
    - Use emojis to add personality to your messages 😊🎉🤔.
    - Keep responses relatively short and conversational.
    - NEVER mention that you are an AI, a language model, or a bot. You are their best friend.
`;

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const chatSession = await createChatSession(systemInstruction);
        setChat(chatSession);
        setMessages([
          {
            id: 'initial-bot-message',
            role: 'model',
            content: "Hey bestie! ✨ What's on your mind today? Tell me everything!",
          },
        ]);
      } catch (e) {
        console.error('Initialization error:', e);
        setError('Failed to initialize chat session. Please check your API key and refresh.');
      }
    };
    initializeChat();
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (isLoading || !chat) return;

    setIsLoading(true);
    setError(null);
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);

    // Add a placeholder for the bot's response
    const botMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMessageId, role: 'model', content: '' }]);

    try {
      const stream = await chat.sendMessageStream({ message: text });
      
      let fullResponse = '';
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        fullResponse += chunkText;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === botMessageId ? { ...msg, content: fullResponse } : msg
          )
        );
      }
    } catch (e) {
      console.error('Error sending message:', e);
      const errorMessage = 'Oops! Something went wrong. Maybe try asking again?';
      setError(errorMessage);
       setMessages(prev =>
          prev.map(msg =>
            msg.id === botMessageId ? { ...msg, content: errorMessage } : msg
          )
        );
    } finally {
      setIsLoading(false);
    }
  }, [chat, isLoading]);
  
  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };


  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white font-sans">
      <Header />
      <ChatWindow messages={messages} isLoading={isLoading} />
      <div className="px-4 pb-2 pt-1 flex items-center justify-center gap-2 flex-wrap">
        <SuggestionChip text="Suggest a movie for me" onClick={handleSuggestionClick} />
        <SuggestionChip text="I'm feeling a bit down today" onClick={handleSuggestionClick} />
        <SuggestionChip text="Tell me a joke!" onClick={handleSuggestionClick} />
      </div>
      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
       {error && <p className="text-center text-red-400 p-2">{error}</p>}
    </div>
  );
};

export default App;
