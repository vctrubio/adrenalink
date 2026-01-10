# Transactions Documentation

This document defines the structure, logic, and visualization standards for **Transactions** within the Adrenalink ecosystem. Transactions serve as the "Source of Truth" for financial and operational data related to school lessons.

## Core Definition

A Transaction represents a single realized event (Lesson) and its associated financial metadata. It bridges the gap between operational scheduling (Classboard) and financial reporting (Accounting).

### Data Structure (`TransactionEventData`)

The following structure is the definitive standard used across the application:

```typescript
export interface TransactionEventData {
    event: {
        id: string;
        date: string; // ISO string
        duration: number; // minutes
        location: string | null;
        status: string; // e.g., 'planned', 'completed'
    };
    teacher: {
        username: string;
    };
    leaderStudentName: string;
    studentCount: number;
    studentNames: string[];
    packageData: {
        description: string;
        pricePerStudent: number;
        durationMinutes: number;
        categoryEquipment: string;
        capacityEquipment: number;
        capacityStudents: number;
    };
    financials: {
        teacherEarnings: number;
        studentRevenue: number;
        profit: number;
        currency: string;
        commissionType: "fixed" | "percentage";
        commissionValue: number;
    };
}
```

## Visualization Layers

Transactions are visualized in three primary ways depending on the user's needs:

### 1. Grouped List View (Admin Home)

Focuses on high-level operational efficiency.

- **Grouping**: By Date.
- **Interaction**: Collapsible headers showing daily totals.
- **Key Metrics**: Completed/Total ratio, Students, Teachers, Duration, Revenue, Commission, Profit.

### 2. Transaction Table View (`TransactionEventsTable.tsx`)

A powerful, data-dense view for financial auditing and analysis.

- **Flexible Grouping**:
    - **List**: Flat view of all transactions.
    - **Date**: Dividers per day with daily statistics.
    - **Week**: Dividers per week with weekly statistics.
- **Standout Headers**: Group headers feature real-time calculation of:
    - **Students** (HelmetIcon): Total unique student involvements.
    - **Lessons** (FlagIcon): Completed vs. Total count.
    - **Duration** (ClockIcon): Total time spent.
    - **Commissions** (HandshakeIcon): Total teacher payouts.
    - **Revenue** (ReceiptIcon): Total student billing.
    - **Profit** (ActivityIcon): Net margin after payouts.

### 3. Individual Transaction Record (`transaction/page.tsx`)

The deep-dive view for a single event.

- **Perspectives**: Separate cards for "The Instructor" and "The Student".
- **Resume**: Comprehensive breakdown of Booking, Package, Lesson/Teacher, Event Specifics, Involved Students, and Linked Equipment.

## Logic & Calculations

Transactions are typically derived from the `ClassboardModel` via transformation logic:

1.  **Revenue**: `Price Per Student * (Duration / 60) * Student Count`.
2.  **Teacher Earnings**:
    - _Fixed_: `CPH (Commission Per Hour) * (Duration / 60)`.
    - _Percentage_: `Revenue * (Commission % / 100)`.
3.  **Profit**: `Revenue - Teacher Earnings`.

## Icon Standards (Source of Truth)

To maintain consistency, always use these icons when representing transaction data:

- **FlagIcon**: Lessons / Event Count.
- **HelmetIcon**: Students.
- **DurationIcon / Clock**: Duration / Time.
- **HandshakeIcon**: Commissions / Teacher Payouts.
- **ReceiptIcon**: Revenue / Billing.
- **ActivityIcon / TrendingUp**: Profit / Margin.
- **Equipment Categories**: Dynamic icons based on `categoryEquipment`.

---

_This document is the authoritative guide for Transaction-related features. Adhere to these structures and patterns when refactoring or adding new financial modules._
