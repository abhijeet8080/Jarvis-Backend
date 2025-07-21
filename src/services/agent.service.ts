import OpenAI from "openai";
import {
  getUserAndLatestConversation,
  appendMessageToConversation,
  getRecentMessages,
} from "../db/chat.service";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { SYSTEM_PROMPT } from "../constants/constants";
import { tools } from "./tools";
const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});



export const processMessage = async (
  message: string,
  accessToken: string,
  userEmail: string,
  name?: string,
  refreshToken?: string
): Promise<{ reply: string }> => {
  try {
    const { conversation } = await getUserAndLatestConversation(userEmail);

    await appendMessageToConversation(conversation.id, "user", message);

    const recentMessages = await getRecentMessages(userEmail, 10);
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...recentMessages
        .filter((msg) => msg.sender === "user" || msg.sender === "ai")
        .map(
          (msg): ChatCompletionMessageParam => ({
            role: msg.sender === "ai" ? "assistant" : "user",
            content: msg.content,
          })
        ),
    ];

    while (true) {
      const chat = await openai.chat.completions.create({
        model: "gemini-2.5-flash",
        messages,
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const result = chat.choices[0]?.message?.content;
      if (!result) throw new Error("No response content from LLM.");

      console.log("AI response Result:", result);

      let action;
      try {
        action = JSON.parse(result);
        console.log("Parsed action:", action);
      } catch (err) {
        console.error("Failed to parse JSON:", result);
        return { reply: "Sorry, I couldn't understand the response." };
      }

      messages.push({ role: "assistant", content: result });
      await appendMessageToConversation(conversation.id, "ai", result);

      if (action.type === "plan" && action.plan) {
        console.log("Plan step:", action.plan);
        await appendMessageToConversation(
          conversation.id,
          "ai",
          JSON.stringify({ type: "plan", plan: action.plan })
        );
        continue;
      }

      if (action.type === "output") {
        return { reply: action.output || "No output generated." };
      }

      if (action.type === "action" && action.action?.function) {
        const fn = tools[action.action.function as keyof typeof tools];

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
          const output = await fn(action.action.input, context);

          const observation = { type: "observation", observation: output };
          const obsJson = JSON.stringify(observation);

          console.log("Observation step:", observation);

          messages.push({ role: "assistant", content: obsJson });
          console.log("Observation JSON:", obsJson);
          await appendMessageToConversation(conversation.id, "ai", obsJson);

          continue;
        } catch (toolErr) {
          console.error("Tool execution error:", toolErr);
          return { reply: "An error occurred while executing the tool." };
        }
      }

      console.warn("Unknown action type. Retrying...");
    }
  } catch (error) {
    console.error("processMessage error:", error);
    return {
      reply: "An internal error occurred while processing the request.",
    };
  }
};
