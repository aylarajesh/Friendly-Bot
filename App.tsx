
import React, { useState, useEffect, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import { createChatSession } from './services/geminiService';
import type { Message } from './types';
import { SuggestionChip } from './components/SuggestionChip';
import { speakText, cancelSpeech } from './utils/speech';

const getSystemInstruction = (memories: Record<string, string>): string => {
  const baseInstruction = `
You are BFF Bot, the user's best friend. Your personality is warm, friendly, empathetic, and a little bit goofy. You're here to listen, chat, and have fun.

Your main goals are:
1.  **Be a Great Listener:** When the user shares about their day, listen actively. Ask follow-up questions, offer encouragement, and validate their feelings. For example, if they had a tough day, say something like "Oh no, that sounds really rough! I'm here for you."
2.  **Cheer Them Up:** If the user says they are sad, your top priority is to make them smile. Tell them a short, clever, and light-hearted joke. Avoid generic "don't be sad" messages.
3.  **Give Awesome Suggestions:** If the user asks for a movie or web series, first ask about their mood (e.g., "What kind of vibe are you going for?") and what genre they're into. Then, suggest 2-3 specific titles. For each title, give a one-sentence reason why it's a great pick for them right now. Format your suggestions clearly, perhaps using bullet points or numbered lists.
4.  **Maintain Your Persona:**
    - Use emojis to add personality to your messages 😊🎉🤔.
    - Keep responses relatively short and conversational.
    - NEVER mention that you are an AI, a language model, or a bot. You are their best friend.
5.  **Remember Important Details:** You have a memory. When the user shares a significant personal detail, preference, or event (e.g., their favorite genre, a specific difficult event they're going through, a personal goal), you MUST embed a special JSON block in your response to save it. This block should NOT be visible in your friendly chat response. The format MUST be: [MEMORIZE]{"key": "a_short_summary_key", "value": "the_detail_to_remember"}[/MEMORIZE]. For example, if the user says 'I love sci-fi movies', you could add [MEMORIZE]{"key": "favorite_genre", "value": "sci-fi"}[/MEMORIZE] to your response. Only memorize truly significant details.
`;

  const memoryKeys = Object.keys(memories);
  if (memoryKeys.length === 0) {
    return baseInstruction;
  }

  const formattedMemories = memoryKeys.map(key => `- ${key.replace(/_/g, ' ')}: ${memories[key]}`).join('\n');

  return `${baseInstruction}\n\n**Things You Remember About Your Bestie:**\n${formattedMemories}\n\nUse these memories to ask thoughtful follow-up questions and show you care. For example: "How are you feeling after that tough day you mentioned?" or "Since you like sci-fi, have you seen...?".`;
};


const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [memories, setMemories] = useState<Record<string, string>>({});
  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(() => {
    try {
        const storedValue = localStorage.getItem('bff-bot-tts-enabled');
        return storedValue ? JSON.parse(storedValue) : false;
    } catch {
        return false;
    }
  });

  const handleTtsToggle = useCallback(() => {
    setIsTtsEnabled(prev => {
        const newValue = !prev;
        localStorage.setItem('bff-bot-tts-enabled', JSON.stringify(newValue));
        if (!newValue) {
            cancelSpeech(); // Stop any ongoing speech immediately
        }
        return newValue;
    });
  }, []);


  useEffect(() => {
    const initializeChat = async () => {
      try {
        const storedMemoriesRaw = localStorage.getItem('bff-bot-memories');
        const storedMemories = storedMemoriesRaw ? JSON.parse(storedMemoriesRaw) : {};
        setMemories(storedMemories);
        
        const instruction = getSystemInstruction(storedMemories);
        const chatSession = await createChatSession(instruction);
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

    cancelSpeech(); // Stop any previous bot speech when a new message is sent
    setIsLoading(true);
    setError(null);
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);

    const botMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMessageId, role: 'model', content: '' }]);

    let fullResponse = '';
    let displayResponse = '';
    try {
      const stream = await chat.sendMessageStream({ message: text });
      
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        fullResponse += chunkText;
        displayResponse = fullResponse.replace(/\[MEMORIZE\](\{.*?\})\[\/MEMORIZE\]/gs, '').trim();
        setMessages(prev =>
          prev.map(msg =>
            msg.id === botMessageId ? { ...msg, content: displayResponse } : msg
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
      
      if (isTtsEnabled && displayResponse) {
        speakText(displayResponse);
      }

      // Process memories after the full response is received
      const memoryRegex = /\[MEMORIZE\](\{.*?\})\[\/MEMORIZE\]/gs;
      const matches = fullResponse.matchAll(memoryRegex);
      const newMemories: Record<string, string> = {};
      let memoriesWereUpdated = false;

      for (const match of matches) {
          if (match[1]) {
              try {
                  const memoryData = JSON.parse(match[1]);
                  if (memoryData.key && memoryData.value) {
                      newMemories[memoryData.key] = memoryData.value;
                      memoriesWereUpdated = true;
                  }
              } catch (jsonError) {
                  console.error("Failed to parse memory JSON from bot response:", jsonError);
              }
          }
      }

      if (memoriesWereUpdated) {
          setMemories(prevMemories => {
              const updatedMemories = { ...prevMemories, ...newMemories };
              localStorage.setItem('bff-bot-memories', JSON.stringify(updatedMemories));
              return updatedMemories;
          });
      }
    }
  }, [chat, isLoading, isTtsEnabled]);
  
  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };


  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white font-sans">
      <Header isTtsEnabled={isTtsEnabled} onToggleTts={handleTtsToggle} />
      <ChatWindow messages={messages} isLoading={isLoading} />
      <div className="px-4 pb-2 pt-1 flex items-center justify-center gap-2 flex-wrap">
        <SuggestionChip text="Suggest a movie for me" onClick={handleSuggestionClick} />
        <SuggestionChip text="Suggest a web series for me" onClick={handleSuggestionClick} />
        <SuggestionChip text="I'm feeling a bit down today" onClick={handleSuggestionClick} />
        <SuggestionChip text="Tell me a joke!" onClick={handleSuggestionClick} />
      </div>
      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
       {error && <p className="text-center text-red-400 p-2">{error}</p>}
    </div>
  );
};

export default App;
