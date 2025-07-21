import { archiveEmail, createDraft, deleteDraft, deleteForever, fetchEmails, getThreadMessages, listDrafts, listThreads, markEmailAsRead, markEmailAsUnread, moveToLabel, moveToTrash, replyToEmail, sendDraft, sendEmail, } from "./gmail.service";
import { suggestReplies } from "./suggestreply.service";

export const tools = {
  fetchEmails: async (input: any, context: { accessToken: string }) => {
    const { accessToken } = context;
    const { maxResults, labelIds, query } = input;

    if (!maxResults)
      throw new Error("Missing 'maxResults' in fetchEmails input");

    return await fetchEmails(accessToken, { maxResults, labelIds, query });
  },
  suggestReplies: async (input: any) => {
    const { emailContent, userSuggestion } = input;
    return await suggestReplies(emailContent, userSuggestion);
  },
  replyToEmail: async (input: any, context: { accessToken: string }) => {
    const { to, subject, messageId, threadId, replyBody } = input;

    if (!to || !subject || !messageId || !threadId || !replyBody) {
      throw new Error("Missing input fields for replyToEmail.");
    }

    return await replyToEmail(
      context.accessToken,
      to,
      subject,
      messageId,
      threadId,
      replyBody
    );
  },
  sendEmail:async(input: any, context: { accessToken: string }) => {
    const { to, subject, body } = input;

    if (!to || !subject || !body) {
      throw new Error("Missing input fields for sendEmail.");
    }

    // Assuming there's a function to send emails
    return await sendEmail(
      context.accessToken,
      to,
      subject,
      body
    );
  },
  createDraft: async (input: any, context: { accessToken: string }) => {
    const { to, subject, body } = input;

    if (!to || !subject || !body) {
      throw new Error("Missing input fields for createDraft.");
    }

    // Assuming there's a function to create drafts
    return await createDraft(
      context.accessToken,
      to,
      subject,
      body
    );
  },
 listDrafts: async (input: any, context: { accessToken: string }) => {
  const maxResults = input?.maxResults ?? 10;
  return await listDrafts(context.accessToken, maxResults);
},

listThreads: async (input: any, context: { accessToken: string }) => {
  const maxResults = input?.maxResults ?? 10;
  return await listThreads(context.accessToken, { maxResults });
},


  sendDraft: async (input: any, context: { accessToken: string }) => {
    const { draftId } = input;

    if (!draftId) {
      throw new Error("Missing 'draftId' in sendDraft input");
    }

    return await sendDraft(context.accessToken, draftId);
  },
  deleteDraft: async (input: any, context: { accessToken: string }) => {
    const { draftId } = input;

    if (!draftId) {
      throw new Error("Missing 'draftId' in deleteDraft input");
    }

    return await deleteDraft(context.accessToken, draftId);
  },
  markEmailAsRead: async (input: any, context: { accessToken: string }) => {
    const { messageId } = input;

    if (!messageId) {
      throw new Error("Missing 'messageId' in markEmailAsRead input");
    }

    return await markEmailAsRead(context.accessToken, messageId);
  },
  markEmailAsUnread: async (input: any, context: { accessToken: string }) => {
    const { messageId } = input;

    if (!messageId) {
      throw new Error("Missing 'messageId' in markEmailAsUnread input");
    }

    return await markEmailAsUnread(context.accessToken, messageId);
  },
  archiveEmail: async (input: any, context: { accessToken: string }) => {
    const { messageId } = input;

    if (!messageId) {
      throw new Error("Missing 'messageId' in archiveEmail input");
    }

    return await archiveEmail(context.accessToken, messageId);
  },
  moveToTrash: async (input: any, context: { accessToken: string }) => {
    const { messageId } = input;

    if (!messageId) {
      throw new Error("Missing 'messageId' in moveToTrash input");
    }

    return await moveToTrash(context.accessToken, messageId);
  },
  deleteForever: async (input: any, context: { accessToken: string }) => {
    const { messageId } = input;

    if (!messageId) {
      throw new Error("Missing 'messageId' in deleteForever input");
    }

    return await deleteForever(context.accessToken, messageId);
  },
  moveToLabel: async (input: any, context: { accessToken: string }) => {
    const { messageId, targetLabelId } = input;

    if (!messageId || !targetLabelId) {
      throw new Error("Missing 'messageId' or 'targetLabelId' in moveToLabel input");
    }

    return await moveToLabel(context.accessToken, messageId, targetLabelId);
  },
  
  getThreadMessages: async (input: any, context: { accessToken: string }) => {
    const { threadId } = input;

    if (!threadId) {
      throw new Error("Missing 'threadId' in getThreadMessages input");
    }

    return await getThreadMessages(context.accessToken, threadId);
  }
};