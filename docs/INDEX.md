# Nomad Competition Platform - Project Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [API Routes (tRPC)](#api-routes-trpc)
6. [Pages & Features](#pages--features)
7. [Authentication & Authorization](#authentication--authorization)
8. [Setup & Development](#setup--development)
9. [Project Structure](#project-structure)

---

## Project Overview

**Nomad Competition** is a comprehensive competition management platform built for managing Rubik's Cube competitions. The platform allows users to register for competitions, manage schedules, handle payments, and track results.

### Key Features

- **Competition Management**: Create and manage competitions with detailed information
- **Competitor Registration**: User registration system with WCA (World Cube Association) integration
- **Payment Processing**: Integration with QPay payment gateway
- **Schedule Management**: Create and manage competition schedules
- **Results Management**: Import and manage competition results
- **Age Groups**: Configure age-based groupings for competitions
- **Cube Types Management**: Manage different types of Rubik's cubes and events
- **User Authentication**: Secure authentication with email verification

---

## Technology Stack

### Core Framework
- **Next.js 15.1.11** - React framework with SSR/SSG
- **React 18.2.0** - UI library
- **TypeScript 5.6.2** - Type safety

### Backend & API
- **tRPC 10.45.2** - End-to-end typesafe APIs
- **NextAuth.js 4.24.8** - Authentication
- **Drizzle ORM 0.44.7** - TypeScript ORM for PostgreSQL
- **PostgreSQL** - Database

### Styling & UI
- **Tailwind CSS 3.4.13** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **shadcn/ui** - Component library (custom implementation)

### Key Libraries
- **Zod 3.23.8** - Schema validation
- **React Hook Form 7.53.0** - Form management
- **TanStack Query 4.36.1** - Data fetching and caching
- **date-fns 3.6.0** - Date utilities
- **csv-simple-parser 2.0.2** - CSV parsing
- **mn-payment 0.0.4** - Mongolian payment gateway integration

---

## Architecture

### Application Structure

```
nomad_competition/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── ui/             # UI primitives (shadcn/ui components)
│   │   ├── sidebar/        # Sidebar navigation components
│   │   └── ...             # Feature-specific components
│   ├── pages/              # Next.js pages (file-based routing)
│   │   ├── api/           # API routes
│   │   └── competitions/  # Competition-related pages
│   ├── server/            # Server-side code
│   │   ├── api/          # tRPC routers
│   │   │   └── routers/  # Feature routers
│   │   ├── db/           # Database configuration
│   │   │   ├── schema.ts # Drizzle schema definitions
│   │   │   └── migrations/ # Database migrations
│   │   └── auth.ts       # NextAuth configuration
│   ├── utils/            # Utility functions
│   └── styles/           # Global styles
```

### Data Flow

1. **Client Request** → Next.js Page Component
2. **Page Component** → tRPC Client Hook (via `api.utils`)
3. **tRPC Client** → API Route (`/api/trpc/[trpc]`)
4. **API Route** → tRPC Router Procedure
5. **Procedure** → Database Query (Drizzle ORM)
6. **Response** → Client (type-safe, end-to-end)

---

## Database Schema

### Core Tables

#### `users`
User accounts and profile information
- `id` (varchar, PK)
- `email` (varchar, unique)
- `firstname`, `lastname` (varchar)
- `wcaId` (varchar, unique) - World Cube Association ID
- `birthDate` (date)
- `phone` (integer)
- `password` (varchar, hashed)
- `isAdmin` (boolean)
- `provinceId`, `districtId` (foreign keys)

#### `competitions`
Competition information
- `id` (serial, PK)
- `name`, `address` (varchar)
- `slug` (varchar, unique)
- `startDate`, `endDate` (date)
- `registerStartDate`, `registerEndDate` (timestamp)
- `maxCompetitors` (integer)
- `baseFee`, `guestFee` (numeric)
- `isActive` (boolean)

#### `competitors`
Competitor registrations
- `id` (serial, PK)
- `userId` (foreign key → users)
- `competitionId` (foreign key → competitions)
- `status` (enum: 'Created', 'Verified', 'Cancelled')
- `guestCount` (integer)
- `requestedAt`, `verifiedAt` (timestamp)
- `schoolId`, `provinceId`, `districtId`, `ageGroupId` (foreign keys)

#### `cubeTypes`
Types of Rubik's cubes/events
- `id` (serial, PK)
- `name` (varchar)
- `image` (varchar)
- `type` (enum: 'ao5', 'ao3') - Average of 5 or Average of 3
- `order` (real)
- `scrambleMapper` (varchar)

#### `schedules`
Competition schedules
- `id` (serial, PK)
- `competitionId` (foreign key)
- `roundId` (foreign key → rounds)
- `name` (varchar)
- `date` (date)
- `startTime`, `endTime` (time)
- `cutOff`, `timeLimit` (varchar)
- `competitorLimit` (integer)

#### `rounds`
Competition rounds
- `id` (serial, PK)
- `competitionId` (foreign key)
- `cubeTypeId` (foreign key)
- `name` (varchar)
- `roundNumber` (integer)

#### `invoices`
Payment invoices
- `id` (serial, PK)
- `competitorId` (foreign key)
- `userId` (foreign key)
- `invoiceCode` (varchar)
- `amount` (numeric)
- `isPaid` (boolean)
- `guestCount` (integer)
- `cubeTypeIds` (integer array)
- `paymentResult` (json)
- `createdAt` (timestamp)

#### `results`
Competition results
- `id` (serial, PK)
- `roundId` (foreign key)
- `competitorId` (foreign key)
- `time1` through `time5` (real) - Individual solve times
- `average`, `best` (real)
- `rank` (integer)
- Various other fields for result metadata

### Relationship Overview

- **Users** ↔ **Competitors** (one-to-many)
- **Competitions** ↔ **Competitors** (one-to-many)
- **Competitions** ↔ **CubeTypes** (many-to-many via `competitionsToCubeType`)
- **Competitors** ↔ **CubeTypes** (many-to-many via `competitorsToCubeTypes`)
- **Competitions** ↔ **Schedules** (one-to-many)
- **Rounds** ↔ **Results** (one-to-many)
- **Competitors** ↔ **Invoices** (one-to-many)

---

## API Routes (tRPC)

The application uses tRPC for type-safe API communication. All routers are registered in `src/server/api/root.ts`.

### Available Routers

#### `competition`
Competition CRUD operations
- `getAll` - List all competitions
- `getBySlug` - Get competition by slug
- `create` - Create new competition
- `update` - Update competition
- `remove` - Delete competition

#### `competitor`
Competitor management
- `getByCompetitionId` - Get competitors for a competition
- `verify` - Verify competitor registration
- `remove` - Remove competitor
- `importFromWca` - Import competitors from WCA CSV
- `getByUserId` - Get user's competitor registrations

#### `auth`
Authentication and user management
- `register` - User registration
- `me` - Get current user session
- `profile` - Get user profile
- `verify` - Verify email token
- `updateProfile` - Update user profile
- `resetPassword` - Password reset flow

#### `schedule`
Schedule management
- `getByCompetitionId` - Get schedules for competition
- `create` - Create schedule
- `update` - Update schedule
- `remove` - Delete schedule

#### `round`
Round management
- `getByCompetitionId` - Get rounds for competition
- `create` - Create round
- `update` - Update round
- `remove` - Delete round

#### `result`
Results management
- `getByRoundId` - Get results for round
- `importFromWcaLive` - Import results from WCA Live
- `create` - Create result entry
- `update` - Update result
- `remove` - Delete result

#### `payment`
Payment processing (QPay integration)
- `createInvoice` - Create payment invoice
- `checkInvoice` - Check payment status
- Various payment-related operations

#### `fee`
Fee management
- `getByCompetitionId` - Get fees for competition
- `create` - Create fee
- `update` - Update fee
- `remove` - Delete fee

#### `ageGroup`
Age group management
- `getByCompetitionId` - Get age groups
- `create` - Create age group
- `update` - Update age group
- `remove` - Delete age group

#### `cubeTypes`
Cube type management
- `getAll` - Get all cube types
- `create` - Create cube type
- `update` - Update cube type
- `remove` - Delete cube type

#### `group`
Group management for competitions
- Group assignment and management operations

#### `persons`
Person/WCA person management
- WCA person lookup and management

### Procedure Types

- **`publicProcedure`**: Publicly accessible endpoints
- **`protectedProcedure`**: Requires authentication
- **`adminProcedure`**: Requires admin privileges

---

## Pages & Features

### Public Pages

#### `/` (Home)
- Landing page with carousel
- Competition listings

#### `/competitions`
- List all active competitions
- Filter by date/status

#### `/competitions/[slug]`
- Competition detail page
- Shows competition information
- Links to registration, schedule, results

#### `/competitions/[slug]/schedule`
- Competition schedule display
- Grouped by date

#### `/competitions/[slug]/results/[id]`
- Competition results display
- Round-based results

#### `/competitions/[slug]/register`
- Competition registration form
- Cube type selection
- Payment integration

### Authenticated Pages

#### `/profile`
- User profile management
- Update personal information

#### `/competitions/[slug]/registrations`
- View registered competitors (admin)

### Admin Pages

#### `/competitions/create`
- Create new competition
- Multi-step form:
  - Basic information
  - Age groups
  - Fees
  - Rounds
  - Schedules
  - Groups
  - Refunds

#### `/competitions/create/age-groups`
- Configure age groups for competition

#### `/competitions/create/fees`
- Configure fees for cube types

#### `/competitions/create/round`
- Configure competition rounds

#### `/competitions/create/schedules`
- Configure competition schedule

#### `/competitions/create/groups`
- Configure groups for competition

#### `/competitions/create/results/[id]`
- Manage competition results
- Import from WCA Live
- Manual entry

#### `/cube-types`
- Manage cube types (admin)

---

## Authentication & Authorization

### Authentication Providers

1. **Credentials** - Email/password authentication
2. **WCA OAuth** - World Cube Association OAuth integration

### Authentication Flow

1. User registers with email/password
2. Email verification token is generated
3. User clicks verification link
4. Account is activated
5. User can log in with credentials or WCA OAuth

### Authorization Levels

1. **Public** - No authentication required
2. **Authenticated** - Requires valid session
3. **Admin** - Requires `isAdmin: true` flag on user

### Session Management

- Uses NextAuth.js with JWT strategy
- Sessions stored in JWT tokens
- User data included in session token

---

## Setup & Development

### Prerequisites

- Node.js 18+
- pnpm 8.13.1 (package manager)
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
   
   Required environment variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Secret for NextAuth.js
   - `NEXTAUTH_URL` - Application URL
   - `WCA_CLIENT_ID` - WCA OAuth client ID (optional)
   - `WCA_CLIENT_SECRET` - WCA OAuth client secret (optional)
   - QPay credentials (for payment integration)

4. **Set up database**
   
   Using Docker:
   ```bash
   docker-compose up -d
   ```
   
   Or use the start script:
   ```bash
   ./start-database.sh
   ```

5. **Run database migrations**
   ```bash
   pnpm db:push
   ```

6. **Seed database (optional)**
   ```bash
   pnpm db:seed
   ```

7. **Start development server**
   ```bash
   pnpm dev
   ```

   Application will be available at `http://localhost:3000`

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run linter
- `pnpm db:push` - Push schema changes to database
- `pnpm db:studio` - Open Drizzle Studio (database GUI)
- `pnpm db:generate` - Generate migration files
- `pnpm db:migrate` - Run migrations
- `pnpm db:seed` - Seed database with test data

### Database Management

The project uses Drizzle ORM with PostgreSQL.

**Schema Location**: `src/server/db/schema.ts`

**Migrations**: `src/server/db/migration/`

**Commands**:
- Generate migration: `pnpm db:generate`
- Push schema: `pnpm db:push`
- View database: `pnpm db:studio`

---

## Project Structure

### Key Directories

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   ├── sidebar/         # Navigation components
│   ├── emails/          # Email templates
│   └── ...              # Feature components
├── pages/               # Next.js pages
│   ├── api/            # API routes
│   │   ├── auth/       # NextAuth endpoint
│   │   ├── trpc/       # tRPC endpoint
│   │   └── qpay/       # Payment webhooks
│   └── competitions/   # Competition pages
├── server/             # Server-side code
│   ├── api/           # tRPC API
│   │   └── routers/   # Feature routers
│   ├── db/            # Database
│   │   ├── schema.ts  # Drizzle schema
│   │   └── migrations/ # Database migrations
│   └── auth.ts        # Auth configuration
├── utils/              # Utility functions
│   ├── api.ts         # tRPC client setup
│   ├── zod.ts         # Zod schemas
│   └── ...            # Other utilities
└── styles/             # Global styles
```

### Component Organization

- **UI Components** (`components/ui/`): Reusable, unstyled primitives
- **Feature Components** (`components/`): Business logic components
- **Pages** (`pages/`): Next.js route handlers and page components

### Code Style

- Uses Biome for linting and formatting
- TypeScript strict mode enabled
- Follows Next.js 15 App Router patterns (where applicable)
- Uses functional components with hooks
- Form handling with React Hook Form + Zod validation

---

## Additional Resources

### External Integrations

- **WCA (World Cube Association)**: OAuth authentication, competitor import, results import
- **QPay**: Payment gateway for Mongolian market
- **Resend**: Email delivery service
- **Supabase**: Optional database hosting (type generation)

### Key Files Reference

- `src/server/api/root.ts` - tRPC router aggregation
- `src/server/api/trpc.ts` - tRPC context and procedures
- `src/server/auth.ts` - NextAuth configuration
- `src/server/db/schema.ts` - Database schema
- `src/utils/api.ts` - tRPC client configuration
- `src/pages/_app.tsx` - Next.js app wrapper
- `src/components/sidebar/sidebar-items.ts` - Navigation configuration

---

## Notes

- This is a T3 Stack application (Next.js + tRPC + Drizzle + NextAuth)
- The application supports both English and Mongolian (Mongolian is primary)
- Database schema uses prefix `nomad_competition_` for all tables
- Payment integration is specific to Mongolian market (QPay)
- WCA integration allows importing competitors and results from WCA systems

---

*Last Updated: 2025*
*Documentation Version: 1.0*
