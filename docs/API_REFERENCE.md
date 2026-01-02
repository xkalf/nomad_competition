# API Reference

Quick reference for tRPC API endpoints used in the Nomad Competition platform.

## Usage Example

```typescript
import { api } from '~/utils/api'

// In a React component
const { data, isLoading } = api.competition.getAll.useQuery()
const mutation = api.competitor.verify.useMutation()
```

---

## Competition Router

### `competition.getAll`

Get all competitions

```typescript
api.competition.getAll.useQuery(boolean?) // optional: filter by active
```

**Returns**: Array of competitions with related data

---

### `competition.getBySlug`

Get competition by slug

```typescript
api.competition.getBySlug.useQuery(string) // slug
```

**Returns**: Competition details with cube types, fees, etc.

---

### `competition.create`

Create new competition (Admin only)

```typescript
api.competition.create.useMutation()
```

**Input Schema**: See `createCompetitionSchema` in `src/utils/zod.ts`

---

### `competition.update`

Update competition (Admin only)

```typescript
api.competition.update.useMutation()
```

---

### `competition.remove`

Delete competition (Admin only)

```typescript
api.competition.remove.useMutation()
```

**Input**: Competition ID (number)

---

## Competitor Router

### `competitor.getByCompetitionId`

Get competitors for a competition

```typescript
api.competitor.getByCompetitionId.useQuery({
  competitionId: number,
  isVerified: boolean // default: true
})
```

**Returns**: Array of competitors with user and cube type data

---

### `competitor.verify`

Verify a competitor registration (Admin only)

```typescript
api.competitor.verify.useMutation()
```

**Input**: Competitor ID (number)

---

### `competitor.remove`

Remove a competitor (Admin only)

```typescript
api.competitor.remove.useMutation()
```

**Input**: Competitor ID (number)

---

### `competitor.importFromWca`

Import competitors from WCA CSV (Admin only)

```typescript
api.competitor.importFromWca.useMutation()
```

**Input**:
```typescript
{
  competitionId: number,
  data: Array<{
    Email: string,
    'WCA ID'?: string,
    Name: string,
    'Birth Date': string, // date format
    'User Id'?: number,
    '333'?: string,
    '444'?: string,
    '222'?: string,
    '555'?: string,
    '333bf'?: string,
    minx?: string,
    pyram?: string
  }>
}
```

---

### `competitor.getByUserId`

Get user's competitor registrations

```typescript
api.competitor.getByUserId.useQuery()
```

**Returns**: Array of competitions user is registered for

---

## Auth Router

### `auth.register`

Register new user

```typescript
api.auth.register.useMutation()
```

**Input Schema**: See `registerSchema` in `src/utils/zod.ts`

---

### `auth.me`

Get current user session

```typescript
api.auth.me.useQuery()
```

**Returns**: Current user from session

---

### `auth.profile`

Get user profile (Authenticated)

```typescript
api.auth.profile.useQuery()
```

**Returns**: Full user profile from database

---

### `auth.verify`

Verify email token

```typescript
api.auth.verify.useQuery(string) // token
```

---

### `auth.updateProfile`

Update user profile (Authenticated)

```typescript
api.auth.updateProfile.useMutation()
```

**Input Schema**: See `updateProfileSchema` in `src/utils/zod.ts`

---

### `auth.resetPassword`

Request password reset

```typescript
api.auth.resetPassword.useMutation()
```

**Input**: Email (string)

---

### `auth.updatePassword`

Update password with reset token

```typescript
api.auth.updatePassword.useMutation()
```

**Input**: Token and new password

---

## Schedule Router

### `schedule.getByCompetitionId`

Get schedules for a competition

```typescript
api.schedule.getByCompetitionId.useQuery(number) // competitionId
```

---

### `schedule.create`

Create schedule (Admin only)

```typescript
api.schedule.create.useMutation()
```

---

### `schedule.update`

Update schedule (Admin only)

```typescript
api.schedule.update.useMutation()
```

---

### `schedule.remove`

Delete schedule (Admin only)

```typescript
api.schedule.remove.useMutation()
```

**Input**: Schedule ID (number)

---

## Round Router

### `round.getByCompetitionId`

Get rounds for a competition

```typescript
api.round.getByCompetitionId.useQuery(number) // competitionId
```

