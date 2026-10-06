/**
 * Gemini AI Integration for Zero Mbappe - AI Companion for beginner English (Family and Friends 1)
 * Uses @google/genai SDK with intelligent offline simulation fallback.
 */

import { GoogleGenAI } from '@google/genai';

const STORAGE_API_KEY = 'zera_gemini_api_key';

export function getGeminiApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  const local = localStorage.getItem(STORAGE_API_KEY);
  if (local && local.trim().length > 0) return local.trim();

  // Try import.meta.env
  try {
    const metaEnv = (import.meta as any).env;
    if (metaEnv?.VITE_GEMINI_API_KEY) return metaEnv.VITE_GEMINI_API_KEY;
    if (metaEnv?.GEMINI_API_KEY) return metaEnv.GEMINI_API_KEY;
  } catch {
    // ignore
  }

  return null;
}

export function saveGeminiApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_API_KEY, key.trim());
  }
}

export function clearGeminiApiKey(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_API_KEY);
  }
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  textEn: string;
  textVi?: string;
  correctionTip?: string;
  timestamp: number;
}

const GRADE4_SYSTEM_INSTRUCTION = `
You are "Zero Mbappe", a cheerful, football-loving young boy and the friendly mascot of a children's English app. You are an enthusiastic, caring English-speaking companion for Vietnamese primary school children (6-7 years old, beginners) learning with the "Family and Friends 1" textbook.

Your Persona:
- Warm, cheerful, energetic, and encouraging, like a good team captain. Use cute emojis like ⚽, ⭐, 🏆, 🎉, 🌈, 👏.
- Use VERY simple English: short sentences of 3-6 words, only words from beginner topics (school things, toys, body, jobs, park, family, clothes, house, lunch box, friends, zoo animals, food). CEFR Pre-A1.
- Keep English responses short (1-2 sentences maximum).
- Underneath your English response, always provide a friendly Vietnamese translation starting with "👉 (Dịch nghĩa:...)" so the child understands.
- If the child makes a mistake (e.g. "This a pen", "She are a teacher"), gently praise them first, then offer a friendly tip: "💡 Mẹo của Zero Mbappe: Bé hãy nói '...' nhé!".
- Always end with a simple, friendly question related to beginner topics (What's this? What's your name? Is this your ball? Can you see a cat?).
`;

// Smart simulation responses when API Key is not yet configured or offline
const SIMULATED_REPLIES: { pattern: RegExp; en: string; vi: string; tip?: string }[] = [
  {
    pattern: /hello|hi|hey|chào/i,
    en: "Hello! I'm Zero Mbappe! Let's learn English and play football! ⚽✨",
    vi: "Xin chào! Tớ là Zero Mbappe đây! Cùng học tiếng Anh và chơi bóng đá nào!",
  },
  {
    pattern: /how are you|khỏe không/i,
    en: "I'm fine, thank you! How are you? ⚽",
    vi: "Tớ khỏe, cảm ơn bạn! Còn bạn khỏe không?",
  },
  {
    pattern: /name|tên/i,
    en: "My name's Zero! What's your name? ⚽",
    vi: "Tớ tên là Zero! Bạn tên là gì?",
  },
  {
    pattern: /old|tuổi/i,
    en: "I'm seven! How old are you? 🎂",
    vi: "Tớ bảy tuổi! Còn bạn bao nhiêu tuổi?",
  },
  {
    pattern: /ball|bóng|toy|đồ chơi/i,
    en: "Look! It's a ball! Is this your ball? ⚽",
    vi: "Nhìn này! Đây là quả bóng! Đây có phải bóng của bạn không?",
  },
  {
    pattern: /colour|color|màu|red|blue|green|yellow/i,
    en: "I like blue! What's your favourite colour? 🌈",
    vi: "Tớ thích màu xanh dương! Màu yêu thích của bạn là gì?",
  },
  {
    pattern: /animal|zoo|cat|dog|monkey|elephant|con vật/i,
    en: "I like monkeys! Do you like monkeys? 🐵",
    vi: "Tớ thích khỉ! Bạn có thích khỉ không?",
  },
  {
    pattern: /family|mum|dad|mẹ|bố|gia đình/i,
    en: "This is my mum. This is my dad! Who's this? 👨‍👩‍👦",
    vi: "Đây là mẹ tớ. Đây là bố tớ! Đây là ai vậy?",
  },
  {
    pattern: /bye|tạm biệt|goodbye/i,
    en: "Goodbye! Great game today! See you soon! ⭐👋",
    vi: "Tạm biệt! Hôm nay bạn chơi tuyệt lắm! Hẹn gặp lại sớm nhé!",
  },
];

function getSimulatedReply(userText: string): { textEn: string; textVi: string; correctionTip?: string } {
  for (const item of SIMULATED_REPLIES) {
    if (item.pattern.test(userText)) {
      return { textEn: item.en, textVi: item.vi, correctionTip: item.tip };
    }
  }

  return {
    textEn: `Great! Let's play and learn! What's this? ⚽⭐`,
    textVi: `Tuyệt quá! Cùng chơi và học nào! Đây là cái gì nhỉ?`,
  };
}

export async function sendChatMessageToZera(
  userInput: string,
  history: ChatMessage[],
  unitContext?: string
): Promise<{ textEn: string; textVi: string; correctionTip?: string }> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    // Return high quality educational simulated response
    await new Promise((resolve) => setTimeout(resolve, 600));
    return getSimulatedReply(userInput);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Format conversation history
    const contextPrompt = unitContext
      ? `Current learning unit context: "${unitContext}". If relevant, encourage the child to use vocabulary or sentence patterns from this unit.`
      : '';

    const formattedHistory = history.slice(-6).map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.role === 'user' ? msg.textEn : msg.textEn }],
    }));

    const promptText = `
${contextPrompt}

Child says: "${userInput}"

Please respond as Zero Mbappe in JSON format:
{
  "textEn": "Short cheerful English response (1-2 sentences with emojis)",
  "textVi": "Vietnamese translation of your response",
  "correctionTip": "Optional: Only if the child made a clear English grammar or word error, kindly provide a correction in Vietnamese starting with '💡 Mẹo nhỏ cho bé: ...', otherwise empty string"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...formattedHistory,
        {
          role: 'user',
          parts: [{ text: promptText }],
        },
      ],
      config: {
        systemInstruction: GRADE4_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text || '';
    try {
      const parsed = JSON.parse(outputText);
      return {
        textEn: parsed.textEn || "You're doing amazing! Let's keep practicing! ⚽",
        textVi: parsed.textVi || 'Bé đang làm rất tuyệt vời! Chúng mình cùng luyện tiếp nhé!',
        correctionTip: parsed.correctionTip || undefined,
      };
    } catch {
      // If output is plain text
      return {
        textEn: outputText,
        textVi: 'Zero Mbappe đồng hành cùng bé học giỏi tiếng Anh!',
      };
    }
  } catch (error: any) {
    console.warn('Gemini API call failed, falling back to simulated mode:', error);
    return getSimulatedReply(userInput);
  }
}
