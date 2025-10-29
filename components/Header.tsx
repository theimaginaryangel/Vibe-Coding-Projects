
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { HomeIcon } from './icons/HomeIcon';

type ActiveView = 'home' | 'promptEngineer' | 'chat';

interface HeaderProps {
    activeView: ActiveView;
    onNavigateHome: () => void;
}

const TITLES: Record<ActiveView, string> = {
    home: "Benny's AI Suite",
    promptEngineer: "AI Prompt Engineer",
    chat: "AI Assistant"
};


export const Header: React.FC<HeaderProps> = ({ activeView, onNavigateHome }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {activeView !== 'home' && (
             <button 
                onClick={onNavigateHome} 
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Back to Home"
            >
               <HomeIcon className="w-6 h-6" />
            </button>
          )}
          <SparklesIcon className="w-8 h-8 text-brand-primary" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {TITLES[activeView]}
          </h1>
        </div>
        <p className="hidden md:block text-gray-500 dark:text-gray-400">
          Crafting perfect prompts with AI-powered assistance.
        </p>
      </div>
    </header>
  );
};