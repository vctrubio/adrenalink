# Schema Update Documentation

## Overview

This document tracks significant schema changes made to the Adrenalink database to support multi-currency operations, school ownership, and subscription management.

## Changes Made

### 1. Currency Support

**Added Enums:**
```typescript
export const currencyEnum = pgEnum("currency", ["USD", "EUR", "CHF"]);
```

**School Table Update:**
```typescript
currency: currencyEnum("currency").notNull().default("EUR")
```

**Rationale:**
- Adrenalink is a worldwide app where each school operates in its own currency
- Supported currencies: USD (US Dollar), EUR (Euro), CHF (Swiss Franc)
- Currency is defined at the school level
- All monetary amounts (packages, payments, commissions) inherit the school's currency
- Amounts are stored as integers (smallest unit: cents/centimes/rappen)

**Implementation Notes:**
- Currency field added to school table with EUR as default
- No currency field needed on individual price tables - inferred from school relationship
- Seed script updated to set currency: "EUR" for test data

---

### 2. School Ownership

**School Table Update:**
```typescript
ownerId: uuid("owner_id").notNull()
```

**Rationale:**
- Each school belongs to an owner/user
- Required field to track school ownership
- Enables owner-specific queries and access control

**Implementation Notes:**
- Added as required field (notNull)
- Seed script generates fake UUID for testing: `faker.string.uuid()`

---

### 3. Subscription System

**Added Enums:**
```typescript
export const subscriptionTierEnum = pgEnum("subscription_tier", ["blue", "silver", "gold"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "cancelled", "past_due", "expired"]);
```

**New Table: school_subscription**
```typescript
export const schoolSubscription = pgTable("school_subscription", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    schoolId: uuid("school_id").notNull().references(() => school.id),
    tier: subscriptionTierEnum("tier").notNull(),
    status: subscriptionStatusEnum("status").notNull().default("active"),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
```

**New Table: subscription_payment**
```typescript
export const subscriptionPayment = pgTable("subscription_payment", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    subscriptionId: uuid("subscription_id").notNull().references(() => schoolSubscription.id),
    amount: integer("amount").notNull(),
    paymentDate: timestamp("payment_date", { withTimezone: true }).notNull(),
    status: varchar("status", { length: 50 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
```

**Subscription Tiers:**
- **Blue** - €50/month: 3 teachers max, unlimited lessons/bookings
- **Silver** - €100/month: Unlimited teachers, rentals
- **Gold** - €200/month: Everything + equipment tracking + referrals

**Rationale:**
- Track which pricing tier each school is subscribed to
- Manage billing periods with start/end dates
- Handle subscription lifecycle (active, cancelled, past_due, expired)
- Maintain payment history for accounting
- Support monthly recurring billing

**Implementation Notes:**
- Subscription status defaults to "active"
- Payment amounts stored as integers (cents) matching currency pattern
- Payment status uses varchar for flexibility: "paid", "failed", "pending"
- Cancellation tracking via cancelledAt timestamp
- NOT included in seed-rev10.ts yet (subscription logic deferred for testing)

---

### 4. Booking Leader Student Name

**Booking Table Update:**
```typescript
leaderStudentName: varchar("leader_student_name", { length: 255 }).notNull()
```

**Rationale:**
- Each booking needs a primary contact/leader student name
- Defaults to the student associated with the walletId from student_package
- Required field for booking identification and communication

**Implementation Notes:**
- Added as required field (notNull)
- NOT yet implemented in seed-rev10.ts (no bookings created in current seed)
- When implementing: pull student name from walletId student in student_package

---

## Type Exports Added

```typescript
export type SchoolSubscriptionType = typeof schoolSubscription.$inferSelect;
export type SchoolSubscriptionForm = typeof schoolSubscription.$inferInsert;
export type SubscriptionPaymentType = typeof subscriptionPayment.$inferSelect;
export type SubscriptionPaymentForm = typeof subscriptionPayment.$inferInsert;
```

---

## Migration Notes

**To apply these changes:**
1. Generate migration: `npm run db:generate`
2. Review migration files in `drizzle/migrations/`
3. Apply migration: `npm run db:migrate`
4. Run seed: `npm run db:seed-rev10`

**Breaking Changes:**
- School table now requires `ownerId` (must be provided on insert)
- School table now requires `currency` (defaults to EUR)
- Booking table now requires `leaderStudentName` (must be provided on insert)

**Backwards Compatibility:**
- Existing schools will need ownerId populated
- Existing schools will default to EUR currency
- Existing bookings will need leaderStudentName populated

---

## Future Considerations

1. **Currency Conversion:** If cross-currency reporting is needed, consider adding a conversion rate table
2. **Subscription Upgrades/Downgrades:** Add logic to handle tier changes mid-billing cycle
3. **Free Trial:** Consider adding a "trial" subscription tier or trial period tracking
4. **Multi-Owner Schools:** If schools need multiple owners, create a join table
5. **Booking Group Leader:** Consider adding leaderId (UUID reference) instead of just name for better data integrity

---

## Related Files

- Schema: `/drizzle/schema.ts`
- Seed Script: `/drizzle/scripts/seed-rev10.ts`
- Pricing Page: `/src/app/docs/pricing/page.tsx`
- This Document: `/docs/SCHEMA-UPDATE.md`

---

**Last Updated:** 2025-12-18
**Schema Version:** Rev 10 + Currency/Subscription Updates
