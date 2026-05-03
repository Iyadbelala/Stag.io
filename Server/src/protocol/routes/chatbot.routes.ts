import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { processChat } from '../../context/chatbot.service';
import type { JwtPayload } from '../middleware/auth.middleware';

const chatbotRouter = Router();

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_LENGTH = 20;

const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // 15 messages per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many messages. Please slow down.' } },
});

/* POST /api/chatbot — process a chat message */
chatbotRouter.post('/', chatbotLimiter, async (req: Request, res: Response) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Message is required' },
    });
    return;
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: `Message must be under ${MAX_MESSAGE_LENGTH} characters` },
    });
    return;
  }

  // Validate and sanitize history
  let safeHistory: { role: 'user' | 'bot'; text: string }[] = [];
  if (Array.isArray(history)) {
    safeHistory = history
      .slice(0, MAX_HISTORY_LENGTH)
      .filter(
        (entry: unknown) =>
          typeof entry === 'object' &&
          entry !== null &&
          'role' in entry &&
          'text' in entry &&
          typeof (entry as Record<string, unknown>).role === 'string' &&
          typeof (entry as Record<string, unknown>).text === 'string' &&
          ['user', 'bot'].includes((entry as Record<string, unknown>).role as string),
      ) as { role: 'user' | 'bot'; text: string }[];
  }

  // Optional auth — chatbot works for guests too, but with limited features
  let userId: string | null = null;
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const secret = process.env.JWT_SECRET;
      if (secret) {
        const payload = jwt.verify(header.slice(7), secret) as JwtPayload;
        userId = payload.sub;
      }
    } catch {
      // Token invalid — continue as guest
    }
  }

  try {
    const response = await processChat(message.trim(), userId, safeHistory);
    res.json({ success: true, data: response });
  } catch (err: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      const e = err as { message: string; stack?: string };
      console.error('[Chatbot Error]', e.message);
    }
    res.status(500).json({
      success: false,
      error: { code: 'CHATBOT_ERROR', message: 'Something went wrong. Please try again.' },
    });
  }
});

export default chatbotRouter;
