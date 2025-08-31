
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

interface HeaderProps {
    isTtsEnabled: boolean;
    onToggleTts: () => void;
}


export const Header: React.FC<HeaderProps> = ({ isTtsEnabled, onToggleTts }) => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm p-4 border-b border-slate-700/50 flex items-center justify-between shadow-md z-10">
      <div className="flex items-center space-x-4">
        <BotAvatar />
        <div>
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500">BFF Bot</h1>
          <p className="text-sm text-slate-400">Your AI Best Friend</p>
        </div>
      </div>
      <button
        onClick={onToggleTts}
        aria-label={isTtsEnabled ? 'Disable text-to-speech' : 'Enable text-to-speech'}
        aria-checked={isTtsEnabled}
        role="switch"
        className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        {isTtsEnabled ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l2 2" />
          </svg>
        )}
      </button>
    </header>
  );
};
