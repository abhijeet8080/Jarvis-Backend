"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestReplies = void 0;
// suggestreply.service.ts
const google_genai_1 = require("@langchain/google-genai");
const model = new google_genai_1.ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "models/gemini-1.5-flash",
    temperature: 0.4,
});
const suggestReplies = (emailContent, userSuggestion) => __awaiter(void 0, void 0, void 0, function* () {
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
    const result = yield model.invoke(prompt);
    return result.content;
});
exports.suggestReplies = suggestReplies;
