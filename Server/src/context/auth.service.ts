import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../model/db';
import { users, students, companies, universities } from '../model/schema';
import { sendVerificationEmail, sendPasswordResetEmail } from '../lib/email';
import { sendNotification } from './notifications.service';

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

export interface VerificationRequired {
  requiresVerification: true;
  email: string;
}

export type AuthResponse = AuthResult | VerificationRequired;

function isVerificationRequired(r: AuthResponse): r is VerificationRequired {
  return 'requiresVerification' in r;
}

function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function registerStudent(input: RegisterInput): Promise<AuthResponse> {
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
  const code = generateOTP();
  const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  const [user] = await db.insert(users).values({
    email: input.email,
    passwordHash,
    role: 'student',
    firstName: input.firstName,
    lastName: input.lastName,
    university: uni.universityName,
    emailVerificationCode: code,
    emailVerificationExpiry: expiry,
  }).returning();

  await db.insert(students).values({
    userId: user.id,
    skills: [],
  });

  // Send verification email (don't block on failure)
  sendVerificationEmail(input.email, code).catch(() => {});

  return { requiresVerification: true, email: input.email };
}

export async function registerCompany(input: RegisterCompanyInput): Promise<AuthResponse> {
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
    isEmailVerified: true,
  }).returning();

  const [company] = await db.insert(companies).values({
    userId: user.id,
    companyName: input.companyName,
    contactPerson: input.contactPerson,
    industry: input.industry,
    location: input.location,
    verificationDocumentUrl: input.verificationDocumentUrl,
  }).returning();

  // Notify all admins about the new company
  notifyAdmins(
    'company_pending_approval',
    'New Company Registration',
    `${input.companyName} has registered and needs approval`,
    user.id,
  );

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

export async function registerUniversity(input: RegisterUniversityInput): Promise<AuthResponse> {
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
    isEmailVerified: true,
  }).returning();

  const [uni] = await db.insert(universities).values({
    userId: user.id,
    universityName: input.universityName,
    domain,
    website: input.website,
    location: input.location,
  }).returning();

  // Notify all admins about the new university
  notifyAdmins(
    'university_pending_approval',
    'New University Registration',
    `${input.universityName} has registered and needs approval`,
    user.id,
  );

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

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
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

  // If email not verified, resend OTP and require verification
  if (!user.isEmailVerified) {
    const code = generateOTP();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);
    await db.update(users).set({
      emailVerificationCode: code,
      emailVerificationExpiry: expiry,
    }).where(eq(users.id, user.id));

    sendVerificationEmail(user.email, code).catch(() => {});

    return { requiresVerification: true, email: user.email };
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

/* ── Email Verification ── */

export async function verifyEmail(email: string, code: string): Promise<AuthResult> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    const err = new Error('User not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  if (user.isEmailVerified) {
    const err = new Error('Email already verified') as Error & { code: string; status: number };
    err.code = 'ALREADY_VERIFIED';
    err.status = 400;
    throw err;
  }

  if (
    user.emailVerificationCode !== code ||
    !user.emailVerificationExpiry ||
    user.emailVerificationExpiry < new Date()
  ) {
    const err = new Error('Invalid or expired verification code') as Error & { code: string; status: number };
    err.code = 'INVALID_CODE';
    err.status = 400;
    throw err;
  }

  await db.update(users).set({
    isEmailVerified: true,
    emailVerificationCode: null,
    emailVerificationExpiry: null,
  }).where(eq(users.id, user.id));

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

export async function resendVerificationCode(email: string): Promise<void> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    const err = new Error('User not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  if (user.isEmailVerified) {
    const err = new Error('Email already verified') as Error & { code: string; status: number };
    err.code = 'ALREADY_VERIFIED';
    err.status = 400;
    throw err;
  }

  const code = generateOTP();
  const expiry = new Date(Date.now() + 15 * 60 * 1000);

  await db.update(users).set({
    emailVerificationCode: code,
    emailVerificationExpiry: expiry,
  }).where(eq(users.id, user.id));

  await sendVerificationEmail(email, code);
}

/* ── Password Reset ── */

export async function requestPasswordReset(email: string): Promise<void> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  // Always return success to prevent email enumeration
  if (!user) return;

  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.update(users).set({
    passwordResetToken: resetToken,
    passwordResetExpiry: expiry,
  }).where(eq(users.id, user.id));

  await sendPasswordResetEmail(email, resetToken);
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const allUsers = await db.select().from(users);
  const user = allUsers.find((u) => u.passwordResetToken === token);

  if (!user || !user.passwordResetExpiry || user.passwordResetExpiry < new Date()) {
    const err = new Error('Invalid or expired reset token') as Error & { code: string; status: number };
    err.code = 'INVALID_TOKEN';
    err.status = 400;
    throw err;
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await db.update(users).set({
    passwordHash,
    passwordResetToken: null,
    passwordResetExpiry: null,
  }).where(eq(users.id, user.id));
}

async function notifyAdmins(
  type: 'company_pending_approval' | 'university_pending_approval',
  title: string,
  message: string,
  relatedId: string,
): Promise<void> {
  const admins = await db.select().from(users).where(eq(users.role, 'admin'));
  const superadmins = await db.select().from(users).where(eq(users.role, 'superadmin'));
  for (const admin of [...admins, ...superadmins]) {
    sendNotification(admin.id, type, title, message, relatedId).catch(() => {});
  }
}

function signToken(userId: string, role: string): string {
  return jwt.sign(
    { sub: userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
}
