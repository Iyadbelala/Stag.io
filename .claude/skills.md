# Stag.io — Skills & Knowledge Base

> **Purpose:** Shared knowledge base for all team members and AI assistants.  
> Documents learned concepts, design decisions, architecture patterns, and technical skills.  
> **Update this file** whenever you learn something new or make a technical decision.

---

## Table of Contents
1. [Project Overview](#-project-overview)
2. [Design Language](#-design-language)
3. [Tech Stack Deep Dive](#-tech-stack-deep-dive)
4. [Architecture — MCP](#-architecture--mcp)
5. [User Spaces & Features](#-user-spaces--features)
6. [Database Design](#-database-design)
7. [API Design](#-api-design)
8. [Skills & Concepts Learned](#-skills--concepts-learned)
9. [Folder Structure](#-folder-structure)
10. [Environment Setup](#-environment-setup)
11. [Glossary](#-glossary)
12. [Changelog](#-changelog)

---

## 🎯 Project Overview

**Stag.io** is an internship management web platform built as a graduation project (Atelier TI 2025-2026).

### Problem Statement
The internship process at universities is fragmented — students struggle to find relevant opportunities, companies lack a centralized channel to reach students, and administration relies on manual paperwork for validation and tracking. There's no unified platform connecting all three parties.

### Solution
A modern web platform that digitizes the entire internship lifecycle:
- **Discovery** → Students browse and search internship offers
- **Application** → Students apply; companies review and respond
- **Validation** → Administration approves and tracks agreements
- **Monitoring** → Real-time dashboards for all three user types

### Target Users
| Actor | Description |
|-------|-------------|
| **Students** | University students seeking internships |
| **Companies / Recruiters** | Organizations offering internship positions |
| **Administration** | Department heads and internship office staff |

---

## 🎨 Design Language

### Design Philosophy
- **Warm & Professional:** The coffee-inspired palette conveys trust and warmth
- **Clean & Readable:** High contrast text on cream backgrounds for readability
- **Elegant Typography:** Playfair Display serif headings give a premium feel, Inter body text ensures readability
- **Minimal UI:** Let content breathe — generous whitespace, clear hierarchy

### Color Palette

#### Primary Colors (Brand Core)
```
Dark Coffee    #4B2E2B  → Navbar, Footer, Strong Titles
Warm Brown     #7A4E3A  → Buttons, Links, CTAs
Soft Gold      #C8A96A  → Hover states, Highlights, Tags, Badges
```

#### Background & Surfaces
```
Cream Beige    #F5EFE6  → Main page background
White          #FFFFFF  → Card backgrounds, modals
Light Sand     #EFE6D8  → Soft section backgrounds, alternating rows
```

#### Text Colors
```
Dark Charcoal  #2E2E2E  → Primary body text
Soft Brown Gray #5C5C5C → Secondary/supporting text
Light Gray Brown #8A817C → Muted text, captions, timestamps
Cream White    #FDF8F3  → Text on dark backgrounds (navbar, footer)
```

#### Semantic Colors (for states)
```
Success        #4A7C59  → Approved, accepted, online
Warning        #D4A934  → Pending, awaiting review
Error          #C0392B  → Rejected, error states
Info           #5B7FA5  → Information banners, tips
```

### Tailwind CSS Config (Reference)
```ts
// tailwind.config.ts — colors section
colors: {
  coffee: {
    dark: '#4B2E2B',
    warm: '#7A4E3A',
    gold: '#C8A96A',
  },
  surface: {
    cream: '#F5EFE6',
    white: '#FFFFFF',
    sand: '#EFE6D8',
  },
  text: {
    primary: '#2E2E2E',
    secondary: '#5C5C5C',
    muted: '#8A817C',
    inverse: '#FDF8F3',
  },
  status: {
    success: '#4A7C59',
    warning: '#D4A934',
    error: '#C0392B',
    info: '#5B7FA5',
  },
}
```

### Typography System

#### Font Pairing
| Usage | Font | Weights |
|-------|------|---------|
| Logo | Playfair Display | Bold (700) |
| H1 | Playfair Display | SemiBold (600) |
| H2 | Playfair Display | Medium (500) |
| H3 | Playfair Display | Regular (400) |
| Body text | Inter | Regular (400) |
| Buttons | Inter | Medium (500) |
| Labels | Inter | Medium (500) |
| Small/Caption | Inter | Regular (400) |

#### Font Sizes (Recommended Scale)
```
H1:      2.25rem  (36px)  — Page titles
H2:      1.75rem  (28px)  — Section titles
H3:      1.25rem  (20px)  — Sub-section titles
Body:    1rem     (16px)  — Paragraph text
Small:   0.875rem (14px)  — Labels, captions
XSmall:  0.75rem  (12px)  — Timestamps, badges
```

### Logo Specification
```
"Stag"  → Playfair Display Bold — Dark Coffee (#4B2E2B)
"."     → Playfair Display Bold — Soft Gold (#C8A96A)
"io"    → Playfair Display Bold — Muted Sage Green (~#7D8B75)
```
- The dot acts as a visual accent separating "Stag" from "io"
- Background: Cream Beige (#F5EFE6) or transparent

### Component Design Patterns
- **Buttons:** Rounded corners (8px), Warm Brown bg, Cream White text, Gold hover
- **Cards:** White bg, subtle shadow (`shadow-sm`), rounded (12px), 24px padding
- **Inputs:** Cream Beige bg, 1px Light Sand border, Dark Charcoal text
- **Navbar:** Dark Coffee bg, Cream White text, Gold hover underline
- **Footer:** Dark Coffee bg, matching navbar style
- **Tags/Badges:** Soft Gold bg, Dark Coffee text, small rounded pills

---

## 🛠 Tech Stack Deep Dive

### Next.js (App Router)
- **What:** Full-stack React framework with server-side rendering, file-based routing, and API routes
- **Version:** Latest stable (v14+)
- **Why:** SSR for SEO, built-in API routes, excellent DX, great for MCP architecture
- **Key Concepts:**
  - `app/` directory for routing (App Router)
  - Server Components (default) vs Client Components (`"use client"`)
  - Server Actions for form handling
  - Middleware for auth and route protection
  - `layout.tsx` for shared layouts
  - `loading.tsx` and `error.tsx` for UX states

### React
- **What:** UI component library
- **Key Concepts:**
  - Functional components only (no class components)
  - Hooks: `useState`, `useEffect`, `useContext`, `useMemo`, `useCallback`
  - Custom hooks for reusable logic
  - Props typing with TypeScript interfaces
  - Component composition over inheritance

### TypeScript
- **What:** Typed superset of JavaScript
- **Why:** Catch bugs at compile time, better DX with autocomplete, self-documenting code
- **Key Rules:**
  - Strict mode enabled
  - No `any` type — use `unknown` if type is uncertain
  - Define interfaces for all data shapes
  - Use enums or union types for fixed values
  - Generic types for reusable utilities

### PostgreSQL + Neon
- **What:** Relational database hosted on Neon (serverless Postgres)
- **Why:** Reliable, scalable, and Neon offers branching + serverless scaling
- **Key Concepts:**
  - Connection pooling via Neon's serverless driver
  - Database branching for dev/preview environments
  - Migrations for schema changes
  - Prisma or Drizzle ORM (TBD)

### Express.js
- **What:** Minimal Node.js web framework for building APIs
- **Usage:** May be used alongside Next.js API routes or as a standalone backend service
- **Key Concepts:**
  - Middleware pattern (auth, logging, error handling)
  - Router for organizing endpoints
  - Request validation
  - Error handling middleware

---

## 🏗 Architecture — MCP

### Model-Context-Protocol Pattern

```
┌─────────────────────────────────────────────┐
│                  PROTOCOL                    │
│  (API Routes, Request/Response Contracts)    │
│  - Route definitions                         │
│  - Request validation (Zod schemas)          │
│  - Response formatting                       │
│  - Authentication middleware                 │
├─────────────────────────────────────────────┤
│                  CONTEXT                     │
│  (Business Logic, State, Services)           │
│  - Use cases / service functions             │
│  - Business rules and validation             │
│  - State management                          │
│  - Data transformation                       │
├─────────────────────────────────────────────┤
│                   MODEL                      │
│  (Database, Data Access Layer)               │
│  - Database schemas / models                 │
│  - ORM queries (Prisma/Drizzle)              │
│  - Migrations                                │
│  - Seed data                                 │
└─────────────────────────────────────────────┘
```

### Layer Rules
1. **Protocol** → Only handles HTTP concerns. Calls Context, never touches Model directly.
2. **Context** → Contains all business logic. Calls Model for data. No HTTP awareness.
3. **Model** → Only database operations. No business logic. No HTTP awareness.

### Data Flow Example
```
User clicks "Apply" →
  Protocol: POST /api/applications (validates request) →
    Context: createApplication(data) (checks eligibility, business rules) →
      Model: db.application.create(data) (inserts into DB) →
    Context: returns result →
  Protocol: sends JSON response →
UI updates
```

---

## 👥 User Spaces & Features

### A. Student Space
| Feature | Description | Priority |
|---------|-------------|----------|
| Browse Offers | Search and filter internship listings | High |
| Apply | Submit applications with CV/cover letter | High |
| Track Status | View application status (pending/accepted/rejected) | High |
| Profile | Manage personal info, skills, CV upload | High |
| History | View past internships and evaluations | Medium |
| Notifications | Receive updates on application status changes | Medium |

### B. Company / Recruiter Space
| Feature | Description | Priority |
|---------|-------------|----------|
| Post Offers | Create and publish internship listings | High |
| Manage Applications | Review, accept, or reject student applications | High |
| Company Profile | Manage company info, logo, description | High |
| Dashboard | Overview of active offers and statistics | Medium |
| Communication | Message students about their applications | Medium |

### C. Administration Space
| Feature | Description | Priority |
|---------|-------------|----------|
| Oversight Dashboard | View all internships, students, companies | High |
| Validate Agreements | Approve or reject internship conventions | High |
| User Management | Manage student/company accounts | High |
| Reports | Generate statistics and export data | Medium |
| Settings | Configure system parameters and workflows | Low |

---

## 🗄 Database Design

> **Status:** To be designed  
> **ORM:** TBD (Prisma or Drizzle)

### Core Entities (Planned)
```
User
├── id, email, password_hash, role (student|company|admin)
├── created_at, updated_at

Student (extends User)
├── first_name, last_name, university, department
├── cv_url, skills[], bio

Company (extends User)
├── company_name, industry, website, logo_url
├── description, location, contact_person

InternshipOffer
├── id, company_id (FK), title, description
├── requirements, duration, location, type (remote|onsite|hybrid)
├── status (active|closed|draft), created_at

Application
├── id, student_id (FK), offer_id (FK)
├── cover_letter, cv_url, status (pending|accepted|rejected)
├── applied_at, updated_at

InternshipAgreement
├── id, application_id (FK), admin_id (FK)
├── status (pending|approved|rejected)
├── start_date, end_date, validated_at
```

---

## 🔌 API Design

> **Status:** To be designed  
> **Pattern:** RESTful with consistent response format

### Response Format (Standard)
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42
  }
}
```

### Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [...]
  }
}
```

### Planned Endpoints
```
Auth:
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/logout
  GET    /api/auth/me

Students:
  GET    /api/students/:id
  PUT    /api/students/:id
  GET    /api/students/:id/applications

Companies:
  GET    /api/companies/:id
  PUT    /api/companies/:id
  GET    /api/companies/:id/offers

Offers:
  GET    /api/offers
  POST   /api/offers
  GET    /api/offers/:id
  PUT    /api/offers/:id
  DELETE /api/offers/:id

Applications:
  POST   /api/applications
  GET    /api/applications/:id
  PUT    /api/applications/:id/status

Admin:
  GET    /api/admin/dashboard
  GET    /api/admin/agreements
  PUT    /api/admin/agreements/:id/validate
```

---

## 📚 Skills & Concepts Learned

### Skill 1: Next.js App Router
- **What:** File-based routing system using the `app/` directory
- **Key Concepts:** Layouts, Server Components, Client Components, Loading/Error states
- **Why it matters:** Foundation of our entire frontend architecture
- **Resources:** [Next.js Docs](https://nextjs.org/docs)

### Skill 2: TypeScript Strict Mode
- **What:** Writing fully-typed TypeScript with strict compiler checks
- **Key Concepts:** Interfaces, generics, union types, type guards, utility types
- **Why it matters:** Prevents bugs, enables team collaboration with clear contracts
- **Resources:** [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)

### Skill 3: Neon Serverless Postgres
- **What:** PostgreSQL database hosted on Neon's serverless platform
- **Key Concepts:** Connection pooling, branching, serverless scaling
- **Why it matters:** Our data persistence layer — all three user spaces depend on it
- **Resources:** [Neon Docs](https://neon.tech/docs)

### Skill 4: MCP Architecture
- **What:** Model-Context-Protocol — a layered architecture pattern
- **Key Concepts:** Separation of concerns, data layer, business logic layer, API layer
- **Why it matters:** Keeps codebase organized as it grows, enables parallel development
- **Resources:** Internal documentation (this file)

### Skill 5: Design System Implementation
- **What:** Translating a design language into reusable code (Tailwind config, components)
- **Key Concepts:** CSS variables, Tailwind theming, component composition, design tokens
- **Why it matters:** Ensures visual consistency across the entire platform
- **Resources:** [Tailwind Docs](https://tailwindcss.com/docs)

---

## 📁 Folder Structure (Planned)

```
Stag.io/
├── .claude                    # AI assistant context file
├── skills.md                  # This file — knowledge base
├── README.md                  # Project overview
├── LICENSE                    # MIT License
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Auth group (login, register)
│   │   ├── (student)/         # Student space pages
│   │   ├── (company)/         # Company space pages
│   │   ├── (admin)/           # Admin space pages
│   │   ├── api/               # API routes (Protocol layer)
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Global styles
│   │
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # Base components (Button, Input, Card)
│   │   ├── layout/            # Navbar, Footer, Sidebar
│   │   └── shared/            # Shared feature components
│   │
│   ├── context/               # Context layer (business logic)
│   │   ├── services/          # Service functions (use cases)
│   │   └── hooks/             # Custom React hooks
│   │
│   ├── model/                 # Model layer (data access)
│   │   ├── schema/            # Database schemas
│   │   ├── queries/           # Database query functions
│   │   └── migrations/        # Database migrations
│   │
│   ├── lib/                   # Utility libraries
│   │   ├── db.ts              # Database connection (Neon)
│   │   ├── auth.ts            # Authentication utilities
│   │   └── utils.ts           # General utilities
│   │
│   └── types/                 # TypeScript type definitions
│       ├── student.ts
│       ├── company.ts
│       ├── offer.ts
│       ├── application.ts
│       └── api.ts
│
├── public/                    # Static assets
│   ├── logo.svg               # Stag.io logo
│   └── images/
│
├── tailwind.config.ts         # Tailwind with design system colors
├── tsconfig.json              # TypeScript config (strict)
├── next.config.ts             # Next.js configuration
├── package.json
└── .env.local                 # Environment variables (never commit)
```

---

## ⚙️ Environment Setup

### Prerequisites
- Node.js v18+ (LTS recommended)
- npm or pnpm
- Git
- Neon account (for PostgreSQL)
- VS Code with extensions: ESLint, Prettier, Tailwind CSS IntelliSense

### Getting Started
```bash
# Clone the repository
git clone https://github.com/Iyadbelala/Stag.io.git
cd Stag.io

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in: DATABASE_URL, NEXTAUTH_SECRET, etc.

# Run development server
npm run dev
```

### Environment Variables Needed
```
DATABASE_URL=         # Neon PostgreSQL connection string
NEXTAUTH_SECRET=      # Random secret for auth
NEXTAUTH_URL=         # http://localhost:3000 (dev)
```

---

## 📖 Glossary

| Term | Definition |
|------|------------|
| **MCP** | Model-Context-Protocol — the architecture pattern used in this project |
| **Stag** | Short for "Stage" (French for internship) |
| **Neon** | Serverless PostgreSQL hosting provider |
| **App Router** | Next.js routing system using the `app/` directory |
| **Server Component** | React component that renders on the server (default in Next.js) |
| **Client Component** | React component that renders in the browser (`"use client"`) |
| **Convention** | Internship agreement document signed by student, company, and university |
| **SSR** | Server-Side Rendering |
| **ORM** | Object-Relational Mapping (Prisma/Drizzle) |
| **Design Tokens** | Named values (colors, fonts, spacing) that define the design system |

---

## 🔄 Changelog

| Date | Author | Change |
|------|--------|--------|
| 2026-02-14 | Team | Initial project setup — created `.claude`, `skills.md`, `README.md` |
| | | Defined design language (coffee theme, Playfair + Inter) |
| | | Defined tech stack (Next.js, React, TypeScript, PostgreSQL/Neon, Express) |
| | | Planned MCP architecture and folder structure |
| | | Documented three user spaces and core features |
