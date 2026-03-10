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
[![License: MIT](https://img.shields.io/badge/License-MIT-C8A96A?style=flat-square)](LICENSE)

<br/>

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Architecture](#-architecture) · [Contributing](#-contributing) · [Team](#-team)

</div>

<br/>

## 📋 Overview

**Stag.io** (_stage_ is French for _internship_) is a full-stack web platform that digitizes the entire internship lifecycle — from opportunity discovery and application to administrative validation and agreement tracking.

Built as a graduation capstone project (Atelier TI 2025–2026), it provides a unified experience for every stakeholder in the internship process:

<div align="center">

| 🎓 Students | 🏢 Companies | 🏛️ Universities | 🔑 Admins |
|:---:|:---:|:---:|:---:|
| Browse & filter offers | Post internship offers | Validate agreements | Oversee platform |
| Apply with one click | Manage applicants | Monitor student progress | Manage users & roles |
| Track applications | Company dashboard | University dashboard | Super admin panel |
| Build profile & CV | Upload verification docs | Domain-based auth | System-wide controls |

</div>

## ✨ Features

<table>
<tr>
<td width="50%">

**Frontend**
- 🏠 Hero section with animated stats & carousel
- 🔐 Glassmorphism auth with split-layout design
- 🌙 Dark mode with explosion animation (View Transitions API)
- 🌐 Bilingual support (English / French)
- 📱 Fully responsive — mobile-first design
- 🎨 Coffee-inspired design system
- ♿ Accessible form components with validation

</td>
<td width="50%">

**Backend**
- 🔒 JWT authentication with role-based access
- 📄 RESTful API with Express 5
- 🗄️ PostgreSQL via Drizzle ORM on Neon
- ☁️ Cloudinary integration for file uploads
- 📑 PDF generation (internship agreements)
- 🤖 MCP (Model-Context-Protocol) server
- ✅ Zod schema validation

</td>
</tr>
</table>

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|:---|:---|:---|
| **Frontend** | Next.js 16 · React 19 | App Router, SSR, file-based routing |
| **Styling** | Tailwind CSS 4 | Utility-first, dark mode, custom theme |
| **Language** | TypeScript (strict) | End-to-end type safety |
| **Backend** | Express 5 | REST API, middleware pipeline |
| **Database** | PostgreSQL (Neon) | Serverless Postgres with Drizzle ORM |
| **Auth** | JWT + bcrypt | Secure token-based authentication |
| **Storage** | Cloudinary | Cloud image & document hosting |
| **Validation** | Zod | Runtime schema validation |
| **AI** | MCP SDK | Model-Context-Protocol integration |
| **Monorepo** | npm Workspaces | Shared types & constants |

</div>

## 🎨 Design System

Stag.io features a warm **coffee-inspired** design language that evokes professionalism and approachability:

```
 ┌──────────────────────────────────────────────────────────┐
 │  Dark Coffee    Warm Brown    Soft Gold     Cream Beige  │
 │   #4B2E2B        #7A4E3A      #C8A96A       #F5EFE6     │
 │   ███████        ███████      ███████       ███████      │
 └──────────────────────────────────────────────────────────┘
```

| Element | Choice | Rationale |
|:---|:---|:---|
| Headings | **Playfair Display** | Elegance & editorial trust |
| Body text | **Inter** | Clean, modern readability |
| Accent | Soft Gold `#C8A96A` | Warmth without harshness |
| Surfaces | Glassmorphism + subtle gradients | Depth & layering |

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **PostgreSQL** instance (or a free [Neon](https://neon.tech) account)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Iyadbelala/Stag.io.git
cd Stag.io

# 2. Install all dependencies (monorepo-aware)
npm install

# 3. Configure environment variables
#    Copy the example and fill in your credentials
cp Server/.env.example Server/.env

# 4. Start both frontend & backend in dev mode
npm run dev
```

The frontend will be available at **`http://localhost:3000`** and the API at **`http://localhost:3001/api`**.

### Available Scripts

| Command | Description |
|:---|:---|
| `npm run dev` | Start frontend + backend concurrently |
| `npm run dev:app` | Start Next.js frontend only |
| `npm run dev:server` | Start Express backend only |
| `npm run build` | Build shared → frontend → backend |

## 🏗️ Architecture

```
Stag.io/                         # Monorepo root (npm workspaces)
│
├── App/                          # 🖥️  Next.js 16 Frontend
│   └── src/
│       ├── app/                  #     App Router — page routes
│       │   ├── layout.tsx        #     Root layout (theme, nav, footer)
│       │   ├── student/          #     Student dashboard & profile
│       │   ├── company/          #     Company dashboard & profile
│       │   ├── admin/            #     Admin panel
│       │   ├── university/       #     University dashboard
│       │   ├── internships/      #     Browse & filter offers
│       │   ├── login/ register/  #     Authentication pages
│       │   └── ...               #     About, Blog, FAQs, etc.
│       ├── Components/           #     Reusable UI (Navbar, Footer, Forms…)
│       ├── screen/               #     Full-page screen compositions
│       ├── i18n/                 #     Internationalization (EN / FR)
│       └── lib/                  #     API client & utilities
│
├── Server/                       # ⚙️  Express 5 Backend
│   └── src/
│       ├── app.ts                #     Express app setup
│       ├── index.ts              #     Server entry point
│       ├── mcp.ts                #     MCP protocol server
│       ├── context/              #     Service layer (business logic)
│       │   ├── auth.service.ts
│       │   ├── offers.service.ts
│       │   ├── applications.service.ts
│       │   ├── companies.service.ts
│       │   ├── profile.service.ts
│       │   └── ...
│       ├── model/                #     Database schema (Drizzle ORM)
│       ├── lib/                  #     Cloudinary, helpers
│       └── protocol/
│           ├── middleware/       #     Auth & upload middleware
│           └── routes/           #     REST API route handlers
│
└── shared/                       # 📦  Shared Package
    └── src/
        ├── types/                #     TypeScript interfaces
        └── constants/            #     Roles, statuses, enums
```

## 🗄️ Database Schema

The PostgreSQL database is managed with **Drizzle ORM** and includes:

| Table | Description |
|:---|:---|
| `users` | All platform users with role-based access (student, company, admin, university, superadmin) |
| `students` | Student profiles — department, CV, skills, portfolio |
| `companies` | Company profiles — industry, logo, verification docs |
| `universities` | University profiles — domain-based authentication |
| `internship_offers` | Job postings with type (remote / onsite / hybrid) and status |
| `applications` | Student applications with status tracking |

## 🗺️ API Routes

| Endpoint | Description |
|:---|:---|
| `/api/auth/*` | Registration, login, session management |
| `/api/offers/*` | CRUD operations for internship offers |
| `/api/applications/*` | Application submission & status management |
| `/api/companies/*` | Company listing & details |
| `/api/profile/*` | User profile management |
| `/api/admin/*` | Admin panel operations |
| `/api/university/*` | University dashboard & validation |
| `/api/superadmin/*` | Platform-wide administration |

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, etc.
4. **Push** to your fork and open a **Pull Request**

## 👥 Team

<div align="center">

| <img src="https://github.com/Iyadbelala.png" width="80" style="border-radius:50%"/> | <img src="https://github.com/oualb.png" width="80" style="border-radius:50%"/> | <img src="https://github.com/charafeddine-zerouki.png" width="80" style="border-radius:50%"/> |
|:---:|:---:|:---:|
| **Iyed Belala** | **Ouael Bensouici** | **Charaf Eddin Zerouki** |
| Developer | Developer | Developer |
| [![GitHub](https://img.shields.io/badge/-Iyadbelala-181717?style=flat-square&logo=github)](https://github.com/Iyadbelala) | [![GitHub](https://img.shields.io/badge/-oualb-181717?style=flat-square&logo=github)](https://github.com/oualb) | [![GitHub](https://img.shields.io/badge/-charafeddine--zerouki-181717?style=flat-square&logo=github)](https://github.com/charafeddine-zerouki) |

</div>

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

<img src="https://img.shields.io/badge/☕-Built_with_coffee-4B2E2B?style=for-the-badge&labelColor=F5EFE6" alt="Built with coffee"/>

<br/><br/>

<sub>Made with ❤️ by the <strong>Stag.io</strong> team — Atelier TI 2025–2026</sub>

</div>
