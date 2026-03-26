import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq, and, gt } from 'drizzle-orm';
import { db } from '../model/db';
import { users, students, companies, universities } from '../model/schema';
import { sendVerificationEmail, sendPasswordResetEmail } from '../lib/email';
import { sendNotification } from './notifications.service';
import { isAccountLocked, recordFailedAttempt, clearFailedAttempts } from '../lib/login-limiter';

const SALT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;

/* ── Helpers ── */

function throwError(message: string, code: string, status: number): never {
  const err = new Error(message) as Error & { code: string; status: number };
  err.code = code;
  err.status = status;
  throw err;
}

function validatePassword(password: string): void {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    throwError(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      'WEAK_PASSWORD',
      400,
    );
  }
}

function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/** Hash a token/code with SHA-256 before storing in DB */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is required');
  return secret;
}

/** Short-lived access token (15 min) */
function signAccessToken(userId: string, role: string): string {
  return jwt.sign(
    { sub: userId, role, type: 'access' },
    getJwtSecret(),
    { expiresIn: '15m' } as jwt.SignOptions,
  );
}

/** Long-lived refresh token (7 days) */
function signRefreshToken(userId: string): string {
  return jwt.sign(
    { sub: userId, type: 'refresh' },
    getJwtSecret(),
    { expiresIn: '7d' } as jwt.SignOptions,
  );
}

/** Generate both tokens */
function signTokens(userId: string, role: string) {
  return {
    accessToken: signAccessToken(userId, role),
    refreshToken: signRefreshToken(userId),
  };
}

/* ── Types ── */

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
  refreshToken: string;
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

/* ── Register Student ── */

export async function registerStudent(input: RegisterInput): Promise<AuthResponse> {
  validatePassword(input.password);

  const emailDomain = input.email.split('@')[1]?.toLowerCase();
  if (!emailDomain) {
    throwError('Invalid email format', 'INVALID_EMAIL', 400);
  }

  const [uni] = await db.select().from(universities).where(eq(universities.domain, emailDomain));
  if (!uni) {
    throwError('No university registered with this email domain. Your university must register first.', 'UNIVERSITY_NOT_REGISTERED', 400);
  }
  if (!uni.isValidated) {
    throwError('Your university is still pending validation. Please try again later.', 'UNIVERSITY_NOT_VALIDATED', 400);
  }

  const [existing] = await db.select().from(users).where(eq(users.email, input.email));
  if (existing) {
    throwError('Email already registered', 'EMAIL_IN_USE', 409);
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const code = generateOTP();
  const expiry = new Date(Date.now() + 15 * 60 * 1000);

  const [user] = await db.insert(users).values({
    email: input.email,
    passwordHash,
    role: 'student',
    firstName: input.firstName,
    lastName: input.lastName,
    university: uni.universityName,
    emailVerificationCode: hashToken(code),
    emailVerificationExpiry: expiry,
  }).returning();

  await db.insert(students).values({
    userId: user.id,
    skills: [],
  });

  // Send plaintext code to user, only hash is stored in DB
  sendVerificationEmail(input.email, code).catch(() => {});

  return { requiresVerification: true, email: input.email };
}

/* ── Register Company ── */

export async function registerCompany(input: RegisterCompanyInput): Promise<AuthResponse> {
  validatePassword(input.password);

  const [existing] = await db.select().from(users).where(eq(users.email, input.email));
  if (existing) {
    throwError('Email already registered', 'EMAIL_IN_USE', 409);
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

  notifyAdmins(
    'company_pending_approval',
    'New Company Registration',
    `${input.companyName} has registered and needs approval`,
    user.id,
  );

  const { accessToken: token, refreshToken } = signTokens(user.id, user.role);
  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      companyName: company.companyName,
    },
  };
}

/* ── Register University ── */

export async function registerUniversity(input: RegisterUniversityInput): Promise<AuthResponse> {
  validatePassword(input.password);

  const domain = input.domain.toLowerCase().replace(/^@/, '');

  const [existingDomain] = await db.select().from(universities).where(eq(universities.domain, domain));
  if (existingDomain) {
    throwError('A university with this domain is already registered', 'DOMAIN_IN_USE', 409);
  }

  const [existing] = await db.select().from(users).where(eq(users.email, input.email));
  if (existing) {
    throwError('Email already registered', 'EMAIL_IN_USE', 409);
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

  notifyAdmins(
    'university_pending_approval',
    'New University Registration',
    `${input.universityName} has registered and needs approval`,
    user.id,
  );

  const { accessToken: token, refreshToken } = signTokens(user.id, user.role);
  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      universityName: uni.universityName,
    },
  };
}

