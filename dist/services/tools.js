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
exports.tools = void 0;
const gmail_service_1 = require("./gmail.service");
const suggestreply_service_1 = require("./suggestreply.service");
exports.tools = {
    fetchEmails: (input, context) => __awaiter(void 0, void 0, void 0, function* () {
        const { accessToken } = context;
        const { maxResults, labelIds, query } = input;
        if (!maxResults)
            throw new Error("Missing 'maxResults' in fetchEmails input");
        return yield (0, gmail_service_1.fetchEmails)(accessToken, { maxResults, labelIds, query });
    }),
    suggestReplies: (input) => __awaiter(void 0, void 0, void 0, function* () {
        const { emailContent, userSuggestion } = input;
        return yield (0, suggestreply_service_1.suggestReplies)(emailContent, userSuggestion);
    }),
    replyToEmail: (input, context) => __awaiter(void 0, void 0, void 0, function* () {
        const { to, subject, messageId, threadId, replyBody } = input;
        if (!to || !subject || !messageId || !threadId || !replyBody) {
            throw new Error("Missing input fields for replyToEmail.");
        }
        return yield (0, gmail_service_1.replyToEmail)(context.accessToken, to, subject, messageId, threadId, replyBody);
    }),
    sendEmail: (input, context) => __awaiter(void 0, void 0, void 0, function* () {
        const { to, subject, body } = input;
        if (!to || !subject || !body) {
            throw new Error("Missing input fields for sendEmail.");
        }
        // Assuming there's a function to send emails
        return yield (0, gmail_service_1.sendEmail)(context.accessToken, to, subject, body);
    }),
    createDraft: (input, context) => __awaiter(void 0, void 0, void 0, function* () {
        const { to, subject, body } = input;
        if (!to || !subject || !body) {
            throw new Error("Missing input fields for createDraft.");
        }
        // Assuming there's a function to create drafts
        return yield (0, gmail_service_1.createDraft)(context.accessToken, to, subject, body);
    }),
    listDrafts: (input, context) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const maxResults = (_a = input === null || input === void 0 ? void 0 : input.maxResults) !== null && _a !== void 0 ? _a : 10;
        return yield (0, gmail_service_1.listDrafts)(context.accessToken, maxResults);
    }),
    listThreads: (input, context) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const maxResults = (_a = input === null || input === void 0 ? void 0 : input.maxResults) !== null && _a !== void 0 ? _a : 10;
        return yield (0, gmail_service_1.listThreads)(context.accessToken, { maxResults });
    }),
    sendDraft: (input, context) => __awaiter(void 0, void 0, void 0, function* () {
        const { draftId } = input;
        if (!draftId) {
            throw new Error("Missing 'draftId' in sendDraft input");
        }
        return yield (0, gmail_service_1.sendDraft)(context.accessToken, draftId);
    }),
    deleteDraft: (input, context) => __awaiter(void 0, void 0, void 0, function* () {
        const { draftId } = input;
        if (!draftId) {
            throw new Error("Missing 'draftId' in deleteDraft input");
        }
        return yield (0, gmail_service_1.deleteDraft)(context.accessToken, draftId);
    }),
    markEmailAsRead: (input, context) => __awaiter(void 0, void 0, void 0, function* () {
        const { messageId } = input;
        if (!messageId) {
            throw new Error("Missing 'messageId' in markEmailAsRead input");
        }
        return yield (0, gmail_service_1.markEmailAsRead)(context.accessToken, messageId);
    }),
    markEmailAsUnread: (input, context) => __awaiter(void 0, void 0, void 0, function* () {
        const { messageId } = input;
        if (!messageId) {
            throw new Error("Missing 'messageId' in markEmailAsUnread input");
        }
        return yield (0, gmail_service_1.markEmailAsUnread)(context.accessToken, messageId);
    }),
    archiveEmail: (input, context) => __awaiter(void 0, void 0, void 0, function* () {
        const { messageId } = input;
        if (!messageId) {
            throw new Error("Missing 'messageId' in archiveEmail input");
        }
        return yield (0, gmail_service_1.archiveEmail)(context.accessToken, messageId);
    }),
    moveToTrash: (input, context) => __awaiter(void 0, void 0, void 0, function* () {
        const { messageId } = input;
        if (!messageId) {
            throw new Error("Missing 'messageId' in moveToTrash input");
        }
        return yield (0, gmail_service_1.moveToTrash)(context.accessToken, messageId);
    }),
    deleteForever: (input, context) => __awaiter(void 0, void 0, void 0, function* () {
        const { messageId } = input;
        if (!messageId) {
            throw new Error("Missing 'messageId' in deleteForever input");
        }
        return yield (0, gmail_service_1.deleteForever)(context.accessToken, messageId);
    }),
    moveToLabel: (input, context) => __awaiter(void 0, void 0, void 0, function* () {
        const { messageId, targetLabelId } = input;
        if (!messageId || !targetLabelId) {
            throw new Error("Missing 'messageId' or 'targetLabelId' in moveToLabel input");
        }
        return yield (0, gmail_service_1.moveToLabel)(context.accessToken, messageId, targetLabelId);
    }),
    getThreadMessages: (input, context) => __awaiter(void 0, void 0, void 0, function* () {
        const { threadId } = input;
        if (!threadId) {
            throw new Error("Missing 'threadId' in getThreadMessages input");
        }
        return yield (0, gmail_service_1.getThreadMessages)(context.accessToken, threadId);
    })
};
