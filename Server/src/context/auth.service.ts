import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../model/db';
import { users, students, companies, universities } from '../model/schema';

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

export interface RegisterUniversityInput {
  email: string;
  password: string;
  universityName: string;
  domain: string;
  website?: string;
  location?: string;
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
    universityName?: string;
  };
}

export async function registerStudent(input: RegisterInput): Promise<AuthResult> {
  // Check that the email domain belongs to a registered & validated university
  const emailDomain = input.email.split('@')[1]?.toLowerCase();
  if (!emailDomain) {
    const err = new Error('Invalid email format') as Error & { code: string; status: number };
    err.code = 'INVALID_EMAIL';
    err.status = 400;
    throw err;
  }

  const [uni] = await db.select().from(universities).where(eq(universities.domain, emailDomain));
  if (!uni) {
    const err = new Error('No university registered with this email domain. Your university must register first.') as Error & { code: string; status: number };
    err.code = 'UNIVERSITY_NOT_REGISTERED';
    err.status = 400;
    throw err;
  }
  if (!uni.isValidated) {
    const err = new Error('Your university is still pending validation. Please try again later.') as Error & { code: string; status: number };
    err.code = 'UNIVERSITY_NOT_VALIDATED';
    err.status = 400;
    throw err;
  }

  const [existing] = await db.select().from(users).where(eq(users.email, input.email));
  if (existing) {
    const err = new Error('Email already registered') as Error & { code: string; status: number };
    err.code = 'EMAIL_IN_USE';
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const [user] = await db.insert(users).values({
    email: input.email,
    passwordHash,
    role: 'student',
    firstName: input.firstName,
    lastName: input.lastName,
    university: uni.universityName,
  }).returning();

  await db.insert(students).values({
    userId: user.id,
    skills: [],
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
  const [existing] = await db.select().from(users).where(eq(users.email, input.email));
  if (existing) {
    const err = new Error('Email already registered') as Error & { code: string; status: number };
    err.code = 'EMAIL_IN_USE';
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const [user] = await db.insert(users).values({
    email: input.email,
    passwordHash,
    role: 'company',
  }).returning();

  const [company] = await db.insert(companies).values({
    userId: user.id,
    companyName: input.companyName,
    contactPerson: input.contactPerson,
    industry: input.industry,
    location: input.location,
    verificationDocumentUrl: input.verificationDocumentUrl,
  }).returning();

  const token = signToken(user.id, user.role);
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      companyName: company.companyName,
    },
  };
}

export async function registerUniversity(input: RegisterUniversityInput): Promise<AuthResult> {
  const domain = input.domain.toLowerCase().replace(/^@/, '');

  const [existingDomain] = await db.select().from(universities).where(eq(universities.domain, domain));
  if (existingDomain) {
    const err = new Error('A university with this domain is already registered') as Error & { code: string; status: number };
    err.code = 'DOMAIN_IN_USE';
    err.status = 409;
    throw err;
  }

  const [existing] = await db.select().from(users).where(eq(users.email, input.email));
  if (existing) {
    const err = new Error('Email already registered') as Error & { code: string; status: number };
    err.code = 'EMAIL_IN_USE';
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const [user] = await db.insert(users).values({
    email: input.email,
    passwordHash,
    role: 'university',
  }).returning();

  const [uni] = await db.insert(universities).values({
    userId: user.id,
    universityName: input.universityName,
    domain,
    website: input.website,
    location: input.location,
  }).returning();

  const token = signToken(user.id, user.role);
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      universityName: uni.universityName,
    },
  };
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const [user] = await db.select().from(users).where(eq(users.email, input.email));
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

  const [company] = await db.select().from(companies).where(eq(companies.userId, user.id));
  const [uni] = await db.select().from(universities).where(eq(universities.userId, user.id));

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
      companyName: company?.companyName ?? undefined,
      universityName: uni?.universityName ?? undefined,
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
