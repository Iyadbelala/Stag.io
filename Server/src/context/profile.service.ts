import { eq } from 'drizzle-orm';
import { db } from '../model/db';
import { users, students } from '../model/schema';

export interface StudentProfile {
  id: string;
  email: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  university: string | null;
  department: string | null;
  bio: string | null;
  skills: string[];
  cvUrl: string | null;
  profilePhotoUrl: string | null;
  portfolioPhotos: string[];
  createdAt: Date;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  department?: string;
  bio?: string;
  skills?: string[];
}

export async function getStudentProfile(userId: string): Promise<StudentProfile> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));

  if (!user) {
    const err = new Error('User not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  const [student] = await db.select().from(students).where(eq(students.userId, userId));

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    university: user.university,
    department: student?.department ?? null,
    bio: student?.bio ?? null,
    skills: student?.skills ?? [],
    cvUrl: student?.cvUrl ?? null,
    profilePhotoUrl: student?.profilePhotoUrl ?? null,
    portfolioPhotos: student?.portfolioPhotos ?? [],
    createdAt: user.createdAt,
  };
}

export async function updateStudentProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<StudentProfile> {
  const userUpdate: Record<string, string> = {};
  if (input.firstName !== undefined) userUpdate.firstName = input.firstName;
  if (input.lastName !== undefined) userUpdate.lastName = input.lastName;

  const studentUpdate: Record<string, unknown> = {};
  if (input.department !== undefined) studentUpdate.department = input.department;
  if (input.bio !== undefined) studentUpdate.bio = input.bio;
  if (input.skills !== undefined) studentUpdate.skills = input.skills;

  if (Object.keys(userUpdate).length > 0) {
    await db.update(users).set(userUpdate).where(eq(users.id, userId));
  }
  if (Object.keys(studentUpdate).length > 0) {
    await db.update(students).set(studentUpdate).where(eq(students.userId, userId));
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const [student] = await db.select().from(students).where(eq(students.userId, userId));

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    university: user.university,
    department: student?.department ?? null,
    bio: student?.bio ?? null,
    skills: student?.skills ?? [],
    cvUrl: student?.cvUrl ?? null,
    profilePhotoUrl: student?.profilePhotoUrl ?? null,
    portfolioPhotos: student?.portfolioPhotos ?? [],
    createdAt: user.createdAt,
  };
}
