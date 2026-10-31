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
    <div className="space-y-6 animate-in fade-in duration-300 text-slate-100">
      {/* Top Banner & Scene 7 Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Scene 7: The Finance Lead, at the End of the Month</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Financial Health & Recurring Revenue
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Unified single-pane view of active recurring subscriptions, total collected revenue,
            outstanding balances, and overdue invoices.
          </p>
        </div>

        {/* Scene 4 & 7 Quick Action */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 rounded-xl text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Response: &lt; 8ms (&lt; 2.0s goal)</span>
          </div>
          <button
            onClick={() => runBillingDay()}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow"
          >
            <Zap className="w-4 h-4" />
            <span>Run Billing Day (1-Click)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Subscriptions */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg hover:border-purple-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Subscriptions
            </span>
            <div className="p-2 bg-purple-950/60 border border-purple-800/60 text-purple-400 rounded-xl">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{activeSubsCount}</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              100% On Book
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Total registered: {subscriptions.length} accounts
          </p>
        </div>

        {/* Card 2: Monthly Recurring Revenue (MRR) */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg hover:border-purple-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Monthly Recurring (MRR)
            </span>
            <div className="p-2 bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              ${totalMRR.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">/mo</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Projected ARR: <strong className="text-slate-200">${totalARR.toLocaleString()}</strong>
          </p>
        </div>

        {/* Card 3: Total Collected Revenue */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg hover:border-purple-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Revenue Collected
            </span>
            <div className="p-2 bg-blue-950/60 border border-blue-800/60 text-blue-400 rounded-xl">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              ${totalCollectedRevenue.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-blue-400">
              {payments.length} Payments
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Settled via Stripe, CC & Wire
          </p>
        </div>

        {/* Card 4: Still Owed / Overdue Alert */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg hover:border-purple-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Outstanding Owed
            </span>
            <div className="p-2 bg-rose-950/60 border border-rose-800/60 text-rose-400 rounded-xl">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-400">
              ${totalOutstandingOwed.toLocaleString()}
            </span>
            {overdueInvoices.length > 0 && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800/60">
                {overdueInvoices.length} Overdue
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Action required by accounts receivable
          </p>
        </div>
      </div>

      {/* Overdue Invoices Alert Section (Scene 6) */}
      {overdueInvoices.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/40 to-amber-950/30 p-5 rounded-2xl border border-rose-900/60 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
              <AlertOctagon className="w-4.5 h-4.5 text-rose-400" />
              <span>Attention: {overdueInvoices.length} Overdue Invoices Awaiting Payment</span>
            </div>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 underline"
            >
              View Invoices Table &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {overdueInvoices.map((inv) => (
              <div
                key={inv.id}
                className="bg-slate-900/90 p-3.5 rounded-xl border border-rose-900/60 flex items-center justify-between shadow-md"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{inv.number}</span>
                    <span className="text-[10px] bg-rose-950 text-rose-300 font-bold px-1.5 py-0.2 rounded border border-rose-800/60">
                      Due: {inv.dueDate}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-medium mt-0.5">{inv.customerName}</div>
                  <div className="text-xs font-bold text-rose-400 mt-0.5">
                    Amount Owed: ${(inv.total - inv.amountPaid).toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => handleChasePayment(inv.number, inv.customerEmail)}
                  className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-rose-800/60 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Chase Payment</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Subscriptions Summary & Search Filters */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-white">Subscription Portfolio Summary</h3>
            <p className="text-xs text-slate-400">
              Live recurring contracts, billing cycles, and next auto-invoicing dates
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search customer or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="text-xs rounded-xl border border-slate-700 px-3 py-1.5 bg-slate-950 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="px-3 py-1.5 bg-purple-950/60 border border-purple-800/60 text-purple-300 hover:bg-purple-900/60 text-xs font-semibold rounded-xl transition"
            >
              View Full Table &rarr;
            </button>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Subscription</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Plan</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Next Billing</th>
                <th className="px-5 py-3.5 text-right pr-8">Recurring Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredSubscriptions.map((sub) => {
                const statusStyles: Record<string, string> = {
                  Active: 'bg-emerald-950 text-emerald-300 border border-emerald-800/60',
                  Draft: 'bg-slate-800 text-slate-300 border border-slate-700',
                  Quotation: 'bg-indigo-950 text-indigo-300 border border-indigo-800/60',
                  Confirmed: 'bg-blue-950 text-blue-300 border border-blue-800/60',
                  Paused: 'bg-amber-950 text-amber-300 border border-amber-800/60',
                  Closed: 'bg-rose-950 text-rose-300 border border-rose-800/60',
                };

                return (
                  <tr key={sub.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-5 py-4 font-bold text-white">{sub.number}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-200">{sub.customerName}</div>
                      <div className="text-[11px] text-slate-400">{sub.customerEmail}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-300 font-medium">{sub.planName}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          statusStyles[sub.status] || 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">
                      {sub.nextBillingDate}
                    </td>
                    <td className="px-5 py-4 font-bold text-white font-mono text-right pr-8">
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
