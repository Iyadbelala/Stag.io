import 'dotenv/config';
import { count } from 'drizzle-orm';
import { db } from './model/db';
import { users, companies, students, universities, internshipOffers } from './model/schema';

async function check() {
  const [u] = await db.select({ v: count() }).from(users);
  const [c] = await db.select({ v: count() }).from(companies);
  const [s] = await db.select({ v: count() }).from(students);
  const [un] = await db.select({ v: count() }).from(universities);
  const [o] = await db.select({ v: count() }).from(internshipOffers);
  const allUsers = await db.select({ email: users.email, role: users.role }).from(users);
  console.log('DATABASE_URL host:', new URL(process.env.DATABASE_URL!).host);
  console.log('users:', u.v, '| companies:', c.v, '| students:', s.v, '| universities:', un.v, '| offers:', o.v);
  console.log('all users:', allUsers);
  process.exit(0);
}
check().catch((e) => { console.error(e); process.exit(1); });
