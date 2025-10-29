import React, { useState, useMemo } from 'react';
import type { HistoryItem } from '../types';
import { HistoryIcon } from './icons/HistoryIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SortAscIcon } from './icons/SortAscIcon';
import { SortDescIcon } from './icons/SortDescIcon';


interface HistoryPanelProps {
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

type SortKey = 'timestamp' | 'userInput';
type SortDirection = 'ascending' | 'descending';

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelectItem, onClearHistory }) => {
  const [sortKey, setSortKey] = useState<SortKey>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('descending');

  const sortedHistory = useMemo(() => {
    const sorted = [...history].sort((a, b) => {
      if (sortKey === 'userInput') {
        return a.params.userInput.localeCompare(b.params.userInput);
      }
      // Default to timestamp
      return a.timestamp - b.timestamp;
    });

    if (sortDirection === 'descending') {
      return sorted.reverse();
    }
    
    return sorted;
  }, [history, sortKey, sortDirection]);
  
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'ascending' ? 'descending' : 'ascending');
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col max-h-[80vh]">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
          <HistoryIcon className="w-6 h-6 mr-2" />
          History
        </h2>
        {history.length > 0 && (
          <button 
            onClick={onClearHistory} 
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            aria-label="Clear history"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {history.length > 0 && (
        <div className="flex items-center justify-between mb-4 gap-2">
            <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="text-sm p-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                aria-label="Sort by"
            >
                <option value="timestamp">Sort by Date</option>
                <option value="userInput">Sort by Goal</option>
            </select>
            <button
                onClick={toggleSortDirection}
                className="p-1.5 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label={`Sort ${sortDirection === 'ascending' ? 'descending' : 'ascending'}`}
            >
                {sortDirection === 'ascending' ? <SortAscIcon className="w-5 h-5" /> : <SortDescIcon className="w-5 h-5" />}
            </button>
        </div>
      )}

      <div className="flex-grow overflow-y-auto -mr-3 pr-3">
        {history.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 h-full flex items-center justify-center">
            <p>Your generated prompts will appear here.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {sortedHistory.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onSelectItem(item)}
                  className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <p className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">
                    {item.params.userInput}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};