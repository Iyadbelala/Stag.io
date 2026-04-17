# Chapter 2 — Preliminary Study and Requirements Specification

---

## Chapter Outline

> 2.1 Introduction  
> 2.2 Project Presentation  
> 2.3 Actor Identification  
> 2.4 Requirements Specification  
> &emsp; 2.4.1 Functional Requirements  
> &emsp; 2.4.2 Non-Functional Requirements  
> 2.5 Use Case Diagrams  
> &emsp; 2.5.1 Global Use Case Diagram  
> &emsp; 2.5.2 Use Case Diagram — Student  
> &emsp; 2.5.3 Use Case Diagram — Company  
> &emsp; 2.5.4 Use Case Diagram — University  
> &emsp; 2.5.5 Use Case Diagram — Administrator  
> 2.6 Detailed Use Case Descriptions  
> &emsp; 2.6.1 Use Case: "Authenticate"  
> &emsp; 2.6.2 Use Case: "Apply for an Internship"  
> &emsp; 2.6.3 Use Case: "Manage Internship Offers"  
> 2.7 Conclusion  

---

## 2.1 Introduction

In the previous chapter, we presented the general context of the project and studied existing solutions in the field of internship management. In this second chapter, we will present the project to be developed, identify the different actors that interact with the system, and then establish the requirements specification by defining both functional and non-functional requirements. Finally, we will model the use cases along with their detailed textual descriptions.

---

## 2.2 Project Presentation

### 2.2.1 Project Objective

The **Stag.io** project (*stage* is the French word for *internship*) aims to design and develop a modern web platform dedicated to managing the complete internship lifecycle. The platform seeks to digitize the entire process — from the publication of internship offers by companies, through student applications, to the administrative validation of internship agreements by universities.

The main objective is to provide a unified space where all stakeholders in the internship process (students, companies, universities, and administrators) can collaborate efficiently and transparently, replacing traditional methods that often rely on manual exchanges (emails, paper documents, in-person visits).

### 2.2.2 Problem Statement

The traditional internship search and management process suffers from several issues:

- **Scattered offers**: Students must consult multiple sources (company websites, social media, word of mouth) to find relevant offers, which is time-consuming and inefficient.
- **Profile mismatch**: Conventional platforms display a generic chronological list of offers without considering the student's profile (skills, department, location), leading to irrelevant applications.
- **Administrative burden**: The validation of internship agreements between the university, the student, and the company still relies on manual and paper-based processes.
- **Lack of centralized tracking**: Neither universities nor companies have centralized tools to track the status of applications and agreements in real time.
- **No structured feedback**: Students lack a structured way to evaluate their internship experiences and guide future cohorts.

### 2.2.3 Proposed Solution

To address these issues, we propose **Stag.io**, a full-stack web platform that offers the following key features:

- **Intelligent offer discovery**: A proprietary recommendation engine called **SmartMatch** that ranks internship offers by relevance based on the student's profile (skills, academic department, location, job title), producing a composite score from 0 to 100 computed in real time in under 100 ms per request.
- **Complete application management**: A system allowing students to apply with one click, track their application status (pending, accepted, rejected, withdrawn), and enabling companies to manage their applicants from a dedicated dashboard.
- **Administrative validation**: A dedicated space for universities to validate internship agreements and monitor student progress.
- **Real-time communication**: A real-time notification system via WebSocket to inform stakeholders of application status changes, new registrations, and validation requests.
- **Intelligent chatbot**: An AI-powered conversational assistant (Google Gemini) to help users navigate the platform and answer frequently asked questions.
- **Review system**: A mechanism allowing students and companies to evaluate each other at the end of an internship.
- **CV and agreement generation**: Built-in tools to generate CVs and internship agreements in PDF format.
- **Secure authentication**: A robust authentication system based on JWT tokens (access + refresh), email verification (OTP), CAPTCHA protection (Cloudflare Turnstile), and role-based access control.

### 2.2.4 Project Scope

The project covers the following modules:

| Module | Description |
|:---|:---|
| Authentication | Registration (student, company, university), login, email verification via OTP, password reset, JWT token management |
| Offer Management | Creation, editing, deletion, and publication of internship offers (draft, active, closed) |
| Applications | Application submission with cover letter and CV, status tracking, application withdrawal |
| SmartMatch | Intelligent recommendation engine based on 4 dimensions: skills (50%), department (25%), location (15%), title (10%) |
| Profiles | Student profile management (skills, bio, portfolio, CV) and company profile management (logo, industry, verification documents) |
| Dashboards | Role-specific dashboards with statistics and analytics |
| Administration | User management, company and university approval, super admin panel |
| Universities | Internship agreement validation, student tracking, domain-based authentication |
| Notifications | Real-time notifications via Socket.IO for platform events |
| AI Chatbot | Integrated conversational assistant (Google Gemini) with conversation history |
| Reviews | Mutual evaluation system between students and companies after internships |
| Saved Offers | Bookmark system allowing students to save offers for later |
| PDF Generation | CV and internship agreement generation in PDF format |
| Internationalization | Full bilingual support (English / French) |

