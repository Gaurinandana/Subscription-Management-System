import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Subscription, SubscriptionStatus } from '../types';
import {
  Repeat,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  RotateCw,
  XCircle,
  FileText,
  AlertCircle,
  Shield,
  Eye,
  X,
  Send,
  Sparkles,
} from 'lucide-react';

interface SubscriptionsProps {
  onNavigate: (view: string) => void;
}

export const Subscriptions: React.FC<SubscriptionsProps> = ({ onNavigate }) => {
  const {
    subscriptions,
    plans,
    updateSubscriptionStatus,
    pauseSubscription,
    resumeSubscription,
    renewSubscription,
    closeSubscription,
    currentUser,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [viewingSub, setViewingSub] = useState<Subscription | null>(null);

  const statuses = ['All', 'Draft', 'Quotation', 'Confirmed', 'Active', 'Paused', 'Closed'];

  const filteredSubs = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.number.toLowerCase().includes(search.toLowerCase()) ||
      sub.customerName.toLowerCase().includes(search.toLowerCase()) ||
      sub.planName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || sub.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: SubscriptionStatus) => {
    const styles: Record<SubscriptionStatus, string> = {
      Draft: 'bg-slate-100 text-slate-700 border-slate-200',
      Quotation: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      Confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
      Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Paused: 'bg-amber-50 text-amber-700 border-amber-200',
      Closed: 'bg-rose-50 text-rose-700 border-rose-200',
    };
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
          styles[status] || 'bg-slate-100 text-slate-700'
        }`}
      >
        {status}
      </span>
    );
  };

  const getPlan = (planId: string) => plans.find((p) => p.id === planId);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Scene 3: Turning a Quote into a Subscription</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Subscriptions & Quotations Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track subscription progression through every stage: Draft &rarr; Quotation &rarr; Confirmed &rarr; Active &rarr; Closed.
          </p>
        </div>

        <button
          onClick={() => onNavigate('quotes')}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Quote / Subscription</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition shrink-0 ${
                  selectedStatus === st
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by customer, ID or plan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Subscription #</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Plan</th>
                <th className="px-4 py-3.5">Payment Terms</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Next Billing</th>
                <th className="px-4 py-3.5 text-right">Recurring Total</th>
                <th className="px-4 py-3.5 text-center">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                    No subscriptions found matching filter.
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => {
                  const plan = getPlan(sub.planId);
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3.5 font-bold text-slate-900">{sub.number}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800">{sub.customerName}</div>
                        <div className="text-[11px] text-slate-400">{sub.customerEmail}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 font-medium">
                        {sub.planName}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">{sub.paymentTerms}</td>
                      <td className="px-4 py-3.5">{getStatusBadge(sub.status)}</td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">
                        {sub.nextBillingDate}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900 text-right">
                        ${sub.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Inspect Detail */}
                          <button
                            onClick={() => setViewingSub(sub)}
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="Inspect details and items"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Stage Transitions according to Scene 3 */}
                          {sub.status === 'Draft' && (
                            <button
                              onClick={() => updateSubscriptionStatus(sub.id, 'Quotation')}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold rounded-lg text-[11px] transition flex items-center gap-1"
                              title="Send quotation to client"
                            >
                              <Send className="w-3 h-3" />
                              <span>Quote</span>
                            </button>
                          )}

                          {sub.status === 'Quotation' && (
                            <button
                              onClick={() => updateSubscriptionStatus(sub.id, 'Confirmed')}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold rounded-lg text-[11px] transition flex items-center gap-1"
                              title="Confirm quotation"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Confirm</span>
                            </button>
                          )}

                          {sub.status === 'Confirmed' && (
                            <button
                              onClick={() => updateSubscriptionStatus(sub.id, 'Active')}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-bold rounded-lg text-[11px] transition flex items-center gap-1"
                              title="Activate subscription and start recurring billing"
                            >
                              <Play className="w-3 h-3" />
                              <span>Activate</span>
                            </button>
                          )}

                          {sub.status === 'Active' && (
                            <>
                              <button
                                onClick={() => pauseSubscription(sub.id)}
                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                                title="Pause subscription (if plan allows)"
                              >
                                <Pause className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => renewSubscription(sub.id)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                title="Renew subscription (+12 months)"
                              >
                                <RotateCw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => closeSubscription(sub.id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Close subscription"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {sub.status === 'Paused' && (
                            <button
                              onClick={() => resumeSubscription(sub.id)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-bold rounded-lg text-[11px] transition flex items-center gap-1"
                              title="Resume subscription"
                            >
                              <Play className="w-3 h-3" />
                              <span>Resume</span>
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

      {/* Subscription Detail Modal */}
      {viewingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{viewingSub.number}</h3>
                  {getStatusBadge(viewingSub.status)}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customer: <strong>{viewingSub.customerName}</strong> ({viewingSub.customerEmail})
                </p>
              </div>
              <button
                onClick={() => setViewingSub(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Lifecycle Stage Visualizer */}
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Lifecycle Stage Progression
                </div>
                <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                  {['Draft', 'Quotation', 'Confirmed', 'Active', 'Closed'].map((stage, idx) => {
                    const stageOrder = ['Draft', 'Quotation', 'Confirmed', 'Active', 'Closed'];
                    const currentIdx = stageOrder.indexOf(viewingSub.status);
                    const isPassed = currentIdx >= idx;
                    const isCurrent = viewingSub.status === stage;

                    return (
                      <div
                        key={stage}
                        className={`p-2 rounded-xl border text-[11px] font-bold ${
                          isCurrent
                            ? 'bg-purple-600 text-white border-purple-600'
                            : isPassed
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}
                      >
                        {stage}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Plan Rules & Safeguards */}
              {getPlan(viewingSub.planId) && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span>Plan Rules Enforcement ({getPlan(viewingSub.planId)?.name})</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Can Pause?</span>
                      <strong className={getPlan(viewingSub.planId)?.canPause ? 'text-emerald-600' : 'text-slate-500'}>
                        {getPlan(viewingSub.planId)?.canPause ? 'Yes' : 'No'}
                      </strong>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Can Renew?</span>
                      <strong className={getPlan(viewingSub.planId)?.canRenew ? 'text-emerald-600' : 'text-slate-500'}>
                        {getPlan(viewingSub.planId)?.canRenew ? 'Yes' : 'No'}
                      </strong>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Can Close Early?</span>
                      <strong className={getPlan(viewingSub.planId)?.canCloseEarly ? 'text-emerald-600' : 'text-slate-500'}>
                        {getPlan(viewingSub.planId)?.canCloseEarly ? 'Yes' : 'No'}
                      </strong>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Auto-Close on End?</span>
                      <strong className={getPlan(viewingSub.planId)?.autoCloseOnEnd ? 'text-purple-600' : 'text-slate-500'}>
                        {getPlan(viewingSub.planId)?.autoCloseOnEnd ? 'Yes' : 'No'}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Line Items Table */}
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Subscription Line Items
                </div>
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-3 py-2">Product & Variant</th>
                        <th className="px-3 py-2 text-center">Qty</th>
                        <th className="px-3 py-2 text-right">Unit Price</th>
                        <th className="px-3 py-2 text-right">Tax</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {viewingSub.lines.map((line) => (
                        <tr key={line.id}>
                          <td className="px-3 py-2.5">
                            <span className="font-bold text-slate-800">{line.productName}</span>
                            {line.variantName && (
                              <span className="text-[11px] text-purple-700 block font-medium">
                                Variant: {line.variantName}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-center font-semibold text-slate-700">
                            {line.quantity}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-slate-700">
                            ${line.unitPrice.toLocaleString()}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-slate-500">
                            {line.taxRate}%
                          </td>
                          <td className="px-3 py-2.5 text-right font-bold text-slate-900 font-mono">
                            ${line.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">${viewingSub.subtotal.toLocaleString()}</span>
                </div>
                {viewingSub.discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({viewingSub.appliedDiscountCode || 'Applied'}):</span>
                    <span className="font-mono">-${viewingSub.discountTotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Taxes Calculated:</span>
                  <span className="font-mono">${viewingSub.taxTotal.toLocaleString()}</span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex justify-between text-sm font-bold text-slate-900">
                  <span>Recurring Total:</span>
                  <span className="font-mono text-purple-700">${viewingSub.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setViewingSub(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
