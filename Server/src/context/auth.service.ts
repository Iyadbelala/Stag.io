import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../model/prisma';

const SALT_ROUNDS = 12;

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  university: string;
}

export interface RegisterCompanyInput {
  email: string;
  password: string;
  companyName: string;
  contactPerson?: string;
  industry?: string;
  location?: string;
  verificationDocumentUrl?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    university?: string;
    companyName?: string;
  };
}

export async function registerStudent(input: RegisterInput): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    const err = new Error('Email already registered') as Error & { code: string; status: number };
    err.code = 'EMAIL_IN_USE';
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      role: 'student',
      firstName: input.firstName,
      lastName: input.lastName,
      university: input.university,
      student: {
        create: {
          skills: [],
        },
      },
    },
  });

  const token = signToken(user.id, user.role);
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      university: user.university ?? undefined,
    },
  };
}

export async function registerCompany(input: RegisterCompanyInput): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    const err = new Error('Email already registered') as Error & { code: string; status: number };
    err.code = 'EMAIL_IN_USE';
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      role: 'company',
      company: {
        create: {
          companyName: input.companyName,
          contactPerson: input.contactPerson,
          industry: input.industry,
          location: input.location,
          verificationDocumentUrl: input.verificationDocumentUrl,
        },
      },
    },
    include: { company: true },
  });

  const token = signToken(user.id, user.role);
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      companyName: user.company!.companyName,
    },
  };
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { company: true },
  });
  if (!user) {
    const err = new Error('Invalid credentials') as Error & { code: string; status: number };
    err.code = 'INVALID_CREDENTIALS';
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    const err = new Error('Invalid credentials') as Error & { code: string; status: number };
    err.code = 'INVALID_CREDENTIALS';
    err.status = 401;
    throw err;
  }

  const token = signToken(user.id, user.role);
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      university: user.university ?? undefined,
      companyName: user.company?.companyName ?? undefined,
    },
  };
}

function signToken(userId: string, role: string): string {
  return jwt.sign(
    { sub: userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
}