---

## 2.3 Actor Identification

An actor represents an external entity (person, system, or device) that interacts with the system to achieve a goal. Within the scope of Stag.io, we have identified **five (5) primary actors** and **four (4) secondary actors**.

### 2.3.1 Actor Summary Table

| Actor | Type | Description |
|:---|:---|:---|
| Student | Primary | A user registered with the `student` role. They search for internship offers, apply to offers, manage their profile and CV, access SmartMatch recommendations, and can review companies after completing an internship. Registration requires an email belonging to a validated university's domain. |
| Company | Primary | A user registered with the `company` role. They publish internship offers, manage received applications, administer their company profile, and view dashboard statistics. Their registration is subject to administrator approval. |
| University | Primary | A user registered with the `university` role. They validate internship agreements, track the progress of students affiliated with their domain, and manage their university profile. Their registration is subject to administrator approval. |
| Administrator | Primary | A user with the `admin` role. They oversee platform operations, approve company and university registrations, manage users, and control system access. |
| Super Administrator | Primary | A user with the `superadmin` role. They possess all administrator privileges with additional system-wide management capabilities, including administrator account management. |

### 2.3.2 Detailed Actor Descriptions

#### a) Student

The student is the central actor of the platform. They register using their university email address (the email domain must match that of a university previously validated on the platform). After verifying their email using a 6-digit OTP code, they can:

- Browse and filter available internship offers (by type: on-site, remote, hybrid)
- Activate **SmartMatch** mode to receive offers ranked by relevance to their profile
- Apply to internship offers with a cover letter and CV
- Track application status in real time (pending, accepted, rejected, withdrawn)
- Manage their profile: skills, biography, portfolio photos, academic department
- Generate and download their CV in PDF format
- Save offers as bookmarks for later viewing
- Review companies and internship experiences through the review system
- Interact with the AI chatbot for assistance
- Receive real-time notifications on application status changes

#### b) Company

A company registers on the platform by providing its information (company name, industry, location, contact person) and, optionally, a verification document. The account is created upon registration, but it must be **validated by an administrator** for its offers to become fully operational. Its actions include:

- Publishing internship offers with title, description, requirements, duration, location, and type (on-site, remote, hybrid)
- Managing offer status (draft, active, closed)
- Viewing and processing received applications (accept, reject)
- Managing the company profile (logo, description, website, verification documents)
- Viewing the dashboard with statistics and analytics
- Reviewing student interns through the review system
- Receiving real-time notifications on new applications

#### c) University

A university registers by providing its name, **email domain** (e.g., `univ-constantine2.dz`), website, and location. This domain is essential as it automatically links students who register with an email address from the same domain to this university. The university's registration must be **validated by an administrator** before students can register using its domain. Its actions include:

- Validating internship agreements for affiliated students
- Tracking the progress and application status of students
- Managing the university profile (logo, description, website)
- Viewing the dashboard with statistics on students and internships
- Receiving notifications regarding agreement validation requests

#### d) Administrator

The administrator is responsible for the day-to-day supervision of the platform. They can:

- Approve or reject company and university registrations
- Manage user accounts (view, deactivate, modify roles)
- View global platform statistics
- Moderate content and reviews
- Receive notifications on new registrations requiring approval

#### e) Super Administrator

The super administrator possesses all administrator privileges with additional capabilities:

- Manage administrator accounts (create, modify, delete)
- Full control over all platform entities (users, companies, universities, offers)
- Full access to the super administration panel
- System-wide role and permission management

### 2.3.3 Secondary Actors

In addition to the primary actors, the following secondary actors interact with the system in an automated manner:

| Secondary Actor | Description |
|:---|:---|
| Mail Server (SMTP) | External service (via Nodemailer) used for sending account verification emails and password reset emails. |
| Cloud Storage Service (Cloudinary) | External service used for hosting images (logos, profile photos, portfolio) and documents (CVs, company verification documents). |
| AI Service (Google Gemini) | External service used by the intelligent chatbot to generate contextual responses to user queries. |
| CAPTCHA Service (Cloudflare Turnstile) | External service used for bot protection during authentication processes (registration and login). |

---

## 2.4 Requirements Specification

