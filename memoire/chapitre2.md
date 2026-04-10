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

*The following sections (2.4 Requirements Specification, 2.5 Use Case Diagrams, 2.6 Detailed Use Case Descriptions, 2.7 Conclusion) will be written in the coming days according to the established schedule.*
