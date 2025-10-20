import { GoogleGenAI, Modality, Part } from "@google/genai";

// FIX: Adhere to the API key guideline. The API key must be obtained exclusively from `process.env.API_KEY`.
// This also resolves the TypeScript error "Property 'env' does not exist on type 'ImportMeta'".
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface ImageData {
  data: string;
  mimeType: string;
}

/**
 * Generates a meme image by modifying an existing image with a text prompt.
 * Uses the 'gemini-2.5-flash-image' model.
 * @param base64Image The base64 encoded string of the source image (without data URI prefix).
 * @param mimeType The MIME type of the source image.
 * @param expressionPrompt The text prompt describing the desired expression.
 * @param backgroundPrompt The text prompt describing the desired background.
 * @param clothingPrompt The text prompt describing the desired clothing.
 * @param actionPrompt The text prompt describing the desired pose or action.
 * @param backgroundImage Optional image data for the background.
 * @param clothingImage Optional image data for the clothing.
 * @param enhanceConsistency A boolean to toggle stricter consistency prompts.
 * @returns A promise that resolves to the base64 string of the generated image.
 */
export const generateMemeImage = async (
  base64Image: string,
  mimeType: string,
  expressionPrompt: string,
  backgroundPrompt: string,
  clothingPrompt: string,
  actionPrompt: string,
  backgroundImage: ImageData | null,
  clothingImage: ImageData | null,
  enhanceConsistency: boolean
): Promise<string> => {
  try {
    const parts: Part[] = [
      { inlineData: { data: base64Image, mimeType: mimeType } },
    ];

    let textPrompt = `基於第一張圖片中的人物，將其表情修改為 "${expressionPrompt}"。`;

    if (actionPrompt) {
      textPrompt += ` 同時，將人物的姿勢修改為 "${actionPrompt}"。`;
    }

    if (backgroundImage) {
      parts.push({ inlineData: { data: backgroundImage.data, mimeType: backgroundImage.mimeType } });
      textPrompt += ` 接著，將背景替換為第二張圖片的內容。`;
      // Add a hint for natural interaction if the action prompt suggests it
      if (actionPrompt.includes('坐') || actionPrompt.includes('躺') || actionPrompt.includes('靠')) {
          textPrompt += ` 請確保人物與背景中的物體（例如沙發或椅子）能夠自然地互動。`;
      }
    } else if (backgroundPrompt) {
      textPrompt += ` 接著，將背景更換為 "${backgroundPrompt}"。`;
    }

    if (clothingImage) {
      parts.push({ inlineData: { data: clothingImage.data, mimeType: clothingImage.mimeType } });
      const imageIndexText = backgroundImage ? "第三張" : "第二張";
      textPrompt += ` 最後，將人物的服裝更換為${imageIndexText}圖片中的樣式。`;
    } else if (clothingPrompt) {
      textPrompt += ` 最後，將人物的服裝更換為 "${clothingPrompt}"。`;
    }

    if (enhanceConsistency) {
        textPrompt += ' 核心要求：生成圖片中的人物，其臉部結構、五官比例、髮型和膚色，都必須與第一張原始圖片中的人物嚴格保持一致。絕對不要改變人物的身份。';
    } else {
        textPrompt += ' 請務必保持原始人物的臉部特徵和身份不變，生成一張自然、無違和感的圖片。';
    }

    parts.push({ text: textPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
      },
      // FIX: The responseModalities for gemini-2.5-flash-image must be an array with a single Modality.IMAGE element.
      config: {
        responseModalities: [Modality.IMAGE],
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
    throw new Error(`生成 "${expressionPrompt}" 表情圖片失敗，請重試。`);
  }
};

/**
 * Restores an old photo by removing scratches, improving clarity, and colorizing if needed.
 * @param base64Image The base64 encoded string of the source image.
 * @param mimeType The MIME type of the source image.
 * @returns A promise that resolves to the base64 string of the restored image.
 */
export const restoreOldPhoto = async (
  base64Image: string,
  mimeType: string
): Promise<string> => {
  try {
    const textPrompt = "請修復這張老照片。移除照片上的刮痕、摺痕和瑕疵。提高清晰度、增強細節並校正顏色。如果原始照片是黑白的，請對其進行逼真的色彩化。請務必保持原始照片的構圖和人物身份不變。";

    const parts: Part[] = [
      { inlineData: { data: base64Image, mimeType: mimeType } },
      { text: textPrompt },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
      },
      // FIX: The responseModalities for gemini-2.5-flash-image must be an array with a single Modality.IMAGE element.
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }

    throw new Error('API 回應中未包含圖片。');

  } catch (error) {
    console.error("Gemini API call for photo restoration failed:", error);
    throw new Error('老照片修復失敗，請重試。');
  }
};
