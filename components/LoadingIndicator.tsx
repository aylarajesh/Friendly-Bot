
import React from 'react';

export const LoadingIndicator: React.FC = () => {
    return (
        <div className="px-4 py-3 rounded-2xl bg-slate-700 flex items-center space-x-2">
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
    );
};
