import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Generates a meme image by modifying an existing image with a text prompt.
 * Uses the 'gemini-2.5-flash-image' model.
 * @param base64Image The base64 encoded string of the source image (without data URI prefix).
 * @param mimeType The MIME type of the source image.
 * @param prompt The text prompt describing the desired expression.
 * @returns A promise that resolves to the base64 string of the generated image.
 */
export const generateMemeImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: `將圖片中人物的表情修改為：${prompt}。請保留原始照片的背景和風格，只改變面部表情。`,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }

    // Fallback error if no image part is found
    throw new Error('API 回應中未包含圖片。');

  } catch (error) {
    console.error("Gemini API call failed:", error);
    // Re-throw a more user-friendly error
    throw new Error(`生成 "${prompt}" 表情圖片失敗，請重試。`);
  }
};