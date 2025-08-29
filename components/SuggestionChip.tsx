
import React from 'react';

interface SuggestionChipProps {
  text: string;
  onClick: (text: string) => void;
}

export const SuggestionChip: React.FC<SuggestionChipProps> = ({ text, onClick }) => {
  return (
    <button
      onClick={() => onClick(text)}
      className="bg-slate-800 text-slate-300 text-sm px-4 py-2 rounded-full border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-colors duration-200"
    >
      {text}
    </button>
  );
};
