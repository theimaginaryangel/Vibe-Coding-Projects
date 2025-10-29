
import React, { useState } from 'react';
import { TONE_OPTIONS, FORMAT_OPTIONS } from '../constants';
import type { PromptGenerationParams } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

interface PromptFormProps {
  onSubmit: (params: PromptGenerationParams) => void;
  isLoading: boolean;
}

const Label: React.FC<{ htmlFor: string; children: React.ReactNode; description: string; }> = ({ htmlFor, children, description }) => (
    <div>
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {children}
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
    </div>
);


export const PromptForm: React.FC<PromptFormProps> = ({ onSubmit, isLoading }) => {
  const [userInput, setUserInput] = useState('');
  const [context, setContext] = useState('');
  const [tone, setTone] = useState(TONE_OPTIONS[0]);
  const [format, setFormat] = useState(FORMAT_OPTIONS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ userInput, context, tone, format });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Craft Your Prompt Request</h2>
      
      <div className="space-y-2">
        <Label htmlFor="userInput" description="Describe what you want the AI to do (e.g., 'write a poem about space').">
            Your Goal
        </Label>
        <textarea
          id="userInput"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="e.g., Generate a marketing slogan for a new coffee brand"
          className="w-full h-32 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="context" description="Provide any relevant background, keywords, or examples.">
            Additional Context (Optional)
        </Label>
        <textarea
          id="context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g., The brand is eco-friendly and targets young professionals."
          className="w-full h-24 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="tone" description="Select the desired tone for the AI's final response.">
            Response Tone
          </Label>
          <select
            id="tone"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
          >
            {TONE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="format" description="Select the desired output format for the AI's final response.">
            Response Format
          </Label>
          <select
            id="format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
          >
            {FORMAT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <button
          type="submit"
          disabled={isLoading || !userInput.trim()}
          className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800 transition-colors duration-200"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5 mr-2" />
              Generate Prompt
            </>
          )}
        </button>
      </div>
    </form>
  );
};
