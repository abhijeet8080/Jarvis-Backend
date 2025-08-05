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
exports.processMessage = void 0;
const openai_1 = __importDefault(require("openai"));
const chat_service_1 = require("../db/chat.service");
const constants_1 = require("../constants/constants");
const tools_1 = require("./tools");
const openai = new openai_1.default({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});
const processMessage = (message, accessToken, userEmail, name, refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { conversation } = yield (0, chat_service_1.getUserAndLatestConversation)(userEmail);
        yield (0, chat_service_1.appendMessageToConversation)(conversation.id, "user", message);
        const recentMessages = yield (0, chat_service_1.getRecentMessages)(userEmail, 10);
        const messages = [
            { role: "system", content: constants_1.SYSTEM_PROMPT },
            ...recentMessages
                .filter((msg) => msg.sender === "user" || msg.sender === "ai")
                .map((msg) => ({
                role: msg.sender === "ai" ? "assistant" : "user",
                content: msg.content,
            })),
        ];
        while (true) {
            const chat = yield openai.chat.completions.create({
                model: "gemini-2.5-flash",
                messages,
                response_format: { type: "json_object" },
                temperature: 0.7,
            });
            const result = (_b = (_a = chat.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
            if (!result)
                throw new Error("No response content from LLM.");
            console.log("AI response Result:", result);
            let action;
            try {
                action = JSON.parse(result);
                console.log("Parsed action:", action);
            }
            catch (err) {
                console.error("Failed to parse JSON:", result);
                return { reply: "Sorry, I couldn't understand the response." };
            }
            messages.push({ role: "assistant", content: result });
            yield (0, chat_service_1.appendMessageToConversation)(conversation.id, "ai", result);
            if (action.type === "plan" && action.plan) {
                console.log("Plan step:", action.plan);
                yield (0, chat_service_1.appendMessageToConversation)(conversation.id, "ai", JSON.stringify({ type: "plan", plan: action.plan }));
                continue;
            }
            if (action.type === "output") {
                return { reply: action.output || "No output generated." };
            }
            if (action.type === "action" && ((_c = action.action) === null || _c === void 0 ? void 0 : _c.function)) {
                const fn = tools_1.tools[action.action.function];
                if (!fn) {
                    console.error("Invalid function name:", action.action.function);
                    return { reply: `Unknown function: ${action.action.function}` };
                }
                if (!action.action.input || typeof action.action.input !== "object") {
                    return {
                        reply: `Missing or invalid input for function: ${action.action.function}`,
                    };
                }
                try {
                    const context = { accessToken };
                    const output = yield fn(action.action.input, context);
                    const observation = { type: "observation", observation: output };
                    const obsJson = JSON.stringify(observation);
                    console.log("Observation step:", observation);
                    messages.push({ role: "assistant", content: obsJson });
                    console.log("Observation JSON:", obsJson);
                    yield (0, chat_service_1.appendMessageToConversation)(conversation.id, "ai", obsJson);
                    continue;
                }
                catch (toolErr) {
                    console.error("Tool execution error:", toolErr);
                    return { reply: "An error occurred while executing the tool." };
                }
            }
            console.warn("Unknown action type. Retrying...");
        }
    }
    catch (error) {
        console.error("processMessage error:", error);
        return {
            reply: "An internal error occurred while processing the request.",
        };
    }
});
exports.processMessage = processMessage;
