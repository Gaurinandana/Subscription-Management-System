import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Zap,
  DollarSign,
  FileText,
  Layers,
  Sparkles,
  HelpCircle,
  X,
  RefreshCw,
} from 'lucide-react';

interface VerificationGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onOpenAuth: () => void;
}

export const VerificationGuide: React.FC<VerificationGuideProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenAuth,
}) => {
  const { switchRole, runBillingDay, resetToDemoData } = useApp();
  const [activeTab, setActiveTab] = useState<'scenes' | 'learning'>('scenes');

  if (!isOpen) return null;

  const scenes = [
    {
      num: 1,
      title: 'A New Customer Signs Up & RBAC',
      desc: 'Account creation with strict password rules (>8 chars, upper, lower, special), email uniqueness, password reset simulation, and 3-tier Role-Based Access Control.',
      actionLabel: 'Test Sign Up & Password Policy',
      action: () => {
        onClose();
        onOpenAuth();
      },
      roleCheck: 'Switch roles in the top navbar to see how Admin, Staff, and Customer see different data.',
    },
    {
      num: 2,
      title: 'Launching a New Plan & Variants',
      desc: 'Admin configures products with variants (e.g. Odoo Brand adds $560), billing frequencies (daily, weekly, monthly, yearly), minimum quantities, and lifecycle rules (auto-close, early closure, pause, renew).',
      actionLabel: 'View Products & Plans Catalog',
      action: () => {
        switchRole('admin');
        onNavigate('products');
        onClose();
      },
      roleCheck: 'Try switching to "Staff" role to see read-only enforcement where only Admin can create plans.',
    },
    {
      num: 3,
      title: 'Turning a Quote into a Subscription',
      desc: 'Sales reps start from quotation templates with preset lines and validity days. Subscriptions track from Draft -> Quotation -> Confirmed -> Active -> Closed.',
      actionLabel: 'Open Quote & Subscription Builder',
      action: () => {
        switchRole('staff');
        onNavigate('quotes');
        onClose();
      },
      roleCheck: 'Inspect the live status pipeline and action buttons on any subscription.',
    },
    {
      num: 4,
      title: 'Billing Day & Automated Invoicing',
      desc: 'Hundreds of subscriptions due at once. 1-click batch engine automatically creates invoices with prefilled lines, taxes, and discounts. Guarantees no duplicate billing or skipped cycles.',
      actionLabel: 'Trigger 1-Click Billing Run',
      action: () => {
        onNavigate('invoices');
        runBillingDay();
        onClose();
      },
      roleCheck: 'Inspect invoice statuses: Draft -> Confirmed -> Paid. Invoices can be sent or printed.',
    },
    {
      num: 5,
      title: 'A Customer Asks for a Better Price',
      desc: 'Admin creates discount rules (percentage or fixed amount, minimum quantity/spend, date limits, usage cap). Applies automatically to subscriptions and invoices.',
      actionLabel: 'Manage Discount & Tax Rules',
      action: () => {
        switchRole('admin');
        onNavigate('discounts');
        onClose();
      },
      roleCheck: 'Notice discount rules apply automatically to the next invoice without manual typing.',
    },
    {
      num: 6,
      title: 'The Money Comes In (Payments)',
      desc: 'Record incoming payments by method (Credit Card, Bank Transfer, Stripe, Cash, Check), amount, date, and note against specific invoices. Track overdue invoices.',
      actionLabel: 'View Invoices & Record Payment',
      action: () => {
        onNavigate('invoices');
        onClose();
      },
      roleCheck: 'Click "Record Payment" on any confirmed invoice to watch it transition to Paid.',
    },
    {
      num: 7,
      title: 'The Finance Lead at Month-End',
      desc: 'One unified dashboard showing Active Subscriptions, Monthly Recurring Revenue (MRR), Outstanding amounts, and Overdue Invoices with sub-2-second instant filters.',
      actionLabel: 'Go to Finance Dashboard',
      action: () => {
        onNavigate('dashboard');
        onClose();
      },
      roleCheck: 'Test fast search and filtering by customer, status, or date range.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 h-full w-full max-w-2xl shadow-2xl flex flex-col border-l border-slate-800 animate-in slide-in-from-right duration-300 text-slate-100">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-950/80 border border-purple-800/60 text-purple-400 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Project Verification & Learning Guide</h2>
              <p className="text-xs text-slate-400">
                Interactive companion for the Odoo Subscription Management challenge
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900 gap-6">
          <button
            onClick={() => setActiveTab('scenes')}
            className={`py-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'scenes'
                ? 'border-purple-500 text-purple-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>The 7 PDF Scenes Walkthrough</span>
          </button>
          <button
            onClick={() => setActiveTab('learning')}
            className={`py-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'learning'
                ? 'border-purple-500 text-purple-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Web Dev Concepts & Interview Q&A</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'scenes' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-950/40 border border-purple-800/60 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-purple-300">Brightloop Software Scenario Testing</div>
                  <div className="text-xs text-purple-200/80 mt-0.5">
                    Click any action button below to jump straight to that feature with appropriate demo state.
                  </div>
                </div>
                <button
                  onClick={resetToDemoData}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-purple-300 text-xs font-semibold rounded-lg hover:bg-slate-700 flex items-center gap-1.5 transition shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset Demo
                </button>
              </div>

              {scenes.map((scene) => (
                <div
                  key={scene.num}
                  className="p-5 rounded-2xl border border-slate-800 hover:border-purple-500/50 hover:shadow-lg transition bg-slate-950/60 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {scene.num}
                      </span>
                      <h3 className="font-bold text-white text-sm">{scene.title}</h3>
                    </div>
                    <button
                      onClick={scene.action}
                      className="px-3 py-1.5 bg-purple-950/80 text-purple-300 hover:bg-purple-600 hover:text-white transition rounded-xl text-xs font-semibold flex items-center gap-1 border border-purple-800/60 shrink-0"
                    >
                      <span>{scene.actionLabel}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pl-8.5">{scene.desc}</p>

                  <div className="ml-8.5 p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Verification Tip:</strong> {scene.roleCheck}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'learning' && (
            <div className="space-y-5 text-sm text-slate-300">
              <div className="p-4 bg-indigo-950/40 border border-indigo-800/60 rounded-2xl text-xs text-indigo-300 leading-relaxed">
                <strong>Why this architecture?</strong> As a beginner to web development, this guide explains how the pieces fit together so you can confidently answer questions during evaluation.
              </div>

              {/* Concept 1 */}
              <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/60 space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 rounded-md bg-blue-950 text-blue-400 border border-blue-800/60 flex items-center justify-center text-xs">1</span>
                  What is Frontend Web Development?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Frontend is everything the user sees, clicks, and interacts with in their web browser. It transforms raw data into an intuitive, responsive graphical user interface (GUI).
                </p>
                <div className="text-[11px] bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-400">
                  <strong>The 3 Core Pillars:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li><strong>HTML5:</strong> Defines structure (buttons, tables, headings).</li>
                    <li><strong>Tailwind CSS v4:</strong> Controls visual presentation (colors, dark mode tokens, spacing, typography).</li>
                    <li><strong>TypeScript / React:</strong> Controls interactivity, calculations, state, and business rules.</li>
                  </ul>
                </div>
              </div>

              {/* Concept 2 */}
              <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/60 space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 rounded-md bg-purple-950 text-purple-400 border border-purple-800/60 flex items-center justify-center text-xs">2</span>
                  Why React + Vite instead of plain HTML/JS?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>React</strong> uses a component-based model. Instead of copying and pasting code, we write reusable components. When state changes, React updates only that specific DOM element instantly without reloading the page.
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>Vite</strong> is the modern build tool powering instant hot-module reloading (HMR) and sub-second builds.
                </p>
              </div>

              {/* Concept 3 */}
              <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/60 space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center justify-center text-xs">3</span>
                  How is State Managed? (The AppContext)
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  State is the living memory of our application. We use <strong>React Context API</strong> (<code>AppContext.tsx</code>). Any page or modal can read or mutate the active subscriptions, invoices, or logged-in user without prop-drilling.
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We also persist state to browser <code>localStorage</code>, so your created products, status changes, and recorded payments stay intact even on page refresh.
                </p>
              </div>

              {/* Concept 4 */}
              <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/60 space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 rounded-md bg-amber-950 text-amber-400 border border-amber-800/60 flex items-center justify-center text-xs">4</span>
                  How is Role-Based Access Control (RBAC) enforced?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We check the active role (<code>admin</code>, <code>staff</code>, or <code>customer</code>) to conditionally render views and disable unauthorized actions:
                </p>
                <ul className="text-xs text-slate-400 list-disc list-inside space-y-1">
                  <li><strong>Admin:</strong> Can add staff, configure plans, set tax and discount rules.</li>
                  <li><strong>Staff:</strong> Can prepare quotes, convert them to subscriptions, run billing day, record payments.</li>
                  <li><strong>Customer:</strong> Scoped strictly to records matching their <code>customerId</code> (portal self-service).</li>
                </ul>
              </div>

              {/* Concept 5 */}
              <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/60 space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 rounded-md bg-rose-950 text-rose-400 border border-rose-800/60 flex items-center justify-center text-xs">5</span>
                  Questions You Might Be Asked & How to Answer
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="font-bold text-white">Q: "How do you ensure invoices aren't billed twice?"</span>
                    <p className="text-slate-400 mt-0.5">
                      <strong>Answer:</strong> The billing engine compares each active subscription's <code>nextBillingDate</code> with today's date. When an invoice is generated, the <code>lastBilledDate</code> is stamped and <code>nextBillingDate</code> is advanced to the next period.
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="font-bold text-white">Q: "How are discounts and taxes calculated?"</span>
                    <p className="text-slate-400 mt-0.5">
                      <strong>Answer:</strong> Line items add base price + variant delta. The tax rule computes tax percentage (10% standard). Discount rules validate minimum seat quantity / amount and apply either a percentage or fixed amount before calculating the final invoice total.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
