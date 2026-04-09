import { pgTable, text, boolean, timestamp, pgEnum, integer, jsonb, unique, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

/* ── Enums ── */
export const userRoleEnum = pgEnum('UserRole', ['student', 'company', 'admin', 'superadmin', 'university']);
export const offerTypeEnum = pgEnum('OfferType', ['remote', 'onsite', 'hybrid']);
export const offerStatusEnum = pgEnum('OfferStatus', ['draft', 'active', 'closed']);
export const applicationStatusEnum = pgEnum('ApplicationStatus', ['pending', 'accepted', 'rejected', 'withdrawn', 'validated']);
export const notificationTypeEnum = pgEnum('NotificationType', [
  'application_status_changed',
  'new_application',
  'agreement_needs_validation',
  'company_pending_approval',
  'university_pending_approval',
  'new_review',
]);

/* ── Users ── */
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  passwordHash: text('passwordHash').notNull(),
  role: userRoleEnum('role').default('student').notNull(),
  firstName: text('firstName'),
  lastName: text('lastName'),
  university: text('university'),
  isEmailVerified: boolean('isEmailVerified').default(false).notNull(),
  emailVerificationCode: text('emailVerificationCode'),
  emailVerificationExpiry: timestamp('emailVerificationExpiry', { withTimezone: true }),
  passwordResetToken: text('passwordResetToken'),
  passwordResetExpiry: timestamp('passwordResetExpiry', { withTimezone: true }),
  deactivatedAt: timestamp('deactivatedAt', { withTimezone: true }),
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
  bannerUrl: text('bannerUrl'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_offers_company').on(table.companyId),
  index('idx_offers_status').on(table.status),
]);

/* ── Saved Offers (bookmarks) ── */
export const savedOffers = pgTable('saved_offers', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  studentId: text('studentId').notNull().references(() => students.id, { onDelete: 'cascade' }),
  offerId: text('offerId').notNull().references(() => internshipOffers.id, { onDelete: 'cascade' }),
  savedAt: timestamp('savedAt', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique('uq_saved_student_offer').on(table.studentId, table.offerId),
  index('idx_saved_student').on(table.studentId),
]);

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
}, (table) => [
  unique('uq_application_student_offer').on(table.studentId, table.offerId),
  index('idx_applications_student').on(table.studentId),
  index('idx_applications_offer').on(table.offerId),
  index('idx_applications_status').on(table.status),
]);

/* ── Reviews ── */
export const reviewerRoleEnum = pgEnum('ReviewerRole', ['student', 'company']);

export const reviews = pgTable('reviews', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  applicationId: text('applicationId').notNull().references(() => applications.id, { onDelete: 'cascade' }),
  reviewerUserId: text('reviewerUserId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  revieweeUserId: text('revieweeUserId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reviewerRole: reviewerRoleEnum('reviewerRole').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
});

/* ── Notifications ── */
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: boolean('isRead').default(false).notNull(),
  relatedId: text('relatedId'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_notifications_user').on(table.userId),
  index('idx_notifications_read').on(table.userId, table.isRead),
]);

/* ── Audit Logs ── */
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  actorId: text('actorId').notNull(),
  actorRole: text('actorRole').notNull(),
  action: text('action').notNull(),
  targetId: text('targetId'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
});
