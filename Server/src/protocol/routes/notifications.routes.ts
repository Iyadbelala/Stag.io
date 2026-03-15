import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../../context/notifications.service';

const notificationsRouter = Router();

/* GET /api/notifications */
notificationsRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const data = await getUserNotifications(req.user!.sub);
    res.json({ success: true, data });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* GET /api/notifications/unread-count */
notificationsRouter.get('/unread-count', requireAuth, async (req: Request, res: Response) => {
  try {
    const count = await getUnreadCount(req.user!.sub);
    res.json({ success: true, data: { count } });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* PATCH /api/notifications/:id/read */
notificationsRouter.patch('/:id/read', requireAuth, async (req: Request, res: Response) => {
  try {
    await markAsRead(req.user!.sub, req.params.id);
    res.json({ success: true });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* PATCH /api/notifications/read-all */
notificationsRouter.patch('/read-all', requireAuth, async (req: Request, res: Response) => {
  try {
    await markAllAsRead(req.user!.sub);
    res.json({ success: true });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* DELETE /api/notifications/:id */
notificationsRouter.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    await deleteNotification(req.user!.sub, req.params.id);
    res.json({ success: true });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

export default notificationsRouter;
