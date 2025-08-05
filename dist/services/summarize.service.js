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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeEmails = void 0;
const openai_1 = __importDefault(require("openai"));
const SYSTEM_PROMPT = `
You are an intelligent and helpful email assistant. Your job is to summarize a batch of emails in a human-friendly and engaging way.

For each email, highlight:
- **Who sent the email** (use the sender's name if available, else their email)
- **What it's about** (use the subject or infer from the body)
- **What the main message is** (capture the essence in one or two lines)

Present the summaries in a natural, readable flow — as if you're quickly briefing the user on what they received. You do **not** need to include metadata like "Sender Email", "Urgency", "Category", etc.

✅ Focus on being helpful, clear, and slightly conversational.  
🚫 Avoid JSON, lists, bullet points, or robotic structure.

---

### ✍️ Example Style:

- Notion reminded you that your trial is ending in 3 days and encouraged you to upgrade to keep using their AI features.  
- Internshala shared this week’s top internships and encouraged you to apply soon.  
- Your bank sent a gentle nudge about your credit card bill being due in 2 days.

That’s the tone and format you should follow.

`;
const openai = new openai_1.default({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});
const summarizeEmailsIndividually = (_a) => __awaiter(void 0, [_a], void 0, function* ({ from, subject, body, date, }) {
    var _b;
    const email = `From: ${from}\nSubject: ${subject}\nDate: ${date}\n\nBody:\n${body}`;
    const response = yield openai.chat.completions.create({
        model: "gemini-2.5-flash",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: email },
        ],
    });
    return (_b = response.choices[0].message.content) !== null && _b !== void 0 ? _b : "";
});
const summarizeEmails = (emails) => __awaiter(void 0, void 0, void 0, function* () {
    const summaries = [];
    for (const email of emails) {
        const summary = yield summarizeEmailsIndividually(email);
        summaries.push({
            summary,
            senderMailId: email.from,
            messageId: email.messageId,
            threadId: email.threadId,
        });
    }
    return summaries;
});
exports.summarizeEmails = summarizeEmails;
