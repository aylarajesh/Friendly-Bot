
import React from 'react';

interface MessageProps {
  role: 'user' | 'model';
  content: string;
}

const BotAvatar: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white flex-shrink-0">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8V4H8" />
            <rect x="4" y="12" width="16" height="8" rx="2" />
            <path d="M4.8 12h14.4" />
            <path d="M8 12v-2a2 2 0 1 1 4 0v2" />
        </svg>
    </div>
);

export const Message: React.FC<MessageProps> = ({ role, content }) => {
  const isUser = role === 'user';

  const messageClasses = isUser
    ? 'bg-blue-600 rounded-br-none'
    : 'bg-slate-700 rounded-bl-none';

  const containerClasses = isUser
    ? 'flex justify-end items-end space-x-3'
    : 'flex justify-start items-end space-x-3';

  return (
    <div className={`mb-4 ${containerClasses}`}>
      {!isUser && <BotAvatar />}
      <div
        className={`px-4 py-3 rounded-2xl max-w-lg md:max-w-2xl text-white whitespace-pre-wrap ${messageClasses}`}
        style={{ overflowWrap: 'break-word' }}
      >
        {content}
      </div>
    </div>
  );
};
