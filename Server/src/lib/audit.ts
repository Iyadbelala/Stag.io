/**
 * Audit logger for sensitive admin/superadmin actions.
 * Writes to both the database (audit_logs table) and stdout (structured JSON).
 */
import { db } from '../model/db';
import { auditLogs } from '../model/schema';

export function auditLog(entry: {
  actor: string;      // userId of the person performing the action
  role: string;       // role of the actor
  action: string;     // e.g. 'validate_company', 'reject_university', 'delete_user'
  target: string;     // ID of the affected entity
  details?: string;   // optional extra context
}) {
  const log = {
    type: 'AUDIT',
    timestamp: new Date().toISOString(),
    ...entry,
  };

  // Stdout logging (can be piped to any log aggregator)
  console.log(JSON.stringify(log));

  // Persist to database (fire-and-forget)
  db.insert(auditLogs)
    .values({
      actorId: entry.actor,
      actorRole: entry.role,
      action: entry.action,
      targetId: entry.target,
      metadata: entry.details ? { details: entry.details } : null,
    })
    .catch((err) => {
      console.error('Failed to persist audit log:', err);
    });
}
