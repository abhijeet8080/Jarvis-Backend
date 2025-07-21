import { prisma } from '../lib/client';

export const createConversationWithMessage = async (
  userEmail: string,
  sender: string,
  messageText: string,
  name?: string,
  accessToken?: string,
  refreshToken?: string
) => {
  let user = await prisma.user.findUnique({ where: { email: userEmail } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: userEmail,
        name: name || '',
        accessToken: accessToken || '',
        refreshToken: refreshToken || ''
      }
    });
  }

  const conversation = await prisma.conversation.create({
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
};

export const getUserConversations = async (userEmail: string) => {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: {
      conversations: {
        include: { messages: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  return user?.conversations || [];
};

export const appendMessageToConversation = async (
  conversationId: string,
  sender: 'user' | 'ai',
  messageText: string,
  metadata?: any
) => {
  return await prisma.message.create({
    data: {
      conversationId,
      sender,
      content: messageText,
      metadata: metadata || {},
    }
  });
};

export const getRecentMessages = async (userEmail: string, limit = 10) => {
  const user = await prisma.user.findUnique({
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

  return user?.conversations[0]?.messages.reverse() || [];
};


export const getUserAndLatestConversation = async (
  email: string
) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error("User does not exist");
  }

  let conversation = await prisma.conversation.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        title: "New Conversation",
      },
    });
  }

  return { user, conversation };
};