The requirements specification defines what the system must do (functional requirements) and the quality attributes it must satisfy (non-functional requirements). These requirements are derived from the project objectives, the actor analysis, and the limitations of existing solutions identified in Chapter 1.

### 2.4.1 Functional Requirements

The functional requirements describe the specific behaviors and services that the system must provide. They are organized by actor to clearly delineate each stakeholder's interactions with the platform.

#### a) Functional Requirements — Student

| Requirement | Description |
|:---|:---|
| Register with university email | The student must register using an email address whose domain matches a validated university on the platform. |
| Verify email via OTP | After registration, the student must verify their email by entering a 6-digit one-time password (OTP) sent to their inbox. The code expires after 15 minutes. |
| Log in / Log out | The student can authenticate using their email and password, and log out at any time. |
| Reset password | The student can request a password reset link sent to their email. The link expires after 1 hour. |
| Browse internship offers | The student can view all active internship offers with filtering options (type: on-site, remote, hybrid). |
| Use SmartMatch recommendations | The student can activate SmartMatch mode to receive offers ranked by a relevance score (0–100) based on their profile: skills (50%), department (25%), location (15%), and title match (10%). |
| Apply to an internship offer | The student can submit an application to an offer by attaching a cover letter and/or CV. A student cannot apply to the same offer twice. |
| Track application status | The student can view the real-time status of their applications (pending, accepted, rejected, withdrawn, validated). |
| Withdraw an application | The student can withdraw a pending application before the company has processed it. |
| Manage profile | The student can update their personal information: skills, biography, academic department, portfolio photos, LinkedIn/GitHub URLs, and profile photo. |
| Generate CV in PDF | The student can generate and download a formatted CV in PDF based on their profile data. |
| Save offers as bookmarks | The student can bookmark offers for later viewing and remove bookmarks. |
| Review a company | After completing an internship (application status = accepted), the student can leave a rating (1–5) and a comment for the company. |
| Interact with AI chatbot | The student can use the integrated AI chatbot (powered by Google Gemini) to ask questions about the platform, with conversation history preserved. |
| Receive real-time notifications | The student receives real-time notifications (via WebSocket) when their application status changes. |
| Search offers | The student can search offers by keyword, filtering by title, description, or requirements. |
| View dashboard statistics | The student can view their personal dashboard displaying application statistics and activity summary. |

#### b) Functional Requirements — Company

| Requirement | Description |
|:---|:---|
| Register a company account | The company can register by providing company name, industry, location, contact person, and optionally a verification document. |
| Log in / Log out | The company can authenticate and log out. |
| Create an internship offer | The company can create a new offer with title, description, requirements, duration, location, type (on-site/remote/hybrid), and optional banner image. Offers can be saved as draft or published as active. |
| Edit an internship offer | The company can modify the details of an existing offer. |
| Change offer status | The company can change an offer's status between draft, active, and closed. |
| Delete an internship offer | The company can delete an offer. Deleting an offer cascades to remove associated applications. |
| View received applications | The company can view all applications received for each of its offers, including applicant details, cover letter, and CV. |
| Process applications | The company can accept or reject applications. Status changes trigger real-time notifications to the applicant. |
| Manage company profile | The company can update its profile: logo, description, website, industry, location, and verification documents. |
| View dashboard statistics | The company can view dashboard analytics: total offers, total applications, acceptance rates, and recent activity. |
| Review a student | After an internship (application status = accepted), the company can leave a rating and comment for the student intern. |
| Receive real-time notifications | The company receives notifications when a student submits a new application. |

#### c) Functional Requirements — University

| Requirement | Description |
|:---|:---|
| Register a university account | The university can register by providing its name, email domain (e.g., `univ-constantine2.dz`), website, and location. |
| Log in / Log out | The university can authenticate and log out. |
| Validate internship agreements | The university can validate or reject internship agreements for students whose email domain matches the university's registered domain. |
| Track affiliated students | The university can view the list of students registered with its email domain, along with their application statuses and internship progress. |
| Manage university profile | The university can update its profile: logo, description, website, and location. |
| View dashboard statistics | The university can view dashboard analytics: total affiliated students, active internships, and agreement validation statistics. |
| Receive real-time notifications | The university receives notifications when an agreement requires validation. |

#### d) Functional Requirements — Administrator

| Requirement | Description |
|:---|:---|
| Approve/reject company registrations | The administrator can review and approve or reject company registration requests. |
| Approve/reject university registrations | The administrator can review and approve or reject university registration requests. |
| Manage user accounts | The administrator can view all users, deactivate accounts, and modify user roles. |
| View platform statistics | The administrator can view global platform statistics: total users by role, total offers, total applications, and recent activity. |
| Generate platform reports | The administrator can generate detailed PDF reports containing platform-wide statistics and analytics. |
| Receive real-time notifications | The administrator receives notifications when a new company or university registers and requires approval. |