---

### `round.create`

Create round (Admin only)

```typescript
api.round.create.useMutation()
```

---

### `round.update`

Update round (Admin only)

```typescript
api.round.update.useMutation()
```

---

### `round.remove`

Delete round (Admin only)

```typescript
api.round.remove.useMutation()
```

**Input**: Round ID (number)

---

## Result Router

### `result.getByRoundId`

Get results for a round

```typescript
api.result.getByRoundId.useQuery(number) // roundId
```

---

### `result.importFromWcaLive`

Import results from WCA Live (Admin only)

```typescript
api.result.importFromWcaLive.useMutation()
```

**Input**: Round ID (number)

---

### `result.create`

Create result entry (Admin only)

```typescript
api.result.create.useMutation()
```

---

### `result.update`

Update result (Admin only)

```typescript
api.result.update.useMutation()
```

---

### `result.remove`

Delete result (Admin only)

```typescript
api.result.remove.useMutation()
```

**Input**: Result ID (number)

---

## Payment Router

### `payment.createInvoice`

Create payment invoice

```typescript
api.payment.createInvoice.useMutation()
```

**Input**:
```typescript
{
  competitorId: number,
  cubeTypeIds: number[],
  guestCount: number
}
```

**Returns**: Invoice with QPay payment link

---

### `payment.checkInvoice`

Check invoice payment status

```typescript
api.payment.checkInvoice.useQuery(number) // invoiceId
```

---

## Fee Router

### `fee.getByCompetitionId`

Get fees for a competition

```typescript
api.fee.getByCompetitionId.useQuery(number) // competitionId
```

---

### `fee.create`

Create fee (Admin only)

```typescript
api.fee.create.useMutation()
```

---

### `fee.update`

Update fee (Admin only)

```typescript
api.fee.update.useMutation()
```

---

### `fee.remove`

Delete fee (Admin only)

```typescript
api.fee.remove.useMutation()
```

**Input**: Fee ID (number)

---

## Age Group Router

### `ageGroup.getByCompetitionId`

Get age groups for a competition

```typescript
api.ageGroup.getByCompetitionId.useQuery(number) // competitionId
```

---

### `ageGroup.create`

Create age group (Admin only)

```typescript
api.ageGroup.create.useMutation()
```

---

### `ageGroup.update`

Update age group (Admin only)

```typescript
api.ageGroup.update.useMutation()
```

---

### `ageGroup.remove`

Delete age group (Admin only)

```typescript
api.ageGroup.remove.useMutation()
```

**Input**: Age Group ID (number)

---

## Cube Types Router

### `cubeTypes.getAll`

Get all cube types

```typescript
api.cubeTypes.getAll.useQuery()
```

---

### `cubeTypes.create`

Create cube type (Admin only)

```typescript
api.cubeTypes.create.useMutation()
```

---

### `cubeTypes.update`

Update cube type (Admin only)

```typescript
api.cubeTypes.update.useMutation()
```

---

### `cubeTypes.remove`

Delete cube type (Admin only)

```typescript
api.cubeTypes.remove.useMutation()
```

**Input**: Cube Type ID (number)

---

## Procedure Types

### Public Procedures
- No authentication required
- Examples: `competition.getAll`, `auth.register`

### Protected Procedures
- Requires valid session (`ctx.session.user`)
- Examples: `auth.profile`, `competitor.getByUserId`

### Admin Procedures
- Requires admin privileges (`ctx.session.user.isAdmin === true`)
- Examples: `competition.create`, `competitor.verify`

---

## Error Handling

tRPC errors are automatically handled by the client. Common error codes:

- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `BAD_REQUEST` - Invalid input
- `NOT_FOUND` - Resource not found
- `INTERNAL_SERVER_ERROR` - Server error

Error messages are in Mongolian for user-facing errors.

---

## Type Safety

All tRPC endpoints are fully type-safe. Types are inferred from the router definitions:

```typescript
// Type inference example
type Competition = RouterOutputs['competition']['getBySlug']
type CreateCompetitionInput = RouterInputs['competition']['create']
```

Access router output/input types via:

```typescript
import type { RouterOutputs, RouterInputs } from '~/utils/api'

type Competition = RouterOutputs['competition']['getBySlug']
```
