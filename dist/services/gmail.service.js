"use strict";
// services/gmail.service.ts
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
exports.getThreadMessages = exports.listThreads = exports.moveToLabel = exports.deleteForever = exports.moveToTrash = exports.archiveEmail = exports.markEmailAsUnread = exports.markEmailAsRead = exports.deleteDraft = exports.sendDraft = exports.listDrafts = exports.createDraft = exports.sendEmail = exports.replyToEmail = exports.fetchEmails = void 0;
const googleapis_1 = require("googleapis");
const summarize_service_1 = require("./summarize.service");
const getGmailClient = (accessToken) => {
    const auth = new googleapis_1.google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    return googleapis_1.google.gmail({ version: 'v1', auth });
};
const fetchEmails = (accessToken_1, ...args_1) => __awaiter(void 0, [accessToken_1, ...args_1], void 0, function* (accessToken, options = {}) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const gmail = getGmailClient(accessToken);
    console.log("Fetching emails with options:", options);
    const res = yield gmail.users.messages.list({
        userId: "me",
        maxResults: (_a = options.maxResults) !== null && _a !== void 0 ? _a : 5,
        labelIds: (_b = options.labelIds) !== null && _b !== void 0 ? _b : ["INBOX", "UNREAD"],
        q: (_c = options.query) !== null && _c !== void 0 ? _c : "newer_than:7d",
    });
    const messages = res.data.messages || [];
    const emails = [];
    for (const msg of messages) {
        const { data } = yield gmail.users.messages.get({
            userId: "me",
            id: msg.id,
            format: "full",
        });
        const headers = ((_d = data.payload) === null || _d === void 0 ? void 0 : _d.headers) || [];
        const getHeader = (name) => {
            var _a;
            return ((_a = headers.find((h) => h.name.toLowerCase() === name.toLowerCase())) === null || _a === void 0 ? void 0 : _a.value) || "Unknown";
        };
        const from = getHeader("From");
        const subject = getHeader("Subject");
        const date = getHeader("Date");
        const messageId = getHeader("Message-ID");
        const threadId = data.threadId;
        // Plain text body
        const bodyPart = (_j = (_h = (_g = (_f = (_e = data.payload) === null || _e === void 0 ? void 0 : _e.parts) === null || _f === void 0 ? void 0 : _f.find((part) => part.mimeType === "text/plain")) === null || _g === void 0 ? void 0 : _g.body) === null || _h === void 0 ? void 0 : _h.data) !== null && _j !== void 0 ? _j : (_l = (_k = data.payload) === null || _k === void 0 ? void 0 : _k.body) === null || _l === void 0 ? void 0 : _l.data;
        const decodedBody = bodyPart
            ? Buffer.from(bodyPart, "base64").toString("utf-8")
            : "[No body found]";
        emails.push({
            id: msg.id,
            from,
            subject,
            date,
            messageId,
            threadId,
            body: decodedBody,
        });
    }
    const summaries = yield (0, summarize_service_1.summarizeEmails)(emails.map(({ from, subject, body, date, messageId, threadId }) => ({
        from,
        subject,
        body,
        date,
        messageId: messageId !== null && messageId !== void 0 ? messageId : "unknown-message-id",
        threadId: threadId !== null && threadId !== void 0 ? threadId : "unknown-thread-id",
    })));
    return summaries;
});
exports.fetchEmails = fetchEmails;
const replyToEmail = (accessToken, to, subject, messageId, threadId, replyBody) => __awaiter(void 0, void 0, void 0, function* () {
    const gmail = getGmailClient(accessToken);
    const rawMessage = [
        `To: ${to}`,
        `Subject: Re: ${subject}`,
        `In-Reply-To: ${messageId}`,
        `References: ${messageId}`,
        `Content-Type: text/plain; charset="UTF-8"`,
        `MIME-Version: 1.0`,
        "",
        replyBody,
    ].join("\r\n"); // Use \r\n for email headers
    // Gmail API expects base64 **URL-safe**, padded
    const encodedMessage = Buffer.from(rawMessage)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, ""); // remove padding (Gmail requires this)
    const res = yield gmail.users.messages.send({
        userId: "me",
        requestBody: {
            raw: encodedMessage,
            threadId,
        },
    });
    console.log("Reply sent:", res.data);
    return res.data;
});
exports.replyToEmail = replyToEmail;
const sendEmail = (accessToken, to, subject, body) => __awaiter(void 0, void 0, void 0, function* () {
    const gmail = getGmailClient(accessToken);
    // Construct the raw email
    const rawMessage = [
        `To: ${to}`,
        "Content-Type: text/plain; charset=utf-8",
        "MIME-Version: 1.0",
        `Subject: ${subject}`,
        "",
        body,
    ].join("\n");
    const encodedMessage = Buffer.from(rawMessage)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, ""); // URL-safe Base64
    const res = yield gmail.users.messages.send({
        userId: "me",
        requestBody: {
            raw: encodedMessage,
        },
    });
    return res.data;
});
exports.sendEmail = sendEmail;
const createDraft = (accessToken, to, subject, body) => __awaiter(void 0, void 0, void 0, function* () {
    const gmail = getGmailClient(accessToken);
    const rawMessage = Buffer.from(`To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset="UTF-8"\r\n\r\n${body}`).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
    const res = yield gmail.users.drafts.create({
        userId: 'me',
        requestBody: {
            message: {
                raw: rawMessage,
            },
        },
    });
    return res.data;
});
exports.createDraft = createDraft;
const listDrafts = (accessToken_1, ...args_1) => __awaiter(void 0, [accessToken_1, ...args_1], void 0, function* (accessToken, maxResults = 10) {
    var _a;
    const gmail = getGmailClient(accessToken);
    const res = yield gmail.users.drafts.list({
        userId: 'me',
        maxResults,
    });
    return (_a = res.data.drafts) !== null && _a !== void 0 ? _a : [];
});
exports.listDrafts = listDrafts;
const sendDraft = (accessToken, draftId) => __awaiter(void 0, void 0, void 0, function* () {
    const gmail = getGmailClient(accessToken);
    const res = yield gmail.users.drafts.send({
        userId: 'me',
        requestBody: {
            id: draftId,
        },
    });
    return res.data;
});
exports.sendDraft = sendDraft;
const deleteDraft = (accessToken, draftId) => __awaiter(void 0, void 0, void 0, function* () {
    const gmail = getGmailClient(accessToken);
    yield gmail.users.drafts.delete({
        userId: 'me',
        id: draftId,
    });
    return { success: true };
});
exports.deleteDraft = deleteDraft;
const markEmailAsRead = (accessToken, messageId) => __awaiter(void 0, void 0, void 0, function* () {
    const gmail = getGmailClient(accessToken);
    yield gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
            removeLabelIds: ['UNREAD'],
        },
    });
});
exports.markEmailAsRead = markEmailAsRead;
const markEmailAsUnread = (accessToken, messageId) => __awaiter(void 0, void 0, void 0, function* () {
    const gmail = getGmailClient(accessToken);
    yield gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
            addLabelIds: ['UNREAD'],
        },
    });
});
exports.markEmailAsUnread = markEmailAsUnread;
const archiveEmail = (accessToken, messageId) => __awaiter(void 0, void 0, void 0, function* () {
    const gmail = getGmailClient(accessToken);
    yield gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
            removeLabelIds: ['INBOX'],
        },
    });
});
exports.archiveEmail = archiveEmail;
const moveToTrash = (accessToken, messageId) => __awaiter(void 0, void 0, void 0, function* () {
    const gmail = getGmailClient(accessToken);
    yield gmail.users.messages.trash({
        userId: 'me',
        id: messageId,
    });
});
exports.moveToTrash = moveToTrash;
const deleteForever = (accessToken, messageId) => __awaiter(void 0, void 0, void 0, function* () {
    const gmail = getGmailClient(accessToken);
    yield gmail.users.messages.delete({
        userId: 'me',
        id: messageId,
    });
});
exports.deleteForever = deleteForever;
const moveToLabel = (accessToken, messageId, targetLabelId) => __awaiter(void 0, void 0, void 0, function* () {
    const gmail = getGmailClient(accessToken);
    yield gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
            addLabelIds: [targetLabelId],
            removeLabelIds: ['INBOX'],
        },
    });
});
exports.moveToLabel = moveToLabel;
const listThreads = (accessToken_1, ...args_1) => __awaiter(void 0, [accessToken_1, ...args_1], void 0, function* (accessToken, options = {}) {
    var _a, _b;
    const gmail = getGmailClient(accessToken);
    const res = yield gmail.users.threads.list({
        userId: "me",
        maxResults: (_a = options.maxResults) !== null && _a !== void 0 ? _a : 10,
        labelIds: options.labelIds,
        q: options.query,
    });
    return (_b = res.data.threads) !== null && _b !== void 0 ? _b : [];
});
exports.listThreads = listThreads;
const getThreadMessages = (accessToken, threadId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const gmail = getGmailClient(accessToken);
    const thread = yield gmail.users.threads.get({
        userId: "me",
        id: threadId,
        format: "full",
    });
    const messages = (_a = thread.data.messages) !== null && _a !== void 0 ? _a : [];
    return messages.map((msg) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const headers = (_b = (_a = msg.payload) === null || _a === void 0 ? void 0 : _a.headers) !== null && _b !== void 0 ? _b : [];
        const getHeader = (name) => {
            var _a;
            return ((_a = headers.find((h) => { var _a; return ((_a = h.name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === name.toLowerCase(); })) === null || _a === void 0 ? void 0 : _a.value) || "Unknown";
        };
        const from = getHeader("From");
        const subject = getHeader("Subject");
        const date = getHeader("Date");
        const bodyPart = (_g = (_f = (_e = (_d = (_c = msg.payload) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d.find((part) => part.mimeType === "text/plain")) === null || _e === void 0 ? void 0 : _e.body) === null || _f === void 0 ? void 0 : _f.data) !== null && _g !== void 0 ? _g : (_j = (_h = msg.payload) === null || _h === void 0 ? void 0 : _h.body) === null || _j === void 0 ? void 0 : _j.data;
        const decodedBody = bodyPart
            ? Buffer.from(bodyPart, "base64").toString("utf-8")
            : "[No body found]";
        return {
            id: msg.id,
            from,
            subject,
            date,
            body: decodedBody,
        };
    });
});
exports.getThreadMessages = getThreadMessages;
