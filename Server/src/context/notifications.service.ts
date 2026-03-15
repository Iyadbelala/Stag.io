import { eq, desc, and, count } from 'drizzle-orm';
import { db } from '../model/db';
import { notifications } from '../model/schema';
import { getIO } from '../socket';

export interface NotificationData {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedId: string | null;
  createdAt: string;
}

/**
 * Create a notification and push it via Socket.io in real-time.
 */
export async function sendNotification(
  userId: string,
  type: 'application_status_changed' | 'new_application' | 'agreement_needs_validation' | 'company_pending_approval' | 'university_pending_approval',
  title: string,
  message: string,
  relatedId?: string,
): Promise<NotificationData> {
  const [notification] = await db.insert(notifications).values({
    userId,
    type,
    title,
    message,
    relatedId: relatedId ?? null,
  }).returning();

  const data: NotificationData = {
    id: notification.id,
    userId: notification.userId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    isRead: notification.isRead,
    relatedId: notification.relatedId,
    createdAt: notification.createdAt.toISOString(),
  };

  // Push real-time notification
  try {
    getIO().to(userId).emit('notification', data);
  } catch {
    // Socket.io might not be initialized in tests
  }

  return data;
}

/**
 * Get all notifications for a user.
 */
export async function getUserNotifications(userId: string): Promise<NotificationData[]> {
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));

  return rows.map((n) => ({
    id: n.id,
    userId: n.userId,
    type: n.type,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    relatedId: n.relatedId,
    createdAt: n.createdAt.toISOString(),
  }));
}

/**
 * Get unread notification count.
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ value: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

  return result?.value ?? 0;
}

/**
 * Mark a single notification as read.
 */
export async function markAsRead(userId: string, notificationId: string): Promise<void> {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
}

/**
 * Mark all notifications as read.
 */
export async function markAllAsRead(userId: string): Promise<void> {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, userId));
}

/**
 * Delete a notification.
 */
export async function deleteNotification(userId: string, notificationId: string): Promise<void> {
  await db
    .delete(notifications)
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
}
