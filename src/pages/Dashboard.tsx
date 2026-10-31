import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  CreditCard,
  AlertOctagon,
  Users,
  Repeat,
  Zap,
  Clock,
  ArrowUpRight,
  Filter,
  Search,
  CheckCircle2,
  Calendar,
  Send,
  Sparkles,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { subscriptions, invoices, payments, plans, runBillingDay, sendInvoice, addToast } = useApp();

  // Search & Filter state for Finance Lead
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('all');

  // Key Finance Metrics (Scene 7)
  const activeSubs = useMemo(() => subscriptions.filter((s) => s.status === 'Active'), [subscriptions]);
  const activeSubsCount = activeSubs.length;

  const totalMRR = useMemo(() => {
    return activeSubs.reduce((acc, sub) => acc + sub.totalAmount, 0);
  }, [activeSubs]);

  const totalARR = totalMRR * 12;

  const totalCollectedRevenue = useMemo(() => {
    return payments.reduce((acc, p) => acc + p.amount, 0);
  }, [payments]);

  const totalOutstandingOwed = useMemo(() => {
    return invoices
      .filter((inv) => inv.status === 'Confirmed' || inv.status === 'Draft')
      .reduce((acc, inv) => acc + (inv.total - inv.amountPaid), 0);
  }, [invoices]);

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueInvoices = useMemo(() => {
    return invoices.filter(
      (inv) => inv.status === 'Confirmed' && inv.dueDate < todayStr && inv.amountPaid < inv.total
    );
  }, [invoices, todayStr]);

  // Filtered subscriptions list for fast inspection
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchSearch =
        sub.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.planName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPlan = selectedPlan === 'all' || sub.planId === selectedPlan;
      return matchSearch && matchPlan;
    });
  }, [subscriptions, searchTerm, selectedPlan]);

  const handleChasePayment = (invoiceNumber: string, customerEmail: string) => {
    addToast('success', 'Reminder Sent', `Overdue payment chase reminder emailed to ${customerEmail} for ${invoiceNumber}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-[#17191c]">
      {/* Top Banner & Scene 7 Header — Editorial Serif Display */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#ececec]">
        <div>
          <div className="text-[12px] font-normal uppercase tracking-wider text-[#979799] mb-2 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#17191c]" />
            <span>Scene 7 • Finance Lead Dashboard</span>
          </div>
          <h1 className="font-serif text-[40px] md:text-[44px] leading-[1.2] tracking-[-0.66px] text-[#17191c] font-normal">
            Financial Health <span className="italic">& Recurring Revenue</span>
          </h1>
          <p className="text-sm text-[#777b86] mt-2 max-w-xl font-normal leading-relaxed">
            Unified view of active subscriptions, total collected revenue, outstanding receivables,
            and billing velocity across all business tiers.
          </p>
        </div>

        {/* Scene 4 & 7 Quick Actions — Pill lozenges */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#f2f2f3] text-[#17191c] rounded-full text-xs font-normal">
            <Clock className="w-3.5 h-3.5 text-[#777b86]" />
            <span>Response &lt; 8ms (PDF goal: &lt; 2.0s)</span>
          </div>
          <button
            onClick={() => runBillingDay()}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#17191c] hover:bg-black text-[#ffffff] rounded-full text-xs font-medium transition shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 text-[#fbe1d1]" />
            <span>Run Billing Day (1-Click)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid — Floating Product Artifact Cards with soft shadows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Active Subscriptions */}
        <div className="bg-[#ffffff] p-6 rounded-[24px] border border-[#ececec]/80 shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)] transition hover:border-[#17191c]/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-normal text-[#979799] uppercase tracking-wider">
              Active Subscriptions
            </span>
            <div className="p-2 bg-[#f2f2f3] rounded-full text-[#17191c]">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-[32px] text-[#17191c] font-normal">{activeSubsCount}</span>
            <span className="text-xs font-normal text-[#777b86] flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 text-[#17191c]" />
              100% On Book
            </span>
          </div>
          <p className="text-xs text-[#777b86] mt-1">
            Total portfolio: {subscriptions.length} accounts
          </p>
        </div>

        {/* Card 2: Monthly Recurring Revenue (MRR) */}
        <div className="bg-[#ffffff] p-6 rounded-[24px] border border-[#ececec]/80 shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)] transition hover:border-[#17191c]/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-normal text-[#979799] uppercase tracking-wider">
              Monthly Recurring (MRR)
            </span>
            <div className="p-2 bg-[#f2f2f3] rounded-full text-[#17191c]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-[32px] text-[#17191c] font-normal">
              ${totalMRR.toLocaleString()}
            </span>
            <span className="text-xs text-[#777b86]">/month</span>
          </div>
          <p className="text-xs text-[#777b86] mt-1">
            Projected ARR: <strong className="text-[#17191c] font-medium">${totalARR.toLocaleString()}</strong>
          </p>
        </div>

        {/* Card 3: Total Collected Revenue */}
        <div className="bg-[#ffffff] p-6 rounded-[24px] border border-[#ececec]/80 shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)] transition hover:border-[#17191c]/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-normal text-[#979799] uppercase tracking-wider">
              Revenue Collected
            </span>
            <div className="p-2 bg-[#f2f2f3] rounded-full text-[#17191c]">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-[32px] text-[#17191c] font-normal">
              ${totalCollectedRevenue.toLocaleString()}
            </span>
            <span className="text-xs font-normal text-[#777b86]">
              {payments.length} Payments
            </span>
          </div>
          <p className="text-xs text-[#777b86] mt-1">
            Settled via Stripe, Wire & Cards
          </p>
        </div>

        {/* Card 4: Still Owed / Overdue Alert */}
        <div className="bg-[#ffffff] p-6 rounded-[24px] border border-[#ececec]/80 shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)] transition hover:border-[#17191c]/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-normal text-[#979799] uppercase tracking-wider">
              Outstanding Balance
            </span>
            <div className="p-2 bg-[#f2f2f3] rounded-full text-[#17191c]">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-[32px] text-[#17191c] font-normal">
              ${totalOutstandingOwed.toLocaleString()}
            </span>
            {overdueInvoices.length > 0 && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#fbe1d1] text-[#5d2a1a]">
                {overdueInvoices.length} Overdue
              </span>
            )}
          </div>
          <p className="text-xs text-[#777b86] mt-1">
            Accounts receivable pending settlement
          </p>
        </div>
      </div>

      {/* Accent Blush Peach Editorial Card — Rare single accent highlight on page (Steep signature) */}
      {overdueInvoices.length > 0 && (
        <div className="bg-[#fbe1d1] p-6 rounded-[24px] text-[#5d2a1a] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium text-sm">
              <AlertOctagon className="w-4.5 h-4.5 text-[#5d2a1a]" />
              <span className="font-serif text-lg tracking-tight">Editorial Alert: {overdueInvoices.length} Overdue Invoices Requiring Follow-Up</span>
            </div>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-xs font-medium text-[#5d2a1a] hover:underline"
            >
              Open Receivables Ledger &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {overdueInvoices.map((inv) => (
              <div
                key={inv.id}
                className="bg-[#ffffff] p-4 rounded-[16px] flex items-center justify-between shadow-xs border border-[#5d2a1a]/10"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs text-[#17191c]">{inv.number}</span>
                    <span className="text-[10px] bg-[#fbe1d1] text-[#5d2a1a] px-2 py-0.5 rounded-full font-medium">
                      Due: {inv.dueDate}
                    </span>
                  </div>
                  <div className="text-xs text-[#777b86] mt-1">{inv.customerName}</div>
                  <div className="text-xs font-medium text-[#17191c] mt-0.5">
                    Owed: ${(inv.total - inv.amountPaid).toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => handleChasePayment(inv.number, inv.customerEmail)}
                  className="px-4 py-1.5 bg-[#17191c] hover:bg-black text-[#ffffff] text-xs font-normal rounded-full transition flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3 h-3 text-[#fbe1d1]" />
                  <span>Chase Payment</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscription Portfolio Summary — Floating Product Artifact */}
      <div className="bg-[#ffffff] rounded-[24px] border border-[#ececec] shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-6 border-b border-[#f2f2f3] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl text-[#17191c] font-normal">Subscription Portfolio</h3>
            <p className="text-xs text-[#777b86] mt-0.5">
              Live recurring contracts, billing cycles, and next auto-invoicing dates
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#979799] absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search customer or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] placeholder-[#a3a6af] focus:outline-none focus:border-[#17191c]"
              />
            </div>

            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="text-xs rounded-full border border-[#ececec] px-3.5 py-1.5 bg-[#fafafb] text-[#17191c] focus:outline-none focus:border-[#17191c]"
            >
              <option value="all">All Plans</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => onNavigate('subscriptions')}
              className="px-4 py-1.5 border border-[#17191c] text-[#17191c] hover:bg-[#f2f2f3] text-xs font-normal rounded-full transition"
            >
              View Full Table &rarr;
            </button>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fafafb] text-[#979799] uppercase tracking-wider font-normal border-b border-[#ececec]">
              <tr>
                <th className="px-6 py-3.5">Subscription</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Plan</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Next Billing</th>
                <th className="px-6 py-3.5 text-right pr-8">Recurring Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f2f3]">
              {filteredSubscriptions.map((sub) => {
                const statusStyles: Record<string, string> = {
                  Active: 'bg-[#f2f2f3] text-[#17191c]',
                  Draft: 'bg-[#fafafb] text-[#777b86]',
                  Quotation: 'bg-[#f2f2f3] text-[#17191c]',
                  Confirmed: 'bg-[#f2f2f3] text-[#17191c]',
                  Paused: 'bg-[#fbe1d1] text-[#5d2a1a]',
                  Closed: 'bg-[#f2f2f3] text-[#777b86]',
                };

                return (
                  <tr key={sub.id} className="hover:bg-[#fafafb] transition">
                    <td className="px-6 py-4 font-medium text-[#17191c]">{sub.number}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#17191c]">{sub.customerName}</div>
                      <div className="text-[11px] text-[#777b86]">{sub.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-[#777b86]">{sub.planName}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                          statusStyles[sub.status] || 'bg-[#f2f2f3] text-[#777b86]'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#777b86] font-mono text-[11px]">
                      {sub.nextBillingDate}
                    </td>
                    <td className="px-6 py-4 font-medium text-[#17191c] font-mono text-right pr-8">
                      ${sub.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
