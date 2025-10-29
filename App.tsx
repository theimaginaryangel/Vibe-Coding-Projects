
import React, { useState, useCallback, useEffect } from 'react';
import { PromptForm } from './components/PromptForm';
import { GeneratedPrompt } from './components/GeneratedPrompt';
import { Header } from './components/Header';
import { HistoryPanel } from './components/HistoryPanel';
import { generatePromptWithGrounding } from './services/geminiService';
import type { GroundingChunk, HistoryItem, PromptGenerationParams } from './types';
import { ChatBot } from './components/ChatBot';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { ChatBotIcon } from './components/icons/ChatBotIcon';
import { ChevronRightIcon } from './components/icons/ChevronRightIcon';

type ActiveView = 'home' | 'promptEngineer' | 'chat';

const HomeView: React.FC<{ onSelectView: (view: ActiveView) => void }> = ({ onSelectView }) => (
  <div className="flex flex-col items-center justify-center h-full text-center">
    <div className="max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white">Welcome to Benny's AI Suite</h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
        Powerful tools to enhance your interaction with generative AI. Choose an option below to get started.
      </p>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <button onClick={() => onSelectView('promptEngineer')} className="group text-left p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:border-brand-primary dark:hover:border-brand-primary hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <SparklesIcon className="w-10 h-10 mb-4 text-brand-primary" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">AI Prompt Engineer</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Craft, refine, and test detailed prompts with web grounding, file analysis, and other advanced tools.</p>
           <div className="mt-6 font-semibold text-brand-primary dark:text-brand-accent flex items-center group-hover:underline">
            Launch Tool <ChevronRightIcon className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </button>
        <button onClick={() => onSelectView('chat')} className="group text-left p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:border-brand-primary dark:hover:border-brand-primary hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <ChatBotIcon className="w-10 h-10 mb-4 text-brand-primary" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">AI Assistant</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Have a dynamic conversation with a powerful AI. Get quick answers, brainstorm ideas, or dive deep into complex topics.</p>
          <div className="mt-6 font-semibold text-brand-primary dark:text-brand-accent flex items-center group-hover:underline">
            Start Chatting <ChevronRightIcon className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </button>
      </div>
    </div>
  </div>
);


const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('home');
  
  // State for Prompt Engineer
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
    setSelectedHistoryParams(null);
    setCurrentParams(null);

    try {
      const result = await generatePromptWithGrounding(params);
      if (result) {
        setGeneratedPrompt(result.prompt);
        setGroundingSources(result.sources);
        setRegexMatches(result.regexMatches || []);

        const paramsForHistory = { ...params };
        delete paramsForHistory.file; 

        const newHistoryItem: HistoryItem = {
          id: `id-${Date.now()}`,
          params: {
            ...paramsForHistory,
            fileInfo: params.file ? { name: params.file.name, type: params.file.type } : undefined,
          },
          result: { 
            prompt: result.prompt, 
            sources: result.sources,
            regexMatches: result.regexMatches,
          },
          timestamp: Date.now(),
        };

        setCurrentParams(newHistoryItem.params);

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
    setCurrentParams(item.params);
    setError(null);
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

  const renderActiveView = () => {
    switch (activeView) {
      case 'promptEngineer':
        return (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4 lg:col-span-3">
              <HistoryPanel 
                history={history}
                onSelectItem={handleSelectHistoryItem}
                onClearHistory={handleClearHistory}
              />
            </div>
            <div className="md:col-span-8 lg:col-span-5 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <PromptForm 
                  onSubmit={handleGeneratePrompt} 
                  isLoading={isLoading} 
                  initialData={selectedHistoryParams} 
              />
            </div>
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
        );
      case 'chat':
        return (
           <div className="h-[calc(100vh-180px)] md:h-[calc(100vh-160px)]">
             <ChatBot />
           </div>
        );
      case 'home':
      default:
        return <HomeView onSelectView={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-light dark:bg-brand-dark text-gray-900 dark:text-gray-100 font-sans">
      <Header activeView={activeView} onNavigateHome={() => setActiveView('home')} />
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        {renderActiveView()}
      </main>
      <footer className="text-center p-4 mt-auto text-gray-500 dark:text-gray-400 text-sm">
        <p>Powered by Google Gemini. Built for brilliant prompts.</p>
      </footer>
    </div>
  );
};

export default App;