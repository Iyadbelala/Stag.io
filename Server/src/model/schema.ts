import { pgTable, text, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

/* ── Enums ── */
export const userRoleEnum = pgEnum('UserRole', ['student', 'company', 'admin', 'superadmin', 'university']);
export const offerTypeEnum = pgEnum('OfferType', ['remote', 'onsite', 'hybrid']);
export const offerStatusEnum = pgEnum('OfferStatus', ['draft', 'active', 'closed']);
export const applicationStatusEnum = pgEnum('ApplicationStatus', ['pending', 'accepted', 'rejected', 'withdrawn', 'validated']);

/* ── Users ── */
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  passwordHash: text('passwordHash').notNull(),
  role: userRoleEnum('role').default('student').notNull(),
  firstName: text('firstName'),
  lastName: text('lastName'),
  university: text('university'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull(),
});

/* ── Companies ── */
export const companies = pgTable('companies', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  companyName: text('companyName').notNull(),
  industry: text('industry'),
  website: text('website'),
  logoUrl: text('logoUrl'),
  description: text('description'),
  location: text('location'),
  contactPerson: text('contactPerson'),
  isValidated: boolean('isValidated').default(false).notNull(),
  verificationDocumentUrl: text('verificationDocumentUrl'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull(),
});

/* ── Students ── */
export const students = pgTable('students', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  department: text('department'),
  cvUrl: text('cvUrl'),
  skills: text('skills').array().default([]).notNull(),
  bio: text('bio'),
  profilePhotoUrl: text('profilePhotoUrl'),
  portfolioPhotos: text('portfolioPhotos').array().default([]).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull(),
});

/* ── Universities ── */
export const universities = pgTable('universities', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  universityName: text('universityName').notNull(),
  domain: text('domain').notNull().unique(),
  website: text('website'),
  logoUrl: text('logoUrl'),
  description: text('description'),
  location: text('location'),
  isValidated: boolean('isValidated').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull(),
});

/* ── Internship Offers ── */
export const internshipOffers = pgTable('internship_offers', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  companyId: text('companyId').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  requirements: text('requirements').notNull(),
  duration: text('duration').notNull(),
  location: text('location').notNull(),
  type: offerTypeEnum('type').default('onsite').notNull(),
  status: offerStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull(),
});

/* ── Saved Offers (bookmarks) ── */
export const savedOffers = pgTable('saved_offers', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  studentId: text('studentId').notNull().references(() => students.id, { onDelete: 'cascade' }),
  offerId: text('offerId').notNull().references(() => internshipOffers.id, { onDelete: 'cascade' }),
  savedAt: timestamp('savedAt', { withTimezone: true }).defaultNow().notNull(),
});

/* ── Applications ── */
export const applications = pgTable('applications', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  studentId: text('studentId').notNull().references(() => students.id, { onDelete: 'cascade' }),
  offerId: text('offerId').notNull().references(() => internshipOffers.id, { onDelete: 'cascade' }),
  coverLetter: text('coverLetter'),
  cvUrl: text('cvUrl'),
  status: applicationStatusEnum('status').default('pending').notNull(),
  appliedAt: timestamp('appliedAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull(),
});
