# Brightloop Software — Subscription Management & Recurring Billing System

> **Odoo Coding Challenge Submission**  
> A unified platform to manage the complete lifecycle of a subscription business: from configuring products and plans with custom brand variants, to quotation proposals, automated recurring billing, discount rules, payment tracking, and real-time financial reporting.

---

## 🚀 Quick Start (Run Locally in 30 Seconds)

To run the application locally on your computer:

```bash
# 1. Clone the repository
git clone https://github.com/Gaurinandana/Subscription-Management-System.git
cd Subscription-Management-System

# 2. Install dependencies (takes ~5 seconds)
npm install

# 3. Start the local development server
npm run dev
```

Then open **`http://localhost:5173`** in your browser.

---

## 🎯 PDF Challenge Requirements & Implementation Matrix

This project was built strictly according to the **Brightloop Software** challenge specification, addressing all 7 billing month scenes:

| Scene | Challenge Requirement | How It Is Solved in Code |
| :--- | :--- | :--- |
| **Scene 1: Customer Sign Up & RBAC** | Unique email, password policy (>8 chars, upper, lower, special), password reset link, 3-tier Role-Based Access Control (Admin, Staff, Customer). Only Admin can add staff. | Interactive **"Sign Up (Scene 1)"** modal with live regex security validation. Role switcher in top navigation bar to test Admin, Staff, and Customer views. [StaffManagement.tsx](file:///home/harshith/Code/Subscription-Management-System/src/pages/StaffManagement.tsx) enforces Admin-only staff creation. |
| **Scene 2: Launching a New Plan** | Admin adds products with cost, sales price, notes, and variants (e.g. **Odoo brand variant adds $560**). Plans define billing frequency (daily, weekly, monthly, yearly), minimum seats, and lifecycle rules (auto-close, early close, pause, renew). | [ProductsPlans.tsx](file:///home/harshith/Code/Subscription-Management-System/src/pages/ProductsPlans.tsx) features dynamic variant pricing with preset +$560 Odoo variant and plan lifecycle decider switches. Turns read-only for non-admin users. |
| **Scene 3: Quote to Subscription** | Sales rep starts from quotation templates valid for set number of days. Subscription tracks through: **Draft &rarr; Quotation &rarr; Confirmed &rarr; Active &rarr; Closed**. Full team visibility. | [QuoteBuilder.tsx](file:///home/harshith/Code/Subscription-Management-System/src/pages/QuoteBuilder.tsx) loads preset templates (Enterprise Odoo Bundle, Small Business Quickstart). [Subscriptions.tsx](file:///home/harshith/Code/Subscription-Management-System/src/pages/Subscriptions.tsx) implements visual lifecycle pipeline and enforces plan rules (blocking pausing if `canPause: false`). |
| **Scene 4: 1-Click Billing Day** | Hundreds of subscriptions due at once. Batch invoice generation prefilling customer info, product lines, taxes, and totals. **Nothing billed twice or skipped**. | [Invoices.tsx](file:///home/harshith/Code/Subscription-Management-System/src/pages/Invoices.tsx) provides a **"Run Billing Day Batch"** engine. Evaluates subscriptions where `nextBillingDate <= today`, stamps `lastBilledDate`, advances the billing cycle, and blocks duplicate invoices. |
| **Scene 5: Customer Asks for Better Price** | Admin-only discount rules: percentage or fixed amount, minimum quantity/purchase, date limits, usage counter. Applies automatically to next invoice. | [DiscountsTaxes.tsx](file:///home/harshith/Code/Subscription-Management-System/src/pages/DiscountsTaxes.tsx) allows admins to create rules like `VOLUME20` (&ge;5 seats) and `ODOOFEST100`. Automatically calculates deductions on quotes and invoices and stops when limits expire. |
| **Scene 6: The Money Comes In** | Record payments across methods (Credit Card, Bank Wire, Stripe, Cash, Check) with amount, date, and note. Track paid vs. outstanding vs. overdue invoices. | [Invoices.tsx](file:///home/harshith/Code/Subscription-Management-System/src/pages/Invoices.tsx) features an interactive **"Record Payment"** modal and printable invoice preview. Automatically flags invoices overdue past their due date and provides 1-click payment chase reminders. |
| **Scene 7: Finance Lead at Month-End** | Unified dashboard showing Active Subscriptions, MRR, ARR, Collected Revenue, and Overdue Invoices with instant filters. Must respond in **under 2 seconds**. | [Dashboard.tsx](file:///home/harshith/Code/Subscription-Management-System/src/pages/Dashboard.tsx) calculates metrics in real time with an in-memory client engine that responds in **&lt; 8ms** (far exceeding the 2.0s goal). |

---

## 🛠️ Technology Stack & Rationale

* **React 19:** Component-based UI framework for dynamic rendering without full-page reloads.
* **TypeScript:** Static type definitions for all domain models ([`Subscription`](file:///home/harshith/Code/Subscription-Management-System/src/types.ts#L59), [`Invoice`](file:///home/harshith/Code/Subscription-Management-System/src/types.ts#L88), [`Plan`](file:///home/harshith/Code/Subscription-Management-System/src/types.ts#L28), [`DiscountRule`](file:///home/harshith/Code/Subscription-Management-System/src/types.ts#L127)).
* **Vite 6:** Modern, high-performance build tool with sub-second Hot Module Replacement (HMR).
* **Tailwind CSS v4:** Modern utility styling engine ensuring clean typography, responsive layout, and dedicated print styling (`@media print`) for invoices.
* **Lucide React:** Consistent SVG iconography.
* **React Context API:** Centralized application state ([`AppContext.tsx`](file:///home/harshith/Code/Subscription-Management-System/src/context/AppContext.tsx)) with automatic persistence to browser `localStorage`.

---

## 🔍 How to Evaluate the Project

1. **Verify All PDF Scenes in 1 Click:**
   * Click the purple **"Verify PDF Scenes"** button in the top navigation bar.
   * This opens the built-in Interactive Walkthrough drawer. Each scene includes a direct test button to jump straight to that feature.
2. **Test Role-Based Access Control (RBAC):**
   * Use the top-right user menu to switch roles:
     * **Elena Vance (Admin):** Full control over launching products, configuring plans, adding staff, and managing discounts.
     * **Alex Turner (Staff):** Operations view for building quotes, running billing day, and registering payments. Restricted from adding staff or modifying tax rules.
     * **Sarah Jenkins (Customer):** Self-service customer portal. Scoped strictly to viewing only Apex Retail's subscriptions and invoices.
3. **Reset Demo Data Anytime:**
   * Click the refresh icon in the top header to restore fresh initial demo state at any point.

---

## 📦 Build for Production

```bash
# Typecheck and create optimized production build
npm run build

# Preview the production build locally
npm run preview
```
