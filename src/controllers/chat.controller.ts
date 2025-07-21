import {  Response } from 'express';
import { prisma } from '../lib/client';
import { processMessage } from '../services/agent.service';
import { AuthenticatedRequest } from '../middlewares/auth';




export const chatWithAI = async (req: AuthenticatedRequest, res: Response) => {
  console.log("ChatWithAI called");

  const { message } = req.body;
  const { userId } = req.user || {};

  if (!message || !userId) {
    return res.status(400).json({
      error: "message and userId are required",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.accessToken || !user.refreshToken || !user.email) {
      return res.status(404).json({ error: "User not found or tokens missing" });
    }

    const result = await processMessage(
      message,
      user.accessToken,
      user.email,
      user.name || 'User',
      user.refreshToken
    );

    console.log("AI response:", result);
    res.json({ summary: result });
  } catch (error) {
    console.error("AI error:", error);
    res.status(500).json({ error: "Failed to process message" });
  }
};
