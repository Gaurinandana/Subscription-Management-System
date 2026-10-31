import React, { useState } from 'react';
import { 
  Repeat, Search, Plus, Play, Pause, 
  XCircle, RotateCw, CheckCircle2, Clock 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SubscriptionsProps {
  onNavigate?: (tab: string) => void;
}

export const Subscriptions: React.FC<SubscriptionsProps> = ({ onNavigate }) => {
  const { 
    subscriptions, 
    pauseSubscription, 
    resumeSubscription, 
    closeSubscription, 
    renewSubscription 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const activeCount = subscriptions.filter(s => (s.status || '').toLowerCase() === 'active').length;
  const pausedCount = subscriptions.filter(s => (s.status || '').toLowerCase() === 'paused').length;
  const closedCount = subscriptions.filter(s => {
    const st = (s.status || '').toLowerCase();
    return st === 'closed' || st === 'cancelled';
  }).length;

  const filteredSubs = subscriptions.filter(sub => {
    const num = (sub.number || '').toLowerCase();
    const cust = (sub.customerName || '').toLowerCase();
    const plan = (sub.planName || '').toLowerCase();
    const matchesSearch = num.includes(searchQuery.toLowerCase()) || 
                          cust.includes(searchQuery.toLowerCase()) || 
                          plan.includes(searchQuery.toLowerCase());

    const currentStatus = (sub.status || '').toLowerCase();
    const matchesStatus = statusFilter === 'ALL' || currentStatus === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'active') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'paused') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (s === 'closed' || s === 'cancelled') return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="revops-card rounded-2xl p-6 lg:p-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 bg-white border border-slate-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <Repeat className="w-3.5 h-3.5 text-indigo-600" />
            <span>Contract Lifecycles</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Subscription Management
          </h1>
          <p className="text-sm text-slate-500">
            Manage recurring contract terms, pauses, early closures, and renewal schedules.
          </p>
        </div>

        {onNavigate && (
          <button
            onClick={() => onNavigate('quotes')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow transition-all cursor-pointer active:scale-95 self-start lg:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Subscription</span>
          </button>
        )}
      </div>

      {/* 2. Metric Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-indigo-50/60 border-indigo-200 ring-2 ring-indigo-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Contracts</span>
            <Repeat className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">{subscriptions.length}</p>
        </button>

        <button
          onClick={() => setStatusFilter('active')}
          className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
            statusFilter === 'active'
              ? 'bg-emerald-50/60 border-emerald-200 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2 tabular-nums">{activeCount}</p>
        </button>

        <button
          onClick={() => setStatusFilter('paused')}
          className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
            statusFilter === 'paused'
              ? 'bg-amber-50/60 border-amber-200 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Paused</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2 tabular-nums">{pausedCount}</p>
        </button>
      </div>

      {/* 3. Subscriptions Ledger Table */}
      <div className="revops-card rounded-2xl overflow-hidden bg-white border border-slate-200">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by contract #, customer, or plan..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All ({subscriptions.length})</option>
              <option value="active">Active ({activeCount})</option>
              <option value="paused">Paused ({pausedCount})</option>
              <option value="closed">Closed ({closedCount})</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-6">Subscription</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Plan & Terms</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Next Billing</th>
                <th className="py-3 px-6 text-right">Recurring Total</th>
                <th className="py-3 px-6 text-center">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    No subscriptions match your current filter.
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => {
                  const status = (sub.status || '').toLowerCase();
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-mono font-semibold text-indigo-600 text-xs">
                        {sub.number}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900 text-xs">
                          {sub.customerName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {sub.customerEmail}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-xs font-medium text-slate-800">{sub.planName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{sub.paymentTerms}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${getStatusBadge(sub.status)}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-600">
                        {sub.nextBillingDate || '—'}
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-slate-900 tabular-nums text-xs">
                        ${Number(sub.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-1.5">
                          {status === 'active' && (
                            <>
                              <button
                                onClick={() => pauseSubscription(sub.id)}
                                title="Pause Subscription"
                                className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors cursor-pointer"
                              >
                                <Pause className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => closeSubscription(sub.id)}
                                title="Close / Cancel Early"
                                className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => renewSubscription(sub.id)}
                                title="Renew Contract (+1 Year)"
                                className="p-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer"
                              >
                                <RotateCw className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {status === 'paused' && (
                            <>
                              <button
                                onClick={() => resumeSubscription(sub.id)}
                                title="Resume Subscription"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                <Play className="w-3 h-3" />
                                <span>Resume</span>
                              </button>
                              <button
                                onClick={() => closeSubscription(sub.id)}
                                title="Close Contract"
                                className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {(status === 'closed' || status === 'cancelled') && (
                            <button
                              onClick={() => renewSubscription(sub.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              <RotateCw className="w-3 h-3" />
                              <span>Reactivate</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;