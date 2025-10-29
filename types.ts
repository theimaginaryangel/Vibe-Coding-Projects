
export interface PromptGenerationParams {
  userInput: string;
  context: string;
  tone: string;
  format: string;
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
