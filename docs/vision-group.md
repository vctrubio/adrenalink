# Vision Group - Application Flow

## Overview

This document outlines the core workflow steps in Adrenalink. Each step represents a key phase in the school management lifecycle, showing how entities connect and flow through the system.

## Layout Structure

Each step follows this pattern:
- **a** points to **b** and **c**
- **b** is always right of **a**
- **c** is bottom of **a**
- **Description** to the right of **c**
- Grid: 4 columns left, 8 columns right

---

## Step 1: School Setup

**Icon:** School
**Heading:** Sign Up

### Entities
- **a:** Admin
- **b:** Subdomain
- **c:** Packages

### Description
School sets up account.

---

## Step 2: Team Building

**Icon:** Teachers
**Heading:** Build Your Team

### Entities
- **a:** Teacher
- **b:** Commission
- **c:** Lesson

### Description
Create teachers, give them commission based salaries, and appoint them to lessons for planning.

---

## Step 3: Student Enrollment

**Icon:** Students
**Heading:** Welcome Riders

### Entities
- **a:** Student
- **b:** Request
- **c:** Bookings

### Description
Students register to your site, request a package, and seamlessly create a booking.

---

## Step 4: Daily Operations

**Icon:** Event
**Heading:** Track & Execute

### Entities
- **a:** Event
- **b:** Equipment
- **c:** Confirmation

### Description
Create events, track your equipment and get teacher confirmation easily.

---

## Step 5: Financial Analytics

**Icon:** Statistic
**Heading:** Revenue & Payments

### Entities
- **a:** Bank
- **b:** Payments
- **c:** Revenue

### Description
See your money flow, who you have to pay = students package - teacher commission - referrals = revenue (our 3 pillars).

---

## Visual Flow

```
Step 1: School → Subdomain + Packages
Step 2: Teacher → Commission + Lesson
Step 3: Student → Request + Bookings
Step 4: Event → Equipment + Confirmation
Step 5: Bank → Payments + Revenue
```

## Notes

This structure represents the upgradable flow pattern that will be implemented in the dev page component. Each step builds on the previous one to create a complete school management workflow.
