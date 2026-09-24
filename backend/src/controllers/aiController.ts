import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { chatWithGemini } from '../services/geminiService.js';
import { ChatMessage } from '../models/ChatMessage.js';

export const chatHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
      return;
    }

    const { message } = req.body;

    const result = await chatWithGemini(userId, message);

    res.status(200).json({
      success: true,
      data: {
        reply: result.reply,
        contextSummary: result.contextSummary,
      },
    });
  } catch (err: any) {
    console.error('[AI Chat Error]', err);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI financial response',
      code: 'AI_ERROR',
    });
  }
};

export const getHistoryHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const history = await ChatMessage.find({ userId }).sort({ createdAt: 1 }).limit(100);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat history',
      code: 'SERVER_ERROR',
    });
  }
};

export const clearHistoryHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    await ChatMessage.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: 'Chat history cleared successfully',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear chat history',
      code: 'SERVER_ERROR',
    });
  }
};
