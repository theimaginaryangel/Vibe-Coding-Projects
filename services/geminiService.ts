import { GoogleGenAI, Chat } from "@google/genai";
import type { PromptGenerationParams, GroundingChunk, ChatMode, ChatMessage } from '../types';

// Lazily initialize the AI client to avoid script-blocking errors on load
// if the API key is not yet available.
let aiInstance: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (aiInstance) {
    return aiInstance;
  }

  if (!process.env.API_KEY) {
    // Throw an error that will be caught by the calling function's error handler.
    // This allows the UI to load and display a meaningful error message upon user interaction.
    throw new Error("[Configuration Error] The API_KEY environment variable is not set. The application cannot connect to the AI service.");
  }

  aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return aiInstance;
}

// --- PROMPT ENGINEERING SERVICE ---

export async function generatePromptWithGrounding(params: PromptGenerationParams): Promise<{ prompt: string; sources: GroundingChunk[]; regexMatches: string[] }> {
  const { userInput, context, tone, format, enableRegexGrounding, regexPattern, file, linkUrl } = params;

  if (!userInput.trim()) {
    throw new Error("[Invalid Input] The 'Your Goal' field cannot be empty. Please describe what you want the AI to do.");
  }

  if (enableRegexGrounding && regexPattern) {
    try {
        new RegExp(regexPattern);
    } catch (e) {
        throw new Error("[Invalid Input] The provided Regex Pattern is invalid. Please check its syntax.");
    }
  }

  let metaPrompt = `
    As an expert prompt engineer, your task is to create a clear, concise, and highly effective prompt for a generative AI model. 
    Use the latest information from the web to ensure the prompt is up-to-date and contextually relevant.

    **User's Goal:**
    ${userInput}

    **Additional Context:**
    ${context || "None provided."}

    **Desired Tone for AI Response:**
    ${tone}

    **Desired Output Format for AI Response:**
    ${format}
  `;
  
  if (file && !file.type.startsWith('image/')) {
    metaPrompt += `\n\n**Attached File Content (${file.name}):**\n${file.content}`;
  }

  if (linkUrl) {
    metaPrompt += `\n\n**Referenced Public Link:**\n${linkUrl}`;
  }


  if (enableRegexGrounding && regexPattern) {
    metaPrompt += `
    **Regex Grounding Task:**
    In addition to the main goal, you MUST perform the following task: Search through the content of the web search results for any text that matches this regular expression: \`${regexPattern}\`.

    **Mandatory Output Structure:**
    Your entire response MUST follow this exact two-part structure, separated by a unique delimiter line "---PROMPT-SEPARATOR---".

    Part 1 (before the separator): List every unique text snippet that matched the regex. Each match should be on a new line. If you find no matches, you MUST write the exact phrase "No matches found.".

    Part 2 (after the separator): Write the final, optimized prompt based on the user's goal and all context, including any insights gained from the regex matches. The prompt should be self-contained and ready to be used. It must clearly define the AI's role, the specific task, any constraints, and the expected format.
    `;
  } else {
    metaPrompt += `
    Based on this information, generate an optimized prompt. The prompt should be self-contained and ready to be used. It must clearly define the AI's role, the specific task, any constraints, the expected format, and provide examples if it would improve clarity.
    `;
  }


  try {
    let requestContents: any;
    if (file && file.type.startsWith('image/')) {
      const [mimeTypePart, base64Data] = file.content.split(';base64,');
      const mimeType = mimeTypePart.split(':')[1];
      
      requestContents = {
        parts: [
            { text: metaPrompt },
            {
                inlineData: {
                    mimeType,
                    data: base64Data,
                },
            },
        ],
      };
    } else {
        requestContents = metaPrompt;
    }
    
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: requestContents,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const generatedText = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources = groundingChunks.filter((chunk: unknown) => {
        const c = chunk as GroundingChunk;
        return (c.web && c.web.uri) || (c.maps && c.maps.uri);
    }) as GroundingChunk[];
    
    let prompt = generatedText.trim();
    let regexMatches: string[] = [];

    if (enableRegexGrounding && regexPattern) {
      const separator = '---PROMPT-SEPARATOR---';
      if (generatedText.includes(separator)) {
        const parts = generatedText.split(separator);
        const matchesPart = parts[0].trim();
        prompt = parts[1]?.trim() || ''; 
    
        if (matchesPart && matchesPart.toLowerCase() !== 'no matches found.') {
          regexMatches = matchesPart.split('\n').map(s => s.trim()).filter(Boolean);
        }
      } else {
        console.warn("Model did not follow formatting instructions for regex grounding. Treating entire output as the prompt.");
        prompt = generatedText.trim();
      }
    }

    return {
      prompt,
      sources,
      regexMatches,
    };

  } catch (error) {
    console.error("Error generating prompt with Gemini:", error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            throw new Error("[API Key Error] Your API key is invalid. Please check your configuration and ensure it has the necessary permissions.");
        }
        if (error.message.toLowerCase().includes('failed to fetch')) {
            throw new Error("[Network Error] Could not connect to the Gemini API. Please check your internet connection and try again.");
        }
        if (error.message.includes('429')) { 
            throw new Error("[API Quota Exceeded] You have exceeded your request quota. Please check your Gemini API plan and billing details.");
        }
        if (error.message.match(/\[\d{3}\]/)) { 
            throw new Error(`[API Error] The model failed to generate a response. Details: ${error.message}`);
        }
        throw new Error(`[Service Error] An unexpected error occurred while communicating with the API: ${error.message}`);
    }
    throw new Error("[Unknown Error] An unexpected issue occurred. Please try again.");
  }
}


