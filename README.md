# Nomad Competition Platform

A comprehensive competition management platform for Rubik's Cube competitions, built with the T3 Stack.

## About

This platform manages competition registrations, schedules, payments, and results for Rubik's Cube competitions. It integrates with the World Cube Association (WCA) for competitor data and uses QPay for payment processing in Mongolia.

## Tech Stack

This is a [T3 Stack](https://create.t3.gg/) project using:

- **[Next.js](https://nextjs.org)** - React framework with SSR/SSG
- **[tRPC](https://trpc.io)** - End-to-end typesafe APIs
- **[Drizzle ORM](https://orm.drizzle.team/)** - TypeScript ORM (instead of Prisma)
- **[NextAuth.js](https://next-auth.js.org)** - Authentication
- **[Tailwind CSS](https://tailwindcss.com)** - Styling
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety

## Documentation

📚 **[Full Project Documentation](./docs/INDEX.md)** - Comprehensive guide covering architecture, database schema, API routes, and more.

📖 **[API Reference](./docs/API_REFERENCE.md)** - Quick reference for all tRPC API endpoints.

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8.13.1
- PostgreSQL database
- Docker (optional, for local database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nomad_competition
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your database URL and other required variables.

4. **Start database (Docker)**
   ```bash
   docker-compose up -d
   ```
   Or use: `./start-database.sh`

5. **Run database migrations**
   ```bash
   pnpm db:push
   ```

6. **Start development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run linter
- `pnpm db:push` - Push schema changes to database
- `pnpm db:studio` - Open Drizzle Studio (database GUI)
- `pnpm db:generate` - Generate migration files
- `pnpm db:migrate` - Run migrations
- `pnpm db:seed` - Seed database with test data

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [NextAuth.js Documentation](https://next-auth.js.org/getting-started/introduction)
- [T3 Stack Documentation](https://create.t3.gg/)

## Deployment

Follow deployment guides for:
- [Vercel](https://create.t3.gg/en/deployment/vercel)
- [Netlify](https://create.t3.gg/en/deployment/netlify)
- [Docker](https://create.t3.gg/en/deployment/docker)

For detailed deployment instructions, see the [documentation](./docs/INDEX.md).

---

**Note**: This project uses Drizzle ORM instead of Prisma, which is a common alternative in T3 Stack projects.
