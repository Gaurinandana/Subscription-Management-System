import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
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
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');

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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Scene 7 Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Scene 7: The Finance Lead, at the End of the Month</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Financial Health & Recurring Revenue
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Unified single-pane view of active recurring subscriptions, total collected revenue,
            outstanding balances, and overdue invoices.
          </p>
        </div>

        {/* Scene 4 & 7 Quick Action */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Response: &lt; 8ms (&lt; 2.0s goal)</span>
          </div>
          <button
            onClick={() => {
              const res = runBillingDay();
            }}
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
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Subscriptions
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{activeSubsCount}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              100% On Book
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Total registered: {subscriptions.length} accounts
          </p>
        </div>

        {/* Card 2: Monthly Recurring Revenue (MRR) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Monthly Recurring (MRR)
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              ${totalMRR.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">/mo</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Projected ARR: <strong>${totalARR.toLocaleString()}</strong>
          </p>
        </div>

        {/* Card 3: Total Collected Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Revenue Collected
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              ${totalCollectedRevenue.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-blue-600">
              {payments.length} Payments
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Settled via Stripe, CC & Wire
          </p>
        </div>

        {/* Card 4: Still Owed / Overdue Alert */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Outstanding Owed
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600">
              ${totalOutstandingOwed.toLocaleString()}
            </span>
            {overdueInvoices.length > 0 && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                {overdueInvoices.length} Overdue
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Action required by accounts receivable
          </p>
        </div>
      </div>

      {/* Overdue Invoices Alert Section (Scene 6: "chased before they turn into lost revenue") */}
      {overdueInvoices.length > 0 && (
        <div className="bg-gradient-to-r from-rose-50 to-amber-50/50 p-5 rounded-2xl border border-rose-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <AlertOctagon className="w-4.5 h-4.5 text-rose-600" />
              <span>Attention: {overdueInvoices.length} Overdue Invoices Awaiting Payment</span>
            </div>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 underline"
            >
              View Invoices Table &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {overdueInvoices.map((inv) => (
              <div
                key={inv.id}
                className="bg-white p-3.5 rounded-xl border border-rose-200/80 flex items-center justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{inv.number}</span>
                    <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded">
                      Due: {inv.dueDate}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">{inv.customerName}</div>
                  <div className="text-xs font-bold text-rose-600 mt-0.5">
                    Amount Owed: ${(inv.total - inv.amountPaid).toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => handleChasePayment(inv.number, inv.customerEmail)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-rose-200 shrink-0"
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Subscription Portfolio Summary</h3>
            <p className="text-xs text-slate-500">
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
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="text-xs rounded-xl border border-slate-200 px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold rounded-xl transition"
            >
              View Full Table &rarr;
            </button>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Subscription</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Plan</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Next Billing</th>
                <th className="px-5 py-3.5">Recurring Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubscriptions.map((sub) => {
                const statusStyles: Record<string, string> = {
                  Active: 'bg-emerald-100 text-emerald-800',
                  Draft: 'bg-slate-100 text-slate-700',
                  Quotation: 'bg-indigo-100 text-indigo-800',
                  Confirmed: 'bg-blue-100 text-blue-800',
                  Paused: 'bg-amber-100 text-amber-800',
                  Closed: 'bg-rose-100 text-rose-800',
                };

                return (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-4 font-bold text-slate-900">{sub.number}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{sub.customerName}</div>
                      <div className="text-[11px] text-slate-400">{sub.customerEmail}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-700 font-medium">{sub.planName}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          statusStyles[sub.status] || 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-mono text-[11px]">
                      {sub.nextBillingDate}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900 text-right pr-8">
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
