import { prisma } from '../model/prisma';

export interface StudentProfile {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  university: string;
  department: string | null;
  bio: string | null;
  skills: string[];
  cvUrl: string | null;
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
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { student: true },
  });

  if (!user) {
    const err = new Error('User not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    university: user.university,
    department: user.student?.department ?? null,
    bio: user.student?.bio ?? null,
    skills: user.student?.skills ?? [],
    cvUrl: user.student?.cvUrl ?? null,
    createdAt: user.createdAt,
  };
}

export async function updateStudentProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<StudentProfile> {
  // Update User fields
  const userUpdate: Record<string, string> = {};
  if (input.firstName !== undefined) userUpdate.firstName = input.firstName;
  if (input.lastName !== undefined) userUpdate.lastName = input.lastName;

  // Update Student fields
  const studentUpdate: Record<string, unknown> = {};
  if (input.department !== undefined) studentUpdate.department = input.department;
  if (input.bio !== undefined) studentUpdate.bio = input.bio;
  if (input.skills !== undefined) studentUpdate.skills = input.skills;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...userUpdate,
      student: {
        update: studentUpdate,
      },
    },
    include: { student: true },
  });

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    university: user.university,
    department: user.student?.department ?? null,
    bio: user.student?.bio ?? null,
    skills: user.student?.skills ?? [],
    cvUrl: user.student?.cvUrl ?? null,
    createdAt: user.createdAt,
  };
}
