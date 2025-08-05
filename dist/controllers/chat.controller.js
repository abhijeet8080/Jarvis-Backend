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
exports.chatWithAI = void 0;
const client_1 = require("../lib/client");
const agent_service_1 = require("../services/agent.service");
const chatWithAI = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("ChatWithAI called");
    const { message } = req.body;
    const { userId } = req.user || {};
    if (!message || !userId) {
        return res.status(400).json({
            error: "message and userId are required",
        });
    }
    try {
        const user = yield client_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.accessToken || !user.refreshToken || !user.email) {
            return res.status(404).json({ error: "User not found or tokens missing" });
        }
        const result = yield (0, agent_service_1.processMessage)(message, user.accessToken, user.email, user.name || 'User', user.refreshToken);
        console.log("AI response:", result);
        res.json({ summary: result });
    }
    catch (error) {
        console.error("AI error:", error);
        res.status(500).json({ error: "Failed to process message" });
    }
});
exports.chatWithAI = chatWithAI;
