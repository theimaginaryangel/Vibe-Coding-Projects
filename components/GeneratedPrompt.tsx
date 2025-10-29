
import React, { useState, useEffect } from 'react';
import type { GroundingChunk, PromptGenerationParams } from '../types';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { LinkIcon } from './icons/LinkIcon';
import { RegexIcon } from './icons/RegexIcon';
import { ExportIcon } from './icons/ExportIcon';

interface GeneratedPromptProps {
  prompt: string;
  sources: GroundingChunk[];
  regexMatches: string[];
  isLoading: boolean;
  error: string | null;
  params: PromptGenerationParams | null;
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


export const GeneratedPrompt: React.FC<GeneratedPromptProps> = ({ prompt, sources, regexMatches, isLoading, error, params }) => {
  const [copied, setCopied] = useState(false);
  const [exported, setExported] = useState(false);

  useEffect(() => {
    if (prompt) {
      setCopied(false);
      setExported(false);
    }
  }, [prompt]);
  
  const handleCopy = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!prompt || !params) return;

    const exportData = {
      parameters: params,
      result: {
        prompt,
        sources,
        regexMatches,
      },
      exportedAt: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSkeleton />;
    }
    if (error) {
      let title = 'Generation Failed';
      let message = error;
      
      const match = error.match(/^\[(.*?)\]\s*(.*)$/);
      if (match) {
        title = match[1]; // e.g., "API Key Error"
        message = match[2]; // The rest of the message
      }

      return (
        <div className="text-red-500 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg">
          <p className="font-semibold">{title}</p>
          <p>{message}</p>
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
        <div className="relative p-4 bg-brand-secondary dark:bg-brand-primary/10 border border-green-200 dark:border-gray-700 rounded-lg">
          <div className="absolute top-2 right-2 flex space-x-2">
            <button
              onClick={handleExport}
              className="p-2 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label={exported ? "Exported!" : "Export prompt as JSON"}
              disabled={!params}
            >
              {exported ? <CheckIcon className="w-5 h-5 text-green-500" /> : <ExportIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
            </button>
            <button
              onClick={handleCopy}
              className="p-2 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="Copy prompt"
            >
              {copied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
            </button>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200 text-base leading-relaxed">
            {prompt}
          </pre>
        </div>

        {regexMatches.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <RegexIcon className="w-4 h-4 mr-2" />
              Regex Matches
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border dark:border-gray-700">
              {regexMatches.map((match, index) => (
                  <li key={index} className="font-mono break-all">
                      {match}
                  </li>
              ))}
            </ul>
          </div>
        )}

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
                            className="text-brand-primary dark:text-brand-accent hover:underline text-sm break-all"
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
        <div className="flex-grow overflow-y-auto">
            {renderContent()}
        </div>
    </div>
  );
};