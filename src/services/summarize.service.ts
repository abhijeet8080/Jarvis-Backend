import OpenAI from "openai";

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

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY, 
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const summarizeEmailsIndividually = async ({
  from,
  subject,
  body,
  date,
}: {
  from: string;
  subject: string;
  body: string;
  date: string;
}) => {
  const email = `From: ${from}\nSubject: ${subject}\nDate: ${date}\n\nBody:\n${body}`;

  const response = await openai.chat.completions.create({
    model: "gemini-2.5-flash",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: email },
    ],
  });

  return response.choices[0].message.content ?? "";
};

export const summarizeEmails = async (
  emails: {
    from: string;
    subject: string;
    body: string;
    date: string;
    messageId: string;
    threadId: string;
  }[]
) => {
  const summaries = [];

  for (const email of emails) {
    const summary = await summarizeEmailsIndividually(email);

    summaries.push({
      summary,
      senderMailId: email.from,
      messageId: email.messageId,
      threadId: email.threadId,
    });
  }

  return summaries;
};