// --- CHATBOT SERVICE ---

const chatSessions = new Map<ChatMode, Chat>();

function getModelConfigForMode(mode: ChatMode) {
  switch (mode) {
    case 'fast':
      return { modelName: 'gemini-2.5-flash-lite', config: {} };
    case 'web':
      return { modelName: 'gemini-2.5-flash', config: { tools: [{ googleSearch: {} }] } };
    case 'deep-thought':
      return { modelName: 'gemini-2.5-pro', config: { thinkingConfig: { thinkingBudget: 32768 } } };
    case 'standard':
    default:
      return { modelName: 'gemini-2.5-flash', config: {} };
  }
}

function getChatSession(mode: ChatMode): Chat {
  if (chatSessions.has(mode)) {
    return chatSessions.get(mode)!;
  }
  
  const ai = getAiClient();
  const { modelName, config } = getModelConfigForMode(mode);
  
  const chat = ai.chats.create({
    model: modelName,
    config: config,
  });
  
  chatSessions.set(mode, chat);
  return chat;
}

export async function* sendMessageToBot(
  message: string,
  mode: ChatMode
): AsyncGenerator<{ textChunk?: string; sources?: GroundingChunk[]; error?: string }> {
  try {
    const chat = getChatSession(mode);
    const responseStream = await chat.sendMessageStream({ message });

    let finalSources: GroundingChunk[] = [];

    for await (const chunk of responseStream) {
      const textChunk = chunk.text;
      if (textChunk) {
        yield { textChunk };
      }
      
      const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = groundingChunks.filter((c: unknown) => {
        const chunkTyped = c as GroundingChunk;
        return (chunkTyped.web && chunkTyped.web.uri);
      }) as GroundingChunk[];
      
      if(sources.length > 0) {
        finalSources = sources;
      }
    }

    if (finalSources.length > 0) {
        yield { sources: finalSources };
    }

  } catch (error) {
     console.error("Error sending message to bot:", error);
    let errorMessage = "[Service Error] An unexpected error occurred while communicating with the API.";
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            errorMessage = "[API Key Error] Your API key is invalid. Please check your configuration.";
        } else if (error.message.toLowerCase().includes('failed to fetch')) {
            errorMessage = "[Network Error] Could not connect to the Gemini API.";
        } else if (error.message.includes('429')) { 
            errorMessage = "[API Quota Exceeded] You have exceeded your request quota.";
        } else if (error.message.match(/\[\d{3}\]/)) { 
            errorMessage = `[API Error] The model failed to generate a response. Details: ${error.message}`;
        } else {
             errorMessage = `[Service Error] An unexpected error occurred: ${error.message}`;
        }
    }
    yield { error: errorMessage };
  }
}