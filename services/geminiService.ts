import { GoogleGenAI } from "@google/genai";

// Helper to convert URL to Base64 string (without data:image/... prefix for pure base64 needs, or with it)
export const urlToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data:image/png;base64, prefix if present for the API parts
        const base64Content = base64String.split(',')[1];
        resolve(base64Content);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting URL to base64:", error);
    throw new Error("无法加载图片，请检查网络或图片跨域设置。");
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(base64String.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Using Gemini 2.5 Flash Image (Nano Banana)
const MODEL_NAME = 'gemini-2.5-flash-image';

export const generateClothingImage = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const finalPrompt = `Design a piece of clothing: ${prompt}. The image should be a high-quality, flat-lay product shot on a clean white background.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: finalPrompt,
  });

  // Iterate through parts to find the image
  if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
  }
  
  throw new Error("未生成有效的图片数据。");
};

export const generateTryOn = async (personUrl: string, clothUrl: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const personBase64 = await urlToBase64(personUrl);
  const clothBase64 = await urlToBase64(clothUrl);

  const prompt = "Generate a high-quality, photorealistic full-body photo of the person in the first image wearing the clothing from the second image. Maintain the person's identity, facial features, pose, and body shape exactly. Ensure the clothing fits naturally with realistic lighting and shadows. The background should remain simple.";

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: personBase64
          }
        },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: clothBase64
          }
        },
        {
          text: prompt
        }
      ]
    }
  });

  if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
         return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error("生成失败，请重试。");
};