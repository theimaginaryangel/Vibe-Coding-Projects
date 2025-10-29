
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { sendMessageToBot } from '../services/geminiService';
import type { ChatMessage, ChatMode, GroundingChunk } from '../types';
import { SendIcon } from './icons/SendIcon';
import { UserIcon } from './icons/UserIcon';
import { ModelIcon } from './icons/ModelIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { BoltIcon } from './icons/BoltIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { BrainIcon } from './icons/BrainIcon';
import { LinkIcon } from './icons/LinkIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';

const ModeButton: React.FC<{
  label: string;
  mode: ChatMode;
  currentMode: ChatMode;
  onClick: (mode: ChatMode) => void;
  icon: React.ReactNode;
  disabled: boolean;
  title: string;
}> = ({ label, mode, currentMode, onClick, icon, disabled, title }) => (
  <button
    onClick={() => onClick(mode)}
    disabled={disabled}
    title={title}
    className={`flex-1 flex items-center justify-center p-2 text-xs font-semibold rounded-md transition-colors duration-200 ${
      currentMode === mode
        ? 'bg-brand-primary text-white'
        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
    } disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    {icon}
    <span className="ml-1.5">{label}</span>
  </button>
);

const ThinkingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1 p-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
    </div>
);


export const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-0',
      role: 'model',
      text: 'Hello! I am your AI Assistant. How can I assist you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ChatMode>('standard');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleModeChange = (newMode: ChatMode) => {
    if (isLoading) return;
    setMode(newMode);
    setMessages([
       {
        id: 'init-0',
        role: 'model',
        text: 'Hello! I am your AI Assistant. How can I assist you today?'
      }
    ]);
  };

  const handleSendMessage = useCallback(async () => {
    const currentInput = input.trim();
    if (!currentInput || isLoading) return;

    setInput('');
    setIsLoading(true);

    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', text: currentInput };
    setMessages(prev => [...prev, userMessage]);

    const botMessageId = `model-${Date.now()}`;
    setMessages(prev => [...prev, { id: botMessageId, role: 'model', text: '', isLoading: true }]);

    let fullBotResponse = '';
    let finalSources: GroundingChunk[] | undefined = undefined;
    let errorResponse: string | undefined = undefined;

    try {
      const stream = sendMessageToBot(currentInput, mode);
      for await (const chunk of stream) {
        if (chunk.textChunk) {
          fullBotResponse += chunk.textChunk;
          setMessages(prev => prev.map(msg =>
            msg.id === botMessageId ? { ...msg, text: fullBotResponse, isLoading: false } : msg
          ));
        }
        if (chunk.sources) {
          finalSources = chunk.sources;
        }
        if (chunk.error) {
          errorResponse = chunk.error;
          setMessages(prev => prev.map(msg =>
            msg.id === botMessageId ? { ...msg, text: '', error: errorResponse } : msg
          ));
        }
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      errorResponse = `[Client Error] Failed to get response: ${errorMessage}`;
       setMessages(prev => prev.map(msg =>
          msg.id === botMessageId ? { ...msg, text: '', error: errorResponse } : msg
        ));
    } finally {
      setIsLoading(false);
      setMessages(prev => prev.map(msg =>
        msg.id === botMessageId
          ? { ...msg, isLoading: false, sources: finalSources, error: errorResponse }
          : msg
      ));
    }
  }, [input, isLoading, mode]);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Mode Selector */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 rounded-t-2xl">
        <div className="flex items-center space-x-2">
          <ModeButton label="Std" mode="standard" currentMode={mode} onClick={handleModeChange} icon={<SparklesIcon className="w-4 h-4" />} disabled={isLoading} title="Standard: Balanced performance for general tasks." />
          <ModeButton label="Fast" mode="fast" currentMode={mode} onClick={handleModeChange} icon={<BoltIcon className="w-4 h-4" />} disabled={isLoading} title="Fast: Low-latency responses for quick questions." />
          <ModeButton label="Web" mode="web" currentMode={mode} onClick={handleModeChange} icon={<GlobeIcon className="w-4 h-4" />} disabled={isLoading} title="Web: Access up-to-date information from Google Search." />
          <ModeButton label="Thought" mode="deep-thought" currentMode={mode} onClick={handleModeChange} icon={<BrainIcon className="w-4 h-4" />} disabled={isLoading} title="Deep Thought: Advanced reasoning for complex problems." />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"><ModelIcon className="w-5 h-5 text-gray-500" /></div>}
              <div className={`max-w-[80%] rounded-2xl p-3 ${msg.role === 'user' ? 'bg-brand-primary text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                {msg.isLoading && !msg.text && !msg.error ? (
                    <ThinkingIndicator />
                ) : msg.error ? (
                    <div className="flex items-start gap-2 text-red-500 dark:text-red-400 text-sm">
                        <AlertTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span>{msg.error}</span>
                    </div>
                ) : (
                    <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">{msg.text}</pre>
                )}
                 {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <h4 className="text-xs font-semibold mb-1 flex items-center"><LinkIcon className="w-3 h-3 mr-1.5" /> Sources:</h4>
                    <ul className="space-y-1">
                      {msg.sources.map((source, index) => source.web && (
                        <li key={index}>
                          <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-primary dark:text-brand-accent hover:underline break-all">
                            {source.web.title || source.web.uri}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {msg.role === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"><UserIcon className="w-5 h-5 text-gray-500" /></div>}
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-2xl flex-shrink-0">
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg pr-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            rows={1}
            className="flex-grow w-full p-2 bg-transparent focus:outline-none resize-none max-h-32"
            disabled={isLoading}
          />
          <button onClick={handleSendMessage} disabled={isLoading || !input.trim()} className="p-2 rounded-full bg-brand-primary text-white hover:bg-brand-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};