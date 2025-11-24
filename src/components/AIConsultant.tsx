import React, { useState, useEffect } from 'react';

interface AIConsultantProps {
  onSearch: (prompt: string) => void;
  isLoading: boolean;
  onClear: () => void;
  hasResults: boolean;
  resetSignal: number; // Incrementing number to trigger a reset
}

export const AIConsultant: React.FC<AIConsultantProps> = ({ onSearch, isLoading, onClear, hasResults, resetSignal }) => {
  const [input, setInput] = useState('');

  // Listen for external global reset signal
  useEffect(() => {
    if (resetSignal > 0) {
      setInput('');
    }
  }, [resetSignal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input);
    }
  };

  const handleClearInput = () => {
    setInput('');
    // If we have active results, clearing the input should also clear the AI filter
    if (hasResults) {
        onClear();
    }
  };

  return (
    <div className="bg-gradient-to-br from-teal-800 to-teal-900 rounded-2xl p-6 md:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-teal-500 opacity-20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-emerald-500 opacity-20 blur-3xl"></div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-serif font-medium mb-3">
          Not sure which island to pick?
        </h2>
        <p className="text-teal-100 mb-6 text-sm md:text-base">
          Describe your dream trip (e.g., "I want to see sharks but stay on a quiet island with lots of trees") and we'll give island suggestions.
        </p>
        
        <form onSubmit={handleSubmit} className="relative max-w-xl mx-auto">
          <div className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your ideal Maldives vacation..."
              className="w-full py-4 pl-6 pr-[150px] rounded-full bg-white text-gray-800 focus:outline-none focus:ring-4 focus:ring-teal-500/50 shadow-lg placeholder:text-gray-400"
            />
            
            <div className="absolute right-2 top-2 bottom-2 flex items-center gap-2">
                {/* Clear X Button - Visible when there is text or results */}
                {(input.length > 0 || hasResults) && (
                    <button
                        type="button"
                        onClick={handleClearInput}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        title="Clear search"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="h-full px-5 rounded-full bg-teal-600 hover:bg-teal-500 text-white font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                >
                {isLoading ? (
                    <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Thinking...
                    </>
                ) : (
                    <>
                    <span>Find an island</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    </>
                )}
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