#### e) Functional Requirements — Super Administrator

| Requirement | Description |
|:---|:---|
| All administrator privileges | The super administrator inherits all functional requirements of the administrator. |
| Manage administrator accounts | The super administrator can create, modify, and delete administrator accounts. |
| Full entity control | The super administrator has unrestricted access to manage all platform entities (users, companies, universities, offers, applications). |
| View audit logs | The super administrator can view audit logs recording all significant actions performed on the platform (actor, action, target, timestamp). |

#### f) Cross-Cutting Functional Requirements

| Requirement | Description |
|:---|:---|
| Bilingual support (EN/FR) | The platform must support full internationalization in English and French, with dynamic language switching. |
| CAPTCHA protection | Registration and login forms must be protected by CAPTCHA (Cloudflare Turnstile) to prevent automated bot attacks. |
| Token-based authentication | The system must use JWT-based authentication with short-lived access tokens (15 minutes) and long-lived refresh tokens (7 days). |
| Account lockout on failed attempts | The system must lock an account temporarily after multiple consecutive failed login attempts to prevent brute-force attacks. |
| Real-time notifications via WebSocket | The system must deliver notifications in real time using Socket.IO, without requiring page refresh. |
| Cloud-based file storage | All uploaded files (images, documents, CVs) must be stored on an external cloud storage service (Cloudinary). |

### 2.4.2 Non-Functional Requirements

Non-functional requirements define the quality attributes and constraints that the system must satisfy. They describe *how* the system performs its functions rather than *what* it does.

| Category | Requirement |
|:---|:---|
| **Performance** | The SmartMatch recommendation engine must compute and return results in under 100 ms per request and score up to 500 offers in real time. |
| **Performance** | API response times must not exceed 500 ms for standard operations (CRUD) under normal load conditions. |
| **Performance** | Real-time notifications must be delivered to connected clients within 1 second of the triggering event. |
| **Security** | Passwords must be hashed using bcrypt with a cost factor of 12 rounds before storage. Plain-text passwords must never be stored or logged. |
| **Security** | Verification codes and password reset tokens must be hashed with SHA-256 before storage. Only the hash is persisted; the plain-text value is sent to the user. |
| **Security** | The system must implement role-based access control (RBAC) with five distinct roles: student, company, university, admin, superadmin. Each API endpoint must enforce role-based authorization. |
| **Security** | JWT access tokens must expire after 15 minutes. Refresh tokens must expire after 7 days. Token refresh must issue both a new access token and a new refresh token (token rotation). |
| **Security** | The system must prevent email enumeration by returning generic error messages during password reset and email verification flows. |
| **Usability** | The user interface must be responsive and adapt to all screen sizes (desktop, tablet, mobile) following a mobile-first approach. |
| **Usability** | The platform must provide a premium, modern user experience with smooth transitions, micro-animations, and an intuitive navigation structure. |
| **Usability** | Error messages must be clear, contextual, and guide the user toward resolving the issue. |
| **Reliability** | The system must handle errors gracefully without exposing internal implementation details (stack traces, database queries) to end users. |
| **Reliability** | File uploads must be validated for type and size before processing. Only allowed MIME types (images: JPEG, PNG, WebP; documents: PDF) must be accepted. |
| **Scalability** | The database schema must use proper indexing on frequently queried columns (offer status, application status, user ID, company ID) to ensure efficient query performance as data grows. |
| **Scalability** | The system architecture must separate concerns between the frontend (Next.js), backend API (Express), and database (PostgreSQL), enabling independent scaling of each tier. |
| **Maintainability** | The codebase must follow a modular architecture with clear separation between routing, business logic (services), data access (ORM), and middleware layers. |
| **Maintainability** | All database schema changes must be managed through a migration system (Drizzle ORM) to ensure reproducible and versioned schema evolution. |
| **Availability** | The system must support graceful shutdown, allowing in-flight requests to complete before the server process terminates. |
| **Auditability** | All significant administrative actions (user deactivation, role changes, approval/rejection decisions) must be recorded in an audit log with actor, action, target, and timestamp. |
| **Compatibility** | The web application must be compatible with the latest versions of major browsers: Google Chrome, Mozilla Firefox, Microsoft Edge, and Safari. |

---

*The following sections (2.5 Use Case Diagrams, 2.6 Detailed Use Case Descriptions, 2.7 Conclusion) will be written in the coming days according to the established schedule.*
