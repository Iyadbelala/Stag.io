import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { processChat } from '../../context/chatbot.service';
import type { JwtPayload } from '../middleware/auth.middleware';

const chatbotRouter = Router();

/* POST /api/chatbot — process a chat message */
chatbotRouter.post('/', async (req: Request, res: Response) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Message is required' },
    });
    return;
  }

  // Optional auth — chatbot works for guests too, but with limited features
  let userId: string | null = null;
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as JwtPayload;
      userId = payload.sub;
    } catch {
      // Token invalid — continue as guest
    }
  }

  try {
    const response = await processChat(message.trim(), userId, history ?? []);
    res.json({ success: true, data: response });
  } catch (err: unknown) {
    const e = err as { message: string; stack?: string };
    console.error('[Chatbot Error]', e.message);
    console.error('[Chatbot Stack]', e.stack);
    res.status(500).json({
      success: false,
      error: { code: 'CHATBOT_ERROR', message: 'Something went wrong. Please try again.' },
    });
  }
});

export default chatbotRouter;
