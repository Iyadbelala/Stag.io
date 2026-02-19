<div align="center">

# Stag.io

### Internship Management Platform

*Connecting Students, Companies & Universities*

[![Next.js](https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://neon.tech/)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-C8A96A.svg)](LICENSE)

</div>

---

## About

**Stag.io** is a modern web platform that digitizes the entire internship lifecycle — from discovery and application to administrative validation and tracking. Built as a graduation project (Atelier TI 2025-2026), it connects three key actors in a seamless experience:

| Actor | Role |
|-------|------|
| **Students** | Browse offers, apply, track applications |
| **Companies** | Post internships, manage applicants |
| **Administration** | Validate agreements, oversee the process |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | **Next.js** (App Router) |
| UI | **React** |
| Language | **TypeScript** (strict mode) |
| Backend | **Express.js** |
| Database | **PostgreSQL** on **Neon** |
| Architecture | **MCP** (Model-Context-Protocol) |
| Styling | **Tailwind CSS** |

## Design

Stag.io features a warm **coffee-inspired** design language:

- **Playfair Display** for headings — elegance and trust
- **Inter** for body text — clean readability
- **Color palette:** Dark Coffee `#4B2E2B` · Warm Brown `#7A4E3A` · Soft Gold `#C8A96A` · Cream Beige `#F5EFE6`

> See [skills.md](skills.md) for the complete design system specification.

## Getting Started

```bash
# Clone the repository
git clone https://github.com/Iyadbelala/Stag.io.git
cd Stag.io

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

## Project Structure

```
Stag.io/
├── App/                        # Next.js frontend (monorepo workspace)
│   └── src/
│       ├── app/                # App Router — route pages
│       │   ├── layout.tsx      # Root layout (ThemeProvider, Navbar, Footer)
│       │   ├── page.tsx        # Landing / Homepage
│       │   ├── globals.css     # Tailwind v4 theme + dark mode overrides
│       │   ├── about/          # About page
│       │   ├── login/          # Sign-in route
│       │   ├── register/       # Register route
│       │   ├── blog/ contact/ cookies/ faqs/ help/ privacy/ terms/
│       │   └── ...
│       ├── Components/         # Reusable UI components
│       │   ├── Logo.tsx        # Brand mark (size / variant props)
│       │   ├── navbar.tsx      # Sticky navbar + dark mode toggle
│       │   ├── footer.tsx      # Site footer
│       │   ├── ThemeContext.tsx # Dark mode provider (View Transitions API)
│       │   ├── FloatingOrbs.tsx # Animated background shapes
│       │   ├── FormField.tsx   # Glass-style form input + PasswordField
│       │   ├── FieldError.tsx  # Inline validation error
│       │   ├── AuthBrandPanel.tsx # Auth left sidebar
│       │   └── slide.tsx       # Carousel / slider
│       └── screen/             # Full-page screen components
│           ├── Homepage/
│           ├── About/
│           ├── Authentication/
│           └── Footer/         # Blog, Contact, Cookies, FAQs, etc.
├── Server/                     # Express.js backend (monorepo workspace)
│   └── src/
│       ├── app.ts
│       ├── index.ts
│       └── protocol/routes/
├── shared/                     # Shared types & constants
│   └── src/
│       ├── constants/
│       └── types/
└── package.json                # Monorepo root (npm workspaces)
```

> See [`.claude/skills.md`](.claude/skills.md) for the complete design system, architecture details, and knowledge base.

## Team

| Name | Role |
|------|------|
| **Iyed Belala** | Developer |
| **Ouael Bensouici** | Developer |
| **Charaf Eddin Zerouki** | Developer |

## Features Implemented

- **Homepage** — Hero section, stats, feature highlights, carousel slides, CTA
- **About Page** — Mission pillars, timeline, "Who We Serve" section
- **Authentication** — Sign-in / Register with split-layout glassmorphism design, university email validation (`@univ-xxxx.dz`), auto-detected university, password visibility toggle
- **Dark Mode** — Explosion animation from toggle switch (View Transitions API with fallback), system preference detection, localStorage persistence
- **Responsive Navbar** — Desktop + mobile layouts, theme toggle always visible
- **Footer** — Multi-column nav, social links, dark-section styling
- **Component Architecture** — Extracted reusable components (Logo, FloatingOrbs, FormField, PasswordField, FieldError, AuthBrandPanel)

## Contributing

1. Read [`.claude/skills.md`](.claude/skills.md) for the knowledge base and design system
2. Create a branch: `feature/your-feature-name`
3. Use Conventional Commits: `feat:`, `fix:`, `docs:`, etc.
4. Submit a Pull Request

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
<sub>Built with ☕ by the Stag.io team — 2026</sub>
</div>
