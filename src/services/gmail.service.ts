// services/gmail.service.ts

import { google } from "googleapis";
import { summarizeEmails } from "./summarize.service";



const getGmailClient = (accessToken: string) => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: 'v1', auth });
};


export const fetchEmails = async (
  accessToken: string,
  options: { maxResults?: number; labelIds?: string[]; query?: string } = {}
) => {
    const gmail = getGmailClient(accessToken);
  console.log("Fetching emails with options:", options);

  const res = await gmail.users.messages.list({
    userId: "me",
    maxResults: options.maxResults ?? 5,
    labelIds: options.labelIds ?? ["INBOX", "UNREAD"],
    q: options.query ?? "newer_than:7d",
  });

  const messages = res.data.messages || [];
  const emails = [];

  for (const msg of messages) {
    const { data } = await gmail.users.messages.get({
      userId: "me",
      id: msg.id!,
      format: "full",
    });

    const headers = data.payload?.headers || [];

    const getHeader = (name: string) =>
      headers.find((h) => h.name!.toLowerCase() === name.toLowerCase())
        ?.value || "Unknown";

    const from = getHeader("From");
    const subject = getHeader("Subject");
    const date = getHeader("Date");
    const messageId = getHeader("Message-ID");
    const threadId = data.threadId;

    // Plain text body
    const bodyPart =
      data.payload?.parts?.find((part) => part.mimeType === "text/plain")?.body
        ?.data ?? data.payload?.body?.data;

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
  const summaries = await summarizeEmails(
    emails.map(({ from, subject, body, date, messageId, threadId }) => ({
      from,
      subject,
      body,
      date,
      messageId: messageId ?? "unknown-message-id",
      threadId: threadId ?? "unknown-thread-id",
    }))
  );

  return summaries;
};

export const replyToEmail = async (
  accessToken: string,
  to: string,
  subject: string,
  messageId: string,
  threadId: string,
  replyBody: string
) => {
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

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
      threadId,
    },
  });
  console.log("Reply sent:", res.data);
  return res.data;
};


export const sendEmail = async (
  accessToken: string,
  to: string,
  subject: string,
  body: string
) => {
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

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });

  return res.data;
};

export const createDraft = async (
  accessToken: string,
  to: string,
  subject: string,
  body: string
) => {
      const gmail = getGmailClient(accessToken);


  const rawMessage = Buffer.from(
    `To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset="UTF-8"\r\n\r\n${body}`
  ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

  const res = await gmail.users.drafts.create({
    userId: 'me',
    requestBody: {
      message: {
        raw: rawMessage,
      },
    },
  });

  return res.data;
};


export const listDrafts = async (accessToken: string, maxResults = 10) => {
      const gmail = getGmailClient(accessToken);


  const res = await gmail.users.drafts.list({
    userId: 'me',
    maxResults,
  });

  return res.data.drafts ?? [];
};


export const sendDraft = async (accessToken: string, draftId: string) => {
      const gmail = getGmailClient(accessToken);

  const res = await gmail.users.drafts.send({
    userId: 'me',
    requestBody: {
      id: draftId,
    },
  });

  return res.data;
};

export const deleteDraft = async (accessToken: string, draftId: string) => {
      const gmail = getGmailClient(accessToken);

  await gmail.users.drafts.delete({
    userId: 'me',
    id: draftId,
  });

  return { success: true };
};



export const markEmailAsRead = async (accessToken: string, messageId: string) => {
      const gmail = getGmailClient(accessToken);
  await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    requestBody: {
      removeLabelIds: ['UNREAD'],
    },
  });
};

export const markEmailAsUnread = async (accessToken: string, messageId: string) => {
      const gmail = getGmailClient(accessToken);
  await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    requestBody: {
      addLabelIds: ['UNREAD'],
    },
  });
};


export const archiveEmail = async (accessToken: string, messageId: string) => {
      const gmail = getGmailClient(accessToken);
  await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    requestBody: {
      removeLabelIds: ['INBOX'],
    },
  });
};

export const moveToTrash = async (accessToken: string, messageId: string) => {
      const gmail = getGmailClient(accessToken);
  await gmail.users.messages.trash({
    userId: 'me',
    id: messageId,
  });
};

export const deleteForever = async (accessToken: string, messageId: string) => {
      const gmail = getGmailClient(accessToken);
  await gmail.users.messages.delete({
    userId: 'me',
    id: messageId,
  });
};


export const moveToLabel = async (
  accessToken: string,
  messageId: string,
  targetLabelId: string
) => {
  const gmail = getGmailClient(accessToken);

  await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    requestBody: {
      addLabelIds: [targetLabelId],
      removeLabelIds: ['INBOX'], 
    },
  });
};

export const listThreads = async (
  accessToken: string,
  options: { maxResults?: number; labelIds?: string[]; query?: string } = {}
) => {
  const gmail = getGmailClient(accessToken);

  const res = await gmail.users.threads.list({
    userId: "me",
    maxResults: options.maxResults ?? 10,
    labelIds: options.labelIds,
    q: options.query,
  });

  return res.data.threads ?? [];
};

export const getThreadMessages = async (
  accessToken: string,
  threadId: string
) => {
  const gmail = getGmailClient(accessToken);

  const thread = await gmail.users.threads.get({
    userId: "me",
    id: threadId,
    format: "full",
  });

  const messages = thread.data.messages ?? [];

  return messages.map((msg) => {
    const headers = msg.payload?.headers ?? [];

    const getHeader = (name: string) =>
      headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())
        ?.value || "Unknown";

    const from = getHeader("From");
    const subject = getHeader("Subject");
    const date = getHeader("Date");

    const bodyPart =
      msg.payload?.parts?.find((part) => part.mimeType === "text/plain")
        ?.body?.data ?? msg.payload?.body?.data;

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
};
