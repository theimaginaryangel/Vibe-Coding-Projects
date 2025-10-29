
import React, { useState, useEffect } from 'react';
import type { GroundingChunk } from '../types';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { LinkIcon } from './icons/LinkIcon';

interface GeneratedPromptProps {
  prompt: string;
  sources: GroundingChunk[];
  isLoading: boolean;
  error: string | null;
}

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mt-4"></div>
    </div>
);


export const GeneratedPrompt: React.FC<GeneratedPromptProps> = ({ prompt, sources, isLoading, error }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (prompt) {
      setCopied(false);
    }
  }, [prompt]);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSkeleton />;
    }
    if (error) {
      return (
        <div className="text-red-500 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg">
          <p className="font-semibold">Generation Failed</p>
          <p>{error}</p>
        </div>
      );
    }
    if (!prompt) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="font-semibold">Your generated prompt will appear here.</p>
          <p>Fill out the form and click "Generate Prompt" to start.</p>
        </div>
      );
    }
    return (
      <>
        <div className="relative p-4 bg-blue-50 dark:bg-gray-900/50 border border-blue-200 dark:border-gray-700 rounded-lg">
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            aria-label="Copy prompt"
          >
            {copied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
          </button>
          <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200 text-base leading-relaxed">
            {prompt}
          </pre>
        </div>

        {sources.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <LinkIcon className="w-4 h-4 mr-2" />
              Grounding Sources
            </h3>
            <ul className="space-y-2">
              {sources.map((source, index) => {
                const webSource = source.web;
                if (!webSource) return null;
                return (
                    <li key={index}>
                        <a 
                            href={webSource.uri} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 dark:text-blue-400 hover:underline text-sm break-all"
                        >
                            {webSource.title || webSource.uri}
                        </a>
                    </li>
                );
              })}
            </ul>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Generated Prompt</h2>
        <div className="flex-grow">
            {renderContent()}
        </div>
    </div>
  );
};
