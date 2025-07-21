// suggestreply.service.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
  model: "models/gemini-1.5-flash",
  temperature: 0.4,
});

export const suggestReplies = async (emailContent: string, userSuggestion:string) => {
  const prompt = `
You are an AI assistant helping a busy startup founder respond to emails.
Given the email below, suggest 2–3 possible replies that are professional, concise, and relevant.

What i want to express in the email is: ${userSuggestion}

Email:
"""
${emailContent}
"""

Replies:
1.
2.
3.
`;

  const result = await model.invoke(prompt);
  return result.content;
};
