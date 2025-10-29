
import React, { useState, useEffect } from 'react';
import { TONE_OPTIONS, FORMAT_OPTIONS } from '../constants';
import type { PromptGenerationParams } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { UploadIcon } from './icons/UploadIcon';
import { CloseIcon } from './icons/CloseIcon';
import { LinkIcon } from './icons/LinkIcon';

interface PromptFormProps {
  onSubmit: (params: PromptGenerationParams) => void;
  isLoading: boolean;
  initialData: PromptGenerationParams | null;
}

const Label: React.FC<{ htmlFor: string; children: React.ReactNode; description: React.ReactNode; }> = ({ htmlFor, children, description }) => (
    <div>
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {children}
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
    </div>
);


export const PromptForm: React.FC<PromptFormProps> = ({ onSubmit, isLoading, initialData }) => {
  const [userInput, setUserInput] = useState('');
  const [context, setContext] = useState('');
  const [tone, setTone] = useState(TONE_OPTIONS[0]);
  const [format, setFormat] = useState(FORMAT_OPTIONS[0]);
  const [enableRegexGrounding, setEnableRegexGrounding] = useState(false);
  const [regexPattern, setRegexPattern] = useState('');
  
  const [file, setFile] = useState<{ name: string; type: string; content: string; } | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [historyFileInfo, setHistoryFileInfo] = useState<{ name: string; type: string; } | null>(null);

  useEffect(() => {
    if (initialData) {
      setUserInput(initialData.userInput);
      setContext(initialData.context);
      setTone(initialData.tone);
      setFormat(initialData.format);
      setEnableRegexGrounding(initialData.enableRegexGrounding || false);
      setRegexPattern(initialData.regexPattern || '');
      setLinkUrl(initialData.linkUrl || '');
      setFile(null); // Always clear file content on load from history
      setHistoryFileInfo(initialData.fileInfo || null);
    }
  }, [initialData]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
        setFile({
            name: selectedFile.name,
            type: selectedFile.type,
            content: loadEvent.target?.result as string,
        });
        setLinkUrl('');
        setHistoryFileInfo(null);
    };
    reader.onerror = () => {
        console.error("Failed to read file");
    };

    if (selectedFile.type.startsWith('image/')) {
        reader.readAsDataURL(selectedFile);
    } else {
        reader.readAsText(selectedFile);
    }
  };
  
  const removeFile = () => {
    setFile(null);
    setHistoryFileInfo(null);
    // Also clear the file input element
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
  }
  
  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLinkUrl(e.target.value);
    removeFile();
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ userInput, context, tone, format, enableRegexGrounding, regexPattern, file, linkUrl });
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
          className="w-full h-32 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-150"
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
          className="w-full h-24 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-150"
        />
      </div>
      
       <div className="space-y-4">
        <Label htmlFor="attachments" description="Optionally provide a file or a public URL for additional context.">
            Attachments (Optional)
        </Label>
        
        {file ? (
            <div className="flex items-center justify-between p-2.5 bg-brand-secondary dark:bg-brand-primary/20 rounded-lg text-sm">
                <p className="font-medium text-brand-primary dark:text-brand-accent truncate">{file.name}</p>
                <button type="button" onClick={removeFile} className="ml-2 p-1 rounded-full hover:bg-green-200 dark:hover:bg-brand-primary/40">
                    <CloseIcon className="w-4 h-4 text-brand-primary dark:text-brand-accent" />
                </button>
            </div>
        ) : historyFileInfo ? (
            <div className="p-2.5 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
              File from history: <span className="font-medium">{historyFileInfo.name}</span>. Please re-upload to use.
            </div>
        ) : (
            <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-brand-primary dark:hover:border-brand-accent transition-colors">
                <input type="file" id="file-upload" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={!!linkUrl} accept="image/*,text/plain,.md,.csv,.json,.html,.css,.js,.ts"/>
                <div className="flex flex-col items-center justify-center space-y-2 text-gray-500 dark:text-gray-400">
                    <UploadIcon className="w-8 h-8"/>
                    <p>
                        <span className="font-semibold text-brand-primary dark:text-brand-accent">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs">Image or text files</p>
                </div>
            </div>
        )}

        <div className="relative flex items-center">
            <LinkIcon className="absolute left-3 w-5 h-5 text-gray-400 dark:text-gray-500"/>
            <input
                type="url"
                placeholder="Or paste a public URL"
                value={linkUrl}
                onChange={handleLinkChange}
                disabled={!!file || !!historyFileInfo}
                className="w-full p-2 pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-150 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
            />
        </div>
      </div>


      <div className="space-y-4 p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
            <input 
                type="checkbox" 
                id="enableRegexGrounding" 
                checked={enableRegexGrounding}
                onChange={(e) => setEnableRegexGrounding(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-brand-primary focus:ring-brand-primary bg-gray-50 dark:bg-gray-700"
            />
            <label htmlFor="enableRegexGrounding" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Regex Pattern Grounding
            </label>
        </div>
        {enableRegexGrounding && (
            <div className="space-y-2 pt-2">
                <Label 
                    htmlFor="regexPattern" 
                    description={
                        <>
                            Extract text from search results. E.g., find all prices with{' '}
                            <code className="text-xs bg-gray-200 dark:bg-gray-600 p-0.5 rounded-sm font-mono">
                                \$\d+(\.\d{2})?
                            </code>
                        </>
                    }
                >
                    Regex Pattern
                </Label>
                <input
                    type="text"
                    id="regexPattern"
                    value={regexPattern}
                    onChange={(e) => setRegexPattern(e.target.value)}
                    placeholder="e.g., to find US phone numbers: \(\d{3}\) \d{3}-\d{4}"
                    className="w-full p-2 font-mono text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-150"
                />
            </div>
        )}
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
            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-150"
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
            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-150"
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
          className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-brand-primary hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-gray-400 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800 transition-colors duration-200"
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