import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { db } from './model/db';

async function reset() {
  console.log('Wiping all data (schema preserved)...');
  await db.execute(sql`
    TRUNCATE TABLE
      audit_logs,
      notifications,
      reviews,
      applications,
      saved_offers,
      internship_offers,
      universities,
      students,
      companies,
      users
    RESTART IDENTITY CASCADE;
  `);
  console.log('Done. All tables empty.');
  process.exit(0);
}

reset().catch((err) => {
  console.error('Reset failed:', err);
  process.exit(1);
});
