// Shared type definitions used by both app and server
import { UserRole } from '../constants/roles';
import { ApplicationStatus, OfferStatus, AgreementStatus } from '../constants/status';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  university: string;
  department: string;
  cvUrl?: string;
  skills: string[];
  bio?: string;
}

export interface Company {
  id: string;
  userId: string;
  companyName: string;
  industry: string;
  website?: string;
  logoUrl?: string;
  description?: string;
  location: string;
  contactPerson: string;
}

export interface InternshipOffer {
  id: string;
  companyId: string;
  title: string;
  description: string;
  requirements: string;
  duration: string;
  location: string;
  type: 'remote' | 'onsite' | 'hybrid';
  status: OfferStatus;
  createdAt: Date;
}

export interface Application {
  id: string;
  studentId: string;
  offerId: string;
  coverLetter?: string;
  cvUrl?: string;
  status: ApplicationStatus;
  appliedAt: Date;
  updatedAt: Date;
}

export interface InternshipAgreement {
  id: string;
  applicationId: string;
  adminId: string;
  status: AgreementStatus;
  startDate: Date;
  endDate: Date;
  validatedAt?: Date;
}

// Standard API response types
export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
