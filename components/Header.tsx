
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

export const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SparklesIcon className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Benny's AI Prompt Engineer
          </h1>
        </div>
        <p className="hidden md:block text-gray-500 dark:text-gray-400">
          Crafting perfect prompts with AI-powered assistance.
        </p>
      </div>
    </header>
  );
};
