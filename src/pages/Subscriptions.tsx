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
      Draft: 'bg-[#fafafb] text-[#777b86] border border-[#ececec]',
      Quotation: 'bg-[#f2f2f3] text-[#17191c] border border-[#ececec]',
      Confirmed: 'bg-[#f2f2f3] text-[#17191c] border border-[#ececec]',
      Active: 'bg-[#17191c] text-[#ffffff]',
      Paused: 'bg-[#fbe1d1] text-[#5d2a1a] border border-[#5d2a1a]/20',
      Closed: 'bg-[#fafafb] text-[#979799] border border-[#ececec]',
    };
    return (
      <span
        className={`px-3 py-0.5 rounded-full text-xs font-normal ${
          styles[status] || 'bg-[#f2f2f3] text-[#777b86]'
        }`}
      >
        {status}
      </span>
    );
  };

  const getPlan = (planId: string) => plans.find((p) => p.id === planId);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-[#17191c]">
      {/* Header — Editorial Serif Display */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#ececec]">
        <div>
          <div className="text-[12px] font-normal uppercase tracking-wider text-[#979799] mb-2 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#17191c]" />
            <span>Scene 3 • Quotation to Subscription Lifecycle</span>
          </div>
          <h1 className="font-serif text-[40px] md:text-[44px] leading-[1.2] tracking-[-0.66px] text-[#17191c] font-normal">
            Subscriptions <span className="italic">& Contract Pipeline</span>
          </h1>
          <p className="text-sm text-[#777b86] mt-2 max-w-xl font-normal leading-relaxed">
            Track subscription progression through every stage: Draft &rarr; Quotation &rarr; Confirmed &rarr; Active &rarr; Closed.
          </p>
        </div>

        <button
          onClick={() => onNavigate('quotes')}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#17191c] hover:bg-black text-[#ffffff] rounded-full text-xs font-medium transition shadow-xs self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-[#fbe1d1]" />
          <span>New Quote / Subscription</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-[#ffffff] p-5 rounded-[24px] border border-[#ececec] shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Status Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-4 py-1.5 text-xs rounded-full transition shrink-0 ${
                  selectedStatus === st
                    ? 'bg-[#17191c] text-[#ffffff] font-medium'
                    : 'text-[#777b86] hover:bg-[#f2f2f3] hover:text-[#17191c] font-normal'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#979799] absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter by customer, ID or plan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] placeholder-[#a3a6af] focus:outline-none focus:border-[#17191c]"
            />
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="overflow-x-auto rounded-[16px] border border-[#ececec]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fafafb] text-[#979799] uppercase tracking-wider font-normal border-b border-[#ececec]">
              <tr>
                <th className="px-5 py-3.5">Subscription #</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Plan</th>
                <th className="px-5 py-3.5">Payment Terms</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Next Billing</th>
                <th className="px-5 py-3.5 text-right">Recurring Total</th>
                <th className="px-5 py-3.5 text-center">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f2f3]">
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-[#a3a6af]">
                    No subscriptions found matching filter.
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => {
                  return (
                    <tr key={sub.id} className="hover:bg-[#fafafb] transition">
                      <td className="px-5 py-4 font-medium text-[#17191c]">{sub.number}</td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-[#17191c]">{sub.customerName}</div>
                        <div className="text-[11px] text-[#777b86]">{sub.customerEmail}</div>
                      </td>
                      <td className="px-5 py-4 text-[#777b86] font-normal">
                        {sub.planName}
                      </td>
                      <td className="px-5 py-4 text-[#777b86] font-normal">{sub.paymentTerms}</td>
                      <td className="px-5 py-4">{getStatusBadge(sub.status)}</td>
                      <td className="px-5 py-4 font-mono text-[#777b86] text-[11px]">
                        {sub.nextBillingDate}
                      </td>
                      <td className="px-5 py-4 font-medium text-[#17191c] font-mono text-right">
                        ${sub.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Inspect Detail */}
                          <button
                            onClick={() => setViewingSub(sub)}
                            className="p-1.5 text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3] rounded-full transition"
                            title="Inspect details and items"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Stage Transitions according to Scene 3 */}
                          {sub.status === 'Draft' && (
                            <button
                              onClick={() => updateSubscriptionStatus(sub.id, 'Quotation')}
                              className="px-3 py-1 border border-[#17191c] text-[#17191c] hover:bg-[#f2f2f3] rounded-full text-[11px] font-normal transition flex items-center gap-1"
                              title="Send quotation to client"
                            >
                              <Send className="w-3 h-3" />
                              <span>Quote</span>
                            </button>
                          )}

                          {sub.status === 'Quotation' && (
                            <button
                              onClick={() => updateSubscriptionStatus(sub.id, 'Confirmed')}
                              className="px-3 py-1 bg-[#17191c] text-[#ffffff] hover:bg-black rounded-full text-[11px] font-normal transition flex items-center gap-1"
                              title="Confirm quotation"
                            >
                              <CheckCircle2 className="w-3 h-3 text-[#fbe1d1]" />
                              <span>Confirm</span>
                            </button>
                          )}

                          {sub.status === 'Confirmed' && (
                            <button
                              onClick={() => updateSubscriptionStatus(sub.id, 'Active')}
                              className="px-3 py-1 bg-[#17191c] text-[#ffffff] hover:bg-black rounded-full text-[11px] font-normal transition flex items-center gap-1"
                              title="Activate subscription and start recurring billing"
                            >
                              <Play className="w-3 h-3 text-[#fbe1d1]" />
                              <span>Activate</span>
                            </button>
                          )}

                          {sub.status === 'Active' && (
                            <>
                              <button
                                onClick={() => pauseSubscription(sub.id)}
                                className="p-1.5 text-[#777b86] hover:text-[#5d2a1a] hover:bg-[#fbe1d1] rounded-full transition"
                                title="Pause subscription (if plan allows)"
                              >
                                <Pause className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => renewSubscription(sub.id)}
                                className="p-1.5 text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3] rounded-full transition"
                                title="Renew subscription (+12 months)"
                              >
                                <RotateCw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => closeSubscription(sub.id)}
                                className="p-1.5 text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3] rounded-full transition"
                                title="Close subscription"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {sub.status === 'Paused' && (
                            <button
                              onClick={() => resumeSubscription(sub.id)}
                              className="px-3 py-1 bg-[#17191c] text-[#ffffff] hover:bg-black rounded-full text-[11px] font-normal transition flex items-center gap-1"
                              title="Resume subscription"
                            >
                              <Play className="w-3 h-3 text-[#fbe1d1]" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17191c]/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#ffffff] rounded-[24px] shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] max-w-2xl w-full border border-[#ececec] overflow-hidden text-[#17191c]">
            <div className="p-6 border-b border-[#ececec] flex items-center justify-between bg-[#fafafb]">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-serif text-xl text-[#17191c] font-normal">{viewingSub.number}</h3>
                  {getStatusBadge(viewingSub.status)}
                </div>
                <p className="text-xs text-[#777b86] mt-1">
                  Customer: <strong className="text-[#17191c] font-medium">{viewingSub.customerName}</strong> ({viewingSub.customerEmail})
                </p>
              </div>
              <button
                onClick={() => setViewingSub(null)}
                className="p-2 text-[#777b86] hover:text-[#17191c] rounded-full hover:bg-[#f2f2f3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Lifecycle Stage Visualizer */}
              <div>
                <div className="text-[11px] font-normal text-[#979799] uppercase tracking-wider mb-2.5">
                  Lifecycle Stage Progression
                </div>
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  {['Draft', 'Quotation', 'Confirmed', 'Active', 'Closed'].map((stage, idx) => {
                    const stageOrder = ['Draft', 'Quotation', 'Confirmed', 'Active', 'Closed'];
                    const currentIdx = stageOrder.indexOf(viewingSub.status);
                    const isPassed = currentIdx >= idx;
                    const isCurrent = viewingSub.status === stage;

                    return (
                      <div
                        key={stage}
                        className={`py-2 px-1 rounded-full text-[11px] ${
                          isCurrent
                            ? 'bg-[#17191c] text-[#ffffff] font-medium'
                            : isPassed
                            ? 'bg-[#f2f2f3] text-[#17191c]'
                            : 'bg-[#fafafb] text-[#a3a6af] border border-[#ececec]'
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
                <div className="p-5 bg-[#fafafb] rounded-[20px] border border-[#ececec]">
                  <div className="text-xs font-medium text-[#17191c] mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#17191c]" />
                    <span>Plan Rules Enforcement ({getPlan(viewingSub.planId)?.name})</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="bg-[#ffffff] p-3 rounded-[12px] border border-[#ececec]">
                      <span className="text-[10px] text-[#979799] block">Can Pause?</span>
                      <strong className="text-[#17191c] font-medium">
                        {getPlan(viewingSub.planId)?.canPause ? 'Yes' : 'No'}
                      </strong>
                    </div>
                    <div className="bg-[#ffffff] p-3 rounded-[12px] border border-[#ececec]">
                      <span className="text-[10px] text-[#979799] block">Can Renew?</span>
                      <strong className="text-[#17191c] font-medium">
                        {getPlan(viewingSub.planId)?.canRenew ? 'Yes' : 'No'}
                      </strong>
                    </div>
                    <div className="bg-[#ffffff] p-3 rounded-[12px] border border-[#ececec]">
                      <span className="text-[10px] text-[#979799] block">Can Close Early?</span>
                      <strong className="text-[#17191c] font-medium">
                        {getPlan(viewingSub.planId)?.canCloseEarly ? 'Yes' : 'No'}
                      </strong>
                    </div>
                    <div className="bg-[#ffffff] p-3 rounded-[12px] border border-[#ececec]">
                      <span className="text-[10px] text-[#979799] block">Auto-Close on End?</span>
                      <strong className="text-[#17191c] font-medium">
                        {getPlan(viewingSub.planId)?.autoCloseOnEnd ? 'Yes' : 'No'}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Line Items Table */}
              <div>
                <div className="text-[11px] font-normal text-[#979799] uppercase tracking-wider mb-2.5">
                  Subscription Line Items
                </div>
                <div className="rounded-[16px] border border-[#ececec] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#fafafb] text-[#979799] border-b border-[#ececec]">
                      <tr>
                        <th className="px-4 py-2.5">Product & Variant</th>
                        <th className="px-4 py-2.5 text-center">Qty</th>
                        <th className="px-4 py-2.5 text-right">Unit Price</th>
                        <th className="px-4 py-2.5 text-right">Tax</th>
                        <th className="px-4 py-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f2f2f3]">
                      {viewingSub.lines.map((line) => (
                        <tr key={line.id}>
                          <td className="px-4 py-3">
                            <span className="font-medium text-[#17191c]">{line.productName}</span>
                            {line.variantName && (
                              <span className="text-[11px] text-[#777b86] block">
                                Variant: {line.variantName}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-[#777b86]">
                            {line.quantity}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-[#777b86]">
                            ${line.unitPrice.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-[#777b86]">
                            {line.taxRate}%
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-[#17191c] font-mono">
                            ${line.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="p-5 bg-[#fafafb] rounded-[16px] border border-[#ececec] space-y-2 text-xs">
                <div className="flex justify-between text-[#777b86]">
                  <span>Subtotal:</span>
                  <span className="font-mono text-[#17191c]">${viewingSub.subtotal.toLocaleString()}</span>
                </div>
                {viewingSub.discountTotal > 0 && (
                  <div className="flex justify-between text-[#5d2a1a] font-medium">
                    <span>Discount ({viewingSub.appliedDiscountCode || 'Applied'}):</span>
                    <span className="font-mono">-${viewingSub.discountTotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#777b86]">
                  <span>Taxes Calculated:</span>
                  <span className="font-mono text-[#17191c]">${viewingSub.taxTotal.toLocaleString()}</span>
                </div>
                <div className="h-px bg-[#ececec]" />
                <div className="flex justify-between text-sm font-medium text-[#17191c]">
                  <span>Recurring Total:</span>
                  <span className="font-mono font-medium">${viewingSub.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#fafafb] border-t border-[#ececec] flex items-center justify-end">
              <button
                onClick={() => setViewingSub(null)}
                className="px-5 py-2 border border-[#17191c] text-[#17191c] hover:bg-[#ffffff] text-xs rounded-full transition font-normal"
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
