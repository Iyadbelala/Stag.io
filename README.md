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
src/
├── app/           # Next.js App Router (pages & API routes)
├── components/    # Reusable UI components
├── context/       # Business logic layer (MCP: Context)
├── model/         # Data access layer (MCP: Model)
├── lib/           # Utilities and config
└── types/         # TypeScript type definitions
```

> See [skills.md](skills.md) for the full folder structure and architecture details.

## Team

| Name | Role |
|------|------|
| **Iyed Belala** | Developer |
| **Ouael Bensouici** | Developer |
| **Charaf Eddin Zerouki** | Developer |

## Contributing

1. Read [`.claude`](.claude) for project context and coding rules
2. Read [`skills.md`](skills.md) for the knowledge base and design system
3. Create a branch: `feature/your-feature-name`
4. Use Conventional Commits: `feat:`, `fix:`, `docs:`, etc.
5. Submit a Pull Request

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
<sub>Built with ☕ by the Stag.io team — 2026</sub>
</div>
