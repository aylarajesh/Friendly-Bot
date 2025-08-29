
import React from 'react';

const BotAvatar: React.FC = () => (
    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8V4H8" />
            <rect x="4" y="12" width="16" height="8" rx="2" />
            <path d="M4.8 12h14.4" />
            <path d="M8 12v-2a2 2 0 1 1 4 0v2" />
        </svg>
    </div>
);

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm p-4 border-b border-slate-700/50 flex items-center space-x-4 shadow-md z-10">
        <BotAvatar />
      <div>
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500">BFF Bot</h1>
        <p className="text-sm text-slate-400">Your AI Best Friend</p>
      </div>
    </header>
  );
};
