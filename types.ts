
export interface PromptGenerationParams {
  userInput: string;
  context: string;
  tone: string;
  format:string;
  enableRegexGrounding: boolean;
  regexPattern: string;
  // For active generation
  file?: {
    name: string;
    type: string;
    content: string; // Can be base64 data URL or text content
  };
  linkUrl?: string;
  // For history display only
  fileInfo?: {
    name: string;
    type: string;
  }
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
  };
}

export interface HistoryItem {
  id: string;
  // Note: 'file' property with content should be stripped before saving
  params: PromptGenerationParams;
  result: {
    prompt: string;
    sources: GroundingChunk[];
    regexMatches?: string[];
  };
  timestamp: number;
}


export type ChatMode = 'standard' | 'fast' | 'web' | 'deep-thought';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: GroundingChunk[];
  isLoading?: boolean;
  error?: string;
}
