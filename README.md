# Brightloop Software - Subscription Management System

Odoo Coding Challenge submission. A recurring billing and subscription platform supporting product/plan configuration, quotation lifecycle tracking, batch invoice generation, discount rule management, payment recording, and financial reporting.

---

## Quick Start

```bash
git clone https://github.com/Gaurinandana/Subscription-Management-System.git
cd Subscription-Management-System
npm install
npm run dev
```

Application runs locally at `http://localhost:5173`.

---

## Challenge Requirements and Implementation Matrix

Built to the Brightloop Software specification across all 7 scenes:

| Scene | Requirement | Implementation |
| :--- | :--- | :--- |
| **Scene 1: Customer Sign Up & RBAC** | Unique email, password policy (>8 chars, uppercase, lowercase, special char), reset link, 3-tier RBAC (Admin, Staff, Customer). Only Admin can add staff. | [AuthModal.tsx](file:///home/harshith/Code/Subscription-Management-System/src/components/auth/AuthModal.tsx) provides live password regex checks and password reset simulation. Role switcher in [Navbar.tsx](file:///home/harshith/Code/Subscription-Management-System/src/components/common/Navbar.tsx). Admin-only staff creation enforced in [StaffManagement.tsx](file:///home/harshith/Code/Subscription-Management-System/src/pages/StaffManagement.tsx). |
| **Scene 2: Launching a New Plan** | Admin configures products (sales price, cost price, notes, brand variants; Odoo variant adds $560). Plans define frequency (daily, weekly, monthly, yearly), minimum seats, availability window, and lifecycle flags (auto-close, early close, pause, renew). Non-admin read-only. | [ProductsPlans.tsx](file:///home/harshith/Code/Subscription-Management-System/src/pages/ProductsPlans.tsx) manages products, variants (preset +$560 Odoo edition), and plan lifecycle switches. Disables edits for non-admin roles. |
| **Scene 3: Quote to Subscription** | Sales rep starts from quotation templates valid for N days. Pipeline: `Draft` -> `Quotation` -> `Confirmed` -> `Active` -> `Closed`. Plan pause/renew rule enforcement. | [QuoteBuilder.tsx](file:///home/harshith/Code/Subscription-Management-System/src/pages/QuoteBuilder.tsx) loads preset templates. [Subscriptions.tsx](file:///home/harshith/Code/Subscription-Management-System/src/pages/Subscriptions.tsx) implements visual lifecycle pipeline and blocks illegal transitions (e.g. pausing if `canPause: false`). |
| **Scene 4: Billing Day** | 1-Click batch engine generates prefilled invoices (customer details, line items, taxes, discounts) for active contracts due today. Zero duplicate billing; no skipped cycles. | [Invoices.tsx](file:///home/harshith/Code/Subscription-Management-System/src/pages/Invoices.tsx) executes batch billing: filters `nextBillingDate <= today`, stamps `lastBilledDate`, advances the billing cycle, and guarantees idempotency. |
| **Scene 5: Discounts & Taxes** | Admin-only discount rules (percentage/fixed, minimum quantity/spend, date limits, usage counter, subscription vs product scope). Auto-applies to quotes and invoices. | [DiscountsTaxes.tsx](file:///home/harshith/Code/Subscription-Management-System/src/pages/DiscountsTaxes.tsx) defines promotional rules and tax rates. Validates limits and increments usage counters. |
| **Scene 6: Payments** | Multi-method payments (Credit Card, Bank Wire, Stripe, Cash, Check). Transitions invoices: `Draft` -> `Confirmed` -> `Paid`. Overdue tracking with 1-click chase reminder. | [Invoices.tsx](file:///home/harshith/Code/Subscription-Management-System/src/pages/Invoices.tsx) provides payment recording modal and printable invoices. Flags overdue balances and simulates payment reminder emails. |
| **Scene 7: Finance Lead Dashboard** | Real-time metrics: MRR, ARR, active subscriptions, collected revenue, outstanding/overdue balances. Sub-2-second query performance. | [Dashboard.tsx](file:///home/harshith/Code/Subscription-Management-System/src/pages/Dashboard.tsx) computes financial metrics in real time (< 8ms response time, exceeding the 2.0s requirement). |

---

## Tech Stack

- **Framework:** React 19 + Vite 6
- **Language:** TypeScript 5.7 (strict mode)
- **Styling:** Tailwind CSS v4 (dark mode default, print styling for invoices)
- **Icons:** Lucide React
- **State Management:** React Context API ([`AppContext.tsx`](file:///home/harshith/Code/Subscription-Management-System/src/context/AppContext.tsx)) with `localStorage` persistence

---

## Evaluation Guide

1. **Verify All Scenes:** Click **"Verify PDF Scenes"** in the top navigation bar to open the walkthrough drawer with 1-click test triggers for each scene.
2. **Role-Based Access Control:** Use the persona switcher in [Navbar.tsx](file:///home/harshith/Code/Subscription-Management-System/src/components/common/Navbar.tsx) to switch between Admin (Elena), Staff (Alex), and Customer (Sarah).
3. **Reset State:** Click the reset icon in the navigation bar to restore initial seed data.

---

## Production Build

```bash
npm run build
npm run preview
```
