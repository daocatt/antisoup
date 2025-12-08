import { GoogleGenAI, Type } from "@google/genai";

// 初始化 Gemini 客户端
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface GeneratedBattleContent {
  soup: string;
  anti: string;
}

export const generateBattleContent = async (topic: string): Promise<GeneratedBattleContent> => {
  try {
    const prompt = `
      Create a pair of short quotes about the topic: "${topic}".
      
      1. "Soup": An overly optimistic, cliché, motivational "Chicken Soup for the Soul" style quote. It should sound sweet but potentially unrealistic.
      2. "Anti": A cynical, realistic, perhaps slightly dark or funny counter-argument ("Anti-Chicken Soup") that breaks the illusion of the first quote.

      Return the result in JSON format with keys "soup" and "anti". The language MUST be Simplified Chinese (zh-CN).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            soup: { type: Type.STRING, description: "The motivational quote" },
            anti: { type: Type.STRING, description: "The cynical counter-quote" }
          },
          required: ["soup", "anti"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    const data = JSON.parse(text) as GeneratedBattleContent;
    return data;

  } catch (error) {
    console.error("Error generating battle content:", error);
    // Fallback in case of API error
    return {
      soup: "只要努力，梦想就会开花！",
      anti: "努力不一定成功，但不努力真的很舒服。"
    };
  }
};