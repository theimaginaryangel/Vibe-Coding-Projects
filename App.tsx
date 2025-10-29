
import React, { useState, useCallback } from 'react';
import { PromptForm } from './components/PromptForm';
import { GeneratedPrompt } from './components/GeneratedPrompt';
import { Header } from './components/Header';
import { generatePromptWithGrounding } from './services/geminiService';
import type { GroundingChunk } from './types';
import type { PromptGenerationParams } from './types';

const App: React.FC = () => {
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [groundingSources, setGroundingSources] = useState<GroundingChunk[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePrompt = useCallback(async (params: PromptGenerationParams) => {
    setIsLoading(true);
    setError(null);
    setGeneratedPrompt('');
    setGroundingSources([]);

    try {
      const result = await generatePromptWithGrounding(params);
      if (result) {
        setGeneratedPrompt(result.prompt);
        setGroundingSources(result.sources);
      } else {
        setError('Failed to generate prompt. The result was empty.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Error: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <PromptForm onSubmit={handleGeneratePrompt} isLoading={isLoading} />
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <GeneratedPrompt
              prompt={generatedPrompt}
              sources={groundingSources}
              isLoading={isLoading}
              error={error}
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
