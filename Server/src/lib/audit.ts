/**
 * Simple audit logger for sensitive admin/superadmin actions.
 * Logs to stdout in structured JSON format — can be piped to any log aggregator.
 */
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
  console.log(JSON.stringify(log));
}