/* ── Login ── */

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  // Check account lockout before anything
  const lockSeconds = isAccountLocked(input.email);
  if (lockSeconds > 0) {
    const mins = Math.ceil(lockSeconds / 60);
    throwError(`Account temporarily locked. Try again in ${mins} minute(s)`, 'ACCOUNT_LOCKED', 429);
  }

  const [user] = await db.select().from(users).where(eq(users.email, input.email));
  if (!user) {
    recordFailedAttempt(input.email);
    throwError('Invalid credentials', 'INVALID_CREDENTIALS', 401);
  }

  if (user.deactivatedAt) {
    throwError('This account has been deactivated', 'ACCOUNT_DEACTIVATED', 403);
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    const locked = recordFailedAttempt(input.email);
    if (locked) {
      throwError('Too many failed attempts. Account locked for 15 minutes', 'ACCOUNT_LOCKED', 429);
    }
    throwError('Invalid credentials', 'INVALID_CREDENTIALS', 401);
  }

  // Successful login — clear failed attempts
  clearFailedAttempts(input.email);

  if (!user.isEmailVerified) {
    const code = generateOTP();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);
    await db.update(users).set({
      emailVerificationCode: hashToken(code),
      emailVerificationExpiry: expiry,
    }).where(eq(users.id, user.id));

    sendVerificationEmail(user.email, code).catch(() => {});

    return { requiresVerification: true, email: user.email };
  }

  const [company] = await db.select().from(companies).where(eq(companies.userId, user.id));
  const [uni] = await db.select().from(universities).where(eq(universities.userId, user.id));

  const { accessToken: token, refreshToken } = signTokens(user.id, user.role);
  return {
    token,
    refreshToken,
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
    // Generic message to prevent email enumeration
    throwError('Invalid or expired verification code', 'INVALID_CODE', 400);
  }

  if (user.isEmailVerified) {
    throwError('Email already verified', 'ALREADY_VERIFIED', 400);
  }

  if (
    user.emailVerificationCode !== hashToken(code) ||
    !user.emailVerificationExpiry ||
    user.emailVerificationExpiry < new Date()
  ) {
    throwError('Invalid or expired verification code', 'INVALID_CODE', 400);
  }

  await db.update(users).set({
    isEmailVerified: true,
    emailVerificationCode: null,
    emailVerificationExpiry: null,
  }).where(eq(users.id, user.id));

  const [company] = await db.select().from(companies).where(eq(companies.userId, user.id));
  const [uni] = await db.select().from(universities).where(eq(universities.userId, user.id));

  const { accessToken: token, refreshToken } = signTokens(user.id, user.role);
  return {
    token,
    refreshToken,
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
  // Silently return to prevent email enumeration
  if (!user || user.isEmailVerified) return;

  const code = generateOTP();
  const expiry = new Date(Date.now() + 15 * 60 * 1000);

  await db.update(users).set({
    emailVerificationCode: hashToken(code),
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

  // Store hash of token in DB, send plaintext to user
  await db.update(users).set({
    passwordResetToken: hashToken(resetToken),
    passwordResetExpiry: expiry,
  }).where(eq(users.id, user.id));

  await sendPasswordResetEmail(email, resetToken);
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  validatePassword(newPassword);

  // Hash the incoming token to compare against stored hash
  const [user] = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.passwordResetToken, hashToken(token)),
        gt(users.passwordResetExpiry, new Date()),
      ),
    );

  if (!user) {
    throwError('Invalid or expired reset token', 'INVALID_TOKEN', 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await db.update(users).set({
    passwordHash,
    passwordResetToken: null,
    passwordResetExpiry: null,
  }).where(eq(users.id, user.id));
}

/* ── Refresh Token ── */

export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  let payload: { sub: string; type: string };
  try {
    payload = jwt.verify(refreshToken, getJwtSecret()) as { sub: string; type: string };
  } catch {
    throwError('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN', 401);
  }

  if (payload.type !== 'refresh') {
    throwError('Invalid token type', 'INVALID_TOKEN_TYPE', 401);
  }

  const [user] = await db.select().from(users).where(eq(users.id, payload.sub));
  if (!user) {
    throwError('User not found', 'USER_NOT_FOUND', 401);
  }

  if (user.deactivatedAt) {
    throwError('This account has been deactivated', 'ACCOUNT_DEACTIVATED', 403);
  }

  return {
    accessToken: signAccessToken(user.id, user.role),
    refreshToken: signRefreshToken(user.id),
  };
}

/* ── Internal helpers ── */

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
