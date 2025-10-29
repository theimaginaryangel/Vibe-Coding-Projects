
import React, { useState, useCallback, useEffect } from 'react';
import { PromptForm } from './components/PromptForm';
import { GeneratedPrompt } from './components/GeneratedPrompt';
import { Header } from './components/Header';
import { HistoryPanel } from './components/HistoryPanel';
import { generatePromptWithGrounding } from './services/geminiService';
import type { GroundingChunk, HistoryItem, PromptGenerationParams } from './types';

const App: React.FC = () => {
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [groundingSources, setGroundingSources] = useState<GroundingChunk[]>([]);
  const [regexMatches, setRegexMatches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedHistoryParams, setSelectedHistoryParams] = useState<PromptGenerationParams | null>(null);
  const [currentParams, setCurrentParams] = useState<PromptGenerationParams | null>(null);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('promptHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage", e);
      localStorage.removeItem('promptHistory');
    }
  }, []);

  const handleGeneratePrompt = useCallback(async (params: PromptGenerationParams) => {
    setIsLoading(true);
    setError(null);
    setGeneratedPrompt('');
    setGroundingSources([]);
    setRegexMatches([]);
    setSelectedHistoryParams(null); // Clear selection on new generation
    setCurrentParams(null);

    try {
      const result = await generatePromptWithGrounding(params);
      if (result) {
        setGeneratedPrompt(result.prompt);
        setGroundingSources(result.sources);
        setRegexMatches(result.regexMatches || []);

        // Prepare params for history: remove heavy file content
        const paramsForHistory = { ...params };
        delete paramsForHistory.file; 

        const newHistoryItem: HistoryItem = {
          id: `id-${Date.now()}`,
          params: {
            ...paramsForHistory,
            // Add lightweight file info if a file was used
            fileInfo: params.file ? { name: params.file.name, type: params.file.type } : undefined,
          },
          result: { 
            prompt: result.prompt, 
            sources: result.sources,
            regexMatches: result.regexMatches,
          },
          timestamp: Date.now(),
        };

        setCurrentParams(newHistoryItem.params); // Set current params for export

        setHistory(prevHistory => {
          const updatedHistory = [newHistoryItem, ...prevHistory];
          try {
            localStorage.setItem('promptHistory', JSON.stringify(updatedHistory));
          } catch (e) {
            console.error("Failed to save history to localStorage", e);
          }
          return updatedHistory;
        });

      } else {
        setError('[Service Error] Failed to generate prompt. The result was empty.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectHistoryItem = useCallback((item: HistoryItem) => {
    setGeneratedPrompt(item.result.prompt);
    setGroundingSources(item.result.sources);
    setRegexMatches(item.result.regexMatches || []);
    setSelectedHistoryParams(item.params);
    setCurrentParams(item.params); // Set current params for export
    setError(null); // Clear any previous error
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem('promptHistory');
    } catch (e) {
      console.error("Failed to clear history from localStorage", e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* History Panel: Full width on mobile, 1/3 on tablet, 1/4 on desktop. */}
          <div className="md:col-span-4 lg:col-span-3">
            <HistoryPanel 
              history={history}
              onSelectItem={handleSelectHistoryItem}
              onClearHistory={handleClearHistory}
            />
          </div>
          {/* Prompt Form: Full width on mobile, 2/3 on tablet, 5/12 on desktop. */}
          <div className="md:col-span-8 lg:col-span-5 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <PromptForm 
                onSubmit={handleGeneratePrompt} 
                isLoading={isLoading} 
                initialData={selectedHistoryParams} 
            />
          </div>
          {/* Generated Prompt: Full width on mobile, full-width (on new row) on tablet, 1/3 on desktop. */}
          <div className="md:col-span-12 lg:col-span-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <GeneratedPrompt
              prompt={generatedPrompt}
              sources={groundingSources}
              regexMatches={regexMatches}
              isLoading={isLoading}
              error={error}
              params={currentParams}
            />
          </div>
        </div>
      </main>
      <footer className="text-center p-4 mt-8 text-gray-500 dark:text-gray-400 text-sm">
        <p>Powered by Google Gemini. Built for brilliant prompts.</p>
      </footer>
    </div>
  );
};

export default App;
