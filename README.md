<div align="center">

<img src="https://img.shields.io/badge/☕-Stag.io-4B2E2B?style=for-the-badge&labelColor=F5EFE6" alt="Stag.io" height="40"/>

# Stag.io

**The modern internship management platform that connects students, companies & universities.**

[![Next.js](https://img.shields.io/badge/Next.js_16-000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express_5-000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat-square&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat-square&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![License: MIT](https://img.shields.io/badge/License-MIT-C8A96A?style=flat-square)](LICENSE)

<br/>

[Features](#-features) · [SmartMatch](#-smartmatch) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Architecture](#-architecture) · [API Reference](#-api-reference) · [Team](#-team)

</div>

---

## Overview

**Stag.io** (_stage_ is French for _internship_) is a full-stack web platform that digitizes the entire internship lifecycle — from opportunity discovery and application to administrative validation and agreement tracking.

Built as a graduation capstone project (**Atelier TI 2025 – 2026**), it provides a unified experience for every stakeholder in the internship process:

<div align="center">

| Role | Capabilities |
|:---|:---|
| **Students** | Browse & filter offers, apply with one click, track applications, build profile & CV, get SmartMatch recommendations, save favorite offers, review companies |
| **Companies** | Post internship offers, manage applicants, company dashboard & analytics, upload verification docs, view & respond to reviews |
| **Universities** | Validate internship agreements, monitor student progress, domain-based authentication, university dashboard |
| **Admins** | Oversee platform operations, manage users & roles, approve companies/universities, super admin panel for system-wide control |

</div>

---

## Features

<table>
<tr>
<td width="50%">

### Frontend
- Animated hero section with live stats & carousel
- Glassmorphism authentication with split-layout design
- Dark mode with explosion animation (View Transitions API)
- Bilingual support (English / French) with full i18n
- Fully responsive mobile-first design
- Coffee-inspired design system with custom theme tokens
- Accessible form components with real-time validation
- SmartMatch — intelligent internship matching with score rings
- AI-powered chatbot (Gemini) with theme-aware UI
- Real-time notifications via Socket.IO
- CV generation & download (PDF)
- Saved offers & review system

</td>
<td width="50%">

### Backend
- JWT authentication with refresh tokens & httpOnly cookies
- Role-based access control (5 roles) with per-route middleware
- RESTful API with Express 5 & strict middleware pipeline
- PostgreSQL via Drizzle ORM on Neon (serverless)
- Cloudinary integration for images & document uploads
- PDF generation for internship agreements (PDFKit)
- AI chatbot service powered by Google Gemini
- MCP (Model-Context-Protocol) server integration
- Real-time notifications with Socket.IO
- Email verification & password reset (Nodemailer)
- Zod schema validation on all endpoints
- SmartMatch scoring engine (< 100ms per request)
- Database seeding for development

</td>
</tr>
</table>

---

## SmartMatch

> *"Stop scrolling through hundreds of offers. Let the right ones find you."*

**SmartMatch** is Stag.io's proprietary internship matching engine — a zero-dependency, purely algorithmic system that scores and ranks every available internship offer against a student's profile in real time. No external AI APIs, no cloud ML services. The entire engine runs server-side in **< 100 ms** per request.

### The Problem

Traditional internship platforms dump students into a chronological list of offers with basic keyword search. Students waste time scrolling through irrelevant postings, and companies receive applications from mismatched candidates.

### The Solution

SmartMatch flips the experience: instead of students searching for offers, **offers compete for students**. Each offer receives a composite score (0 – 100) based on how well it aligns with the student's unique profile.

### The 4-Dimension Scoring Engine

```
  ┌───────────────────────────────────────────────────────────────┐
  │                    SmartMatch Score (0 – 100)                 │
  │                                                               │
  │   ┌─────────────────────────────────────────────────────┐     │
  │   │  Skills Match          ████████████████████   50 %  │     │
  │   │  Department Relevance  ██████████             25 %  │     │
  │   │  Location Proximity    ██████                 15 %  │     │
  │   │  Title Relevance       ████                   10 %  │     │
  │   └─────────────────────────────────────────────────────┘     │
  │                                                               │
  │   Final Score = Σ (dimension_score × weight) × 100            │
  └───────────────────────────────────────────────────────────────┘
```

<table>
<tr>
<td width="50%">

#### Skills Match — 50 %

The heaviest signal. SmartMatch tokenizes both the student's skills array and the offer's requirements/description into normalized terms, then computes overlap:

- **Exact match**: full skill name found in offer text (weight 1.0)
- **Partial match**: >= 50 % of multi-word skill tokens found (weight 0.7 x ratio)
- **Normalization**: score is divided by `min(required, student skills)` so students aren't penalized for broad skillsets

</td>
<td width="50%">

#### Department Relevance — 25 %

Maps the student's academic department to industry keywords via a curated lookup table covering **17 departments** (Computer Science, Electrical Engineering, Business, Law, Medicine, etc.):

- Each department maps to relevant industry keywords
- The engine counts keyword appearances in the offer's combined text
- Score is amplified by 1.5x to reward strong matches

</td>
</tr>
<tr>
<td width="50%">

#### Location Proximity — 15 %

Infers location from the university domain and compares against the offer and company locations:

- **City match**: university city words found in offer/company location (1.0)
- **Remote offers**: automatically score 0.7 (location-agnostic)
- **No match**: scores 0.1 (relocation is possible)

</td>
<td width="50%">

#### Title Relevance — 10 %

A lightweight signal that checks whether the student's skills appear in the offer title — because a title like *"React Frontend Developer Intern"* is a stronger signal than skills buried in the description.

- Tokenizes student skills against normalized title text
- Capped at 3 skill matches to prevent title-stuffing

</td>
</tr>
</table>

### User Experience Flow

```
  1. Student opens /internships
  2. Flips the SmartMatch toggle
  3. Branded breathing overlay appears while scoring runs
  4. Offers re-sort by match score (highest first)
  5. Each card shows:
     • ScoreRing — an SVG circular gauge (0 – 100%)
     • Matched skills highlighted on the card
     • "Ranked for you" badge in the header
  6. Toggle off → returns to default chronological order
```

---

## Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|:---|:---|:---|
| **Frontend** | Next.js 16 + React 19 | App Router, SSR, file-based routing |
| **Styling** | Tailwind CSS 4 | Utility-first, dark mode, custom design tokens |
| **Language** | TypeScript (strict) | End-to-end type safety across all packages |
| **Backend** | Express 5 | REST API, middleware pipeline |
| **Database** | PostgreSQL (Neon) | Serverless Postgres with Drizzle ORM |
| **Auth** | JWT + bcryptjs + httpOnly cookies | Access/refresh token architecture |
| **Security** | Helmet + Turnstile + rate-limit | Headers, bot protection, abuse prevention |
| **Real-time** | Socket.IO | Live notifications |
| **Storage** | Cloudinary | Cloud image & document hosting |
| **Email** | Nodemailer | Email verification & password reset |
| **PDF** | PDFKit | Internship agreement & CV generation |
| **AI Chat** | Google Gemini | Context-aware chatbot |
| **Validation** | Zod | Runtime schema validation |
| **AI Tools** | MCP SDK | Model-Context-Protocol integration |
| **Monorepo** | npm Workspaces | Shared types & constants |

</div>

---

## Design System

Stag.io features a warm **coffee-inspired** design language that evokes professionalism and approachability:

```
 ┌──────────────────────────────────────────────────────────────────┐
 │  Dark Coffee     Warm Brown     Soft Gold      Cream Beige       │
 │    #4B2E2B        #7A4E3A        #C8A96A        #F5EFE6          │
 │    ███████        ███████        ███████        ███████           │
 │                                                                  │
 │  Sage Green      Error Red     Warning Amber   Info Blue         │
 │    #7C9A6E        #DC2626        #F59E0B        #3B82F6          │
 │    ███████        ███████        ███████        ███████           │
 └──────────────────────────────────────────────────────────────────┘
```

| Element | Choice | Rationale |
|:---|:---|:---|
| Headings | **Playfair Display** | Elegance & editorial trust |
| Body text | **Inter** | Clean, modern readability |
| Accent | Soft Gold `#C8A96A` | Warmth without harshness |
| Surfaces | Glassmorphism + subtle gradients | Depth & layering |
| Dark mode | Full theme with View Transitions API | Smooth animated toggle |

---

## Getting Started

### Prerequisites

| Requirement | Version |
|:---|:---|
| Node.js | >= 18 |
| npm | >= 9 |
| PostgreSQL | Any (or free [Neon](https://neon.tech) account) |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Iyadbelala/Stag.io.git
cd Stag.io

# 2. Install all dependencies (monorepo-aware)
npm install

# 3. Configure environment variables
cp Server/.env.example Server/.env
# Fill in your credentials (database URL, JWT secret, Cloudinary, etc.)

# 4. Start both frontend & backend in dev mode
npm run dev
```

The frontend will be available at **`http://localhost:3000`** and the API at **`http://localhost:3001/api`**.

### Environment Variables

| Variable | Description |
|:---|:---|
| `DATABASE_URL` | PostgreSQL connection string (Neon recommended) |
| `JWT_SECRET` | Secret key for JWT token signing |
| `CLOUDINARY_*` | Cloudinary cloud name, API key & secret |
| `GEMINI_API_KEY` | Google Gemini API key for chatbot |
| `SMTP_*` | SMTP host, port, user & password for emails |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key (server) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key (frontend) |

### Turnstile Setup (Important)

To enable Cloudflare Turnstile correctly, configure both apps:

1. In `Server/.env`, set `TURNSTILE_SECRET_KEY` to your Turnstile secret key.
2. In `App/.env.local`, set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` to your Turnstile site key.
3. Restart both dev servers after editing env files.

Example:

```bash
# Server/.env
TURNSTILE_SECRET_KEY=your_turnstile_secret_key

# App/.env.local
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
```

### Available Scripts

| Command | Description |
|:---|:---|
| `npm run dev` | Start frontend + backend concurrently |
| `npm run dev:app` | Start Next.js frontend only |
| `npm run dev:server` | Start Express backend only |
| `npm run build` | Build shared → frontend → backend |
| `npm run seed` | Seed the database with sample data |
| `npm run mcp` | Start the MCP protocol server |

---

## Architecture

```
Stag.io/                              # Monorepo root (npm workspaces)
│
├── App/                               # Next.js 16 Frontend
│   └── src/
│       ├── app/                       # App Router — page routes
│       │   ├── layout.tsx             #   Root layout (providers, nav, footer)
│       │   ├── student/               #   Student dashboard & profile
│       │   ├── company/               #   Company dashboard & profile
│       │   ├── admin/                 #   Admin panel
│       │   ├── university/            #   University dashboard
│       │   ├── superadmin/            #   Super admin panel
│       │   ├── internships/           #   Browse & filter offers
│       │   ├── login/ register/       #   Authentication pages
│       │   ├── reviews/               #   Review system
│       │   ├── saved/                 #   Saved offers
│       │   └── ...                    #   About, Blog, FAQs, etc.
│       │
│       ├── Components/                # Organized component library
│       │   ├── contexts/              #   State providers (Auth, Theme, Language, Notifications)
│       │   ├── features/              #   Domain components (ChatBot, AuthBrandPanel)
│       │   ├── layout/                #   Page structure (Navbar/, Footer)
│       │   └── ui/                    #   Reusable primitives (StatCard, Spinner, FormField...)
│       │
│       ├── screen/                    # Full-page screen compositions
│       │   ├── Homepage/              #   Landing page with hero & carousel
│       │   ├── Authentication/        #   Login & registration flows
│       │   ├── Internships/           #   Offer browsing with SmartMatch
│       │   ├── Student/               #   Student dashboard + Profile/
│       │   ├── Company/               #   Company dashboard + Profile/
│       │   ├── Admin/                 #   Admin management panel
│       │   ├── University/            #   University validation dashboard
│       │   ├── SuperAdmin/            #   Super admin controls
│       │   └── Footer/                #   Static pages (Blog, FAQ, Privacy...)
│       │
│       ├── i18n/                      # Internationalization (EN / FR)
│       └── lib/                       # API client (Axios + JWT interceptor)
│
├── Server/                            # Express 5 Backend
│   └── src/
│       ├── app.ts                     # Express app setup & middleware
│       ├── index.ts                   # Server entry point
│       ├── socket.ts                  # Socket.IO configuration
│       ├── mcp.ts                     # MCP protocol server
│       ├── seed.ts                    # Database seeder
│       ├── context/                   # Service layer (business logic)
│       │   ├── auth.service.ts
│       │   ├── offers.service.ts
│       │   ├── applications.service.ts
│       │   ├── matching.service.ts    # SmartMatch engine
│       │   ├── chatbot.service.ts     # Gemini AI chatbot
│       │   ├── cv.service.ts          # CV/PDF generation
│       │   ├── notifications.service.ts
│       │   ├── reviews.service.ts
│       │   └── ...
│       ├── model/                     # Database schema (Drizzle ORM)
│       │   ├── schema.ts             #   Table definitions & enums
│       │   └── db.ts                 #   Database connection
│       ├── lib/                       # Cloudinary, helpers
│       └── protocol/
│           ├── middleware/            # Auth & upload middleware
│           └── routes/               # REST API route handlers
│
└── shared/                            # Shared Package
    └── src/
        ├── types/                     # TypeScript interfaces
        └── constants/                 # Roles, statuses, enums
```

---

## Database Schema

The PostgreSQL database is managed with **Drizzle ORM** and uses **9 tables**:

| Table | Description |
|:---|:---|
| `users` | All platform users with role-based access (student, company, admin, university, superadmin) |
| `students` | Student profiles — department, skills, CV, bio, portfolio photos |
| `companies` | Company profiles — industry, logo, verification docs, validation status |
| `universities` | University profiles — domain-based authentication, validation status |
| `internship_offers` | Job postings with type (remote / onsite / hybrid), status (draft / active / closed) |
| `applications` | Student applications with status tracking (pending / accepted / rejected / withdrawn / validated) |
| `saved_offers` | Student bookmarked offers |
| `reviews` | Company & internship reviews from students |
| `notifications` | Real-time notification records with type-based categorization |

---

## API Reference

All endpoints are prefixed with `/api`.

| Endpoint | Methods | Description |
|:---|:---|:---|
| `/api/auth/*` | POST | Registration, login, email verification, password reset |
| `/api/offers/*` | GET, POST, PATCH, DELETE | CRUD for internship offers |
| `/api/applications/*` | GET, POST, PATCH | Application submission & status management |
| `/api/companies/*` | GET | Company listing & details |
| `/api/company-profile/*` | GET, PATCH | Company profile management |
| `/api/profile/*` | GET, PATCH | Student profile management |
| `/api/matching` | GET | SmartMatch — ranked offers for authenticated students |
| `/api/reviews/*` | GET, POST | Review submission & listing |
| `/api/saved/*` | GET, POST, DELETE | Save/unsave internship offers |
| `/api/notifications/*` | GET, PATCH | Notification retrieval & read status |
| `/api/chatbot` | POST | AI chatbot conversation |
| `/api/search/users` | GET | Search students by name (debounced) |
| `/api/admin/*` | GET, PATCH, DELETE | Admin panel operations |
| `/api/university/*` | GET, PATCH | University dashboard & agreement validation |
| `/api/superadmin/*` | GET, PATCH, DELETE | Platform-wide administration |

---

## Security

Stag.io implements defense-in-depth across the full stack:

| Layer | Measure | Details |
|:---|:---|:---|
| **Authentication** | Access + refresh tokens | Short-lived access tokens (15 min) with long-lived refresh tokens (7 days) stored in httpOnly, secure, sameSite=strict cookies |
| **Token Storage** | httpOnly cookies | Refresh tokens never exposed to JavaScript — immune to XSS token theft |
| **Password** | bcryptjs (10 rounds) + strength validation | Minimum 8 characters enforced server-side |
| **OTP & Reset Tokens** | SHA-256 hashed at rest | Verification codes and password reset tokens are hashed before database storage |
| **Bot Protection** | Cloudflare Turnstile | CAPTCHA challenge on login, registration (all roles). Graceful fallback in development |
| **Rate Limiting** | express-rate-limit | Auth: 10 req/15 min, OTP: 5 req/15 min, Global API: 100 req/min |
| **Headers** | Helmet.js | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, and more |
| **File Uploads** | Triple validation | File extension + MIME type + magic byte verification (PNG, JPEG, WebP) |
| **Role Authorization** | `requireRole()` middleware | Per-route enforcement — students can't manage offers, companies can't apply, etc. |
| **Request Logging** | Morgan | Structured access logs (combined in production, dev in development) |
| **Input Validation** | Length & type checks | Chatbot history capped (2000 chars/msg, 20 messages), body size limit (100kb) |
| **Anti-Enumeration** | Generic responses | Password reset and resend-verification return identical responses regardless of email existence |
| **CV Access** | Auth-gated | CV download endpoint requires authentication — no public file access |

### Environment Variables (Security)

| Variable | Description |
|:---|:---|
| `JWT_SECRET` | **Required.** Secret key for signing access and refresh tokens. Server refuses to start without it |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret. If unset, CAPTCHA verification is skipped (dev mode) |

---

## Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, etc.
4. **Push** to your fork and open a **Pull Request**

Please make sure your code follows the existing patterns and passes the build before submitting.

---

## Team

<div align="center">

| <img src="https://github.com/Iyadbelala.png" width="100" style="border-radius:50%"/> | <img src="https://github.com/oualb.png" width="100" style="border-radius:50%"/> | <img src="https://github.com/charafeddine-zerouki.png" width="100" style="border-radius:50%"/> |
|:---:|:---:|:---:|
| **Iyed Belala** | **Ouael Bensouici** | **Charaf Eddin Zerouki** |
| Full-Stack Developer | Full-Stack Developer | Full-Stack Developer |
| [![GitHub](https://img.shields.io/badge/-Iyadbelala-181717?style=flat-square&logo=github)](https://github.com/Iyadbelala) | [![GitHub](https://img.shields.io/badge/-oualb-181717?style=flat-square&logo=github)](https://github.com/oualb) | [![GitHub](https://img.shields.io/badge/-charafeddine--zerouki-181717?style=flat-square&logo=github)](https://github.com/charafeddine-zerouki) |

</div>

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

<img src="https://img.shields.io/badge/☕-Built_with_coffee-4B2E2B?style=for-the-badge&labelColor=F5EFE6" alt="Built with coffee"/>

<br/><br/>

<sub>Made with care by the <strong>Stag.io</strong> team — Atelier TI 2025 – 2026, University of Constantine 2</sub>

</div>
