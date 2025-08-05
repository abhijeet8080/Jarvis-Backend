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
exports.getUserAndLatestConversation = exports.getRecentMessages = exports.appendMessageToConversation = exports.getUserConversations = exports.createConversationWithMessage = void 0;
const client_1 = require("../lib/client");
const createConversationWithMessage = (userEmail, sender, messageText, name, accessToken, refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield client_1.prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
        user = yield client_1.prisma.user.create({
            data: {
                email: userEmail,
                name: name || '',
                accessToken: accessToken || '',
                refreshToken: refreshToken || ''
            }
        });
    }
    const conversation = yield client_1.prisma.conversation.create({
        data: {
            userId: user.id,
            title: 'New Conversation',
            messages: {
                create: {
                    sender,
                    content: messageText
                }
            }
        },
        include: { messages: true }
    });
    return conversation;
});
exports.createConversationWithMessage = createConversationWithMessage;
const getUserConversations = (userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield client_1.prisma.user.findUnique({
        where: { email: userEmail },
        include: {
            conversations: {
                include: { messages: true },
                orderBy: { createdAt: 'desc' }
            }
        }
    });
    return (user === null || user === void 0 ? void 0 : user.conversations) || [];
});
exports.getUserConversations = getUserConversations;
const appendMessageToConversation = (conversationId, sender, messageText, metadata) => __awaiter(void 0, void 0, void 0, function* () {
    return yield client_1.prisma.message.create({
        data: {
            conversationId,
            sender,
            content: messageText,
            metadata: metadata || {},
        }
    });
});
exports.appendMessageToConversation = appendMessageToConversation;
const getRecentMessages = (userEmail_1, ...args_1) => __awaiter(void 0, [userEmail_1, ...args_1], void 0, function* (userEmail, limit = 10) {
    var _a;
    const user = yield client_1.prisma.user.findUnique({
        where: { email: userEmail },
        include: {
            conversations: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                include: {
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: limit
                    }
                }
            }
        }
    });
    return ((_a = user === null || user === void 0 ? void 0 : user.conversations[0]) === null || _a === void 0 ? void 0 : _a.messages.reverse()) || [];
});
exports.getRecentMessages = getRecentMessages;
const getUserAndLatestConversation = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield client_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error("User does not exist");
    }
    let conversation = yield client_1.prisma.conversation.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
    });
    if (!conversation) {
        conversation = yield client_1.prisma.conversation.create({
            data: {
                userId: user.id,
                title: "New Conversation",
            },
        });
    }
    return { user, conversation };
});
exports.getUserAndLatestConversation = getUserAndLatestConversation;
