import React, { useState } from 'react';
import { 
  Zap, CheckCircle2, AlertTriangle, TrendingUp, 
  DollarSign, Users, Clock, Search, Plus, Send, ArrowUpRight 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface DashboardProps {
  onNavigate?: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { 
    subscriptions, invoices, payments, 
    runBillingDay, addToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const today = new Date().toISOString().split('T')[0];

  const activeSubs = subscriptions.filter(s => (s.status || '').toLowerCase() === 'active');
  const mrr = activeSubs.reduce((sum, sub) => sum + (Number(sub.unit_price || sub.totalAmount || 0)), 0);
  const arr = mrr * 12;

  const collectedRevenue = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const unpaidInvoices = invoices.filter(i => (i.status || '').toLowerCase() !== 'paid' && (i.status || '').toLowerCase() !== 'cancelled');
  const outstandingBalance = unpaidInvoices.reduce((sum, i) => sum + (Number(i.total || 0) - Number(i.amount_paid || 0)), 0);

  const overdueInvoices = unpaidInvoices.filter(i => i.due_date && i.due_date < today);
  const overdueBalance = overdueInvoices.reduce((sum, i) => sum + (Number(i.total || 0) - Number(i.amount_paid || 0)), 0);

  const filteredSubs = subscriptions.filter(sub => {
    const num = (sub.subscription_number || sub.number || '').toLowerCase();
    const cust = (sub.customer_name || sub.customerName || '').toLowerCase();
    const match = num.includes(searchQuery.toLowerCase()) || cust.includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || (sub.status || '').toLowerCase() === statusFilter.toLowerCase();
    return match && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'active') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'paused') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (s === 'cancelled' || s === 'closed') return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6 animate-entrance">
      {/* 1. Header Banner */}
      <div className="revops-card rounded-2xl p-6 lg:p-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 bg-white border border-slate-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span>Revenue Operations</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Financial Health & Recurring Revenue
          </h1>
          <p className="text-sm text-slate-500">
            Real-time subscription billing telemetry, collections, and receivables.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Response: &lt; 50ms</span>
          </div>

          <button
            onClick={() => runBillingDay()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow transition-all cursor-pointer active:scale-95"
          >
            <Zap className="w-4 h-4" />
            <span>Run Billing Day</span>
          </button>
        </div>
      </div>

      {/* 2. Bento KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Active Subscriptions */}
        <div className="revops-card-hover rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Contracts
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">
              {activeSubs.length}
            </span>
            <span className="text-xs text-slate-500">
              of {subscriptions.length} total
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Generating recurring monthly billing
          </p>
        </div>

        {/* Card 2: MRR */}
        <div className="revops-card-hover rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Monthly Recurring (MRR)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">
              ${mrr.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">/mo</span>
          </div>
          <p className="text-xs text-slate-500">
            Projected ARR: <strong className="text-emerald-700 font-semibold font-mono">${arr.toLocaleString()}</strong>
          </p>
        </div>

        {/* Card 3: Collected Revenue */}
        <div className="revops-card-hover rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Revenue Collected
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">
              ${collectedRevenue.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-sky-700">
              {payments.length} settled
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Payments settled across all channels
          </p>
        </div>

        {/* Card 4: Outstanding Dues */}
        <div className="revops-card-hover rounded-2xl p-5 space-y-3 border-rose-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Outstanding Dues
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-rose-600 tabular-nums">
              ${outstandingBalance.toLocaleString()}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-medium">
              {overdueInvoices.length} Overdue
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Overdue Risk: <strong className="text-rose-700 font-mono">${overdueBalance.toLocaleString()}</strong>
          </p>
        </div>
      </div>

      {/* 3. Overdue Alert Strip */}
      {overdueInvoices.length > 0 && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-800 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>
                Attention: {overdueInvoices.length} Overdue Invoice{overdueInvoices.length > 1 ? 's' : ''} Awaiting Settlement
              </span>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('invoices')}
                className="text-xs font-semibold text-rose-700 hover:text-rose-900 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View Invoices</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {overdueInvoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-rose-200 shadow-2xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{inv.invoice_number || inv.number}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                      Due {inv.due_date || inv.dueDate}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{inv.customer_name || inv.customerName}</p>
                  <p className="text-xs text-rose-600 font-bold font-mono">
                    ${(Number(inv.total || 0) - Number(inv.amount_paid || 0)).toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => addToast(`Reminder dispatched for ${inv.invoice_number || inv.number}`, 'info')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Chase</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Portfolio Table */}
      <div className="revops-card rounded-2xl overflow-hidden bg-white border border-slate-200">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Subscription Portfolio Summary</h2>
            <p className="text-xs text-slate-500">Live active contracts, schedules, and renewal checkpoints</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contract or customer..."
                className="pl-9 pr-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 w-56 transition-colors"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="ALL">All Statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {onNavigate && (
              <button
                onClick={() => onNavigate('quotes')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Quote</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-6">Subscription</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Next Billing</th>
                <th className="py-3 px-6 text-right">Recurring Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                    No subscriptions found. Create your first quote or subscription to see it here!
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-semibold text-indigo-600 text-xs">
                      {sub.subscription_number || sub.number}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="font-medium text-slate-900 text-xs">
                        {sub.customer_name || sub.customerName || `Customer #${sub.customer_id}`}
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize ${getStatusBadge(sub.status)}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-xs text-slate-600">
                      {sub.next_billing_date || sub.nextBillingDate || '—'}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono font-bold text-slate-900 tabular-nums text-xs">
                      ${Number(sub.unit_price || sub.totalAmount || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};