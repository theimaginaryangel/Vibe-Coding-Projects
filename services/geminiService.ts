
import { GoogleGenAI } from "@google/genai";
import type { PromptGenerationParams, GroundingChunk } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generatePromptWithGrounding(params: PromptGenerationParams): Promise<{ prompt: string; sources: GroundingChunk[] }> {
  const { userInput, context, tone, format } = params;

  if (!userInput) {
    throw new Error("User input cannot be empty.");
  }

  // This is the "meta-prompt" that instructs the AI on how to behave.
  const metaPrompt = `
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

    Based on this information, generate an optimized prompt. The prompt should be self-contained and ready to be used. It must clearly define the AI's role, the specific task, any constraints, the expected format, and provide examples if it would improve clarity.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: metaPrompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const generatedText = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Filter out any empty chunks
    const sources = groundingChunks.filter((chunk: unknown) => {
        const c = chunk as GroundingChunk;
        return (c.web && c.web.uri) || (c.maps && c.maps.uri);
    }) as GroundingChunk[];

    return {
      prompt: generatedText.trim(),
      sources: sources,
    };
  } catch (error) {
    console.error("Error generating prompt with Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API call failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred during the Gemini API call.");
  }
}
