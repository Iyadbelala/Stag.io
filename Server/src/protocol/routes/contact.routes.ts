import { Router, Request, Response } from 'express';

const contactRouter = Router();

contactRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'All fields are required' },
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_EMAIL', message: 'Invalid email format' },
      });
      return;
    }

    console.log(`[CONTACT] New message from ${name} (${email}): ${subject} - ${message}`);

    res.json({
      success: true,
      message: 'Message sent successfully!',
    });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: e.message },
    });
  }
});

export default contactRouter;