import { ilike, or, sql } from 'drizzle-orm';
import { db } from '../model/db';
import { users, students } from '../model/schema';

export interface StudentSearchResult {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  university: string | null;
  department: string | null;
  profilePhotoUrl: string | null;
  skills: string[];
}

export async function searchStudents(
  query: string,
  limit: number
): Promise<StudentSearchResult[]> {
  const pattern = `%${query}%`;

  const rows = await db
    .select({
      userId: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      university: users.university,
      department: students.department,
      profilePhotoUrl: students.profilePhotoUrl,
      skills: students.skills,
    })
    .from(users)
    .innerJoin(students, sql`${students.userId} = ${users.id}`)
    .where(
      or(
        ilike(users.firstName, pattern),
        ilike(users.lastName, pattern),
        ilike(sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`, pattern)
      )
    )
    .limit(limit);

  return rows;
}
